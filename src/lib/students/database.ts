import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

import {
  createSafePostgresDiagnostic,
  type PostgresFailurePhase,
  type SafePostgresDiagnostic,
} from "@/lib/booking/postgres-diagnostics";
import { createBookingDatabasePoolConfig } from "@/lib/booking/postgres-config";
import { calculateFinancialBalance } from "@/lib/students/finance";
import { normalizeEmail, normalizePhone, type StudentInput, type StudentRecordAction } from "@/lib/students/schemas";
import type {
  BookingLink,
  ContractRecord,
  LessonRecord,
  LicenseProcess,
  PaymentRecord,
  SkillAssessment,
  StudentMetrics,
  StudentNote,
  StudentSummary,
  StudentWorkspace,
} from "@/lib/students/types";

export class StudentsDatabaseError extends Error {
  constructor(
    public readonly code:
      | "STUDENTS_SCHEMA_NOT_INSTALLED"
      | "STUDENTS_DATABASE_UNAVAILABLE"
      | "STUDENT_NOT_FOUND"
      | "STUDENT_DUPLICATE"
      | "POSSIBLE_STUDENT_DUPLICATE"
      | "STUDENT_RECORD_CONFLICT",
    public readonly details?: Array<Pick<StudentSummary, "id" | "fullName" | "phone" | "email">>,
    public readonly diagnostic?: SafePostgresDiagnostic,
  ) {
    super("Não foi possível acessar a gestão de alunos.");
    this.name = "StudentsDatabaseError";
  }
}

type StudentRow = QueryResultRow & {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  training_category: StudentSummary["trainingCategory"];
  service_type: string;
  status: StudentSummary["status"];
  archived_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  has_future_lessons?: boolean;
  total_count?: string;
};

type LessonRow = QueryResultRow & {
  id: string;
  modality: string;
  starts_at: Date | string;
  duration_minutes: number;
  status: LessonRecord["status"];
  content: string | null;
  notes: string | null;
  booking_reservation_id: string | null;
  google_event_id: string | null;
};

type SkillRow = QueryResultRow & {
  id: string;
  lesson_id: string | null;
  vehicle_category: "A" | "B";
  skill_code: string;
  skill_label: string;
  level: SkillAssessment["level"];
  comments: string | null;
  assessed_on: string;
  created_at: Date | string;
};

type ProcessRow = QueryResultRow & {
  id: string;
  process_type: LicenseProcess["processType"];
  category: LicenseProcess["category"];
  status_label: string;
  steps: unknown;
  notes: string | null;
  started_on: string | null;
  completed_on: string | null;
};

type ContractRow = QueryResultRow & {
  id: string;
  description: string;
  amount: string;
  lessons_count: number | null;
  status: ContractRecord["status"];
  agreed_on: string;
  notes: string | null;
};

type PaymentRow = QueryResultRow & {
  id: string;
  contract_id: string | null;
  amount: string;
  method: PaymentRecord["method"];
  status: PaymentRecord["status"];
  paid_on: string | null;
  notes: string | null;
};

type NoteRow = QueryResultRow & {
  id: string;
  content: string;
  author_email: string;
  created_at: Date | string;
};

type BookingRow = QueryResultRow & {
  id: string;
  service_id: string;
  starts_at: Date | string;
  ends_at: Date | string;
  status: string;
  student_id: string | null;
};

let studentsPool: Pool | undefined;

function database() {
  studentsPool ??= new Pool(createBookingDatabasePoolConfig());
  return studentsPool;
}

