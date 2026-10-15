# Validação — QA Atlas

Validado em 15/10/2026, em Linux com Chromium 153 headless, sobre a **versão compilada em dist/** servida por Python http.server em 127.0.0.1. O sistema foi preparado para execução no Windows, mas o iniciador .cmd não foi executado em uma máquina Windows nesta sessão.

## Resultado

**Build TypeScript + Vite aprovado. 22 testes Playwright aprovados, sem retries, em 19,3 segundos.**

1. Currículo de 22 semanas (110 aulas) e abertura/fechamento de aula.
2. Marcação e reabertura de aula, notas, evidência e persistência após recarregar.
3. Filtros combinados, busca, estado vazio e limpeza.
4. Agenda com cinco sessões, navegação de semanas e diário persistente.
5. Impedimento de aprovação de gate sem evidência; aprovação com dados; separação Greenfield/Brownfield e persistência.
6. Migração do backup anterior de 60 aulas e preservação dos dados diante de JSON inválido.
7. Exportação e reimportação de progresso.
8. Banco com 30 cenários, referências Alura e downloads locais com conteúdo real.
9. Cronômetro com início, pausa e reset.
10. Axe: trilha e diálogo de aula sem violações detectadas no escopo WCAG 2 A/AA e 2.1 AA.
11. Viewport móvel de 390 × 844: menu, agenda, diálogo e painel de gates sem overflow horizontal.
12. Capturas de tela desktop e móvel.
13. Axe: agenda, banco de prática, gates, referências e ambiente sem violações detectadas no mesmo escopo.
14. Interface carregada e navegação de ambiente sem requisições a origens externas.

15. PDF completo servido localmente e SHA-256 idêntico ao original recebido; 256 páginas e 319 atividades com IDs únicos.
16. Busca integral, navegação por página, limites, marcação de leitura e retomada após reload.
17. Filtros de exercícios, gabaritos, evidências e independência de entradas com números repetidos no PDF.
18. Prompts com continuação entre páginas, checklist de 36 itens e busca nos 62 termos do glossário.
19. Exportação/importação preserva livro, checklist e diário/conclusão da semana 22.
20. Backup v3 da versão anterior, sem campo book, preserva aulas e diários.
21. Aula abre o livro na página indicada e permite retornar à agenda relacionada.
22. Livro: navegação de abas por teclado; axe nas seis áreas e no gabarito aberto, sem violações detectadas no escopo; viewport 390 × 844 sem overflow horizontal.

Os testes usam contextos isolados. Os dados sintéticos das verificações não são distribuídos como progresso do usuário.

## Dataset verificado

A leitura de `defeitos.csv`, deduplicação por id e exclusão de horas negativas resultaram em 8 registros válidos. As horas ordenadas são 2, 4, 6, 8, 10, 12, 14 e 24. Média = 10h; mediana = 9h; p95 com interpolação linear = 20,5h. Esta é uma amostra fictícia para estudo.

## Laboratórios e preservação do material

- `lab_sql.py` executado: cinco verificações aprovadas, incluindo usuários ativos, JOIN, totais e rollback.
- `api_local.py` executado: GET /health, GET /pedidos e 404 para rota inexistente conferidos.
- O PDF original está incluído sem alterações; sumário e bônus foram indexados com conferência de páginas e identidades. A numeração inconsistente do próprio material é detalhada em docs/INTEGRACAO-LIVRO.md e na interface.
- As 269 entradas de exercícios e 50 prompts têm texto extraído, inclusive continuações. A diagramação original e eventuais quebras de código devem ser consultadas no PDF.
- A biblioteca de leitura é carregada sob demanda. Build emitiu aviso de tamanho do chunk principal (545 kB, 140 kB gzip); não houve erro de compilação ou dependência externa para abrir a interface.

## Limites da validação

- Não houve execução dos exemplos contra SauceDemo, Restful Booker, Automation Exercise ou Sauce Labs Cloud. Esses exemplos são didáticos e exigem conferência dos contratos/seletores e execução no ambiente do aluno.
- Não foram executados os 269 gabaritos do PDF, o smoke Robot, nem cenários Appium/dispositivos ou k6/JMeter. O acervo mantém atribuição e notas de adaptação, sem certificação de todos os códigos.
- Não houve instalação ou execução de BMAD/MCP na máquina do usuário. O sistema contém aulas, referências e configuração de exemplo.
- As checagens axe não constituem auditoria completa de acessibilidade. A interface também usa foco visível, skip link, diálogo nativo e navegação por teclado nas abas.
- Registro de gate é uma decisão humana e referência textual a evidências, não inspeção automática dos documentos.
- Não há publicação privada confirmada nem URL externa validada nesta entrega. A execução local usa http://127.0.0.1:5173 após iniciar o servidor.

Para repetir: `npm ci`, `npx playwright install chromium` e `npm test`. Para testar a compilação: `npm run build`, sirva dist/ e defina TEST_BASE_URL com a URL do servidor.
