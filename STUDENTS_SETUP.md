# Gestão de Alunos — preparação e migração

A Gestão de Alunos usa o mesmo PostgreSQL Supabase Free, o mesmo Transaction
Pooler e a autenticação Google já configurados. Não há outro serviço ou custo
mensal obrigatório.

## Estado atual

O código e a migração estão prontos, mas `database/students.sql` **não foi
executado automaticamente**. Enquanto as tabelas não existirem, `/admin/alunos`
mostra o estado seguro **Migração pendente** e não aceita cadastros.

## Revisão antes de aplicar

1. Abra `database/students.sql`.
2. Confirme que não existem `DROP`, `TRUNCATE`, exclusões ou renomeações.
3. Confirme os novos objetos:
   - `students`;
   - `lessons`;
   - `student_skill_assessments`;
   - `license_processes`;
   - `contracts`;
   - `payments`;
   - `student_notes`;
   - `student_audit_log`;
   - coluna opcional `booking_reservations.student_id`.
4. Confirme RLS e `REVOKE ALL` para `anon` e `authenticated`.
5. Faça backup ou snapshot conforme os recursos disponíveis no projeto.

## Aplicação manual

1. Acesse o projeto Supabase correto.
2. Abra **SQL Editor → New query**.
3. Cole todo o conteúdo de `database/students.sql`.
4. Revise novamente o projeto selecionado e clique em **Run**.
5. Não cole `DATABASE_URL`, tokens ou secrets no SQL Editor.
6. Execute localmente:

```bash
npm run students:verify
```

O verificador confere TLS, tabelas, coluna de vínculo, RLS, permissões e
integridade referencial. Os registros técnicos usados no teste são executados em
transação e revertidos com `ROLLBACK`.

## Teste local

1. Inicie com `npm run dev`.
2. Entre em `/admin/login` com a conta autorizada.
3. Abra `/admin/alunos`.
4. Cadastre uma ficha controlada, sem usar dados reais sem autorização.
5. Teste pesquisa, filtros, edição e as abas da ficha.
6. Exporte o CSV e confirme que o download exige a sessão administrativa.
7. Registre uma aula e altere sua situação para **Realizada**.
8. Registre uma avaliação didática, processo, condição comercial, pagamento e
   anotação de teste.
9. Vincule apenas uma reserva controlada e depois desvincule-a.
10. Arquive a ficha de teste e confirme que ela não aparece na lista principal.

Registrar uma aula manualmente não cria, edita nem remove eventos no Google
Agenda. O vínculo com reservas também não altera a lógica de concorrência,
idempotência, reconciliação ou criação de eventos existente.

## Produção

Depois da validação local, faça o deploy normal na Netlify. Nenhuma variável nova
é necessária: o módulo usa `DATABASE_URL`, a configuração TLS e a autenticação já
existentes. Não altere `CUSTOM_BOOKING_ENABLED` para publicar este módulo.

## Correção e eliminação LGPD

- Correções cadastrais devem ser feitas pela edição da ficha e ficam registradas
  na trilha de auditoria sem copiar valores pessoais para logs técnicos.
- O botão **Arquivar** é a proteção padrão contra exclusão acidental.
- Eliminação definitiva não está exposta na interface. Quando houver solicitação,
  revise obrigações de conservação, exporte o que for necessário e prepare uma
  operação administrativa específica e autorizada no banco.
- Nunca registre CPF, documentos, dados médicos, número completo de cartão, CVV,
  senha ou credencial bancária nas anotações.
