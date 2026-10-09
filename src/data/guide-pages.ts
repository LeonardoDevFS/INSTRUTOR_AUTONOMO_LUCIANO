export type OfficialSource = {
  id: string;
  title: string;
  shortTitle: string;
  url: string;
  officialUpdatedAt?: string;
};

export type JourneyStep = {
  id: string;
  title: string;
  summary: string;
  what: string;
  why: string;
  actions: readonly string[];
  requirements: readonly string[];
  after: string;
  tip: string;
  sourceIds?: readonly OfficialSourceId[];
  notice?: { title: string; text: string; tone?: "attention" | "info" };
};

export type JourneyFaqItem = { question: string; answer: string };
export type GlossaryItem = { term: string; definition: string };
export type GuideStep = { title: string; description: string };
export type JourneyVariant = {
  id: string;
  label: string;
  title: string;
  description: string;
  highlights: readonly string[];
};

export const guideReviewDate = "9 de outubro de 2026";

export const officialGuideSources = {
  firstLicense: {
    id: "firstLicense",
    title: "Obter a 1ª habilitação: CNH ou ACC — Portal MG",
    shortTitle: "Primeira habilitação no Portal MG",
    url: "https://www.mg.gov.br/servico/obter-1a-habilitacao-cnh-ou-acc",
    officialUpdatedAt: "9 de setembro de 2026",
  },
  categoryAddition: {
    id: "categoryAddition",
    title: "Adicionar categoria A ou B, ou ACC — Portal MG",
    shortTitle: "Adição de categoria no Portal MG",
    url: "https://www.mg.gov.br/servico/adicionar-categoria-ou-b-ou-acc",
    officialUpdatedAt: "30 de abril de 2026",
  },
  cnhBrasil: {
    id: "cnhBrasil",
    title: "CNH do Brasil — Ministério dos Transportes",
    shortTitle: "CNH do Brasil",
    url: "https://www.gov.br/transportes/pt-br/cnh-do-brasil",
  },
  resolution1020: {
    id: "resolution1020",
    title: "Resolução Contran nº 1.020/2025",
    shortTitle: "Resolução Contran nº 1.020/2025",
    url: "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10202025.pdf",
    officialUpdatedAt: "10 de dezembro de 2025",
  },
  autonomousInstructor: {
    id: "autonomousInstructor",
    title: "Autorizar instrutores de trânsito autônomos — Portal MG",
    shortTitle: "Instrutor autônomo em Minas Gerais",
    url: "https://www.mg.gov.br/servico/autorizar-instrutores-de-transito-autonomos",
  },
} as const satisfies Record<string, OfficialSource>;

export type OfficialSourceId = keyof typeof officialGuideSources;

