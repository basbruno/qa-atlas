# QA Atlas — roadmap do Bruno

Sistema web pessoal em português para evoluir até QA Sênior: **22 semanas, 110 aulas e 220 horas**, com 2 horas por sessão no Windows e VS Code.

## Publicar como página web no GitHub

O app está preparado para **GitHub Pages**, com publicação automática pelo arquivo `.github/workflows/pages.yml`. O build configura os caminhos conforme o endereço do Pages, inclusive quando o site fica em `/nome-do-repositorio/`.

1. Crie um repositório no GitHub com branch principal `main` ou `master` e envie o conteúdo desta pasta. Inclua a pasta oculta `.github`; não envie `node_modules/` nem `dist/`.
2. No repositório, abra **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**.
3. Abra **Actions → Publicar QA Atlas no GitHub Pages → Run workflow** e execute na branch principal. Novos envios para essa branch publicam as alterações automaticamente.
4. Após a execução concluir, abra o endereço exibido no ambiente **github-pages**, normalmente `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Quem acessa a página não precisa instalar Node.js ou Python para usar o app. Os laboratórios continuam sendo arquivos para baixar e executar no computador.

O progresso continua salvo somente no navegador. Para levar seus dados da versão local à página publicada, use **Exportar progresso** na versão local e **Importar backup** na versão online.

O conteúdo de `public/`, incluindo o livro PDF e os laboratórios, é publicado junto com o site.

Para conferir o build antes de enviar:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run preview
```

Abra o endereço informado no terminal. No PowerShell, `npm.cmd` também funciona quando a política de execução bloqueia `npm.ps1`.

