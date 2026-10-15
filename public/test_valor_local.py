from playwright.sync_api import Page, expect

HTML = """
<label for="valor">Valor</label>
<input id="valor" inputmode="decimal">
<button id="validar">Validar</button>
<p role="status"></p>
<script>
document.querySelector('#validar').addEventListener('click', () => {
  const raw = document.querySelector('#valor').value.trim();
  const value = Number(raw);
  document.querySelector('[role="status"]').textContent =
    raw !== '' && Number.isFinite(value) && value > 0
      ? 'Valor aceito' : 'Informe valor positivo';
});
</script>
"""

def test_valor_zero_exibe_erro(page: Page):
    page.set_content(HTML)
    page.get_by_label("Valor", exact=True).fill("0")
    page.get_by_role("button", name="Validar", exact=True).click()
    expect(page.get_by_role("status")).to_have_text("Informe valor positivo")