export const firstLicenseSteps: readonly JourneyStep[] = [
  {
    id: "entender-cnh",
    title: "Entenda o que é a CNH",
    summary: "Conheça os documentos entre o início do processo e a habilitação definitiva.",
    what: "A Carteira Nacional de Habilitação é o documento definitivo que autoriza a condução dos veículos da categoria obtida. Na primeira habilitação, a pessoa aprovada recebe antes a Permissão para Dirigir (PPD), provisória e válida por um ano.",
    why: "Distinguir processo, PPD e CNH evita a expectativa de receber imediatamente o documento definitivo e esclarece as responsabilidades do primeiro ano.",
    actions: ["Conheça as categorias possíveis", "Entenda que curso, exames e aulas são etapas diferentes", "Acompanhe o processo apenas por canais oficiais"],
    requirements: ["Nenhum documento é necessário apenas para esta etapa de orientação"],
    after: "O próximo passo é confirmar se você atende aos requisitos legais para iniciar.",
    tip: "Encare a habilitação como uma sequência de aprendizagem, não apenas como uma prova.",
    sourceIds: ["resolution1020", "cnhBrasil"],
  },
  {
    id: "requisitos",
    title: "Confira os requisitos para começar",
    summary: "Valide idade, alfabetização, identificação e CPF antes de abrir o processo.",
    what: "É preciso ser penalmente imputável — na prática, ter 18 anos completos —, saber ler e escrever, possuir documento de identificação reconhecido por lei e estar inscrito no CPF.",
    why: "Esses dados são verificados na abertura do Renach e na coleta biométrica. Divergências cadastrais podem interromper as etapas seguintes.",
    actions: ["Confira nome e CPF nos documentos", "Separe identificação oficial atualizada", "Regularize divergências antes do atendimento"],
    requirements: ["18 anos completos", "Saber ler e escrever", "Documento oficial de identificação", "CPF"],
    after: "Com os requisitos conferidos, escolha a categoria adequada ao veículo que pretende conduzir.",
    tip: "Crie uma pasta física ou digital para comprovantes e protocolos.",
    sourceIds: ["firstLicense", "resolution1020"],
  },
  {
    id: "escolher-categoria",
    title: "Escolha entre A, B ou AB",
    summary: "Defina se sua formação será para motocicleta, automóvel ou para as duas categorias.",
    what: "A categoria A autoriza veículos motorizados de duas ou três rodas. A B abrange automóveis de até 3.500 kg e até oito passageiros além do motorista, sem incluir a A. A opção AB reúne as duas formações.",
    why: "A categoria determina o veículo, as aulas e o exame de direção. Na opção AB, a preparação e a prova prática acontecem para cada categoria.",
    actions: ["Considere o uso real do veículo", "Compare o tempo para treinar uma ou duas categorias", "Informe a escolha correta no requerimento"],
    requirements: ["Decisão entre categoria A, B ou AB"],
    after: "A escolha será registrada no requerimento e orientará a formação prática.",
    tip: "A opção AB amplia possibilidades, mas exige preparação prática separada para carro e moto.",
    sourceIds: ["firstLicense", "resolution1020"],
  },
  {
    id: "abrir-processo",
    title: "Inicie o processo nos canais oficiais",
    summary: "Abra o requerimento e faça a continuidade exigida para residentes de Minas Gerais.",
    what: "A norma federal permite iniciar pelos canais digitais da União, como a CNH do Brasil, ou pelo órgão estadual. O Portal MG alerta que quem começou no aplicativo federal também precisa cumprir o cadastro e as etapas operacionais mineiras.",
    why: "O requerimento cria o processo. Em Minas Gerais, dados, taxas e agendamentos estaduais precisam ficar associados ao prontuário correto.",
    actions: ["Escolha um canal oficial e evite duplicidade", "Preencha o formulário indicado pelo Portal MG", "Guarde o número da solicitação"],
    requirements: ["Conta Gov.br quando exigida", "Dados pessoais e endereço atualizados"],
    after: "O fluxo estadual orientará DAE, biometria e exames.",
    tip: "Salve a tela final e os comprovantes; não confie somente em mensagens de terceiros.",
    sourceIds: ["firstLicense", "cnhBrasil", "resolution1020"],
  },
  {
    id: "taxas-cadastro",
    title: "Emita o DAE e organize o cadastro",
    summary: "Entenda o documento de arrecadação sem depender de valores que mudam.",
    what: "DAE é o Documento de Arrecadação Estadual usado em Minas Gerais para taxas públicas. Cada etapa que exigir pagamento terá orientação e vencimento próprios.",
    why: "A compensação da taxa inicial libera etapas estaduais. Como valores e meios de pagamento podem mudar, este guia não fixa preços.",
    actions: ["Gere o DAE no serviço oficial", "Confira CPF, serviço e vencimento", "Guarde e consulte o comprovante"],
    requirements: ["CPF", "Dados do requerimento", "Meio de pagamento aceito no serviço"],
    after: "Após a compensação, agende biometria, exame médico e avaliação psicológica.",
    tip: "Confira o beneficiário antes de pagar e não use boleto enviado por perfil desconhecido.",
    sourceIds: ["firstLicense"],
  },
  {
    id: "biometria-exames",
    title: "Faça biometria e avaliações de aptidão",
    summary: "Registre sua identidade e realize as avaliações previstas para a primeira habilitação.",
    what: "A biometria reúne foto, assinatura e impressões digitais. O exame físico e mental verifica aptidão relacionada à condução; a avaliação psicológica integra a primeira habilitação.",
    why: "Os registros confirmam a identidade e verificam a aptidão para prosseguir. Luciano não realiza nem interfere nessas avaliações.",
    actions: ["Agende no canal indicado", "Compareça à clínica designada", "Acompanhe o lançamento dos resultados"],
    requirements: ["Documento oficial atualizado com foto e CPF", "Comprovante ou agendamento solicitado"],
    after: "Com os resultados lançados, siga para a formação teórica.",
    tip: "Chegue com antecedência e leve exatamente o documento indicado no agendamento.",
    sourceIds: ["firstLicense", "resolution1020"],
  },
  {
    id: "curso-teorico",
    title: "Conclua a formação teórica",
    summary: "Estude legislação e segurança pela opção gratuita ou por instituição habilitada.",
    what: "Em outubro de 2026, o Portal MG informa curso on-line gratuito pelo aplicativo CNH do Brasil, além de modalidades presenciais ou a distância oferecidas por CFCs credenciados.",
    why: "A conclusão registrada no Renach é necessária para o exame teórico. O certificado comprova participação; a prova oficial avalia o conhecimento.",
    actions: ["Escolha a modalidade", "Conclua os módulos e o envio indicado", "Confirme o registro antes de agendar a prova"],
    requirements: ["Conta Gov.br na opção CNH do Brasil", "Conclusão registrada no Renach"],
    after: "Com as etapas anteriores concluídas, emita a taxa aplicável e agende a prova teórica.",
    tip: "Relacione legislação e sinalização com situações observadas no cotidiano, em vez de apenas decorar respostas.",
    sourceIds: ["firstLicense", "cnhBrasil", "resolution1020"],
  },
  {
    id: "prova-teorica",
    title: "Realize a prova teórica",
    summary: "Demonstre o conhecimento necessário antes da aprendizagem prática.",
    what: "A prova teórica, chamada de prova de legislação no Portal MG, avalia o conteúdo aprendido. Ela é diferente do exame prático de direção.",
    why: "A aprovação confirma o conhecimento mínimo para iniciar a aprendizagem em via com supervisão.",
    actions: ["Emita a taxa quando o processo liberar", "Confira data, local e documentos", "Consulte o resultado pelo canal oficial"],
    requirements: ["Etapas anteriores concluídas", "Documento oficial com foto", "Agendamento"],
    after: "Após aprovação e expedição da Licença de Aprendizagem, começa a fase prática.",
    tip: "Explique em voz alta por que cada alternativa está certa ou errada para revelar dúvidas reais.",
    sourceIds: ["firstLicense", "resolution1020"],
    notice: { title: "Se houver reprovação", text: "É possível realizar nova prova. Consulte no Portal MG a taxa e o procedimento válidos para o seu caso.", tone: "attention" },
  },
  {
    id: "licenca-instrutor",
    title: "Receba a Licença de Aprendizagem",
    summary: "A LADV libera a prática supervisionada e precisa estar válida antes da aula em via.",
    what: "A Licença de Aprendizagem, também conhecida como LADV, é o documento digital que autoriza a prática supervisionada. As aulas podem ocorrer com instrutor autônomo autorizado ou profissionais vinculados às entidades previstas na norma.",
    why: "Sem licença e profissional autorizado, a atividade não integra regularmente o processo.",
    actions: ["Confirme a expedição digital", "Verifique a autorização do instrutor", "Combine veículo, plano e registro das aulas"],
    requirements: ["Aprovação teórica", "Licença válida", "Instrutor autorizado"],
    after: "O instrutor poderá planejar as habilidades práticas.",
    tip: "Conte o que já conhece e suas dúvidas antes da primeira aula; o planejamento começa pela conversa.",
    sourceIds: ["resolution1020", "autonomousInstructor", "firstLicense"],
  },
  {
    id: "aulas-praticas",
    title: "Desenvolva as habilidades práticas",
    summary: "Aprenda controle, observação e tomada de decisão de forma progressiva.",
    what: "As aulas transformam conhecimento em condução segura. A Resolução nº 1.020/2025 e o Portal MG informam mínimo de 2 horas para CNH A ou B — não as antigas 20 horas obrigatórias.",
    why: "O mínimo é requisito administrativo, não promessa de preparo. O número adequado depende das habilidades, da categoria e da avaliação pedagógica.",
    actions: ["Adapte-se aos comandos", "Pratique circulação e manobras", "Peça retorno objetivo sobre a evolução"],
    requirements: ["Licença válida", "Instrutor autorizado", "Veículo conforme as regras"],
    after: "Com o mínimo registrado e preparo adequado, siga para o exame de direção.",
    tip: "Não transforme a carga mínima em meta automática; priorize consistência e segurança.",
    sourceIds: ["firstLicense", "resolution1020"],
    notice: { title: "Regra atual", text: "A exigência antiga de 20 horas práticas não é a regra vigente. O mínimo atual para A ou B é de 2 horas, mas o treinamento pode ser maior quando necessário.", tone: "info" },
  },
  {
    id: "preparacao-exame",
    title: "Prepare-se para o exame prático",
    summary: "Transforme dificuldades específicas em objetivos de treino.",
    what: "A preparação final revisa procedimentos, observação e pontos ainda inconsistentes, sem criar promessa de aprovação.",
    why: "O exame verifica condições para conduzir com segurança. Treinar com intenção ajuda a corrigir erros antes da avaliação.",
    actions: ["Liste dificuldades", "Faça exercícios completos", "Confirme documentos, local e horário"],
    requirements: ["Aulas registradas", "Agendamento quando liberado"],
    after: "Com o agendamento confirmado, compareça à avaliação oficial.",
    tip: "Execute cada ação de modo consciente e previsível; segurança importa mais que pressa.",
    sourceIds: ["firstLicense", "resolution1020"],
  },
  {
    id: "exame-pratico",
    title: "Faça o exame de direção",
    summary: "Realize a avaliação oficial da categoria escolhida.",
    what: "O órgão de trânsito aplica o exame em percurso ou ambiente definido. Em Minas Gerais, a prova A ocorre em motopista; data, local e horário são informados pelo Detran-MG.",
    why: "A aprovação encerra a formação e permite a PPD. O instrutor prepara, mas não aplica a prova nem decide o resultado.",
    actions: ["Chegue com antecedência", "Priorize condução segura", "Consulte o resultado oficial"],
    requirements: ["Carga mínima registrada", "Agendamento", "Documento solicitado"],
    after: "Aprovado, o registro no Renach permite expedir a PPD; reprovado, siga o reagendamento oficial.",
    tip: "Observe, decida e execute uma ação de cada vez.",
    sourceIds: ["firstLicense", "resolution1020"],
    notice: { title: "Nova tentativa", text: "A norma federal prevê segunda tentativa sem taxa adicional, enquanto o Portal MG ainda descreve novo DAE em alguns fluxos. Confirme a regra aplicada antes de pagar.", tone: "attention" },
  },
  {
    id: "ppd-definitiva",
    title: "Passe pela PPD até a CNH definitiva",
    summary: "Use o primeiro ano com responsabilidade e acompanhe o documento definitivo.",
    what: "A PPD vale por um ano. Nesse período, não se pode cometer infração grave ou gravíssima nem reincidir em infração média. A Resolução nº 1.020/2025 prevê CNH automática ao fim do período se não houver impedimento definitivo.",
    why: "Uma infração impeditiva confirmada pode cancelar o documento e exigir reinício integral do processo.",
    actions: ["Acompanhe a emissão", "Dirija só a categoria obtida", "Verifique CNH digital e entrega após 12 meses"],
    requirements: ["Aprovação prática", "PPD válida", "Ausência de impedimento definitivo"],
    after: "Com a CNH definitiva, mantenha aprendizagem contínua e observe a validade do documento.",
    tip: "Aumente a complexidade dos trajetos gradualmente; autonomia cresce com prática responsável.",
    sourceIds: ["firstLicense", "resolution1020"],
  },
] as const;