function normalizeDatabaseError(
  error: unknown,
  phase: PostgresFailurePhase,
): never {
  if (error instanceof StudentsDatabaseError) throw error;
  const diagnostic = createSafePostgresDiagnostic(error, phase);
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
  const constraint = typeof error === "object" && error !== null && "constraint" in error
    ? String(error.constraint)
    : "";
  if (code === "42P01" || code === "42703") {
    throw new StudentsDatabaseError(
      "STUDENTS_SCHEMA_NOT_INSTALLED",
      undefined,
      diagnostic,
    );
  }
  if (code === "23505") {
    throw new StudentsDatabaseError(
      constraint === "students_duplicate_confirmation_required"
        ? "STUDENT_DUPLICATE"
        : "STUDENT_RECORD_CONFLICT",
    );
  }
  if (code === "23503" || code === "23P01") {
    throw new StudentsDatabaseError("STUDENT_RECORD_CONFLICT");
  }
  throw new StudentsDatabaseError(
    "STUDENTS_DATABASE_UNAVAILABLE",
    undefined,
    diagnostic,
  );
}

async function query<Row extends QueryResultRow>(text: string, values: unknown[] = []) {
  try {
    return await database().query<Row>(text, values);
  } catch (error) {
    normalizeDatabaseError(error, "query");
  }
}

async function transaction<T>(operation: (client: PoolClient) => Promise<T>) {
  let client: PoolClient | undefined;
  let failurePhase: PostgresFailurePhase = "connection";
  try {
    client = await database().connect();
    failurePhase = "query";
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Mantém a falha original sem expor detalhes da conexão.
      }
    }
    normalizeDatabaseError(error, failurePhase);
  } finally {
    client?.release();
  }
}

function iso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function dateValue(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapStudent(row: StudentRow): StudentSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    birthDate: dateValue(row.birth_date),
    trainingCategory: row.training_category,
    serviceType: row.service_type,
    status: row.status,
    archivedAt: row.archived_at ? iso(row.archived_at) : null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    ...(row.has_future_lessons !== undefined
      ? { hasFutureLessons: row.has_future_lessons }
      : {}),
  };
}

async function audit(
  client: PoolClient,
  input: {
    studentId: string;
    entityType: string;
    entityId?: string;
    action: string;
    actorEmail: string;
    changedFields?: string[];
  },
) {
  await client.query(
    `INSERT INTO student_audit_log
      (student_id, entity_type, entity_id, action, actor_email, metadata)
     VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6::jsonb)`,
    [
      input.studentId,
      input.entityType,
      input.entityId ?? null,
      input.action,
      input.actorEmail,
      JSON.stringify({ changedFields: input.changedFields ?? [] }),
    ],
  );
}

async function duplicateCandidates(
  client: PoolClient,
  input: StudentInput,
  excludedId?: string,
) {
  const normalizedPhone = normalizePhone(input.phone);
  const normalizedEmail = normalizeEmail(input.email);
  const result = await client.query<StudentRow>(
    `SELECT id, full_name, phone, email, birth_date, training_category,
            service_type, status, archived_at, created_at, updated_at
     FROM students
     WHERE ($4::uuid IS NULL OR id <> $4::uuid)
       AND archived_at IS NULL
       AND (
         phone_normalized = $1
         OR ($2::text IS NOT NULL AND email_normalized = $2)
         OR lower(trim(full_name)) = lower(trim($3))
       )
     ORDER BY created_at DESC
     LIMIT 8`,
    [normalizedPhone, normalizedEmail ?? null, input.fullName, excludedId ?? null],
  );
  return result.rows;
}