Referências: [Vite no GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages) e [criação de um site no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Abrir no Windows

Instale o **Node.js 24 LTS** (ou 22.12+), extraia o ZIP e abra esta pasta no VS Code. No terminal PowerShell:

```powershell
npm ci
npm run dev
```

Abra **http://127.0.0.1:5173**. Use sempre esse endereço para manter o mesmo armazenamento. O arquivo **iniciar-windows.cmd** instala as dependências na primeira vez e inicia o sistema.

Para abrir apenas a versão pronta, sem Node.js, se você já tem Python:

```powershell
py -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Abra o mesmo endereço. Não abra dist/index.html por duplo clique: o app usa módulos e precisa de servidor HTTP local. Instalações iniciais e referências externas exigem internet; o conteúdo e as fontes da interface são servidos localmente.

## O que está pronto

- Trilha do básico ao avançado: Python, pytest, pandas, Requests, Playwright web/API, arquitetura, confiabilidade, CI/CD, IA, MCP, BMAD Greenfield e Brownfield e projeto final.
- Aulas com conceito, desafio, critério de conclusão, referências, prompt de apoio, notas e registro de evidência.
- Progresso marcável, próxima aula e filtros combinados por tema, nível, texto e pendência.
- Agenda com cinco sessões de 2h, sábado opcional de recuperação, domingo livre e diário semanal.
- Banco de 30 cenários, exemplos de código, dataset CSV com oráculos e teste Playwright local para baixar.
- Painéis separados de 9 Quality Gates para Greenfield e Brownfield; aprovação exige campos e confirmação humana.
- Backup JSON, importação com combinação e migração do JSON do roadmap anterior de 60 aulas.
- Layout responsivo, navegação por teclado, diálogo nativo, fontes locais e teste automatizado de acessibilidade.

## Material completo adicionado

A área **Meu livro** integra as **256 páginas** do PDF “Perca o Medo da Automação — Edição Completa com Bônus”, de **Lilian Borba / QA Insider**, fornecido por você. O PDF original foi preservado byte a byte e acompanha o projeto em `public/leitura/`. O conteúdo é apresentado como material de referência da autora; as novas aulas e notas técnicas são adaptações do QA Atlas.

- Leitura por página, busca no texto integral, sumário com capítulos e ligação às semanas correspondentes.
- **269 entradas de exercícios**: 100 Web, 83 API, 35 SQL e 51 Mobile. Os números da capa/sumário não coincidem com todas as entradas efetivamente presentes. API tem números repetidos e lacunas; Mobile repete o 025; SQL não contém 026–040. O sistema mantém cada entrada por tema, número e página. Não foram inventados itens ausentes.
- **50 prompts**, **36 itens de checklist** e **62 termos** realmente presentes no glossário.
- Filtros de tema/nível, gabarito recolhível, marcação, registro de adaptação e evidência; progresso do livro separado das aulas.
- **30 aulas novas nas semanas 17–22**: SQL; ecossistema JS/TS e ferramentas web/API; Appium/Android; Robot/BDD; performance/segurança; carreira, prompts e revisão profissional.
- Exemplos locais para baixar: `lab_sql.py` (SQLite em memória, 5 verificações), `smoke.robot` (regra pura) e `api_local.py` (mock HTTP local, sem autenticação/persistência).

A programação mantém cinco sessões de 2 horas por semana. Os 269 exercícios são um banco de prática selecionável; não é prometido concluir todo o acervo nas 220 horas. Escolha um recorte relacionado à aula dentro de 65 minutos de prática, e use o restante como aprofundamento.

A leitura em HTML preserva o texto, mas a extração pode alterar tabelas e quebras de código. O link **Ver página no PDF** abre a diagramação original. Código extraído precisa ser adaptado e conferido no ambiente antes do uso. As notas técnicas explicam requisitos atuais do ReqRes, Android/iOS, permissões Android 13, dialetos SQL, venv, protocolos e limites dos gabaritos.

### Atualizar a versão sem perder seu progresso

1. Exporte um backup na versão anterior.
2. Encerre o servidor antigo e extraia o novo ZIP em uma pasta separada.
3. Inicie esta versão e use o mesmo navegador e endereço `http://127.0.0.1:5173`.
4. A chave de armazenamento e os IDs das 80 aulas anteriores foram preservados. Se mudar de navegador/endereço, importe o backup. O formato antigo sem o campo `book` é aceito.

O backup completo inclui leitura, atividades, evidências e checklist do livro, além de aulas, diários e gates. A importação combina conclusões e mantém textos atuais nos conflitos.

## Seus dados

Conclusões, leitura, atividades, checklist, notas, evidências e gates ficam no **localStorage deste navegador**, na chave `qa-atlas-bruno-v3`. Não há backend, conta, telemetria ou sincronização. Navegadores, perfis, localhost e uma publicação privada têm armazenamentos independentes. Use **Exportar progresso** e **Ambiente e backup → Importar backup** para transferir seus dados. Limpar dados do navegador remove seu progresso local.

A importação combina conclusões e preserva notas/decisões atuais em conflitos. O JSON anterior aceita `guide: "bruno-qa"` com `schemaVersion: 2`, ou a estrutura antiga `{done, notes}`. As semanas de origem são remapeadas; datas inexistentes usam a data da importação. Um backup inválido preserva os dados atuais.

Os caminhos de evidência são apenas texto. Nenhum arquivo citado é enviado ou inspecionado pelo sistema. Gates registrados como aprovados são decisões humanas; o painel não certifica a qualidade dos arquivos.

## Como estudar

15 min de revisão + 25 min de conceito + 65 min de prática + 15 min de registro. Cada semana tem 5 aulas (10h). O sábado opcional não integra as 220h principais. Não compense atrasos dobrando a carga. Horas mostradas no dashboard são a carga prevista das aulas marcadas, não uma medição de tempo real. O cronômetro depende da página ativa.

Aulas e scripts Python são executados no terminal do VS Code, não dentro da interface. A tela Ambiente contém os comandos de venv. As aulas da semana 03 usam `public/defeitos.csv`: 10 linhas brutas, 1 duplicata, 1 valor negativo, 8 registros válidos; média 10h, mediana 9h, p95 linear 20,5h.

## Referências e limites do conteúdo

O currículo reaproveita o plano original `roadmap-quality-engineer-bruno.html` e adiciona 20 aulas para dados, MCP, Greenfield e Brownfield, mais 30 aulas de integração do livro. Há links de documentação oficial e páginas públicas da Alura, sem reprodução de aulas pagas. Referências principais conferidas em 15/10/2026; versões e catálogo podem mudar.

- Python e pytest: https://docs.python.org/3/library/venv.html e https://docs.pytest.org/en/stable/
- pandas: https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html
- Requests: https://requests.readthedocs.io/en/latest/user/quickstart/
- Playwright Python: https://playwright.dev/python/docs/intro e https://playwright.dev/python/docs/api-testing
- Playwright MCP: https://github.com/microsoft/playwright-mcp
- VS Code MCP: https://code.visualstudio.com/docs/agent-customization/mcp-servers
- BMAD: https://docs.bmad-method.org/
- TEA: https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/
- Sauce Labs: https://docs.saucelabs.com/web-apps/automated-testing/playwright/

Os **9 gates são uma matriz didática adaptável do seu plano anterior**, não uma lista oficial fixa do BMAD. Confira os comandos da versão instalada antes de executar workflows. O ciclo Greenfield define requisitos antes da implementação; o Brownfield acrescenta baseline, caracterização, impacto, regressão e rollback.

**SauceDemo** é o site público de treino da suíte Python local. **Sauce Labs Cloud** é uma extensão opcional, com conta e limites próprios; a documentação Playwright da nuvem oferece JS/TS com saucectl. O laboratório apresenta essa distinção e propõe portar somente um smoke para TypeScript. Os exemplos para serviços externos são didáticos e precisam de validação no ambiente; não foram executados contra esses serviços nesta entrega. Não faça carga em ambientes públicos.

## Stack e manutenção

React 19 + TypeScript 5.9 + Vite 8, Lucide React, Fontsource, Playwright Test e axe-core. As versões exatas estão no package-lock.json. O app é estático e usa localStorage para o escopo individual; não depende de banco ou API para o acompanhamento. Isso permite executá-lo localmente sem serviços adicionais.

```powershell
npm run build        # checagem TypeScript e build em dist/
npx playwright install chromium
npm test             # testes funcionais e de acessibilidade
```

Arquivos principais:

- `src/curriculum.json`: 110 aulas, 30 cenários e exemplos reaproveitados.
- `src/content.ts`: referências, gates, setup e configuração MCP.
- `src/store.ts`: persistência, validação, exportação e migração.
- `src/App.tsx`: interface e interações.
- `src/BookLibrary.tsx` e `src/book.ts`: leitura, atividades e notas técnicas.
- `src/book-index.json`: índice completo, auditoria de numeração, checklist e glossário.
- `public/leitura/`: PDF integral, texto por página, atividades e laboratórios.
- `scripts/import_book.py`: gerador reproduzível do índice (Python + PyMuPDF, somente para manutenção).
- `src/styles.css`: layout responsivo e estilos de foco/contraste.
- `tests/roadmap.spec.ts`: fluxos de uso e verificações automatizadas.

A análise automática de acessibilidade cobre critérios WCAG detectáveis pelo axe, e não constitui auditoria completa. A validação disponível está documentada em VALIDACAO.md.
