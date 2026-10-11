# Modelo de alunos no mesmo Supabase

O projeto **Luciano Direção Segura** deve permanecer como o único PostgreSQL do
sistema. O schema remoto foi inspecionado em 11 de outubro de 2026 e continha
somente as tabelas técnicas `booking_reservations` e `booking_rate_limits`.
A migração aditiva está pronta em `database/students.sql`, mas não foi executada.

Modelo preparado, ainda não executado:

- `students`: cadastro canônico e dados mínimos do aluno;
- `license_processes`: processo de primeira habilitação ou adição de categoria;
- `lessons`: aulas previstas e realizadas, ligadas ao aluno e, quando aplicável,
  à reserva de origem;
- `student_skill_assessments`: histórico de habilidades observadas sem diagnóstico médico;
- `student_notes`: anotações operacionais com autoria e data;
- `contracts`: condições comerciais aceitas;
- `payments`: lançamentos e estados de pagamento, sem armazenar dados completos de
  cartão;
- `student_audit_log`: trilha privada das alterações administrativas relevantes;
- `booking_reservations.student_id`: vínculo opcional com `students`.

Uma reserva pública não deve criar automaticamente múltiplas fichas a partir de
variações de telefone/e-mail. O vínculo com um aluno existente deve ser confirmado
no fluxo administrativo. CPF e informações financeiras só devem ser adicionados
quando houver finalidade, base legal, controle de acesso administrativo e política
de retenção definidos.

As relações que carregam simultaneamente o identificador do registro e do aluno
usam chaves estrangeiras compostas. Assim, pagamentos não aceitam contratos de
outro aluno, avaliações não aceitam aulas de outro aluno e aulas não aceitam
reservas vinculadas a outro aluno. `payments.contract_id` continua opcional e
reservas antigas com `student_id` nulo permanecem válidas e sem associação
automática.

Cadastros com nome e telefone iguais são bloqueados pelo PostgreSQL até que o
administrador confirme explicitamente a duplicidade. A decisão fica identificada
por data e e-mail administrativo; o índice de identidade é apenas de busca, pois
um índice `UNIQUE` impediria o fluxo de confirmação aprovado.

Todas as novas tabelas têm RLS habilitado e acesso revogado para `anon` e
`authenticated`. O acesso ocorre apenas pelas rotas administrativas autenticadas
do backend. Nenhuma dessas tabelas é consultada diretamente por componentes
públicos.