export const categoryAdditionVariants: readonly JourneyVariant[] = [
  {
    id: "b-para-a",
    label: "Tenho B e quero A",
    title: "Do carro para a motocicleta",
    description: "Você já dirige carro, mas deseja conduzir motocicleta? A categoria A exige uma nova formação prática voltada ao equilíbrio, aos comandos e à dinâmica de duas rodas.",
    highlights: ["Treinamento em motocicleta", "Exame prático da categoria A", "Categoria incluída na CNH"],
  },
  {
    id: "a-para-b",
    label: "Tenho A e quero B",
    title: "Da motocicleta para o automóvel",
    description: "Você já conduz motocicleta e deseja dirigir carro? A categoria B trabalha comandos, percepção de espaço, manobras e circulação com veículo de quatro rodas.",
    highlights: ["Treinamento em automóvel", "Exame prático da categoria B", "Categoria incluída na CNH"],
  },
] as const;

export const categoryAdditionSteps: readonly JourneyStep[] = [
  {
    id: "entender-adicao",
    title: "Entenda o que é adição de categoria",
    summary: "Inclua A ou B sem confundir o serviço com mudança para C, D ou E.",
    what: "Adição é o processo para quem possui A e quer B, ou possui B, C, D ou E e quer A. Mudança de categoria é outro serviço, usado para avançar para C, D ou E, com requisitos próprios.",
    why: "Escolher o serviço correto evita formulários, exames e pagamentos incompatíveis com o objetivo.",
    actions: ["Confira a categoria atual na CNH", "Defina se deseja A ou B", "Use o serviço de adição, não o de mudança"],
    requirements: ["CNH ou PPD compatível com a categoria a adicionar"],
    after: "Confira se o prontuário e os dados permitem iniciar.",
    tip: "Observe a CNH digital ou física para confirmar quais categorias já constam no documento.",
    sourceIds: ["categoryAddition", "resolution1020"],
  },
  {
    id: "conferir-prontuario",
    title: "Confira prontuário e endereço",
    summary: "Regularize bloqueios e dados antes de abrir o processo.",
    what: "O Portal MG informa que o condutor deve residir no Estado, manter o endereço atualizado, não possuir bloqueio e não ter mais de uma infração gravíssima nos últimos 12 meses.",
    why: "A situação do prontuário pode impedir o processo, e o endereço é usado para entrega do documento.",
    actions: ["Consulte a situação do condutor", "Atualize o endereço", "Resolva bloqueios antes de emitir taxas"],
    requirements: ["Documento de habilitação", "CPF", "Endereço atualizado em Minas Gerais"],
    after: "Com os dados regulares, solicite oficialmente a adição.",
    tip: "Faça a consulta antes de planejar aulas; pendências administrativas cabem ao órgão competente.",
    sourceIds: ["categoryAddition"],
  },
  {
    id: "solicitar-servico",
    title: "Solicite a adição no canal oficial",
    summary: "Abra o serviço e emita o DAE sem depender de intermediários.",
    what: "A solicitação cria o processo no prontuário. Em Minas Gerais, o Portal MG direciona ao formulário do órgão de trânsito e ao Documento de Arrecadação Estadual.",
    why: "Sem processo aberto e taxa compensada, exames e licença não são vinculados corretamente.",
    actions: ["Acesse o formulário pelo Portal MG", "Confira dados e categoria", "Pague pelo canal oficial e guarde o comprovante"],
    requirements: ["Dados da CNH", "CPF", "Categoria pretendida"],
    after: "A compensação libera os exames aplicáveis.",
    tip: "Consulte o DAE atual do seu processo em vez de usar valores de publicações antigas.",
    sourceIds: ["categoryAddition"],
  },
  {
    id: "exames-aplicaveis",
    title: "Realize os exames aplicáveis",
    summary: "Faça a avaliação de aptidão e confirme exigências adicionais.",
    what: "A Resolução nº 1.020/2025 inclui aptidão física e mental e permite reaproveitar resultado apto, sem restrições, ainda válido. O Portal MG informa exame médico e avaliação psicológica para atividade remunerada; categorias C, D ou E podem exigir toxicológico.",
    why: "O resultado apto libera o prosseguimento e a Licença de Aprendizagem.",
    actions: ["Agende no canal oficial", "Leve os documentos indicados", "Acompanhe o resultado"],
    requirements: ["Documento oficial com foto e CPF", "Laudos adicionais quando aplicáveis"],
    after: "O resultado registrado permite a licença para a etapa prática.",
    tip: "Leia as exigências do seu prontuário; elas variam conforme atividade remunerada, exames e categoria atual.",
    sourceIds: ["categoryAddition", "resolution1020"],
  },
  {
    id: "licenca-aprendizagem",
    title: "Confirme a Licença de Aprendizagem",
    summary: "Só comece a nova categoria quando a autorização digital estiver disponível.",
    what: "Após o resultado apto no Renach, a norma federal prevê Licença de Aprendizagem para iniciar aulas na categoria pretendida sob supervisão direta.",
    why: "A licença comprova a liberação oficial da etapa prática.",
    actions: ["Consulte a licença", "Confira a categoria", "Não inicie antes da liberação"],
    requirements: ["Exames registrados", "Licença digital válida"],
    after: "Escolha o profissional e planeje o treinamento.",
    tip: "Compartilhe apenas o necessário para confirmar a liberação; nunca entregue a senha Gov.br.",
    sourceIds: ["resolution1020", "categoryAddition"],
  },
  {
    id: "escolher-instrutor",
    title: "Escolha um instrutor autorizado",
    summary: "Confirme quem poderá supervisionar e registrar a aprendizagem.",
    what: "A norma federal permite aulas com instrutor autônomo autorizado, instrutor de autoescola e profissionais das demais entidades previstas. Minas Gerais mantém serviço específico de autorização de autônomos.",
    why: "A aula precisa ser supervisionada e registrada por profissional habilitado para integrar o processo.",
    actions: ["Confirme a autorização", "Verifique como ocorrerá o registro", "Combine veículo, horários e objetivos"],
    requirements: ["Instrutor autorizado", "Atuação compatível com a categoria"],
    after: "Aluno e instrutor organizam o plano prático.",
    tip: "Pergunte como sua evolução será acompanhada, não apenas quantas aulas serão marcadas.",
    sourceIds: ["resolution1020", "autonomousInstructor", "categoryAddition"],
    notice: { title: "Fluxo estadual em atualização", text: "A página mineira de adição ainda descreve etapas pelo CFC, enquanto a norma federal vigente prevê instrutor autônomo. Confirme com o Detran-MG se o canal escolhido permite todos os registros do seu processo.", tone: "attention" },
  },
  {
    id: "planejar-treinamento",
    title: "Planeje o treinamento da nova categoria",
    summary: "Use a experiência anterior sem presumir que carro e moto funcionam do mesmo modo.",
    what: "Experiência prévia ajuda na leitura do trânsito, mas comandos, equilíbrio, percepção de espaço e dinâmica exigem aprendizagem própria.",
    why: "Um plano individual evita pular fundamentos e concentra tempo nas habilidades que precisam evoluir.",
    actions: ["Faça avaliação inicial", "Defina prioridades", "Organize frequência e prática"],
    requirements: ["Licença válida", "Veículo adequado", "Supervisão do instrutor"],
    after: "As aulas avançam dos fundamentos para as situações avaliadas.",
    tip: "Não compare seu ritmo na nova categoria com sua experiência na categoria atual.",
  },
  {
    id: "realizar-aulas",
    title: "Realize e registre as aulas práticas",
    summary: "Cumpra a regra atual e treine além do mínimo quando necessário.",
    what: "A Resolução nº 1.020/2025 aplica à adição os procedimentos da primeira habilitação. O Portal MG informa mínimo de 2 horas/aula para A ou B, incluindo 1 hora/aula noturna.",
    why: "O registro mínimo libera o exame, mas o preparo depende do domínio da nova categoria.",
    actions: ["Pratique fundamentos e situações avaliadas", "Acompanhe o registro", "Revise dificuldades antes do exame"],
    requirements: ["Mínimo vigente registrado", "Condições legais e de segurança"],
    after: "Com as aulas registradas, prepare-se especificamente para o exame.",
    tip: "Use o mínimo legal como ponto administrativo, não como medida automática de prontidão.",
    sourceIds: ["categoryAddition", "resolution1020"],
  },
  {
    id: "exame-direcao",
    title: "Prepare-se e faça o exame prático",
    summary: "Demonstre as habilidades da categoria que será adicionada.",
    what: "O exame avalia a categoria pretendida. A sequência da Resolução nº 1.020/2025 para adição A/B não inclui nova prova teórica.",
    why: "A aprovação permite registrar a nova categoria.",
    actions: ["Confirme agendamento e local", "Revise pontos indicados", "Consulte o resultado"],
    requirements: ["Aulas registradas", "Agendamento", "Documento solicitado"],
    after: "A aprovação no Renach leva à emissão do documento atualizado.",
    tip: "Prepare-se para conduzir com segurança, não para repetir movimentos sem compreender o ambiente.",
    sourceIds: ["categoryAddition", "resolution1020"],
    notice: { title: "Sem nova prova teórica", text: "A norma federal vigente lista aptidão, aulas práticas, exame de direção e documento. Não trate prova teórica como obrigatória sem orientação oficial específica.", tone: "info" },
  },
  {
    id: "documento-atualizado",
    title: "Acompanhe a inclusão no documento",
    summary: "Verifique a CNH digital e a entrega física após a aprovação.",
    what: "A Resolução nº 1.020/2025 prevê expedição automática da CNH com a nova categoria após o registro da aprovação.",
    why: "Só conduza o novo tipo de veículo quando a autorização estiver válida no documento.",
    actions: ["Consulte a CNH digital", "Acompanhe a entrega", "Confira a categoria"],
    requirements: ["Aprovação registrada no Renach"],
    after: "Com a categoria válida, continue praticando de modo progressivo.",
    tip: "Antes de conduzir sozinho, confirme no aplicativo oficial que a categoria já aparece.",
    sourceIds: ["categoryAddition", "resolution1020"],
  },
] as const;

