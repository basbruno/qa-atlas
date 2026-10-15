# Integração de Perca o Medo da Automação

Fonte: Lilian Borba · QA Insider. PDF fornecido pelo usuário, preservado integralmente.

SHA-256: `f2b0d686555315cdb95819b8f4205572386e72af268b21d35e44eed6f7658b25`

## Cobertura

| Seção | Páginas | Semanas relacionadas |
|---|---|---|
| Apresentação e sumário | 1–6 | 1 |
| 01 · O medo da automação | 7–10 | 1, 22 |
| 02 · Fundamentos de automação | 11–14 | 1, 2 |
| 03 · Automação web | 15–21 | 6, 7, 18 |
| 04 · API testing | 22–26 | 4, 5, 9, 18 |
| 05 · SQL para QA | 27–29 | 3, 17 |
| 06 · IA aplicada à automação | 30–32 | 12, 13 |
| 07 · Boas práticas de automação | 33–35 | 8, 10 |
| 08 · CI/CD | 36–38 | 11 |
| 09 · Mobile testing | 39–41 | 19 |
| 10 · Robot Framework | 42–43 | 20 |
| 11 · BDD | 44–45 | 14, 15, 20 |
| 12 · Outras ferramentas | 46–48 | 18, 21 |
| 13 · Carreira em automação | 49–52 | 16, 22 |
| Apresentação dos bônus | 53–53 | 17 |
| Bônus · Exercícios web | 54–111 | 6, 7, 8, 10, 18 |
| Bônus · Exercícios de API | 112–179 | 4, 5, 9, 18 |
| Bônus · Exercícios SQL | 180–197 | 17 |
| Bônus · Exercícios mobile | 198–238 | 19 |
| Bônus · 50 prompts para IA | 239–249 | 12, 13, 22 |
| Bônus · Checklist profissional | 250–251 | 16, 22 |
| Bônus · Glossário | 252–256 | 1, 22 |

## Conferência dos bônus

| Tema | Anunciado | Entradas presentes | Números distintos |
|---|---:|---:|---:|
| Web | 100 | 100 | 100 |
| API | 100 | 83 | 62 |
| SQL | 50 | 35 | 35 |
| Mobile | 50 | 51 | 50 |
| IA | 50 | 50 | 50 |

A numeração original é exibida junto à página. Repetições não colidem no progresso. Lacunas não foram preenchidas com conteúdo inventado. O índice mantém 269 entradas de exercícios e 50 prompts. Checklist: 36 itens; glossário: 62 termos, apesar de o sumário anunciar 150+.

## Preservação e adaptação

- IDs e semanas das 80 aulas anteriores preservados; novas aulas acrescentadas como w17d1 até w22d5.
- Leitura, exercícios, prompts e checklist possuem progresso independente, incluído no mesmo backup JSON.
- PDF original e texto integral por página disponíveis localmente; somente rodapés repetidos de identificação foram removidos da extração HTML.
- Continuação de código mobile na página 234 e prompts entre páginas mantida.
- Novas aulas possuem links às páginas do livro, conceito, prática, critérios e sessão de 120 minutos.
- A coleção é um banco de consulta: não se promete executar os 269 gabaritos nas 220 horas.

## Notas técnicas

A interface Meu livro → Notas técnicas registra ajustes de contexto para ReqRes, Playwright JS/Python, Appium no Windows/iOS, permissões Android 13, SQL, Robot, IA, checklist e protocolos. Fontes oficiais estão vinculadas a cada nota. O texto original da autora fica identificado e preservado; as notas não alteram o PDF.

## Reprodução da extração

Com Python e PyMuPDF em ambiente de manutenção:

```powershell
python scripts/import_book.py public/leitura/perca-o-medo-da-automacao.pdf
```

O gerador usa metadados de fonte/posição para checklist e glossário, e delimitadores numéricos para os bônus. O sistema web não depende de Python ou PyMuPDF para ler o material.
