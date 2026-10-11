# Checklist do agendamento personalizado na Netlify

Use este checklist depois que `npm run booking:doctor` validar as dependências
locais. Enquanto `CUSTOM_BOOKING_ENABLED=false`, a pendência de ativação exibida
pelo diagnóstico é esperada e deve permanecer assim até o teste controlado.
O diagnóstico e os testes iniciais devem usar uma agenda controlada. Não altere
eventos reais de alunos.

## 1. Variáveis do contexto Production

Cadastre no site correto em **Project configuration > Environment variables**.
Variáveis privadas não usam o prefixo `NEXT_PUBLIC_`.

### Site, painel e contingência

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_BOOKING_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_ALLOWED_EMAIL`
- `GOOGLE_CALENDAR_ID`
- `APP_TIMEZONE`

### Agendamento personalizado

- `DATABASE_URL`
- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `BOOKING_MIN_ADVANCE_MINUTES`
- `BOOKING_MAX_ADVANCE_DAYS`
- `BOOKING_BUFFER_MINUTES`
- `BOOKING_CLOSED_DATES` — opcional; vazio ou datas `AAAA-MM-DD` separadas por vírgula
- `CUSTOM_BOOKING_ENABLED` — mantenha `false` até o teste controlado

### Certificado opcional

- Não cadastre o caminho Windows de `SUPABASE_CA_CERT_PATH`.
- Comece sem `SUPABASE_CA_CERT_PEM`, usando a cadeia confiável do runtime.
- Se os logs mostrarem `BOOKING_DATABASE_TLS`, cadastre
  `SUPABASE_CA_CERT_PEM` com o PEM completo da CA oficial baixada no Supabase.
- Nunca use `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED=0` ou
  `sslmode=no-verify`.

No plano Free, a seleção de escopos específicos pode não estar disponível. Nesse
caso, mantenha o escopo padrão para todos. Se a interface oferecer escopos,
inclua **Builds** e **Functions**, pois a página `/agendar` é renderizada pela
função no runtime e as rotas `/api/booking/*` também usam essas variáveis.

## 2. Banco e TLS

- Use o Supabase Transaction Pooler na porta `6543`.
- A `DATABASE_URL` deve terminar em `sslmode=verify-full`.
- Não exponha a URI no navegador, em logs ou no repositório.
- Confirme que `booking_reservations` e `booking_rate_limits` existem.
- Preserve RLS e a revogação de acesso de `anon` e `authenticated`.

## 3. Google OAuth

- Ative a Google Calendar API no projeto correto.
- O refresh token deve pertencer a `ADMIN_ALLOWED_EMAIL` e acessar
  `GOOGLE_CALENDAR_ID`.
- O cliente web deve manter os callbacks do painel administrativo cadastrados.
- Confirme em **Google Auth Platform > Audience** se o aplicativo está em
  **Testing** ou **In production**. Esse estado não é retornado pela API.
- Em **Testing**, mantenha Luciano como test user e considere que o refresh token
  com escopo do Calendar pode expirar após sete dias.
- Nunca gere ou substitua o token automaticamente durante deploys.

## 4. Regras de disponibilidade

Confirme com Luciano antes de preencher:

- `BOOKING_MIN_ADVANCE_MINUTES`: antecedência mínima, inteiro maior ou igual a zero;
- `BOOKING_MAX_ADVANCE_DAYS`: tamanho da janela futura, inteiro maior que zero;
- `BOOKING_BUFFER_MINUTES`: intervalo adicional entre aulas, inteiro maior ou igual a zero;
- `BOOKING_CLOSED_DATES`: somente datas confirmadas sem atendimento.

Os horários-base continuam no código: segunda a sexta das 07:00 às 20:00,
sábado das 07:00 às 13:00 e domingo sob consulta pelo WhatsApp.

## 5. Deploy e diagnóstico

1. Mantenha `CUSTOM_BOOKING_ENABLED=false`.
2. Salve todas as demais variáveis no contexto **Production**.
3. Faça um novo deploy; alterações de ambiente só chegam às Functions em um
   deploy novo.
4. Confira o build: `/agendar` deve aparecer como dinâmica (`ƒ`), não estática (`○`).
5. Abra os logs de Functions e carregue `/agendar`.
6. Falhas seguras aparecem como:
   - `Public booking configuration unavailable`, com nomes das variáveis ausentes;
   - `BOOKING_DATABASE_TLS`, `BOOKING_DATABASE_CONFIGURATION` ou
     `BOOKING_DATABASE_UNAVAILABLE`;
   - `GOOGLE_OAUTH_EXPIRED`, `GOOGLE_OAUTH_CONFIGURATION` ou outro código Google.
7. Não existe endpoint público de diagnóstico de infraestrutura.

## 6. Teste controlado

Somente após banco, Google e regras estarem validados:

1. use uma agenda de teste ou uma janela explicitamente combinada;
2. altere `CUSTOM_BOOKING_ENABLED=true` no contexto Production;
3. faça um novo deploy;
4. abra `/agendar` em janela anônima;
5. selecione um atendimento ativo, data e horário;
6. faça uma única reserva controlada com dados de teste autorizados;
7. confira o evento privado no Google Agenda;
8. confira a reserva no painel `/admin/agenda`;
9. cancele o evento de teste pelo fluxo previsto e verifique a sincronização;
10. teste duas solicitações para o mesmo horário e a repetição da mesma chave de
    idempotência;
11. se qualquer etapa falhar, volte `CUSTOM_BOOKING_ENABLED=false`, faça novo
    deploy e mantenha o agendamento pelo Google como contingência.

Não declare produção validada apenas porque a consulta de disponibilidade retorna
horários. A confirmação controlada e a verificação do evento no Google são
obrigatórias.