export const licensedTrainingSteps: readonly JourneyStep[] = [
  {
    id: "primeiro-contato", title: "Primeiro contato", summary: "Conte o que dificulta sua rotina e onde deseja chegar.",
    what: "É uma conversa sobre experiência, tempo sem dirigir, situações evitadas, objetivos e disponibilidade.",
    why: "O treinamento deve começar pela necessidade real do aluno, não por roteiro genérico.",
    actions: ["Explique há quanto tempo não dirige", "Liste situações difíceis", "Informe disponibilidade"], requirements: ["CNH válida para a categoria"],
    after: "Luciano organiza uma avaliação inicial compatível com seu momento.", tip: "Seja específico: conte em qual trajeto, manobra ou condição a dificuldade aparece.",
  },
  {
    id: "avaliacao-inicial", title: "Avaliação inicial", summary: "Observe habilidades atuais sem julgamento e com segurança.",
    what: "Luciano conversa com o aluno e observa familiarização, comandos, coordenação, espaço e tomada de decisão em condições adequadas.",
    why: "A avaliação evita começar por situações avançadas ou repetir exercícios já dominados.",
    actions: ["Revisar posição e comandos", "Identificar pontos preservados", "Mapear habilidades a desenvolver"], requirements: ["Condições seguras definidas pelo instrutor"],
    after: "Os pontos observados viram um plano personalizado.", tip: "A primeira aula orienta o caminho; não serve para comparação com quem dirige diariamente.",
  },
  {
    id: "plano-personalizado", title: "Plano personalizado", summary: "Organize habilidades, exercícios e progressão.",
    what: "O plano define o que será trabalhado, em qual ordem e ambiente, sujeito à avaliação contínua.", why: "Metas pequenas tornam a evolução observável e o próximo desafio mais seguro.",
    actions: ["Definir prioridades", "Escolher exercícios iniciais", "Combinar progressão"], requirements: ["Objetivos e disponibilidade combinados"],
    after: "Começam os exercícios supervisionados, do ambiente controlado ao mais complexo.", tip: "Prefira metas concretas, como uma manobra ou um trajeto específico.",
  },
  {
    id: "treinamento-progressivo", title: "Treinamento progressivo", summary: "Pratique comandos, espaço, manobras e trânsito em sequência segura.",
    what: "As aulas podem trabalhar veículo, comandos, coordenação, percepção de espaço, estacionamento, circulação urbana, observação, antecipação de riscos e direção preventiva.", why: "A progressão consolida uma habilidade antes de acrescentar novas variáveis.",
    actions: ["Praticar uma habilidade por vez", "Repetir com variações graduais", "Aplicar em trajetos úteis"], requirements: ["Atividades compatíveis com a avaliação", "Condições legais e de segurança"],
    after: "Aluno e instrutor analisam avanços e pontos de atenção.", tip: "Se um exercício estiver difícil, retorne ao fundamento; controle e observação vêm antes da velocidade.",
  },
  {
    id: "acompanhar-evolucao", title: "Acompanhamento da evolução", summary: "Reconheça avanços e transforme pendências em próximos exercícios.",
    what: "Ao final das práticas, Luciano orienta sobre habilidades consistentes, erros recorrentes e situações que ainda exigem supervisão.", why: "Um retorno objetivo substitui a impressão vaga de ‘fui bem’ ou ‘fui mal’.",
    actions: ["Revisar o objetivo", "Registrar aprendizados", "Definir o próximo foco"], requirements: ["Participação ativa e comunicação"],
    after: "A complexidade aumenta somente quando houver base.", tip: "Anote uma conquista, um ponto de atenção e uma dúvida depois da aula.",
  },
  {
    id: "desenvolver-autonomia", title: "Desenvolvimento de autonomia", summary: "Leve as habilidades para situações reais com responsabilidade.",
    what: "A autonomia cresce quando a pessoa observa, decide e executa com menos intervenção, respeitando regras e limites atuais.", why: "O objetivo é apoiar condução consciente, não criar dependência do instrutor.",
    actions: ["Consolidar trajetos conhecidos", "Variar situações gradualmente", "Manter prática responsável"], requirements: ["Evolução compatível com as situações propostas"],
    after: "Continuidade ou encerramento é combinado conforme avaliação e objetivos.", tip: "Progresso é tomar decisões mais seguras e reconhecer quando ainda precisa praticar.",
    notice: { title: "Cada pessoa tem um ritmo", text: "Não existe número garantido de aulas para perder o medo ou dirigir sozinho. A progressão depende da avaliação e das condições de segurança.", tone: "info" },
  },
] as const;

