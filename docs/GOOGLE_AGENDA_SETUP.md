# Google Agenda — configuração do agendamento da Direção Segura

Este documento explica como configurar uma única página pública de agendamento para todos os serviços de Luciano Oliveira, usando uma conta Google pessoal e sem contratar uma assinatura.

## Antes de começar

- Faça a configuração inicial em um computador. O Google informa que a criação da página de agendamento não está disponível pelo aplicativo móvel.
- Use a conta Google que Luciano utilizará para administrar sua agenda.
- Revise previamente o nome e a foto públicos dessa conta. A página de reservas pode exibir essas informações.
- Nunca compartilhe senha, cookies, códigos de autenticação ou tokens com o projeto ou com terceiros.
- A conta pessoal gratuita permite uma única página de agendamento. Recursos adicionais podem exigir uma assinatura; não os ative para esta implementação.

Fontes oficiais do Google:

- [Criar uma programação de horários](https://support.google.com/calendar/answer/10729749?hl=pt-BR)
- [Compartilhar ou incorporar a página de agendamento](https://support.google.com/calendar/answer/10733297?hl=pt-BR)
- [Comparar recursos gratuitos e premium](https://support.google.com/calendar/answer/16287038?hl=pt-BR)

## 1. Acessar o Google Agenda

1. No computador, acesse [calendar.google.com](https://calendar.google.com/).
2. Entre na conta pessoal que será usada por Luciano.
3. Confirme que o fuso horário da conta está definido como `America/Sao_Paulo` ou horário de Brasília.
4. Sempre concentre os agendamentos e bloqueios no calendário principal dessa conta. A verificação simultânea de vários calendários é um recurso que pode exigir plano elegível.

## 2. Criar uma única programação de horários

1. Clique em **Criar**.
2. Escolha **Programação de horários** ou **Agendamento de horários**, conforme o texto exibido pelo Google.
3. Use um título público claro, como **Aulas Direção Segura — Luciano Oliveira**.
4. Não crie páginas separadas para carro, moto ou mentoria. Uma única programação deve atender todos os serviços para impedir reservas simultâneas.

## 3. Configurar a duração

1. Em **Duração do horário**, selecione a opção personalizada.
2. Informe **50 minutos**.
3. Não configure durações diferentes por serviço nesta etapa.

## 4. Configurar dias e horários

Use os horários máximos de atendimento como referência:

| Dia | Disponibilidade máxima |
| --- | --- |
| Segunda a sexta | 07:00–20:00 |
| Sábado | 07:00–13:00 |
| Domingo | Indisponível |

1. Configure de segunda a sexta dentro do período de 07:00 a 20:00.
2. Configure o sábado dentro do período de 07:00 a 13:00.
3. Marque o domingo como indisponível.
4. Se Luciano precisar de pausas, divida o mesmo dia em dois ou mais períodos. Não é necessário disponibilizar todo o expediente continuamente.

Domingos continuam sendo tratados somente por consulta direta via WhatsApp.

## 5. Configurar antecedência, janela e pausas

Na seção de janela de agendamento:

1. Defina a antecedência mínima desejada para novas reservas.
2. Defina até quantos dias ou semanas no futuro o aluno poderá reservar.
3. Se a opção estiver disponível sem pedido de upgrade, configure o intervalo necessário entre compromissos.
4. Se alguma opção solicitar assinatura, ignore-a e continue somente com os controles gratuitos.

O Google normalmente aplica uma antecedência mínima padrão. Revise essa opção caso não apareçam horários para o mesmo dia durante os testes.

## 6. Bloquear folgas, feriados e compromissos

Existem duas formas simples:

1. Use a disponibilidade ajustada para tornar uma data específica indisponível.
2. Crie um evento comum no calendário principal para bloquear um compromisso pessoal, folga ou outro atendimento.

Os eventos ocupados no calendário usado pela página devem retirar esses períodos da disponibilidade pública. Teste esse comportamento antes da publicação.

## 7. Configurar o formulário da reserva

O Google solicita nome, sobrenome e e-mail no formulário padrão. Adicione também as seguintes perguntas:

### Pergunta obrigatória de serviço

**Qual serviço você deseja agendar?**

Na descrição da pergunta ou da página, apresente as opções:

- Carro — Categoria B
- Moto — Categoria A
- Treinamento para habilitados
- Preparação para prova prática
- Adição de categoria
- Mentoria teórica

Use uma pergunta personalizada de texto e marque-a como obrigatória. O aluno deve digitar uma das opções.

### Pergunta de contato

**Telefone / WhatsApp para contato**

Adicione como pergunta personalizada de texto. Marque como obrigatória se essa opção estiver disponível sem exigir plano pago.

Não ative verificação avançada de e-mail, lembretes adicionais, pagamentos ou outra opção que solicite assinatura.

## 8. Revisar local, descrição e identidade pública

1. Em local e videoconferência, selecione a opção apropriada para o atendimento ou deixe o local para definição posterior.
2. Na descrição, informe que o ponto de encontro será combinado diretamente com o aluno.
3. Explique que a hora/aula dura 50 minutos.
4. Verifique o nome e a foto que aparecem publicamente.
5. Não publique endereço residencial, detalhes de outros alunos ou informações privadas da agenda.

## 9. Salvar e copiar o link público

1. Salve a programação.
2. Na área **Páginas de agendamento**, abra as opções da página criada.
3. Escolha a opção de compartilhamento.
4. Copie o link da página pública.
5. Abra o link em uma janela anônima para confirmar que apenas horários disponíveis e informações públicas são exibidos.

Links encurtados oficiais costumam utilizar o domínio `calendar.app.google`. Links completos da página de horários utilizam `calendar.google.com`.

## 10. Obter a incorporação oficial

1. No computador, abra as opções da página de agendamento.
2. Acesse **Opções de compartilhamento** e depois **Incorporação em site**.
3. Selecione **Página de agendamento incorporada** ou **Inline booking page**.
4. Escolha **Uma única página de agendamento**.
5. Copie o código fornecido pelo Google.
6. Dentro do código, localize o valor do atributo `src` do `iframe`. Ele deve começar com `https://calendar.google.com/` e conter `/calendar/appointments/schedules/`.

Não utilize o código de incorporação de um calendário público comum. Ele poderia expor eventos e não cria reservas. Use somente a incorporação específica da página de agendamento.

## 11. Configurar o projeto

1. Na raiz do projeto, crie ou edite o arquivo `.env.local`.
2. Adicione somente a URL pública obtida do atributo `src`:

```env
NEXT_PUBLIC_GOOGLE_BOOKING_URL="https://calendar.google.com/calendar/appointments/schedules/SEU_IDENTIFICADOR_PUBLICO?gv=true"
```

3. Não coloque o elemento `<iframe>` completo dentro da variável.
4. Não adicione senha, ID privado de calendário, chave de API, conta de serviço ou token.
5. Em desenvolvimento, reinicie o servidor do Next.js depois de alterar `.env.local`. Em produção, faça um novo build e publique novamente o projeto.

O projeto valida protocolo, domínio e caminho antes de incorporar a URL. Uma URL oficial encurtada em `calendar.app.google` será aceita como link externo, mas a incorporação automática requer a URL `calendar.google.com` fornecida no código inline.

## 12. Testar uma reserva

1. Acesse `/agendar` no site.
2. Confirme que a página do Google aparece dentro do contêiner.
3. Faça o teste em computador e celular.
4. Escolha um horário livre.
5. Preencha nome, sobrenome, e-mail, serviço e WhatsApp.
6. Conclua a reserva.
7. Confirme que o compromisso aparece no Google Agenda de Luciano.
8. Verifique se o horário reservado desaparece da página pública.
9. Crie um evento manual no mesmo calendário e confirme que esse intervalo também deixa de aparecer.
10. Cancele a reserva de teste quando terminar.

Não considere a integração validada de ponta a ponta antes de concluir esse teste com a URL real.

## 13. Administrar pelo celular

Depois da configuração inicial no computador, Luciano poderá usar o aplicativo Google Agenda para:

- consultar reservas;
- identificar o aluno e o serviço informado;
- criar bloqueios e compromissos manuais;
- alterar ou cancelar eventos;
- consultar a programação diária e semanal;
- compartilhar novamente o link público da página.

A criação e a configuração completa da programação devem ser feitas no computador. A rotina diária pode ser administrada pelo aplicativo.

## Limitações da opção gratuita

- Apenas uma página de agendamento deve ser usada.
- Todos os serviços terão duração padrão de 50 minutos.
- A escolha do serviço será informada em uma pergunta de texto.
- Verificação avançada de e-mail, vários lembretes, pagamentos e verificação de múltiplos calendários podem exigir plano elegível.
- Não existe envio automático de WhatsApp nesta implementação.
- O WhatsApp permanece como alternativa para dúvidas, domingos e situações especiais.
