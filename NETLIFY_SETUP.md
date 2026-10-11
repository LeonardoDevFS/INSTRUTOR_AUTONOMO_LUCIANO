# Publicação do painel administrativo na Netlify

Este projeto usa rotas dinâmicas do Next.js para OAuth e Google Calendar API. Ele
não utiliza exportação estática e depende das funções server-side gerenciadas pela
integração Next.js da Netlify.

## 1. Variáveis de ambiente

No painel da Netlify, abra o site e acesse **Site configuration > Environment
variables**. Cadastre as variáveis abaixo no contexto de produção:

```env
NEXT_PUBLIC_SITE_URL=https://instrutor-luciano-itajuba.netlify.app
NEXT_PUBLIC_GOOGLE_BOOKING_URL=URL_PUBLICA_DA_PAGINA_DE_AGENDAMENTO

AUTH_GOOGLE_ID=CLIENT_ID_DO_GOOGLE
AUTH_GOOGLE_SECRET=CLIENT_SECRET_DO_GOOGLE
AUTH_SECRET=SEGREDO_ALEATORIO_EXCLUSIVO_DA_PRODUCAO
ADMIN_ALLOWED_EMAIL=instrutorautonomoluciano@gmail.com
GOOGLE_CALENDAR_ID=instrutorautonomoluciano@gmail.com
APP_TIMEZONE=America/Sao_Paulo

CUSTOM_BOOKING_ENABLED=false
DATABASE_URL=URI_TRANSACTION_POOLER_SUPABASE_PORTA_6543
GOOGLE_CALENDAR_REFRESH_TOKEN=REFRESH_TOKEN_OFFLINE
BOOKING_MIN_ADVANCE_MINUTES=VALOR_CONFIRMADO
BOOKING_MAX_ADVANCE_DAYS=VALOR_CONFIRMADO
BOOKING_BUFFER_MINUTES=0
BOOKING_CLOSED_DATES=
```

`AUTH_GOOGLE_SECRET` e `AUTH_SECRET` são segredos. Nunca use o prefixo
`NEXT_PUBLIC_` neles. `DATABASE_URL` e `GOOGLE_CALENDAR_REFRESH_TOKEN` também são
segredos exclusivos do servidor. Prefira um `AUTH_SECRET` de produção diferente do
ambiente local. Consulte `BOOKING_SETUP.md` antes de mudar
`CUSTOM_BOOKING_ENABLED` para `true`.

Em `DATABASE_URL`, use a URI copiada em **Supabase > Luciano Direção Segura >
Connect > Transaction pooler**. Ela deve usar a porta `6543` e terminar em
`sslmode=verify-full`. Não use a connection string direta na função serverless e
não exponha a URI ao navegador. Teste primeiro a cadeia de certificados padrão da
Netlify; não replique o caminho Windows de `SUPABASE_CA_CERT_PATH` em produção.
Configure uma CA adicional na Netlify somente se o runtime realmente apresentar
erro de cadeia. Nesse caso, cadastre `SUPABASE_CA_CERT_PEM` com o conteúdo PEM
completo do certificado oficial baixado no Supabase, sem desativar a validação TLS
ou de hostname. Não configure `SUPABASE_CA_CERT_PATH` e `SUPABASE_CA_CERT_PEM` ao
mesmo tempo.

Ao cadastrar variáveis, deixe o escopo disponível para **Functions** e **Builds**.
Depois de qualquer alteração, faça um novo deploy para que as funções recebam os
valores atualizados.

## 2. URLs no cliente OAuth do Google

No cliente OAuth do tipo **Aplicativo da Web**, mantenha:

### Origens JavaScript autorizadas

- `http://localhost:3000`
- `https://instrutor-luciano-itajuba.netlify.app`

### URIs de redirecionamento autorizados

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:53682/oauth2/callback` para a autorização offline local
- `https://instrutor-luciano-itajuba.netlify.app/api/auth/callback/google`

Quando `https://instrutorautonomoitajuba.com.br` estiver publicado, com DNS e
HTTPS funcionando, adicione também:

- origem: `https://instrutorautonomoitajuba.com.br`
- callback: `https://instrutorautonomoitajuba.com.br/api/auth/callback/google`

Não remova a URL Netlify antes de confirmar que o domínio próprio está estável.

## 3. Deploy

1. Confirme que a versão de Node utilizada pela Netlify é compatível com Next.js 16.
2. Use `npm run build` como comando de build.
3. Não configure diretório `out` nem `output: "export"`.
4. Salve as variáveis e selecione **Deploys > Trigger deploy > Deploy site**.
5. Confira os logs sem imprimir valores das variáveis.

As rotas abaixo precisam aparecer como dinâmicas/server-side:

- `/admin`
- `/admin/agenda`
- `/api/auth/*`
- `/api/admin/*`
- `/api/booking/*`

## 4. Validação após o deploy

1. Abra `/admin` em uma janela anônima e confirme o redirecionamento para o login.
2. Entre com `instrutorautonomoluciano@gmail.com`.
3. Confirme que outra conta não autorizada não acessa o painel.
4. Verifique o nome, fuso e eventos da agenda.
5. Faça o primeiro teste de escrita em uma agenda de teste, não na agenda real.
6. Crie um bloqueio futuro, confira no Google e depois remova apenas esse bloqueio.
7. Confirme manualmente que o agendador público respeita eventos ocupados da agenda.
8. Repita em celular.

## 5. Diagnóstico rápido

- **Erro de callback:** confira se a URL é idêntica no Google e no site, incluindo
  protocolo, domínio e `/api/auth/callback/google`.
- **Acesso negado:** confirme o usuário de teste e `ADMIN_ALLOWED_EMAIL`.
- **Agenda indisponível:** confirme a Calendar API, o consentimento do escopo
  `calendar.events` e `GOOGLE_CALENDAR_ID`.
- **Sessão cai após alguns dias:** aplicativos externos em modo Testing podem ter
  refresh tokens com duração de sete dias. Publique/verifique o app quando
  aplicável ou refaça o login durante os testes.
- **Bloqueio não afeta o formulário:** ative, no Appointment Schedules, a verificação
  de disponibilidade desta mesma agenda.

O painel não cancela reservas nativas automaticamente. Use **Gerenciar no Google
Agenda** para concluir cancelamentos ou reagendamentos pelo fluxo oficial.
