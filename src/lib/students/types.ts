export const studentStatuses = ["active", "inactive", "completed"] as const;
export const trainingCategories = ["A", "B", "A+B"] as const;
export const lessonStatuses = ["scheduled", "completed", "cancelled", "no_show"] as const;
export const skillLevels = ["not_assessed", "learning", "developing", "autonomous"] as const;
export const processTypes = ["first_license", "category_addition", "licensed_training", "practical_test"] as const;
export const contractStatuses = ["pending", "partial", "paid", "cancelled"] as const;
export const paymentStatuses = ["pending", "paid", "cancelled"] as const;
export const paymentMethods = ["pix", "cash", "debit", "credit"] as const;

export type StudentStatus = (typeof studentStatuses)[number];
export type TrainingCategory = (typeof trainingCategories)[number];
export type LessonStatus = (typeof lessonStatuses)[number];
export type SkillLevel = (typeof skillLevels)[number];
export type ProcessType = (typeof processTypes)[number];
export type ContractStatus = (typeof contractStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentMethod = (typeof paymentMethods)[number];

export type StudentSummary = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  trainingCategory: TrainingCategory;
  serviceType: string;
  status: StudentStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasFutureLessons?: boolean;
};

export type StudentMetrics = {
  total: number;
  active: number;
  inactive: number;
  completed: number;
  withFutureLessons: number;
};

export type LessonRecord = {
  id: string;
  modality: string;
  startsAt: string;
  durationMinutes: number;
  status: LessonStatus;
  content: string | null;
  notes: string | null;
  bookingReservationId: string | null;
  googleEventId: string | null;
};

export type SkillAssessment = {
  id: string;
  lessonId: string | null;
  vehicleCategory: "A" | "B";
  skillCode: string;
  skillLabel: string;
  level: SkillLevel;
  comments: string | null;
  assessedOn: string;
  createdAt: string;
};

export type LicenseProcess = {
  id: string;
  processType: ProcessType;
  category: TrainingCategory;
  statusLabel: string;
  steps: string[];
  notes: string | null;
  startedOn: string | null;
  completedOn: string | null;
};

export type ContractRecord = {
  id: string;
  description: string;
  amount: string;
  lessonsCount: number | null;
  status: ContractStatus;
  agreedOn: string;
  notes: string | null;
};

export type PaymentRecord = {
  id: string;
  contractId: string | null;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidOn: string | null;
  notes: string | null;
};

export type StudentNote = {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
};

export type BookingLink = {
  id: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  linked: boolean;
};

export type StudentWorkspace = {
  student: StudentSummary;
  lessons: LessonRecord[];
  skills: SkillAssessment[];
  processes: LicenseProcess[];
  contracts: ContractRecord[];
  payments: PaymentRecord[];
  notes: StudentNote[];
  reservations: BookingLink[];
  availableReservations: BookingLink[];
  lessonCounts: Record<LessonStatus, number>;
  financial: { agreed: string; paid: string; balance: string };
};
