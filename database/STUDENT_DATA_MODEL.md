# Modelo futuro de alunos no mesmo Supabase

O projeto **Luciano Direção Segura** deve permanecer como o único PostgreSQL do
sistema. Esta etapa cria somente as tabelas técnicas do agendamento. Antes de
criar tabelas de alunos, consulte o Schema Visualizer/Table Editor do projeto e
exporte a definição existente para evitar nomes e cadastros duplicados.

Modelo planejado, ainda não executado:

- `students`: cadastro canônico e dados mínimos do aluno;
- `license_processes`: processo de primeira habilitação ou adição de categoria;
- `lessons`: aulas previstas e realizadas, ligadas ao aluno e, quando aplicável,
  à reserva de origem;
- `student_skills`: habilidades observadas sem diagnóstico médico;
- `student_notes`: anotações operacionais com autoria e data;
- `contracts`: condições comerciais aceitas;
- `payments`: lançamentos e estados de pagamento, sem armazenar dados completos de
  cartão;
- `booking_reservations.student_id`: vínculo opcional futuro com `students`.

Uma reserva pública não deve criar automaticamente múltiplas fichas a partir de
variações de telefone/e-mail. O vínculo com um aluno existente deve ser confirmado
no fluxo administrativo. CPF e informações financeiras só devem ser adicionados
quando houver finalidade, base legal, controle de acesso administrativo e política
de retenção definidos.

As futuras tabelas devem ter RLS habilitado, nenhum acesso para `anon`, políticas
administrativas testadas e trilha de alterações para campos sensíveis. Nenhuma
dessas tabelas deve ser consultada diretamente pelos componentes públicos.
