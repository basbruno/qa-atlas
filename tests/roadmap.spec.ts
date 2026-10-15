import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const openLab = async (page: any, tab: string) => {
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name: "Laboratório", exact: true })
    .click();
  await page.getByRole("tab", { name: tab, exact: true }).click();
};
test.beforeEach(async ({ page }) => {
  await page.goto("./");
});
test("currículo completo, trilha e abertura de aula", async ({ page }) => {
  await expect(page.locator(".week-card")).toHaveCount(22);
  await page.getByRole("button", { name: "Começar minha trilha" }).click();
  const d = page.getByRole("dialog");
  await expect(
    d.getByRole("heading", { name: "Ambiente e primeiro teste" }),
  ).toBeVisible();
  await expect(d.getByText("Seu desafio de hoje")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(d).not.toBeVisible();
});
test("conclusão, evidência, notas e persistência após reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Começar minha trilha" }).click();
  await page
    .getByLabel("Sua hipótese, descoberta ou dúvida")
    .fill("Hipótese investigada e teste reproduzido");
  await page
    .getByLabel("Evidência da aula", { exact: true })
    .fill("commit abc123 · pytest -q · 1 passed");
  await page
    .getByRole("button", { name: "Marcar aula como concluída" })
    .click();
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page
    .getByRole("button", { name: "Ambiente e primeiro teste", exact: false })
    .click();
  await expect(
    page.getByLabel("Sua hipótese, descoberta ou dúvida"),
  ).toHaveValue("Hipótese investigada e teste reproduzido");
  await expect(
    page.getByLabel("Evidência da aula", { exact: true }),
  ).toHaveValue("commit abc123 · pytest -q · 1 passed");
  await page.getByRole("button", { name: "Concluída · reabrir aula" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
});
test("filtros combinados, busca sem acento, vazio e limpeza", async ({
  page,
}) => {
  await page.getByLabel("Filtrar por tema").selectOption("Dados");
  await page.getByLabel("Filtrar por nível").selectOption("Básico");
  await expect(page.locator(".week-card")).toHaveCount(1);
  await expect(page.locator(".lesson-row")).toHaveCount(5);
  await page.getByLabel("Buscar aulas").fill("mediana");
  await expect(page.locator(".lesson-row")).toHaveCount(1);
  await page.getByLabel("Buscar aulas").fill("naoexiste123");
  await expect(page.getByText("Nenhuma aula por aqui.")).toBeVisible();
  await page.getByRole("button", { name: "Ver todas as aulas" }).click();
  await expect(page.locator(".week-card")).toHaveCount(22);
});
test("agenda semanal, notas, navegação e datas", async ({ page }) => {
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await expect(page.locator(".day-card")).toHaveCount(5);
  await page.getByLabel("Selecionar semana").selectOption("3");
  await expect(
    page.getByRole("heading", { name: "CSV, schema e qualidade de dados" }),
  ).toBeVisible();
  await page
    .getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    )
    .fill("Oito registros reconciliados");
  await page.getByLabel("Concluir sessão de Segunda").check();
  await page
    .getByRole("button", { name: "Próxima semana", exact: true })
    .click();
  await expect(page.getByLabel("Selecionar semana")).toHaveValue("4");
  await page
    .getByRole("button", { name: "Semana anterior", exact: true })
    .click();
  await expect(
    page.getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    ),
  ).toHaveValue("Oito registros reconciliados");
  await expect(page.getByLabel("Concluir sessão de Segunda")).toBeChecked();
});
test("gate bloqueia aprovação sem evidência e separa Greenfield de Brownfield", async ({
  page,
}) => {
  await openLab(page, "9 Quality Gates");
  await expect(page.locator(".gate-card")).toHaveCount(9);
  await page
    .getByRole("button", { name: "Validar evidências" })
    .first()
    .click();
  await page.getByLabel("Decisão", { exact: true }).selectOption("Aprovado");
  await page.getByRole("button", { name: "Salvar decisão" }).click();
  await expect(page.getByRole("alert")).toContainText("Para aprovar");
  await page.getByLabel("Versão ou commit").fill("a1b2c3d");
  await page.getByLabel("Evidência e data").fill("criterios.md · 2026-10-15");
  await page
    .getByLabel("Resultado, lacunas e risco residual")
    .fill("Exemplos executados e revisados; sem lacunas para este escopo.");
  await page
    .getByLabel("Revisei as evidências e confirmei o critério acima.")
    .check();
  await page.getByRole("button", { name: "Salvar decisão" }).click();
  await expect(page.locator(".gate-card").first()).toContainText("Aprovado");
  await page.getByRole("button", { name: "Brownfield", exact: true }).click();
  await expect(page.locator(".gate-card").first()).toContainText("Pendente");
  await page.reload();
  await openLab(page, "9 Quality Gates");
  await expect(page.locator(".gate-card").first()).toContainText("Aprovado");
});
test("importação do guia anterior e proteção contra JSON inválido", async ({
  page,
}) => {
  await openLab(page, "Ambiente e backup");
  await page.getByLabel("Importar backup JSON").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        schemaVersion: 2,
        guide: "bruno-qa",
        done: { 1: true, 11: true, 60: true },
        notes: { 3: "Diário Requests legado" },
      }),
    ),
  });
  await expect(page.getByRole("dialog")).toContainText("3 aulas concluídas");
  await page.getByRole("button", { name: "Combinar progresso" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "3");
  await page.getByLabel("Importar backup JSON").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{oops"),
  });
  await expect(page.getByRole("status")).toContainText(
    "Não foi possível importar",
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "3");
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await page.getByLabel("Selecionar semana").selectOption("4");
  await expect(
    page.getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    ),
  ).toHaveValue("Diário Requests legado");
});
test("exportação e reimportação preservam as conclusões", async ({ page }) => {
  await page.getByLabel("Concluir aula Ambiente e primeiro teste").check();
  const dl = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar progresso", exact: true })
    .click();
  const file = await dl;
  const path = await file.path();
  await page.getByLabel("Concluir aula Ambiente e primeiro teste").uncheck();
  await page.getByLabel("Importar backup JSON").setInputFiles(path!);
  await page.getByRole("button", { name: "Combinar progresso" }).click();
  await expect(
    page.getByLabel("Concluir aula Ambiente e primeiro teste"),
  ).toBeChecked();
});
test("banco de cenários, referências Alura e downloads reais", async ({
  page,
  request,
}) => {
  await openLab(page, "Banco de prática");
  await expect(page.locator(".case-card")).toHaveCount(30);
  await page.getByLabel("Buscar cenário").fill("Login inválido");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await page.locator(".case-card summary").click();
  await expect(page.locator(".case-card")).toContainText("Oráculo");
  for (const url of ["./defeitos.csv", "./test_valor_local.py"]) {
    const r = await request.get(url);
    expect(r.ok()).toBeTruthy();
    expect((await r.body()).length).toBeGreaterThan(100);
  }
  await page.getByRole("tab", { name: "Referências", exact: true }).click();
  await page.getByRole("button", { name: "Alura", exact: true }).click();
  await expect(page.locator(".resource-card")).toHaveCount(4);
  await expect(page.locator(".resource-card").first()).toHaveAttribute(
    "href",
    /alura\.com\.br/,
  );
});
test("cronômetro, pausa e reset", async ({ page }) => {
  await page.getByRole("button", { name: "Começar minha trilha" }).click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await expect(page.locator(".timer-box")).toContainText("119:");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.getByRole("button", { name: "Reiniciar cronômetro" }).click();
  await expect(page.locator(".timer-box")).toContainText("120:00");
});
test("acessibilidade automatizada da trilha e modal", async ({ page }) => {
  let r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Começar minha trilha" }).click();
  r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
test("mobile: menu, agenda, aula e ausência de overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await expect(page.locator(".day-card")).toHaveCount(5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Estudar", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBeTruthy();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name: "Laboratório", exact: true })
    .click();
  await page.getByRole("tab", { name: "9 Quality Gates", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("capturas desktop e celular", async ({ page }) => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/qa-atlas-desktop.png",
    fullPage: false,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/qa-atlas-mobile.png",
    fullPage: false,
    animations: "disabled",
  });
});

test("acessibilidade das áreas de agenda e laboratório", async ({ page }) => {
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  const failures: any[] = [];
  for (const area of [
    "agenda",
    "Banco de prática",
    "9 Quality Gates",
    "Referências",
    "Ambiente e backup",
  ]) {
    if (area !== "agenda") await openLab(page, area);
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    failures.push(
      ...r.violations.map((v) => ({
        area,
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
  }
  expect(failures).toEqual([]);
});
test("interface local sem dependências de rede externas", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith(new URL(page.url()).origin) &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await openLab(page, "Ambiente e backup");
  expect(external).toEqual([]);
});
