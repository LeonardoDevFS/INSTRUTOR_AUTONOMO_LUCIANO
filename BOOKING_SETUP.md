# Agendamento personalizado — Supabase Free

A interface está disponível em `/agendar`, mas a confirmação permanece desativada
até a configuração e os testes descritos aqui serem concluídos. Nesse período,
**Agendar pelo Google** continua sendo o fluxo público seguro.

Esta arquitetura utiliza somente o projeto Supabase existente **Luciano Direção
Segura**, na região de São Paulo. Não é necessário criar Neon ou outro banco.

## Arquitetura

- Google Agenda: fonte operacional dos horários ocupados e eventos.
- Supabase PostgreSQL: reservas técnicas, concorrência, idempotência e rate limit.
- Netlify: site Next.js e endpoints server-side.
- OAuth Google offline: acesso da agenda sem depender da sessão `/admin`.
- Navegador: nunca recebe a connection string, refresh token ou acesso às tabelas.

O banco mantém IDs técnicos, serviço, intervalo, status e estado de sincronização.
Nome, e-mail, telefone e observações não são gravados nas tabelas técnicas; ficam
no evento privado do Google. O modelo futuro de alunos está documentado em
`database/STUDENT_DATA_MODEL.md` e usará o mesmo Supabase.

## 1. Conferir o projeto existente