export async function listStudents(input: {
  query: string;
  status: string;
  category: string;
  page: number;
  pageSize: number;
}) {
  const search = input.query ? `%${input.query}%` : "";
  const offset = (input.page - 1) * input.pageSize;
  const [studentsResult, metricsResult] = await Promise.all([
    query<StudentRow>(
      `SELECT s.id, s.full_name, s.phone, s.email, s.birth_date,
              s.training_category, s.service_type, s.status, s.archived_at,
              s.created_at, s.updated_at,
              EXISTS (
                SELECT 1 FROM lessons l
                WHERE l.student_id = s.id
                  AND l.status = 'scheduled'
                  AND l.starts_at >= now()
              ) AS has_future_lessons,
              count(*) OVER ()::text AS total_count
       FROM students s
       WHERE s.archived_at IS NULL
         AND ($1 = '' OR s.full_name ILIKE $1 OR s.phone ILIKE $1 OR coalesce(s.email, '') ILIKE $1)
         AND ($2 = 'all' OR s.status = $2)
         AND ($3 = 'all' OR s.training_category = $3)
       ORDER BY s.updated_at DESC, s.full_name ASC
       LIMIT $4 OFFSET $5`,
      [search, input.status, input.category, input.pageSize, offset],
    ),
    query<{
      total: string;
      active: string;
      inactive: string;
      completed: string;
      with_future_lessons: string;
    }>(
      `SELECT
         count(*)::text AS total,
         count(*) FILTER (WHERE status = 'active')::text AS active,
         count(*) FILTER (WHERE status = 'inactive')::text AS inactive,
         count(*) FILTER (WHERE status = 'completed')::text AS completed,
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM lessons l
           WHERE l.student_id = students.id
             AND l.status = 'scheduled'
             AND l.starts_at >= now()
         ))::text AS with_future_lessons
       FROM students
       WHERE archived_at IS NULL`,
    ),
  ]);

  const metric = metricsResult.rows[0];
  const metrics: StudentMetrics = {
    total: Number(metric?.total ?? 0),
    active: Number(metric?.active ?? 0),
    inactive: Number(metric?.inactive ?? 0),
    completed: Number(metric?.completed ?? 0),
    withFutureLessons: Number(metric?.with_future_lessons ?? 0),
  };
  return {
    students: studentsResult.rows.map(mapStudent),
    metrics,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total: Number(studentsResult.rows[0]?.total_count ?? 0),
    },
  };
}

export async function listStudentsForExport() {
  const result = await query<StudentRow>(
    `SELECT id, full_name, phone, email, birth_date, training_category,
            service_type, status, archived_at, created_at, updated_at
     FROM students
     WHERE archived_at IS NULL
     ORDER BY full_name ASC
     LIMIT 5000`,
  );
  return result.rows.map(mapStudent);
}

