# AGENTS.md — Direção Segura / Luciano Oliveira

## Objetivo do projeto
Desenvolver um site profissional, rápido, responsivo e orientado a conversão para Luciano Oliveira, Instrutor Autônomo em Itajubá/MG, marca "Direção Segura", slogan "Mais que dirigir, é evoluir.".

O site deve unir:
- conversão para WhatsApp e agendamento;
- SEO local para Itajubá/MG e região;
- autoridade e prova social;
- guias úteis sobre habilitação em Minas Gerais;
- identidade visual premium baseada no Instagram do Luciano.

Leia `docs/PROJECT_SPEC.md` antes de qualquer alteração relevante.

## Regras de trabalho
- Antes de modificar código, inspecione a estrutura e preserve o que já funciona.
- Não reescreva arquivos inteiros sem necessidade.
- Não invente informações comerciais, avaliações, números de alunos, taxas ou regras oficiais.
- Dados do Luciano devem ficar centralizados em `src/config/site.ts`.
- Conteúdo repetível deve ficar em `src/data/`.
- Componentes reutilizáveis ficam em `src/components/`.
- Integrações e helpers ficam em `src/lib/`.
- Evite dependências desnecessárias.
- Prefira Server Components; use `"use client"` apenas quando houver estado, eventos do navegador ou APIs client-side.
- TypeScript estrito. Evite `any`.
- Garanta acessibilidade: HTML semântico, foco visível, labels, aria quando necessário, contraste adequado.
- Não comprometa performance por animações.
- Não use imagens externas sem necessidade; preferir `next/image` e arquivos de `public/images/`.
- Não expor secrets no cliente ou no Git.
- `.env.example` pode conter apenas nomes de variáveis e valores de exemplo não sensíveis.

## Stack
- Next.js 16 / App Router
- React
- TypeScript
- Tailwind CSS 4
- lucide-react
- clsx
- tailwind-merge
- npm

## Identidade visual
- Base: preto quase absoluto.
- Destaques: dourado/amarelo.
- Texto: branco e cinzas neutros.
- Estética: automotiva, premium, estrada, conquista, liberdade e confiança.
- Evitar aparência genérica de autoescola.
- Luciano é a marca; carro, moto, escudo e fotos reais devem ter protagonismo.
- Animações discretas; mobile deve priorizar velocidade.

## Marca e dados
- Nome: Luciano Oliveira
- Profissão: Instrutor Autônomo
- Marca: Direção Segura
- Slogan: Mais que dirigir, é evoluir.
- Cidade: Itajubá/MG
- Área: Itajubá e região
- Experiência divulgada: 27 anos
- WhatsApp: (35) 99181-2056
- Instagram: @inst_luciano
- Categorias: A e B

## Serviços principais
- Primeira habilitação
- Aulas de carro
- Aulas de moto
- Adição de categoria
- Preparação para prova prática
- Treinamento para habilitados
- Pessoas com medo/insegurança para dirigir
- Mentoria teórica

## Regras operacionais
- Hora/aula: 50 minutos.
- Segunda a sexta: 07:00–20:00.
- Sábado: 07:00–13:00.
- Domingo: somente mediante consulta e disponibilidade.
- Mentoria teórica: online e atualmente gratuita; presencial pode ocorrer conforme disponibilidade.
- Preços: não exibir publicamente por enquanto.
- Pagamento: dinheiro, PIX, débito e crédito.
- Parcelamento: até 3x sem juros; até 18x com juros.
- Remarcação/cancelamento: combinado diretamente com o aluno.
- Frequência: normalmente 1 aula por dia é recomendada, mas o aluno pode combinar outra necessidade.

## Rotas e arquitetura
Consulte `docs/PROJECT_SPEC.md`. Não criar rotas duplicadas ou conteúdo concorrendo consigo mesmo.

## SEO
- Prioridade alta para SEO local e conteúdo útil.
- Não fazer keyword stuffing.
- Metadata exclusiva por rota.
- URLs legíveis.
- sitemap e robots.
- JSON-LD adequado.
- Open Graph.
- Core Web Vitals.
- Conteúdo dos guias deve indicar data de atualização.
- Informações legais/oficiais de CNH em MG devem vir de fontes oficiais e nunca ser inventadas.
- Não prometer primeiro lugar no Google.
- Nunca fabricar avaliações ou depoimentos.

## Agenda
Objetivo futuro: Google Calendar como agenda operacional para o Luciano no celular.
- Página pública deve consultar horários disponíveis.
- Aula padrão de 50 minutos.
- Domingo deve direcionar para consulta via WhatsApp, salvo decisão posterior.
- Não expor detalhes privados de eventos do calendário.
- Não permitir dupla reserva.
- Integração real só após credenciais/configuração adequada.
- Até lá, usar camada/mock desacoplado da UI.

## Verificação obrigatória
Antes de concluir uma alteração relevante:
1. Rodar `npm run lint`.
2. Rodar `npm run build`.
3. Corrigir erros causados pela alteração.
4. Informar resumidamente quais arquivos foram alterados e o resultado dos checks.

## Git
- Não apagar histórico.
- Não remover arquivos do usuário sem necessidade.
- Commits devem ser objetivos.
- Não commitar `.env.local`, credenciais, `.next/` ou `node_modules/`.

## Princípio central
O site não deve parecer um template. Deve parecer a presença digital oficial da marca Direção Segura, com foco em confiança, clareza, autoridade local e facilidade para agendar.
