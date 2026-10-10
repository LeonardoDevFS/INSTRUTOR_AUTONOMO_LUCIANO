# Painel administrativo da Direção Segura

O painel fica em `/admin` e usa o Google Agenda como fonte dos compromissos. Ele
não possui banco de dados próprio e não substitui a página pública de agendamento.

## O que o painel faz

- autentica uma conta Google autorizada;
- lê eventos do calendário configurado;
- mostra visualizações de dia, semana e mês;
- abre o evento original no Google Agenda;
- cria, edita e remove somente bloqueios identificados pelo próprio painel;
- avisa sobre sobreposição antes de criar ou editar um bloqueio.

Reservas do Google Appointment Schedules não são apagadas automaticamente. O
painel abre o compromisso no Google Agenda para que o cancelamento/reagendamento
seja concluído pelo fluxo oficial, preservando notificações e disponibilidade.

## 1. Criar o projeto no Google Cloud

1. Entre em [Google Cloud Console](https://console.cloud.google.com/) com a conta
   responsável pela integração.
2. Crie ou selecione um projeto exclusivo para o site.
3. Em **APIs e serviços > Biblioteca**, ative **Google Calendar API**.
4. Em **Google Auth Platform** (ou **Tela de consentimento OAuth**), informe nome
   do aplicativo, e-mail de suporte e dados solicitados pelo Google.
5. Se o aplicativo estiver como **External / Externo**, adicione a conta do
   Luciano como usuário de teste enquanto a publicação não for concluída.

Aplicativos externos em modo Testing podem emitir refresh tokens de duração
reduzida. Se a sessão deixar de acessar a agenda, saia e entre novamente; para uso
cotidiano, conclua o processo de publicação/verificação aplicável no Google.

## 2. Configurar os escopos

O código solicita apenas:

- `openid`, `email` e `profile`, para identificar a conta;
- `https://www.googleapis.com/auth/calendar.events`, para consultar e administrar
  eventos da agenda configurada.

Cadastre os escopos do Calendar na tela de consentimento. O painel nunca envia
access token ou refresh token para o JavaScript do navegador; eles permanecem na
sessão JWT criptografada e HttpOnly do Auth.js.

## 3. Criar o cliente OAuth

1. Em **APIs e serviços > Credenciais**, crie um **ID do cliente OAuth**.
2. Escolha o tipo **Aplicativo da Web**.
3. Cadastre as origens JavaScript:
   - `http://localhost:3000`
   - `https://instrutor-luciano-itajuba.netlify.app`
   - `https://instrutorautonomoitajuba.com.br` somente após o domínio estar ativo
     com HTTPS.
4. Cadastre os URIs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://instrutor-luciano-itajuba.netlify.app/api/auth/callback/google`
   - `https://instrutorautonomoitajuba.com.br/api/auth/callback/google` somente
     depois da publicação do domínio.
5. Guarde o Client ID e Client Secret. Nunca os envie ao Git.

Se o domínio de produção mudar, adicione a nova origem e o callback equivalente.

## 4. Descobrir o calendário correto

No Google Agenda pelo computador, abra **Configurações > Configurações das minhas
agendas > Integrar agenda** e copie o **ID da agenda**. Use exatamente o calendário
considerado pela página de agendamento ao verificar conflitos. Para o calendário
principal da própria conta, `primary` também é aceito pela API.

Antes de produção, confirme manualmente nas configurações da página de horários
que eventos ocupados desse calendário realmente impedem novas reservas.

## 5. Variáveis locais

Crie `.env.local` na raiz (o arquivo já é ignorado pelo Git):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_BOOKING_URL="URL_PUBLICA_JA_CONFIGURADA"

AUTH_SECRET="SEGREDO_LONGO_ALEATORIO"
AUTH_GOOGLE_ID="CLIENT_ID_DO_GOOGLE"
AUTH_GOOGLE_SECRET="CLIENT_SECRET_DO_GOOGLE"
ADMIN_ALLOWED_EMAIL="instrutorautonomoluciano@gmail.com"
GOOGLE_CALENDAR_ID="instrutorautonomoluciano@gmail.com"
APP_TIMEZONE="America/Sao_Paulo"
```

Gere `AUTH_SECRET` com um gerador criptograficamente seguro (por exemplo,
`npx auth secret`) e não reutilize uma senha pessoal. Mais de um endereço pode ser
autorizado temporariamente separando-os por vírgula, mas mantenha somente as contas
necessárias.

Reinicie `npm run dev` depois de alterar variáveis.

### Sessão sem banco de dados

A sessão administrativa é stateless, criptografada com `AUTH_SECRET` e limitada a
oito horas. O access token e o refresh token não são enviados pela callback de
sessão ao navegador. Como a mesma chave é configurada em todas as funções da
Netlify, a sessão continua decodificável após reinícios serverless. Para a primeira
versão com um único administrador, isso evita um banco externo sem perder a
proteção dos tokens. Uma persistência adicional só será necessária se futuramente
houver múltiplos administradores, auditoria de ações ou revogação centralizada de
sessões.

## 6. Configurar na Netlify

1. Abra o site no painel da Netlify.
2. Acesse **Site configuration > Environment variables**.
3. Cadastre todas as variáveis do bloco anterior com valores de produção.
4. Em `NEXT_PUBLIC_SITE_URL`, use a URL HTTPS pública.
5. Nunca marque Client Secret, `AUTH_SECRET` ou ID privado como variável pública.
6. Dispare um novo deploy depois de salvar.

O projeto precisa continuar como aplicação Next.js dinâmica. Não use `output:
'export'`, pois login e Route Handlers dependem de execução no servidor.

## 7. Primeiro teste seguro

Use primeiro uma agenda de teste, sem compromissos reais:

1. inicie o projeto e abra `/admin`;
2. entre com o e-mail presente em `ADMIN_ALLOWED_EMAIL`;
3. confira o nome e fuso da agenda no dashboard;
4. consulte as três visualizações;
5. crie um bloqueio futuro sem participantes;
6. confira o evento privado e ocupado no Google Agenda;
7. confira se o horário desaparece da página pública de teste;
8. edite o bloqueio pelo painel;
9. remova somente esse bloqueio;
10. repita com a agenda de produção apenas depois da validação completa.

Os testes automatizados do repositório não chamam a API do Google e não alteram
nenhum calendário.

## Limitações reais

- Campos personalizados do formulário de reserva só aparecem se o Google os
  disponibilizar no evento retornado pela Calendar API. O painel não inventa dados.
- Um evento com participante é indicado como tal, mas isso não prova sozinho que
  ele seja uma aula ou uma reserva feita pelo site.
- Configurações internas do Appointment Schedules não têm gerenciamento completo
  por estes endpoints do Calendar.
- Cancelamento e reagendamento de reservas usam o Google Agenda para garantir o
  fluxo oficial. `events.delete` não é tratado como cancelamento nativo.
- Sem as credenciais e o consentimento da conta autorizada, a interface existe,
  mas a integração real não pode ser validada de ponta a ponta.