export async function createStudent(
  input: StudentInput,
  actorEmail: string,
) {
  return transaction(async (client) => {
    const candidates = await duplicateCandidates(client, input);
    const normalizedName = input.fullName.trim().toLowerCase();
    const normalizedPhone = normalizePhone(input.phone);
    const obvious = candidates.some(
      (candidate) =>
        candidate.full_name.trim().toLowerCase() === normalizedName &&
        normalizePhone(candidate.phone) === normalizedPhone,
    );
    const duplicateDetails = candidates.map((candidate) => ({
      id: candidate.id,
      fullName: candidate.full_name,
      phone: candidate.phone,
      email: candidate.email,
    }));
    if (obvious && !input.confirmPossibleDuplicate) {
      throw new StudentsDatabaseError("STUDENT_DUPLICATE", duplicateDetails);
    }
    if (candidates.length > 0 && !input.confirmPossibleDuplicate) {
      throw new StudentsDatabaseError("POSSIBLE_STUDENT_DUPLICATE", duplicateDetails);
    }

    const result = await client.query<StudentRow>(
      `INSERT INTO students
        (full_name, phone, phone_normalized, email, email_normalized, birth_date,
         training_category, service_type, status, duplicate_confirmed_at,
         duplicate_confirmed_by)
       VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10::timestamptz, $11)
       RETURNING id, full_name, phone, email, birth_date, training_category,
                 service_type, status, archived_at, created_at, updated_at`,
      [
        input.fullName,
        input.phone,
        normalizedPhone,
        input.email ?? null,
        normalizeEmail(input.email) ?? null,
        input.birthDate ?? null,
        input.trainingCategory,
        input.serviceType,
        input.status,
        candidates.length > 0 && input.confirmPossibleDuplicate ? new Date().toISOString() : null,
        candidates.length > 0 && input.confirmPossibleDuplicate ? actorEmail : null,
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new StudentsDatabaseError(
        "STUDENTS_DATABASE_UNAVAILABLE",
        undefined,
        createSafePostgresDiagnostic(undefined, "query"),
      );
    }
    await audit(client, {
      studentId: row.id,
      entityType: "student",
      entityId: row.id,
      action: "student.created",
      actorEmail,
      changedFields: [
        "fullName", "phone", "email", "birthDate", "trainingCategory", "serviceType", "status",
        ...(candidates.length > 0 && input.confirmPossibleDuplicate ? ["duplicateConfirmation"] : []),
      ],
    });
    return mapStudent(row);
  });
}

export async function updateStudent(
  studentId: string,
  input: StudentInput,
  actorEmail: string,
) {
  return transaction(async (client) => {
    const candidates = await duplicateCandidates(client, input, studentId);
    const normalizedName = input.fullName.trim().toLowerCase();
    const normalizedPhone = normalizePhone(input.phone);
    const obvious = candidates.some(
      (candidate) => candidate.full_name.trim().toLowerCase() === normalizedName && normalizePhone(candidate.phone) === normalizedPhone,
    );
    const duplicateDetails = candidates.map((candidate) => ({ id: candidate.id, fullName: candidate.full_name, phone: candidate.phone, email: candidate.email }));
    if (obvious && !input.confirmPossibleDuplicate) throw new StudentsDatabaseError("STUDENT_DUPLICATE", duplicateDetails);
    if (candidates.length > 0 && !input.confirmPossibleDuplicate) {
      throw new StudentsDatabaseError("POSSIBLE_STUDENT_DUPLICATE", duplicateDetails);
    }

    const result = await client.query<StudentRow>(
      `UPDATE students
       SET full_name = $2, phone = $3, phone_normalized = $4,
           email = $5, email_normalized = $6, birth_date = $7::date,
           training_category = $8, service_type = $9, status = $10,
           duplicate_confirmed_at = $11::timestamptz,
           duplicate_confirmed_by = $12,
           updated_at = now()
       WHERE id = $1::uuid AND archived_at IS NULL
       RETURNING id, full_name, phone, email, birth_date, training_category,
                 service_type, status, archived_at, created_at, updated_at`,
      [
        studentId, input.fullName, input.phone, normalizedPhone, input.email ?? null,
        normalizeEmail(input.email) ?? null, input.birthDate ?? null,
        input.trainingCategory, input.serviceType, input.status,
        candidates.length > 0 && input.confirmPossibleDuplicate ? new Date().toISOString() : null,
        candidates.length > 0 && input.confirmPossibleDuplicate ? actorEmail : null,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new StudentsDatabaseError("STUDENT_NOT_FOUND");
    await audit(client, {
      studentId,
      entityType: "student",
      entityId: studentId,
      action: "student.updated",
      actorEmail,
      changedFields: [
        "fullName", "phone", "email", "birthDate", "trainingCategory", "serviceType", "status",
        ...(candidates.length > 0 && input.confirmPossibleDuplicate ? ["duplicateConfirmation"] : []),
      ],
    });
    return mapStudent(row);
  });
}

export async function archiveStudent(studentId: string, actorEmail: string) {
  return transaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `UPDATE students
       SET archived_at = now(), status = 'inactive', updated_at = now()
       WHERE id = $1::uuid AND archived_at IS NULL
       RETURNING id`,
      [studentId],
    );
    if (!result.rows[0]) throw new StudentsDatabaseError("STUDENT_NOT_FOUND");
    await audit(client, { studentId, entityType: "student", entityId: studentId, action: "student.archived", actorEmail, changedFields: ["archivedAt", "status"] });
  });
}