No [Dashboard do Supabase](https://supabase.com/dashboard), abra **Luciano Direção
Segura**. Antes de executar SQL:

1. confira o Table Editor e o Schema Visualizer;
2. procure por `booking_reservations` e `booking_rate_limits`;
3. não apague nem renomeie tabelas existentes;
4. se houver tabelas com esses nomes e estrutura diferente, pare e compare o
   esquema antes da migração.

## 2. Executar a migração

Abra **SQL Editor > New query**, cole o conteúdo de `database/booking.sql`, revise e
execute. A migração é aditiva: usa `IF NOT EXISTS`, adiciona os campos de
sincronização quando faltarem e não remove dados.

Ela cria:

- restrição única de idempotência;
- restrição PostgreSQL que impede intervalos ativos sobrepostos;
- índices de disponibilidade e reconciliação;
- tabela de rate limit;
- RLS nas duas tabelas;
- revogação de acesso para `anon` e `authenticated`.

Depois da migração e de configurar `DATABASE_URL` localmente, execute:

```bash
npm run db:verify
```

O verificador confirma conexão TLS pelo pooler, tabelas, RLS, privilégios,
transação e bloqueio de sobreposição. Os registros de teste usam uma transação
revertida com `ROLLBACK`; nada permanece no banco.

Não crie políticas públicas. As operações passam exclusivamente pelos endpoints
Next.js usando a conexão PostgreSQL privada. RLS sem políticas e os `REVOKE`
impedem acesso via Data API para os papéis públicos.

## 3. Copiar a connection string correta

No projeto Supabase:

1. clique em **Connect**;
2. selecione **Transaction pooler**;
3. copie a URI da porta `6543`;
4. substitua `[YOUR-PASSWORD]` pela senha do banco;
5. altere o parâmetro final para `?sslmode=verify-full`;
6. salve o valor completo como `DATABASE_URL` somente no ambiente local e na
   Netlify.

Formato esperado:

```text
postgresql://postgres.PROJECT_REF:SENHA@HOST_DO_POOLER:6543/postgres?sslmode=verify-full
```

Não tente deduzir o host pela região. Copie-o do painel. O usuário do Shared Pooler
normalmente contém `postgres.PROJECT_REF`.

O Shared Transaction Pooler é indicado pelo Supabase para funções serverless. O
código usa `pg`, consultas parametrizadas sem prepared statements nomeados, pool
de uma conexão por instância e mantém `BEGIN`/`COMMIT`/`ROLLBACK` no mesmo client.

`verify-full` criptografa a conexão, valida a cadeia do certificado e confere o
hostname. Para desenvolvimento local, baixe a CA em **Supabase > Database settings
> SSL Configuration** e informe o caminho somente em `.env.local`:

```env
SUPABASE_CA_CERT_PATH="C:\caminho\privado\prod-ca-2021.crt"
```

O caminho não fica no código nem no Git, e o arquivo não deve ser copiado para
`public/`. O módulo PostgreSQL lê essa CA diretamente e mantém
`rejectUnauthorized: true`. Isso evita a divergência documentada pelo `pg`, em que
parâmetros SSL presentes na URL substituem um objeto `ssl` configurado à parte.
Em outro computador, baixe novamente a CA oficial e ajuste apenas esse caminho no
`.env.local`.

Na Netlify, comece sem `SUPABASE_CA_CERT_PATH` e valide a conexão com a cadeia de
confiança do runtime. Só se os logs demonstrarem erro de cadeia, crie
`SUPABASE_CA_CERT_PEM` com o conteúdo PEM completo da CA oficial baixada no painel.
O código aceita apenas uma das duas formas, mantém `rejectUnauthorized: true` e
não grava a CA em `public/`. Não use `NODE_TLS_REJECT_UNAUTHORIZED=0`,
`rejectUnauthorized: false` ou `sslmode=no-verify`.

Referência: [Conexões PostgreSQL no Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## 4. Autorização offline do Google

A reserva pública não usa a sessão administrativa. Ela precisa de um refresh token
da conta autorizada em `GOOGLE_CALENDAR_REFRESH_TOKEN`, guardado apenas no backend.

Antes de executar o comando, adicione exatamente este URI aos **URIs de
redirecionamento autorizados** do cliente OAuth do tipo Aplicativo da Web:

```text
http://localhost:53682/oauth2/callback
```

Depois execute:

```powershell
npm run google:authorize
```

O comando usa o fluxo OAuth 2.0 de aplicação web com:

- o mesmo `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`;
- escopo `https://www.googleapis.com/auth/calendar.events`;
- `access_type=offline`;
- `state` aleatório e PKCE S256;
- identificação `openid email` para confirmar `ADMIN_ALLOWED_EMAIL`;
- consulta somente leitura para validar acesso a `GOOGLE_CALENDAR_ID`;
- consentimento explícito antes de gravar em `.env.local`.

O refresh token nunca é mostrado no terminal. Ele só é salvo após digitar
`SALVAR`, sempre em `GOOGLE_CALENDAR_REFRESH_TOKEN` no `.env.local`, que já é
ignorado pelo Git. Não envie o token por chat e não use prefixo `NEXT_PUBLIC_`.

Se o Google não devolver um refresh token, revogue o acesso anterior do aplicativo
em **Conta Google > Segurança > Conexões com apps e serviços de terceiros** e
execute novamente. Em aplicativos externos no modo **Testing**, refresh tokens de
escopos não básicos podem expirar em sete dias; mantenha Luciano como usuário de
teste enquanto prepara a publicação e conclua a verificação aplicável antes do uso
definitivo. O script não contorna avisos nem requisitos do Google.

Referência: [OAuth 2.0 para aplicações web](https://developers.google.com/identity/protocols/oauth2/web-server).

## 5. Definir regras confirmadas

O expediente continua em `src/config/site.ts`: segunda a sexta 07:00–20:00,
sábado 07:00–13:00 e domingo sob consulta.

```env
BOOKING_MIN_ADVANCE_MINUTES=VALOR_CONFIRMADO_PELO_LUCIANO
BOOKING_MAX_ADVANCE_DAYS=VALOR_CONFIRMADO_PELO_LUCIANO
BOOKING_BUFFER_MINUTES=0
BOOKING_CLOSED_DATES=2026-12-25,2027-01-01
```

Não adicione datas ou regras sem confirmação. Serviços práticos usam os 50 minutos
já definidos. Orientações sem duração confirmada permanecem inativas.

## 6. Reconciliação PostgreSQL ↔ Google

Não existe uma transação única entre PostgreSQL e Google Calendar. Para preservar
a consistência:

- o intervalo é adquirido primeiro no PostgreSQL;
- o servidor revalida o Google antes de criar o evento;
- o ID do evento Google é determinístico;
- retenções expiradas não são liberadas antes de consultar esse ID no Google;
- se o evento existir, a reserva é confirmada no banco;
- se não existir, a retenção vira falha e o intervalo é liberado;
- cancelamentos ficam como `cancel_pending` até a exclusão ser confirmada;
- as próximas consultas processam até dez pendências antigas por vez.

Essa proteção resolve concorrência entre reservas internas. Ainda não existe
garantia transacional contra uma reserva externa criada no Google exatamente entre
a última leitura e a escrita. Enquanto os dois fluxos públicos coexistirem, o novo
agendador não deve ser o fluxo principal.

## 7. Ativar somente após validar

Use primeiro uma agenda e dados de teste. Depois de configurar banco, token e
regras, teste com `CUSTOM_BOOKING_ENABLED=true` apenas em ambiente controlado.

Checklist:

1. confirmar conexão pelo Transaction Pooler;
2. verificar RLS e ausência de acesso para `anon`/`authenticated`;
3. consultar disponibilidade sem login do aluno;
4. confirmar que bloqueios e eventos de dia inteiro removem horários;
5. tentar duas reservas simultâneas no mesmo intervalo;
6. repetir a mesma chave de idempotência;
7. simular falha entre banco e Google e conferir reconciliação;
8. conferir evento privado, convidado e metadados na agenda de teste;
9. conferir **Reserva pelo site** em `/admin/agenda`;
10. cancelar pelo painel e validar a sincronização;
11. testar em celular e no deploy da Netlify.

Somente após todos os itens use `CUSTOM_BOOKING_ENABLED=true` em produção.

## 8. Plano gratuito e indisponibilidade

O projeto permanece em R$ 0 enquanto estiver nos planos gratuitos e dentro das
franquias, sem habilitar add-ons ou upgrades:

- Supabase Free: consulte os limites atuais no painel. A documentação atualmente
  informa 500 MB de banco por projeto, 5 GB de egress e até dois projetos gratuitos.
- Projetos Supabase Free com baixa atividade podem ser pausados após cerca de sete
  dias. O proprietário recebe avisos e pode retomá-los pelo dashboard.
- Netlify Free usa limite mensal rígido de créditos. Ao esgotar, os sites podem ser
  pausados até o próximo ciclo; o plano Free não faz recarga automática.

Essas regras podem mudar. Monitore **Usage/Billing** nas duas plataformas. O código
não solicita upgrade, add-on IPv4, Redis, serviço de e-mail, SMS ou fila paga.

Referências:

- [Limites e cobrança do Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Pausa de projetos gratuitos](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Plano Free da Netlify](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)

## 9. Backup manual

Não presuma backups automáticos no plano gratuito. A recomendação oficial é gerar
exports regulares e mantê-los fora do Supabase.

Com PostgreSQL Client Tools instalado, use uma variável temporária privada apontando
para a conexão de backup indicada pelo Supabase e execute:

```powershell
pg_dump --format=custom --no-owner --no-privileges --file direcao-segura.dump $env:SUPABASE_BACKUP_URL
```

Guarde o arquivo criptografado e com acesso restrito, pois futuramente poderá conter
dados pessoais. Teste a restauração primeiro em um projeto/banco vazio:

```powershell
pg_restore --no-owner --no-privileges --dbname $env:SUPABASE_RESTORE_URL direcao-segura.dump
```

Não execute restauração sobre produção sem revisar o conteúdo, fazer novo backup e
planejar indisponibilidade. Para backup/restore, prefira a conexão indicada pelo
Supabase para ferramentas PostgreSQL, não a conexão Transaction Pooler usada pela
Netlify.

Referência: [Backups no Supabase](https://supabase.com/docs/guides/platform/backups).
