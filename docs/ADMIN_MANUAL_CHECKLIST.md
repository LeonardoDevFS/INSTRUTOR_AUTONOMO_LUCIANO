# Checklist manual — painel e agenda

Execute primeiro com uma agenda exclusiva de teste. Não use dados reais de alunos.

## Autenticação e segurança

- [ ] `/admin` redireciona uma sessão anônima para `/admin/login`.
- [ ] Conta fora de `ADMIN_ALLOWED_EMAIL` recebe acesso negado.
- [ ] Conta autorizada entra e consegue sair.
- [ ] APIs `/api/admin/*` respondem `401` sem sessão.
- [ ] Requisição de escrita com origem divergente responde `403`.
- [ ] Tokens e segredos não aparecem no HTML, DevTools ou respostas JSON.
- [ ] `/admin` envia `noindex` e `Cache-Control: private, no-store`.

## Leitura da agenda

- [ ] Dashboard mostra somente números calculados com eventos reais.
- [ ] Nome e fuso da agenda estão corretos.
- [ ] Dia, semana e mês mostram os mesmos horários do Google Agenda.
- [ ] Filtro diferencia bloqueios, eventos com participante e outros eventos.
- [ ] Evento recorrente é exibido, mas não pode ser removido pelo painel.
- [ ] O link abre exatamente o compromisso selecionado no Google Agenda.

## Bloqueios (agenda de teste)

- [ ] Horário final igual ou anterior ao inicial é rejeitado.
- [ ] Data inexistente é rejeitada.
- [ ] Dois cliques/reenvio com o mesmo identificador não duplicam o bloqueio.
- [ ] Sobreposição mostra aviso e não cancela o evento existente.
- [ ] Crie um bloqueio de teste das 09:00 às 10:30 e confirme a resposta da API.
- [ ] O bloqueio criado é privado, ocupado e não contém convidados.
- [ ] Bloqueio de dia inteiro cobre a data correta em São Paulo.
- [ ] Edição altera somente bloqueio criado pelo painel.
- [ ] Remoção exige confirmação e não aceita evento comum.
- [ ] O bloqueio torna o intervalo indisponível na página pública.

## Reserva pública

- [ ] O iframe continua carregando em desktop e celular.
- [ ] A duração oferecida continua em 50 minutos.
- [ ] Uma reserva de teste aparece no calendário correto.
- [ ] Nome, e-mail, telefone e serviço aparecem somente quando retornados pelo Google; campos ausentes mostram “Informação não disponível”.
- [ ] O horário reservado deixa de aparecer publicamente.
- [ ] O fluxo oficial de cancelamento notifica o participante e reabre o horário.
- [ ] O painel nunca informa cancelamento concluído apenas por abrir o Google.

## Publicação

- [ ] `npm test`, `npm run lint` e `npm run build` aprovados.
- [ ] Nenhum `.env.local`, token ou credencial aparece em `git status`.
- [ ] Callback local e callback Netlify cadastrados no cliente OAuth.
- [ ] Variáveis de produção configuradas na Netlify.
- [ ] Teste mobile feito com a conta administrativa real após autorização.