export async function getStudentWorkspace(studentId: string): Promise<StudentWorkspace> {
  const studentResult = await query<StudentRow>(
    `SELECT id, full_name, phone, email, birth_date, training_category,
            service_type, status, archived_at, created_at, updated_at
     FROM students WHERE id = $1::uuid`,
    [studentId],
  );
  const studentRow = studentResult.rows[0];
  if (!studentRow) throw new StudentsDatabaseError("STUDENT_NOT_FOUND");

  const [lessonsResult, skillsResult, processesResult, contractsResult, paymentsResult, notesResult, linkedReservationsResult, availableReservationsResult] = await Promise.all([
    query<LessonRow>(`SELECT id, modality, starts_at, duration_minutes, status, content, notes, booking_reservation_id, google_event_id FROM lessons WHERE student_id = $1::uuid ORDER BY starts_at DESC LIMIT 250`, [studentId]),
    query<SkillRow>(`SELECT id, lesson_id, vehicle_category, skill_code, skill_label, level, comments, assessed_on, created_at FROM student_skill_assessments WHERE student_id = $1::uuid ORDER BY assessed_on DESC, created_at DESC LIMIT 300`, [studentId]),
    query<ProcessRow>(`SELECT id, process_type, category, status_label, steps, notes, started_on, completed_on FROM license_processes WHERE student_id = $1::uuid ORDER BY created_at DESC LIMIT 50`, [studentId]),
    query<ContractRow>(`SELECT id, description, amount::text, lessons_count, status, agreed_on, notes FROM contracts WHERE student_id = $1::uuid ORDER BY agreed_on DESC, created_at DESC LIMIT 100`, [studentId]),
    query<PaymentRow>(`SELECT id, contract_id, amount::text, method, status, paid_on, notes FROM payments WHERE student_id = $1::uuid ORDER BY created_at DESC LIMIT 250`, [studentId]),
    query<NoteRow>(`SELECT id, content, author_email, created_at FROM student_notes WHERE student_id = $1::uuid ORDER BY created_at DESC LIMIT 250`, [studentId]),
    query<BookingRow>(`SELECT id, service_id, starts_at, ends_at, status, student_id FROM booking_reservations WHERE student_id = $1::uuid ORDER BY starts_at DESC LIMIT 100`, [studentId]),
    query<BookingRow>(`SELECT id, service_id, starts_at, ends_at, status, student_id
      FROM booking_reservations
      WHERE student_id IS NULL AND status = 'confirmed'
      ORDER BY (starts_at >= now()) DESC, abs(extract(epoch FROM starts_at - now())) ASC
      LIMIT 100`),
  ]);

  const lessons: LessonRecord[] = lessonsResult.rows.map((row) => ({ id: row.id, modality: row.modality, startsAt: iso(row.starts_at), durationMinutes: row.duration_minutes, status: row.status, content: row.content, notes: row.notes, bookingReservationId: row.booking_reservation_id, googleEventId: row.google_event_id }));
  const skills: SkillAssessment[] = skillsResult.rows.map((row) => ({ id: row.id, lessonId: row.lesson_id, vehicleCategory: row.vehicle_category, skillCode: row.skill_code, skillLabel: row.skill_label, level: row.level, comments: row.comments, assessedOn: dateValue(row.assessed_on) ?? "", createdAt: iso(row.created_at) }));
  const processes: LicenseProcess[] = processesResult.rows.map((row) => ({ id: row.id, processType: row.process_type, category: row.category, statusLabel: row.status_label, steps: Array.isArray(row.steps) ? row.steps.filter((step): step is string => typeof step === "string") : [], notes: row.notes, startedOn: dateValue(row.started_on), completedOn: dateValue(row.completed_on) }));
  const contracts: ContractRecord[] = contractsResult.rows.map((row) => ({ id: row.id, description: row.description, amount: row.amount, lessonsCount: row.lessons_count, status: row.status, agreedOn: dateValue(row.agreed_on) ?? "", notes: row.notes }));
  const payments: PaymentRecord[] = paymentsResult.rows.map((row) => ({ id: row.id, contractId: row.contract_id, amount: row.amount, method: row.method, status: row.status, paidOn: dateValue(row.paid_on), notes: row.notes }));
  const notes: StudentNote[] = notesResult.rows.map((row) => ({ id: row.id, content: row.content, authorEmail: row.author_email, createdAt: iso(row.created_at) }));
  const mapBooking = (row: BookingRow): BookingLink => ({ id: row.id, serviceId: row.service_id, startsAt: iso(row.starts_at), endsAt: iso(row.ends_at), status: row.status, linked: Boolean(row.student_id) });
  const lessonCounts = { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 };
  for (const lesson of lessons) lessonCounts[lesson.status] += 1;

  return {
    student: mapStudent(studentRow),
    lessons,
    skills,
    processes,
    contracts,
    payments,
    notes,
    reservations: linkedReservationsResult.rows.map(mapBooking),
    availableReservations: availableReservationsResult.rows.map(mapBooking),
    lessonCounts,
    financial: calculateFinancialBalance(contracts, payments),
  };
}

