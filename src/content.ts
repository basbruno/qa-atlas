import raw from "./curriculum.json";
export type Lesson = {
  id: string;
  legacyId?: number;
  bookPages?: number[];
  title: string;
  concept: string;
  challenge: string;
  criteria: string;
  prompt: string;
  topic: string;
  level: string;
  day: number;
  week: number;
  evidence: string;
  steps: string[];
};
export type Week = {
  id: number;
  title: string;
  goal: string;
  topic: string;
  level: string;
  gates: string[];
  lessons: Lesson[];
};
export const weeks = raw.weeks as Week[];
export const lessons = weeks.flatMap((w) => w.lessons);
export const cases = raw.cases;
export const examples = raw.examples;
export const topics = [...new Set(weeks.map((w) => w.topic))];
export const phases = [
  { name: "Fundamentos que sustentam", range: "Semanas 01–03", from: 1, to: 3 },
  { name: "Automação com intenção", range: "Semanas 04–09", from: 4, to: 9 },
  { name: "Qualidade em escala", range: "Semanas 10–13", from: 10, to: 13 },
  { name: "Decisões de QA Sênior", range: "Semanas 14–16", from: 14, to: 16 },
  { name: "Do livro para a prática", range: "Semanas 17–22", from: 17, to: 22 },
];
export type Resource = {
  title: string;
  url: string;
  topic: string;
  type: "Documentação" | "Laboratório" | "Alura";
  description: string;
};
export const resources: Resource[] = [
  {
    title: "Python · SQLite",
    url: "https://docs.python.org/3/library/sqlite3.html",
    topic: "SQL",
    type: "Documentação",
    description: "Banco local, transações e consultas com Python.",
  },
  {
    title: "PostgreSQL · tutorial SQL",
    url: "https://www.postgresql.org/docs/current/tutorial-sql.html",
    topic: "SQL",
    type: "Documentação",
    description: "Base para conferir dialetos e exemplos do material.",
  },
  {
    title: "Playwright Test · instalação",
    url: "https://playwright.dev/docs/intro",
    topic: "Ecossistema",
    type: "Documentação",
    description: "Projeto JavaScript/TypeScript da semana 18.",
  },
  {
    title: "Cypress · fundamentos",
    url: "https://docs.cypress.io/app/get-started/why-cypress",
    topic: "Ecossistema",
    type: "Documentação",
    description: "Modelo de execução e decisões de adoção.",
  },
  {
    title: "Selenium · Grid",
    url: "https://www.selenium.dev/documentation/grid/",
    topic: "Ecossistema",
    type: "Documentação",
    description: "Distribuição de sessões WebDriver.",
  },
  {
    title: "Karate · documentação",
    url: "https://docs.karatelabs.io/",
    topic: "Ecossistema",
    type: "Documentação",
    description: "Contratos e automação API no ecossistema Karate.",
  },
  {
    title: "Rest Assured · projeto oficial",
    url: "https://rest-assured.io/",
    topic: "Ecossistema",
    type: "Documentação",
    description: "Automação REST no ecossistema Java.",
  },
  {
    title: "Appium · requisitos e quickstart",
    url: "https://appium.io/docs/en/latest/quickstart/requirements/",
    topic: "Mobile",
    type: "Documentação",
    description: "Servidor, Node/npm e requisitos específicos do driver.",
  },
  {
    title: "UiAutomator2 · instalação e comandos",
    url: "https://github.com/appium/appium-uiautomator2-driver",
    topic: "Mobile",
    type: "Documentação",
    description: "Android SDK/JDK, doctor e comandos suportados.",
  },
  {
    title: "Android · permissões de mídia",
    url: "https://developer.android.com/about/versions/13/behavior-changes-13",
    topic: "Mobile",
    type: "Documentação",
    description: "Mudanças do Android 13 e targetSdk.",
  },
  {
    title: "Robot Framework · primeiros passos",
    url: "https://docs.robotframework.org/docs/getting_started/testing",
    topic: "Robot e BDD",
    type: "Documentação",
    description: "Ambiente virtual e bibliotecas.",
  },
  {
    title: "Cucumber · Gherkin",
    url: "https://cucumber.io/docs/gherkin/reference/",
    topic: "Robot e BDD",
    type: "Documentação",
    description: "Exemplos, cenários e linguagem de negócio.",
  },
  {
    title: "Robot Framework · bibliotecas",
    url: "https://robotframework.org/",
    topic: "Robot e BDD",
    type: "Documentação",
    description:
      "Catálogo oficial para SeleniumLibrary, RequestsLibrary e DatabaseLibrary.",
  },
  {
    title: "k6 · thresholds",
    url: "https://grafana.com/docs/k6/latest/using-k6/thresholds/",
    topic: "Não funcionais",
    type: "Documentação",
    description: "Critérios mensuráveis de aprovação e falha.",
  },
  {
    title: "JMeter · primeiros passos",
    url: "https://jmeter.apache.org/usermanual/get-started.html",
    topic: "Não funcionais",
    type: "Documentação",
    description: "Preparação e execução de planos de teste.",
  },
  {
    title: "OWASP · metodologia WSTG",
    url: "https://owasp.org/www-project-web-security-testing-guide/",
    topic: "Não funcionais",
    type: "Documentação",
    description: "Escopo, cenários e evidências de segurança.",
  },
  {
    title: "Playwright · boas práticas",
    url: "https://playwright.dev/docs/best-practices",
    topic: "Carreira",
    type: "Documentação",
    description: "Base para revisar decisões do seu portfólio.",
  },
  {
    title: "Python · ambientes virtuais",
    url: "https://docs.python.org/3/library/venv.html",
    topic: "Python",
    type: "Documentação",
    description: "Ambiente isolado e execução pelo interpretador correto.",
  },
  {
    title: "pytest · fixtures",
    url: "https://docs.pytest.org/en/stable/how-to/fixtures.html",
    topic: "pytest",
    type: "Documentação",
    description: "Preparação, escopos e limpeza dos testes.",
  },
  {
    title: "pytest · parametrização",
    url: "https://docs.pytest.org/en/stable/how-to/parametrize.html",
    topic: "pytest",
    type: "Documentação",
    description: "Um comportamento, várias entradas e casos identificáveis.",
  },
  {
    title: "pandas · primeiros passos",
    url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html",
    topic: "Dados",
    type: "Documentação",
    description: "Tabelas, CSV, seleção e estatísticas para sua semana 03.",
  },
  {
    title: "Requests · guia inicial",
    url: "https://requests.readthedocs.io/en/latest/user/quickstart/",
    topic: "Requests",
    type: "Documentação",
    description: "Métodos HTTP, JSON, erros e timeouts.",
  },
  {
    title: "Requests · sessões e recursos avançados",
    url: "https://requests.readthedocs.io/en/latest/user/advanced/",
    topic: "Requests",
    type: "Documentação",
    description: "Persistência de parâmetros, conexão e isolamento.",
  },
  {
    title: "Playwright Python · instalação",
    url: "https://playwright.dev/python/docs/intro",
    topic: "Playwright Web",
    type: "Documentação",
    description: "Plugin pytest, navegadores e requisitos de sistema.",
  },
  {
    title: "Playwright Python · locators",
    url: "https://playwright.dev/python/docs/locators",
    topic: "Playwright Web",
    type: "Documentação",
    description: "Seletores por papel, label e contrato de test id.",
  },
  {
    title: "Playwright Python · API testing",
    url: "https://playwright.dev/python/docs/api-testing",
    topic: "Playwright API",
    type: "Documentação",
    description: "APIRequestContext, preparação e verificação de estado.",
  },
  {
    title: "Playwright Python · CI",
    url: "https://playwright.dev/python/docs/ci",
    topic: "CI/CD",
    type: "Documentação",
    description: "Instalação e execução em integração contínua.",
  },
  {
    title: "SauceDemo · loja de prática",
    url: "https://www.saucedemo.com/",
    topic: "Playwright Web",
    type: "Laboratório",
    description:
      "Login, catálogo, ordenação, carrinho e checkout. Use as contas públicas de demonstração.",
  },
  {
    title: "Sauce Labs · Playwright na nuvem",
    url: "https://docs.saucelabs.com/web-apps/automated-testing/playwright/",
    topic: "CI/CD",
    type: "Documentação",
    description:
      "Extensão opcional em JS/TS com saucectl. Conta e limites do plano são independentes do SauceDemo.",
  },
  {
    title: "Restful Booker · contrato da API",
    url: "https://restful-booker.herokuapp.com/apidoc/index.html",
    topic: "Requests",
    type: "Laboratório",
    description: "Reservas, autenticação, CRUD e dados próprios com limpeza.",
  },
  {
    title: "Automation Exercise · APIs",
    url: "https://automationexercise.com/api_list",
    topic: "Playwright API",
    type: "Laboratório",
    description: "Contrato público para estudos de UI + API.",
  },
  {
    title: "The Internet · desafios web",
    url: "https://the-internet.herokuapp.com/",
    topic: "Playwright Web",
    type: "Laboratório",
    description: "Carregamento dinâmico, upload, alertas e elementos.",
  },
  {
    title: "Playwright MCP · projeto oficial",
    url: "https://github.com/microsoft/playwright-mcp",
    topic: "MCP",
    type: "Documentação",
    description:
      "Servidor, configuração e opções atuais. Registre a versão validada.",
  },
  {
    title: "VS Code · servidores MCP",
    url: "https://code.visualstudio.com/docs/agent-customization/mcp-servers",
    topic: "MCP",
    type: "Documentação",
    description:
      "Formato nativo de .vscode/mcp.json e gerenciamento no editor.",
  },
  {
    title: "BMAD · documentação oficial",
    url: "https://docs.bmad-method.org/",
    topic: "BMAD",
    type: "Documentação",
    description:
      "Planejamento de uma mudança e contexto para bases existentes. Os comandos dependem da versão instalada.",
  },
  {
    title: "TEA · estratégia e evidências",
    url: "https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/",
    topic: "BMAD",
    type: "Documentação",
    description:
      "Desenho por risco, automação, rastreabilidade e decisão de liberação.",
  },
  {
    title: "W3C · avaliação de acessibilidade",
    url: "https://www.w3.org/WAI/test-evaluate/",
    topic: "Confiabilidade",
    type: "Documentação",
    description: "Combine checagens automáticas, teclado e avaliação humana.",
  },
  {
    title: "OWASP · Web Security Testing Guide",
    url: "https://owasp.org/www-project-web-security-testing-guide/",
    topic: "Confiabilidade",
    type: "Documentação",
    description:
      "Referência para escopo e metodologia de testes de segurança autorizados.",
  },
  {
    title: "Python e APIs: conhecendo Requests",
    url: "https://www.alura.com.br/curso-online-python-apis-conhecendo-biblioteca-requests",
    topic: "Requests",
    type: "Alura",
    description:
      "Reforço das semanas 04–05. Selecione os tópicos ligados ao desafio do dia.",
  },
  {
    title: "Python e TDD: testes unitários",
    url: "https://www.alura.com.br/curso-online-python-tdd-explorando-testes-unitarios",
    topic: "pytest",
    type: "Alura",
    description:
      "Apoio para ciclo de teste, regras e refatoração. Adapte o runner ao pytest.",
  },
  {
    title: "Pandas: conhecendo a biblioteca",
    url: "https://www.alura.com.br/curso-online-pandas-conhecendo-biblioteca",
    topic: "Dados",
    type: "Alura",
    description:
      "Complemento para leitura, transformação e investigação de dados.",
  },
  {
    title: "OpenAI e Python: testes com IA",
    url: "https://www.alura.com.br/curso-online-openai-python-otimize-desenvolvimento-testes-ia",
    topic: "IA",
    type: "Alura",
    description:
      "Complemento para geração e revisão assistidas. API e cliente podem ter cobrança própria.",
  },
];
export const gates = [
  {
    id: "G1",
    title: "Requisitos testáveis",
    phase: "Descoberta",
    criterion:
      "Cada requisito prioritário tem critério observável, exemplo de entrada/saída e dúvidas resolvidas ou explicitamente pendentes.",
    artifact: "História + critérios de aceitação + exemplos.",
    green: "Defina a regra antes da implementação.",
    brown: "Separe contrato atual, mudança desejada e lacunas da baseline.",
  },
  {
    id: "G2",
    title: "Risco e estratégia",
    phase: "Planejamento",
    criterion:
      "Riscos têm impacto, probabilidade, prioridade, camada de teste e responsável. Cobertura dos riscos críticos foi justificada.",
    artifact: "Matriz de risco + estratégia por camada.",
    green: "Priorize riscos da funcionalidade nova.",
    brown: "Inclua consumidores, dependências e impacto da mudança.",
  },
  {
    id: "G3",
    title: "Arquitetura e testabilidade",
    phase: "Planejamento",
    criterion:
      "Contratos, observabilidade, dependências, isolamento e controle de dados foram avaliados e têm plano verificável.",
    artifact: "Contrato + mapa de dependências + revisão de testabilidade.",
    green: "Desenhe interfaces e pontos de observação.",
    brown: "Documente o comportamento atual antes de refatorar.",
  },
  {
    id: "G4",
    title: "Prontidão do ambiente",
    phase: "Preparação",
    criterion:
      "Dependências e configurações estão registradas; dados são reproduzíveis; um smoke conhecido executa no ambiente alvo.",
    artifact: "Versões + configuração + comando e resultado do smoke.",
    green: "Recrie o ambiente do zero.",
    brown: "Reproduza baseline e versão alterada com dados comparáveis.",
  },
  {
    id: "G5",
    title: "Desenho e aceitação",
    phase: "Preparação",
    criterion:
      "Cenários positivos, negativos e limites estão ligados aos requisitos. Em ATDD, a falha inicial ocorre pelo motivo esperado.",
    artifact: "Matriz requisito→cenário + resultado inicial quando aplicável.",
    green: "Valide aceitação antes da implementação.",
    brown: "Combine caracterização do legado e aceitação da nova regra.",
  },
  {
    id: "G6",
    title: "Implementação e revisão",
    phase: "Construção",
    criterion:
      "Testes têm assertions relevantes, legibilidade, isolamento e limpeza. Uma alteração controlada demonstra detecção de falha.",
    artifact: "Diff revisado + resultado verde e falha controlada.",
    green: "Revise a regra e o código dos testes.",
    brown: "Mantenha pequeno o diff e preserve o contrato fora do escopo.",
  },
  {
    id: "G7",
    title: "Integração e regressão",
    phase: "Validação",
    criterion:
      "Fluxos críticos e área afetada foram executados em contexto reproduzível, com falhas investigadas e resultado associado ao commit.",
    artifact: "Relatório + comando/CI + análise de regressão.",
    green: "Integre fluxos e dependências relevantes.",
    brown:
      "Compare antes/depois e identifique regressão versus mudança intencional.",
  },
  {
    id: "G8",
    title: "Requisitos não funcionais",
    phase: "Validação",
    criterion:
      "NFRs acordados têm cenário, métrica, limiar e evidência comparável. Itens não avaliados e limitações foram declarados.",
    artifact: "Plano e relatório de NFR com ambiente e limites.",
    green: "Defina metas antes de medir no laboratório local.",
    brown: "Compare com baseline sob as mesmas condições.",
  },
  {
    id: "G9",
    title: "Rastreabilidade e decisão",
    phase: "Liberação",
    criterion:
      "Requisito→risco→caso→execução→defeito→decisão é rastreável. Há responsável, risco residual, pendências e condição de reavaliação.",
    artifact: "Dossiê de evidências + parecer de liberação.",
    green: "Justifique liberar ou bloquear a primeira versão.",
    brown: "Inclua baseline, mudança, plano e gatilho de rollback.",
  },
];
export const setup = `# PowerShell no VS Code · Python 3.12+ recomendado\npy --version\npy -m venv .venv\n.\\.venv\\Scripts\\python.exe -m pip install --upgrade pip\n.\\.venv\\Scripts\\python.exe -m pip install pytest requests pandas pytest-playwright\n.\\.venv\\Scripts\\python.exe -m playwright install chromium\n# Ctrl+Shift+P → Python: Select Interpreter\n# Escolha .venv\\Scripts\\python.exe\n# Depois de criar o primeiro tests/test_inicio.py:\n.\\.venv\\Scripts\\python.exe -m pytest -q\n# Registrar o ambiente após validar a instalação:\n.\\.venv\\Scripts\\python.exe -m pip freeze > requirements-lock.txt`;
export const mcp = `{\n  "servers": {\n    "playwright": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ["-y", "@playwright/mcp@latest", "--isolated", "--codegen", "python"]\n    }\n  }\n}`;
export function refsFor(l: Lesson) {
  const r = resources.filter((r) => r.topic === l.topic);
  return r.length
    ? r.slice(0, 3)
    : resources.filter((r) => r.topic === "pytest").slice(0, 2);
}
export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