export const firstLicenseFaq: readonly JourneyFaqItem[] = [
  { question: "Qual é a diferença entre prova teórica e prática?", answer: "A prova teórica verifica conhecimentos de legislação e segurança. A prática avalia a condução do veículo da categoria escolhida. Ambas são aplicadas pelo órgão de trânsito em momentos diferentes." },
  { question: "O curso teórico da CNH do Brasil é gratuito?", answer: "Sim. Na revisão deste guia, o Governo Federal e o Portal MG informavam a opção digital gratuita no aplicativo CNH do Brasil. CFCs também oferecem modalidades com condições próprias." },
  { question: "Ainda são obrigatórias 20 horas de prática?", answer: "Não como regra vigente para A ou B. A Resolução nº 1.020/2025 e o Portal MG informam mínimo de 2 horas/aula. Esse mínimo administrativo não significa que duas horas preparem toda pessoa." },
  { question: "O que acontece se eu reprovar?", answer: "É possível realizar nova avaliação. Como há divergência entre a norma federal e detalhes operacionais publicados pelo Portal MG sobre taxa e reagendamento, confirme a regra aplicada antes de pagar." },
  { question: "Luciano faz cadastro, exames ou emite a CNH?", answer: "Não. Cadastro, biometria, avaliações, provas e emissão são responsabilidades oficiais. Luciano pode orientar e atuar na etapa prática quando o processo e o formato estiverem autorizados." },
  { question: "A CNH definitiva chega automaticamente?", answer: "A Resolução nº 1.020/2025 prevê emissão automática após um ano de PPD, se não houver impedimento definitivo. Acompanhe a situação nos canais oficiais." },
] as const;

