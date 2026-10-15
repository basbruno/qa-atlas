import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import index from "../src/book-index.json" with { type: "json" };
import { createHash } from "node:crypto";
const openBook = async (page: any) => {
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name: /Meu livro/ })
    .click();
  await expect(page.getByLabel("Conteúdo da página 7")).toContainText(
    "O MEDO DA AUTOMAÇÃO",
  );
};
test.beforeEach(async ({ page }) => {
  await page.goto("./");
});
test("PDF integral, páginas e todos os bônus servidos localmente", async ({
  request,
}) => {
  const pdf = await request.get("./leitura/perca-o-medo-da-automacao.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect(
    createHash("sha256")
      .update(await pdf.body())
      .digest("hex"),
  ).toBe(index.sha256);
  const pages = await (await request.get("./leitura/book-pages.json")).json();
  expect(pages).toHaveLength(256);
  expect(pages.map((p: any) => p.page)).toEqual(
    Array.from({ length: 256 }, (_, i) => i + 1),
  );
  const activities = await (
    await request.get("./leitura/book-activities.json")
  ).json();
  expect(activities).toHaveLength(319);
  expect(new Set(activities.map((a: any) => a.id)).size).toBe(319);
  expect(activities.filter((a: any) => a.kind === "exercise")).toHaveLength(
    269,
  );
  const continued = activities.find((a: any) => a.id === "book-ia-032-p246");
  expect(continued.body).toContain("integridade, performance, rollback");
  expect(continued.body).not.toContain("Perca o Medo da Automacao");
  for (const name of ["lab_sql.py", "smoke.robot", "api_local.py"])
    expect((await request.get("./leitura/" + name)).ok()).toBeTruthy();
});
test("leitura, pesquisa integral, página marcada e retomada após reload", async ({
  page,
}) => {
  await openBook(page);
  await page.getByLabel("Marcar página 7 como lida").check();
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await expect(page.getByLabel("Página", { exact: true })).toHaveValue("8");
  await page.getByLabel("Buscar no livro").fill("granular media");
  await expect(page.getByRole("button", { name: /Página 237/ })).toBeVisible();
  await page.getByRole("button", { name: /Página 237/ }).click();
  await expect(page.getByLabel("Conteúdo da página 237")).toContainText(
    "READ_MEDIA",
  );
  await page.reload();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name: /Meu livro/ })
    .click();
  await expect(page.getByLabel("Página", { exact: true })).toHaveValue("237");
  await expect(page.locator(".book-progress")).toContainText("1/256");
  await page.getByLabel("Página", { exact: true }).fill("256");
  await page.getByRole("button", { name: "Ir", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Próxima página", exact: true }),
  ).toBeDisabled();
});
test("exercícios: filtro, busca, gabarito e progresso distinto para números repetidos", async ({
  page,
}) => {
  await openBook(page);
  await page.getByRole("tab", { name: "Exercícios", exact: true }).click();
  await expect(page.locator(".book-filter-row")).toContainText(
    "269 exercícios",
  );
  await page.getByLabel("Tema dos exercícios").selectOption("SQL");
  await page.getByLabel("Nível dos exercícios").selectOption("Básico");
  await expect(page.locator(".book-activity").first()).toContainText("SQL");
  await page.getByLabel("Tema dos exercícios").selectOption("API");
  await page.getByLabel("Nível dos exercícios").selectOption("Todos os níveis");
  const duplicates = index.items
    .filter((i) => i.topic === "API" && i.number === 50)
    .slice(0, 2);
  for (const item of duplicates) {
    await page.getByLabel("Buscar no livro").fill(item.title);
    const card = page.getByTestId(item.id);
    await card.locator("summary").first().click();
    await card
      .getByText("Consultar gabarito original", { exact: true })
      .click();
    await expect(card.locator(".original-solution pre")).not.toBeEmpty();
    await card
      .getByLabel("Adaptação, comando e evidência")
      .fill("Testado em ambiente local; commit abc");
    await card.getByRole("checkbox").check();
  }
  await expect(page.locator(".book-progress")).toContainText("2/319");
  await page.reload();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name: /Meu livro/ })
    .click();
  await page.getByRole("tab", { name: "Exercícios", exact: true }).click();
  await page.getByLabel("Buscar no livro").fill(duplicates[0].title);
  const card = page.getByTestId(duplicates[0].id);
  await card.locator("summary").first().click();
  await expect(card.getByRole("checkbox")).toBeChecked();
  await expect(card.getByLabel("Adaptação, comando e evidência")).toHaveValue(
    "Testado em ambiente local; commit abc",
  );
  await page.getByLabel("Só pendentes", { exact: true }).check();
  await expect(card).toHaveCount(0);
});
test("prompts, checklist e glossário pesquisáveis", async ({ page }) => {
  await openBook(page);
  await page.getByRole("tab", { name: "Prompts IA", exact: true }).click();
  await expect(page.locator(".book-filter-row")).toContainText("50 prompts");
  await page.getByLabel("Buscar no livro").fill("migração de banco");
  await page.locator(".book-activity summary").first().click();
  await expect(page.locator(".prompt-text")).toContainText("rollback");
  await page
    .getByLabel("Seu contexto, revisão e resultado")
    .fill("Contexto sintético revisto");
  await page.locator(".book-activity").getByRole("checkbox").check();
  await page.getByRole("tab", { name: "Checklist", exact: true }).click();
  await expect(page.locator(".book-checklist input")).toHaveCount(36);
  await page.locator(".book-checklist input").first().check();
  await expect(page.locator(".info-note").first()).toContainText(
    "1 conferidos",
  );
  await page.getByRole("tab", { name: "Glossário", exact: true }).click();
  await expect(page.locator(".book-glossary article")).toHaveCount(62);
  await page.getByLabel("Buscar no livro").fill("webdriver");
  await expect(page.locator(".book-glossary")).toContainText("WebDriver");
  await page.getByRole("tab", { name: "Notas técnicas", exact: true }).click();
  await expect(page.locator(".book-note-list")).toContainText("protocolo");
});
test("backup completo inclui livro e notas das semanas novas", async ({
  page,
}) => {
  await openBook(page);
  await page.getByLabel("Marcar página 7 como lida").check();
  await page.getByRole("tab", { name: "Checklist", exact: true }).click();
  await page.locator(".book-checklist input").first().check();
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await page.getByLabel("Selecionar semana").selectOption("22");
  await expect(
    page.getByRole("button", { name: "Próxima semana", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    )
    .fill("Dossiê com evidências");
  await page.getByLabel("Concluir sessão de Segunda").check();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar progresso", exact: true })
    .click();
  const path = await (await downloading).path();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel("Importar backup JSON").setInputFiles(path!);
  await page.getByRole("button", { name: "Combinar progresso" }).click();
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await page.getByLabel("Selecionar semana").selectOption("22");
  await expect(
    page.getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    ),
  ).toHaveValue("Dossiê com evidências");
  await expect(page.getByLabel("Concluir sessão de Segunda")).toBeChecked();
  await openBook(page);
  await expect(page.getByLabel("Marcar página 7 como lida")).toBeChecked();
  await page.getByRole("tab", { name: "Checklist", exact: true }).click();
  await expect(page.locator(".book-checklist input").first()).toBeChecked();
});
test("backup v3 anterior preserva aulas, notas e gates sem campo livro", async ({
  page,
}) => {
  const stamp = "2026-10-15T12:00:00.000Z";
  await page
    .getByLabel("Importar backup JSON")
    .setInputFiles({
      name: "anterior.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          schemaVersion: 3,
          guide: "qa-atlas",
          done: { w1d1: stamp, w16d5: stamp },
          notes: { week16: "Meu projeto anterior" },
          evidence: { w16d5: "commit antigo" },
          gates: { Greenfield: {}, Brownfield: {} },
          start: "2026-10-12",
        }),
      ),
    });
  await page.getByRole("button", { name: "Combinar progresso" }).click();
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "2");
  await expect(page.getByRole("progressbar")).toHaveAttribute("max", "110");
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await page.getByLabel("Selecionar semana").selectOption("16");
  await expect(
    page.getByLabel(
      "Registre um resultado, uma falha investigada e o próximo passo.",
    ),
  ).toHaveValue("Meu projeto anterior");
  await openBook(page);
  await expect(page.locator(".book-progress")).toContainText("0/319");
});
test("aula abre livro na página correta e volta à agenda relacionada", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Agenda semanal", exact: true })
    .click();
  await page.getByLabel("Selecionar semana").selectOption("17");
  await page
    .getByRole("button", { name: "Estudar", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Ler no Meu livro" }).click();
  await expect(page.getByLabel("Conteúdo da página 27")).toContainText(
    "SQL PARA QA",
  );
  await page
    .locator(".book-related")
    .getByRole("button", { name: /Semana 17/ })
    .click();
  await expect(page.getByLabel("Selecionar semana")).toHaveValue("17");
});
test("livro: teclado, acessibilidade e celular sem overflow", async ({
  page,
}) => {
  await openBook(page);
  const violations: any[] = [];
  for (const tab of [
    "Leitura",
    "Exercícios",
    "Prompts IA",
    "Checklist",
    "Glossário",
    "Notas técnicas",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    violations.push(
      ...r.violations.map((v) => ({
        tab,
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    );
  }
  expect(violations).toEqual([]);
  await page.getByRole("tab", { name: "Leitura", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Exercícios", exact: true }),
  ).toBeFocused();
  await page.locator(".book-activity summary").first().click();
  await page.locator(".original-solution summary").first().click();
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const tab of [
    "Exercícios",
    "Leitura",
    "Checklist",
    "Glossário",
    "Notas técnicas",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByRole("tab", { name: "Leitura", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({
    path: "test-results/qa-atlas-livro-mobile.png",
    fullPage: false,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({
    path: "test-results/qa-atlas-livro-desktop.png",
    fullPage: false,
    animations: "disabled",
  });
});
