import index from "./book-index.json";
import { publicAsset } from "./assets";
export const book = index;
export const bookPdf = publicAsset("leitura/perca-o-medo-da-automacao.pdf");
export const bookLink = (page: number) => `${bookPdf}#page=${page}`;
export type BookItem = (typeof book.items)[number];
export type BookPage = {
  page: number;
  text: string;
  blocks: { kind: string; text: string }[];
};
export type BookActivity = BookItem & { body: string };
export type BookState = {
  done: Record<string, string>;
  evidence: Record<string, string>;
  readPages: Record<string, string>;
  checklist: Record<string, string>;
  lastPage: number;
};
export const newBookState = (): BookState => ({
  done: {},
  evidence: {},
  readPages: {},
  checklist: {},
  lastPage: 7,
});
export const reviewNotes = [
  {
    title: "A contagem é a do arquivo recebido",
    pages: "Bônus · p. 53–256",
    text: "Foram encontrados 100 exercícios Web, 83 entradas API, 35 SQL e 51 Mobile: 269 entradas. Há 50 prompts, 36 itens de checklist e 62 termos no glossário. A numeração do PDF tem repetições e lacunas; cada entrada recebe uma identidade com tema e página, sem inventar exercícios ausentes.",
    url: "",
  },
  {
    title: "JavaScript e Python têm runners diferentes",
    pages: "p. 15–26 · Web e API",
    text: "Os gabaritos web/API do livro usam principalmente JavaScript. Na trilha principal, use pytest + Playwright Python; na semana 18, um projeto separado com Playwright Test e TypeScript. Não cole await, fixtures ou imports JS em arquivos Python. Confira os requisitos atuais; Node 18 citado no livro não é a referência para este projeto.",
    url: "https://playwright.dev/docs/intro",
  },
  {
    title: "ReqRes: confira chave e persistência",
    pages: "p. 24–26 e 112–179",
    text: "A documentação atual exige x-api-key nas requisições descritas. Coleções persistentes e endpoints de exemplo têm contratos próprios; uma resposta de criação não prova que o ID estará disponível para o teste seguinte. Use variáveis de ambiente, dados independentes e limpeza. Para alternativa, adapte o oráculo à API local ou ao Restful Booker.",
    url: "https://reqres.in/docs",
  },
  {
    title: "Um gabarito é um ponto de partida",
    pages: "Web e API · todos os níveis",
    text: "Domínios app.exemplo.com, URLs relativas, seletores e endpoints como /oauth/authorize dependem de uma aplicação real e de baseURL/configuração. Inspecione o alvo, crie massa, defina assertions e execute uma falha controlada. Os códigos originais são preservados como referência e não foram todos executados ou certificados.",
    url: "https://playwright.dev/docs/best-practices",
  },
  {
    title: "Android no Windows; iOS exige outro ambiente",
    pages: "p. 39–41 e 198–238",
    text: "Appium com UiAutomator2 permite prática Android no Windows, com SDK/JDK e dispositivo configurados. Automatizar iOS localmente envolve macOS, Xcode e XCUITest; trocar apenas capabilities não basta. Para cada exemplo, substitua APK e IDs fictícios e consulte os comandos suportados pela versão do driver.",
    url: "https://appium.github.io/appium-xcuitest-driver/latest/getting-started/system-requirements/",
  },
  {
    title: "Permissões de mídia e simulações mobile",
    pages: "p. 207 e 237",
    text: "As permissões granulares READ_MEDIA_* pertencem ao Android 13/API 33, não ao Android 12 indicado no título do exercício 048. Considere também o targetSdk. Um broadcast de teste não demonstra entrega real de push pelo provedor; biometria, rede e gestos precisam de validação no dispositivo e driver escolhidos.",
    url: "https://developer.android.com/about/versions/13/behavior-changes-13",
  },
  {
    title: "SQL: declare o dialeto e a regra",
    pages: "p. 27–29 e 180–197",
    text: "O bônus contém sintaxe específica de PostgreSQL. INTERVAL, EXTRACT, percentis e datas não são diretamente portáveis para todos os bancos. O laboratório local usa SQLite e tem massa própria. Valores monetários e limites citados no livro são exemplos a confirmar no requisito, sem assumir validade regulatória.",
    url: "https://docs.python.org/3/library/sqlite3.html",
  },
  {
    title: "Robot em um ambiente isolado",
    pages: "p. 43",
    text: "Use o Python do venv para instalar e executar Robot. O parâmetro --break-system-packages do exemplo não é necessário no fluxo Windows proposto. Instale apenas as bibliotecas do exercício e registre as versões após a execução.",
    url: "https://docs.robotframework.org/docs/getting_started/testing",
  },
  {
    title: "Checklist não substitui decisão de qualidade",
    pages: "p. 250–251",
    text: "Os percentuais, limites de smoke e retries do livro são sugestões do material. Defina alvos por risco e custo. POM para toda tela, 90% de test IDs ou um retry verde não são prova universal de qualidade. No QA Atlas, cada Quality Gate exige revisão de evidência própria; o checklist não aprova gates automaticamente.",
    url: "https://playwright.dev/docs/best-practices",
  },
  {
    title: "Protocolos e vocabulário com precisão",
    pages: "Glossário · p. 256",
    text: "A entrada WebDriver do PDF generaliza a arquitetura do Playwright. Selenium/Appium usam a família WebDriver; Playwright tem seu protocolo e pode conectar Chromium via CDP. A integração experimental com Selenium Grid usa CDP. Consulte a documentação antes de reproduzir a definição em entrevistas.",
    url: "https://playwright.dev/docs/selenium-grid",
  },
  {
    title: "IA: dados sintéticos e verificação",
    pages: "p. 30–32 e 239–249",
    text: "Adapte prompts de dados brasileiros para dados sintéticos de laboratório, sem dados pessoais reais. Identificadores que passam em um dígito verificador não provam uma identidade. Registre contexto, revisão e execução; saída da IA não é evidência de teste realizado.",
    url: "",
  },
];