export const categoryAdditionFaq: readonly JourneyFaqItem[] = [
  { question: "Quem tem B pode adicionar A?", answer: "Sim. A adição A atende quem possui B, C, D ou E e quer conduzir motocicletas. Quem possui A ou ACC pode solicitar a adição B." },
  { question: "Adição A/B é igual à mudança para C, D ou E?", answer: "Não. Adição inclui A ou B. Mudança para C, D ou E é outro processo, com requisitos e formação próprios." },
  { question: "Preciso fazer outra prova teórica?", answer: "A sequência atual da Resolução nº 1.020/2025 para adição A/B não lista prova teórica: prevê exame de aptidão, aulas práticas, exame de direção e documento." },
  { question: "Quantas aulas são obrigatórias?", answer: "O Portal MG informa mínimo de 2 horas/aula para A ou B, incluindo 1 hora/aula noturna. O preparo individual pode exigir mais treinamento." },
  { question: "Posso fazer com instrutor autônomo?", answer: "A norma federal prevê instrutor autônomo autorizado, e Minas Gerais possui serviço de autorização. Como a página estadual ainda descreve parte do fluxo pelo CFC, confirme se todos os registros estão habilitados para o formato escolhido." },
  { question: "Quando a categoria aparece na CNH?", answer: "A regulamentação federal prevê expedição automática após a aprovação no Renach. Confira a CNH digital antes de conduzir sozinho na nova categoria." },
] as const;