function sqlValue(value: unknown) {
  return Array.isArray(value) ? JSON.stringify(value) : value ?? null;
}

async function updateRecord(
  client: PoolClient,
  table: string,
  studentId: string,
  recordId: string,
  data: Record<string, unknown>,
  columns: Record<string, string>,
) {
  const entries = Object.entries(data).filter(([key, value]) => columns[key] && value !== undefined);
  if (entries.length === 0) return;
  const values: unknown[] = [recordId, studentId];
  const assignments = entries.map(([key, value], index) => {
    values.push(sqlValue(value));
    return `${columns[key]} = $${index + 3}`;
  });
  if (["lessons", "license_processes", "contracts", "payments"].includes(table)) {
    assignments.push("updated_at = now()");
  }
  const result = await client.query(
    `UPDATE ${table} SET ${assignments.join(", ")} WHERE id = $1::uuid AND student_id = $2::uuid RETURNING id`,
    values,
  );
  if (!result.rows[0]) throw new StudentsDatabaseError("STUDENT_RECORD_CONFLICT");
}

export async function createStudentRecord(
  studentId: string,
  input: StudentRecordAction,
  actorEmail: string,
) {
  return transaction(async (client) => {
    const student = await client.query<{ id: string }>(`SELECT id FROM students WHERE id = $1::uuid AND archived_at IS NULL`, [studentId]);
    if (!student.rows[0]) throw new StudentsDatabaseError("STUDENT_NOT_FOUND");

    let entityType = input.action.split(".")[0] ?? "record";
    let entityId: string | undefined;
    if (input.action === "lesson.create") {
      const data = input.data;
      const result = await client.query<{ id: string }>(
        `INSERT INTO lessons (student_id, modality, starts_at, duration_minutes, status, content, notes, booking_reservation_id, google_event_id)
         VALUES ($1::uuid, $2, $3::timestamptz, $4, $5, $6, $7, $8::uuid, $9) RETURNING id`,
        [studentId, data.modality, data.startsAt, data.durationMinutes, data.status, data.content ?? null, data.notes ?? null, data.bookingReservationId ?? null, data.googleEventId ?? null],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "lesson.update") {
      entityId = input.recordId;
      await updateRecord(client, "lessons", studentId, input.recordId, input.data, { modality: "modality", startsAt: "starts_at", durationMinutes: "duration_minutes", status: "status", content: "content", notes: "notes", bookingReservationId: "booking_reservation_id", googleEventId: "google_event_id" });
    } else if (input.action === "skill.create") {
      const data = input.data;
      const result = await client.query<{ id: string }>(
        `INSERT INTO student_skill_assessments (student_id, lesson_id, vehicle_category, skill_code, skill_label, level, comments, assessed_on)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::date) RETURNING id`,
        [studentId, data.lessonId ?? null, data.vehicleCategory, data.skillCode, data.skillLabel, data.level, data.comments ?? null, data.assessedOn],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "process.create") {
      const data = input.data;
      const result = await client.query<{ id: string }>(
        `INSERT INTO license_processes (student_id, process_type, category, status_label, steps, notes, started_on, completed_on)
         VALUES ($1::uuid, $2, $3, $4, $5::jsonb, $6, $7::date, $8::date) RETURNING id`,
        [studentId, data.processType, data.category, data.statusLabel, JSON.stringify(data.steps), data.notes ?? null, data.startedOn ?? null, data.completedOn ?? null],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "process.update") {
      entityId = input.recordId;
      await updateRecord(client, "license_processes", studentId, input.recordId, input.data, { processType: "process_type", category: "category", statusLabel: "status_label", steps: "steps", notes: "notes", startedOn: "started_on", completedOn: "completed_on" });
    } else if (input.action === "contract.create") {
      const data = input.data;
      const result = await client.query<{ id: string }>(
        `INSERT INTO contracts (student_id, description, amount, lessons_count, status, agreed_on, notes)
         VALUES ($1::uuid, $2, $3::numeric, $4, $5, $6::date, $7) RETURNING id`,
        [studentId, data.description, data.amount, data.lessonsCount ?? null, data.status, data.agreedOn, data.notes ?? null],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "contract.update") {
      entityId = input.recordId;
      await updateRecord(client, "contracts", studentId, input.recordId, input.data, { description: "description", amount: "amount", lessonsCount: "lessons_count", status: "status", agreedOn: "agreed_on", notes: "notes" });
    } else if (input.action === "payment.create") {
      const data = input.data;
      const result = await client.query<{ id: string }>(
        `INSERT INTO payments (student_id, contract_id, amount, method, status, paid_on, notes)
         VALUES ($1::uuid, $2::uuid, $3::numeric, $4, $5, $6::date, $7) RETURNING id`,
        [studentId, data.contractId ?? null, data.amount, data.method, data.status, data.paidOn ?? null, data.notes ?? null],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "payment.update") {
      entityId = input.recordId;
      await updateRecord(client, "payments", studentId, input.recordId, input.data, { contractId: "contract_id", amount: "amount", method: "method", status: "status", paidOn: "paid_on", notes: "notes" });
    } else if (input.action === "note.create") {
      const result = await client.query<{ id: string }>(
        `INSERT INTO student_notes (student_id, content, author_email) VALUES ($1::uuid, $2, $3) RETURNING id`,
        [studentId, input.data.content, actorEmail],
      );
      entityId = result.rows[0]?.id;
    } else if (input.action === "reservation.link") {
      entityType = "reservation";
      entityId = input.data.reservationId;
      const result = await client.query(
        `UPDATE booking_reservations SET student_id = $1::uuid, updated_at = now()
         WHERE id = $2::uuid AND (student_id IS NULL OR student_id = $1::uuid)
         RETURNING id`,
        [studentId, input.data.reservationId],
      );
      if (!result.rows[0]) throw new StudentsDatabaseError("STUDENT_RECORD_CONFLICT");
    } else if (input.action === "reservation.unlink") {
      entityType = "reservation";
      entityId = input.data.reservationId;
      const result = await client.query(
        `UPDATE booking_reservations SET student_id = NULL, updated_at = now()
         WHERE id = $2::uuid AND student_id = $1::uuid RETURNING id`,
        [studentId, input.data.reservationId],
      );
      if (!result.rows[0]) throw new StudentsDatabaseError("STUDENT_RECORD_CONFLICT");
    }

    if (!entityId) throw new StudentsDatabaseError("STUDENT_RECORD_CONFLICT");
    await audit(client, { studentId, entityType, entityId, action: input.action, actorEmail, changedFields: "data" in input ? Object.keys(input.data) : [] });
    return { id: entityId };
  });
}