export const licensedTrainingFaq: readonly JourneyFaqItem[] = [
  { question: "É um novo processo de habilitação?", answer: "Não. É aperfeiçoamento prático para quem possui CNH válida. As aulas não exigem prova nem emitem novo documento." },
  { question: "Preciso estar há muito tempo sem dirigir?", answer: "Não. Também atende quem dirige, mas quer trabalhar estacionamento, subidas, trânsito urbano, observação ou outra habilidade." },
  { question: "Quantas aulas vou precisar?", answer: "Não há número igual para todos. Depende da experiência, objetivo, frequência e evolução observada." },
  { question: "As aulas garantem que vou perder o medo?", answer: "Não existe promessa de eliminar medo ou ansiedade em prazo determinado. O treinamento trabalha habilidades progressivamente e respeita o ritmo individual." },
  { question: "Podemos usar trajetos do meu cotidiano?", answer: "Podem ser considerados quando adequados à avaliação do instrutor, às condições da via e ao estágio do treinamento." },
] as const;

export const guideGlossary: readonly GlossaryItem[] = [
  { term: "CNH", definition: "Carteira Nacional de Habilitação, documento definitivo que autoriza a condução conforme a categoria registrada." },
  { term: "PPD", definition: "Permissão para Dirigir, documento provisório da primeira habilitação, válido por um ano." },
  { term: "DAE", definition: "Documento de Arrecadação Estadual usado para pagar taxas públicas em Minas Gerais." },
  { term: "LADV", definition: "Sigla tradicional para Licença de Aprendizagem de Direção Veicular; a Resolução nº 1.020/2025 usa Licença de Aprendizagem." },
  { term: "Renach", definition: "Registro Nacional de Carteiras de Habilitação, base que reúne etapas e dados de candidatos e condutores." },
  { term: "Detran-MG", definition: "Órgão executivo estadual responsável por procedimentos de trânsito e habilitação em Minas Gerais." },
  { term: "Contran", definition: "Conselho Nacional de Trânsito, responsável por normas nacionais de trânsito." },
  { term: "Senatran", definition: "Secretaria Nacional de Trânsito, órgão máximo executivo de trânsito da União." },
  { term: "Categoria A", definition: "Categoria destinada aos veículos motorizados de duas ou três rodas, conforme a definição legal." },
  { term: "Categoria B", definition: "Categoria de automóveis de até 3.500 kg e até oito passageiros além do motorista, sem abranger a A." },
  { term: "Instrutor autônomo", definition: "Instrutor de trânsito autorizado pelo órgão estadual para atuar de forma autônoma dentro das regras aplicáveis." },
] as const;

export const fearOfDrivingSituations = [
  "Tenho CNH, mas quase nunca dirigi",
  "Tenho receio de dirigir no trânsito",
  "Quero melhorar estacionamento e manobras",
  "Não me sinto seguro em subidas",
  "Quero praticar trajetos urbanos",
  "Fiquei muito tempo sem dirigir",
  "Quero aprimorar direção preventiva",
] as const;
