import { useState, useEffect, useMemo } from "react";
import { publicAsset } from "./assets";
import {
  BookOpen,
  Download,
  ArrowLeft,
  ArrowRight,
  Search,
  ExternalLink,
  Check,
  FileText,
  Code2,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import {
  book,
  bookPdf,
  bookLink,
  reviewNotes,
  type BookState,
  type BookPage,
  type BookActivity,
} from "./book";
import { fold, weeks } from "./content";
type Props = {
  state: BookState;
  update: (fn: (s: BookState) => BookState) => void;
  openWeek: (id: number) => void;
};
const tabs = [
  "Leitura",
  "Exercícios",
  "Prompts IA",
  "Checklist",
  "Glossário",
  "Notas técnicas",
] as const;
type Tab = (typeof tabs)[number];
const short = (p: number, e: number) => (p === e ? `p. ${p}` : `p. ${p}–${e}`);
function CopyText({ text }: { text: string }) {
  const [label, setLabel] = useState("Copiar texto");
  return (
    <button
      className="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setLabel("Copiado");
        } catch {
          setLabel("Selecione o texto para copiar");
        }
        setTimeout(() => setLabel("Copiar texto"), 2500);
      }}
    >
      {label}
    </button>
  );
}
export default function BookLibrary({ state, update, openWeek }: Props) {
  const [tab, setTab] = useState<Tab>("Leitura"),
    [pages, setPages] = useState<BookPage[]>([]),
    [activities, setActivities] = useState<BookActivity[]>([]),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(""),
    [theme, setTheme] = useState("Todos os temas"),
    [level, setLevel] = useState("Todos os níveis"),
    [pending, setPending] = useState(false),
    [limit, setLimit] = useState(20),
    [pageInput, setPageInput] = useState(String(state.lastPage));
  useEffect(() => {
    const abort = new AbortController();
    setError("");
    Promise.all(
      ["/leitura/book-pages.json", "/leitura/book-activities.json"].map(
        async (url) => {
          const r = await fetch(publicAsset(url), { signal: abort.signal });
          if (!r.ok) throw Error("Arquivo indisponível");
          return r.json();
        },
      ),
    )
      .then(([p, a]) => {
        setPages(p);
        setActivities(a);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "Não foi possível carregar a leitura. Tente novamente ou abra o PDF completo.",
          );
      });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => {
    setPageInput(String(state.lastPage));
  }, [state.lastPage]);
  useEffect(() => {
    setLimit(20);
  }, [query, theme, level, pending, tab]);
  const chapter = book.chapters.find(
    (c) => state.lastPage >= c.start && state.lastPage <= c.end,
  )!;
  const page = pages[state.lastPage - 1];
  const done = Object.keys(state.done).length,
    read = Object.keys(state.readPages).length;
  const filtered = useMemo(
    () =>
      activities.filter(
        (i) =>
          i.kind === (tab === "Prompts IA" ? "prompt" : "exercise") &&
          (tab === "Prompts IA" ||
            theme === "Todos os temas" ||
            i.topic === theme) &&
          (tab === "Prompts IA" ||
            level === "Todos os níveis" ||
            i.level === level) &&
          (!pending || !state.done[i.id]) &&
          fold(
            `${i.title} ${i.number} ${String(i.number).padStart(3, "0")} ${i.body}`,
          ).includes(fold(query)),
      ),
    [activities, tab, theme, level, pending, state.done, query],
  );
  const pageHits = useMemo(
    () =>
      query ? pages.filter((p) => fold(p.text).includes(fold(query))) : [],
    [pages, query],
  );
  function goto(p: number) {
    if (Number.isInteger(p) && p >= 1 && p <= book.pageCount) {
      update((s) => ({ ...s, lastPage: p }));
      setQuery("");
      setTab("Leitura");
    }
  }
  function toggle(field: "done" | "readPages" | "checklist", id: string) {
    update((s) => {
      const data = { ...s[field] };
      if (data[id]) delete data[id];
      else data[id] = new Date().toISOString();
      return { ...s, [field]: data };
    });
  }
  function switchTab(t: Tab) {
    setTab(t);
    setQuery("");
    setTheme("Todos os temas");
    setLevel("Todos os níveis");
    setPending(false);
  }
  return (
    <div className="book-library">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEU MATERIAL, CONECTADO À PRÁTICA</span>
          <h1>
            Um livro. Muitas formas de evoluir<span>.</span>
          </h1>
          <p>Leia, experimente e registre o que você conseguiu demonstrar.</p>
        </div>
        <a href={bookPdf} download className="secondary">
          <Download size={17} />
          PDF completo
        </a>
      </div>
      <section className="book-hero" aria-label="Resumo do material">
        <div className="book-cover" aria-hidden="true">
          <span>QA INSIDER</span>
          <strong>
            PERCA
            <br />O MEDO
            <br />
            DA <em>AUTOMAÇÃO</em>
          </strong>
          <small>LILIAN BORBA</small>
          <div>DO ZERO AO PROFISSIONAL</div>
        </div>
        <div className="book-overview">
          <span className="eyebrow">ADICIONADO AO SEU QA ATLAS</span>
          <h2>{book.title}</h2>
          <p>
            {book.author} · {book.subtitle}. O arquivo integral permanece
            disponível; a leitura e os bônus abaixo foram extraídos do PDF que
            você enviou.
          </p>
          <div className="book-stats">
            <span>
              <strong>256</strong> páginas
            </span>
            <span>
              <strong>269</strong> exercícios
            </span>
            <span>
              <strong>50</strong> prompts
            </span>
          </div>
          <div className="book-buttons">
            <button
              className="primary"
              onClick={() => {
                switchTab("Leitura");
                document
                  .getElementById("book-workspace")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Bookmark size={16} />
              Continuar na página {state.lastPage}
            </button>
            <button
              className="secondary"
              onClick={() => switchTab("Exercícios")}
            >
              Escolher um exercício
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="book-progress">
            {read}/256 páginas lidas · {done}/319 atividades concluídas ·
            progresso separado das 110 aulas
          </p>
        </div>
      </section>
      <div className="book-session">
        <ClockLabel />
        <p>
          <strong>Cabe nas suas 2 horas.</strong> Use 25 minutos para a leitura
          e 65 para um exercício selecionado. As semanas 17–22 integram os novos
          temas; os demais bônus são prática de consulta, sem prazo artificial
          para terminar todos.
        </p>
        <button className="text-button" onClick={() => openWeek(17)}>
          Ver novas semanas
          <ArrowRight size={16} />
        </button>
      </div>
      <div
        className="tabs book-tabs"
        role="tablist"
        aria-label="Áreas do livro"
      >
        {tabs.map((t, i) => (
          <button
            key={t}
            id={`book-tab-${i}`}
            aria-controls="book-workspace"
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => switchTab(t)}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? tabs.length - 1
                      : (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                        tabs.length;
                switchTab(tabs[next]);
                document.getElementById(`book-tab-${next}`)?.focus();
              }
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <section
        id="book-workspace"
        role="tabpanel"
        aria-labelledby={`book-tab-${tabs.indexOf(tab)}`}
      >
        {error && (
          <div role="alert" className="info-note">
            {error}{" "}
            <button
              className="text-button"
              onClick={() => setRetry((x) => x + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}
        <div className="book-search filter-selects">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Buscar no livro"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "Leitura"
                  ? "Buscar nas 256 páginas…"
                  : tab === "Exercícios"
                    ? "Buscar título, número ou código…"
                    : `Buscar em ${tab.toLowerCase()}…`
              }
            />
          </label>
          {query && (
            <button className="text-button" onClick={() => setQuery("")}>
              Limpar busca
            </button>
          )}
        </div>
        {tab === "Leitura" && (
          <>
            {query ? (
              <div className="book-results">
                <p role="status">{pageHits.length} páginas encontradas</p>
                {pageHits.slice(0, limit).map((p) => {
                  const pos = fold(p.text).indexOf(fold(query));
                  return (
                    <button
                      className="page-hit"
                      key={p.page}
                      onClick={() => goto(p.page)}
                    >
                      <span className="tag">Página {p.page}</span>
                      <p>
                        …
                        {p.text
                          .slice(Math.max(0, pos - 60), pos + 170)
                          .replace(/\n/g, " ")}
                        …
                      </p>
                      <ArrowRight size={17} />
                    </button>
                  );
                })}
                {pageHits.length > limit && (
                  <button
                    className="secondary"
                    onClick={() => setLimit((n) => n + 20)}
                  >
                    Ver mais páginas
                  </button>
                )}
              </div>
            ) : (
              <div className="reader-layout">
                <aside className="chapter-list" aria-label="Sumário do livro">
                  <h2>
                    <BookOpen size={18} />
                    Conteúdo completo
                  </h2>
                  {book.chapters.map((c) => (
                    <button
                      key={c.id}
                      className={chapter.id === c.id ? "selected" : ""}
                      aria-current={
                        chapter.id === c.id ? "location" : undefined
                      }
                      onClick={() => goto(c.start)}
                    >
                      <span>{c.title}</span>
                      <small>{short(c.start, c.end)}</small>
                    </button>
                  ))}
                </aside>
                <article className="reader-panel">
                  <div className="reader-toolbar">
                    <button
                      className="icon-button"
                      aria-label="Página anterior"
                      disabled={state.lastPage === 1}
                      onClick={() => goto(state.lastPage - 1)}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        goto(Number(pageInput));
                      }}
                    >
                      <label htmlFor="book-page">Página</label>
                      <input
                        id="book-page"
                        type="number"
                        min="1"
                        max="256"
                        required
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                      />
                      <span>de 256</span>
                      <button className="secondary" type="submit">
                        Ir
                      </button>
                    </form>
                    <button
                      className="icon-button"
                      aria-label="Próxima página"
                      disabled={state.lastPage === 256}
                      onClick={() => goto(state.lastPage + 1)}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <div className="reader-title">
                    <span className="eyebrow">{chapter.title}</span>
                    <a
                      href={bookLink(state.lastPage)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-button"
                    >
                      Ver página no PDF
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="reader-extraction">
                    Texto extraído do original. Para tabelas, quebras de código
                    e diagramação exata, consulte o PDF. As notas técnicas
                    complementam os exemplos.
                  </p>
                  <div
                    className="book-page-content"
                    aria-label={`Conteúdo da página ${state.lastPage}`}
                  >
                    {!page ? (
                      <p role="status">
                        {error
                          ? "Use o link do PDF acima."
                          : "Carregando o conteúdo…"}
                      </p>
                    ) : !page.blocks.length ? (
                      <p>
                        Esta página está sem texto no original. Consulte o PDF
                        para ver a diagramação.
                      </p>
                    ) : (
                      page.blocks.map((b, i) =>
                        b.kind === "code" ? (
                          <pre
                            key={i}
                            tabIndex={0}
                            aria-label="Código do material"
                          >
                            <code>{b.text}</code>
                          </pre>
                        ) : b.kind === "heading" ? (
                          <h3 key={i}>{b.text}</h3>
                        ) : (
                          <p key={i}>{b.text}</p>
                        ),
                      )
                    )}
                  </div>
                  <label className="reading-done">
                    <input
                      type="checkbox"
                      checked={!!state.readPages[state.lastPage]}
                      onChange={() =>
                        toggle("readPages", String(state.lastPage))
                      }
                    />
                    Marcar página {state.lastPage} como lida
                  </label>
                  <div className="book-related">
                    <strong>Continue pela trilha</strong>
                    {chapter.weeks.map((n) => (
                      <button
                        key={n}
                        className="text-button"
                        onClick={() => openWeek(n)}
                      >
                        Semana {n} · {weeks.find((w) => w.id === n)?.title}
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            )}
          </>
        )}
        {(tab === "Exercícios" || tab === "Prompts IA") && (
          <>
            <div className="book-filter-row">
              {tab === "Exercícios" && (
                <>
                  <select
                    aria-label="Tema dos exercícios"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    {["Todos os temas", "Web", "API", "SQL", "Mobile"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </select>
                  <select
                    aria-label="Nível dos exercícios"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    {[
                      "Todos os níveis",
                      "Básico",
                      "Intermediário",
                      "Avançado",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={pending}
                  onChange={(e) => setPending(e.target.checked)}
                />
                Só pendentes
              </label>
              <span role="status">
                {filtered.length}{" "}
                {tab === "Exercícios" ? "exercícios" : "prompts"}
              </span>
            </div>
            <p className="info-note">
              {tab === "Exercícios"
                ? "Escolha um exercício, tente antes de abrir o gabarito e registre sua adaptação. Os exemplos exigem ambiente, dados e APIs compatíveis."
                : "Adapte o contexto do prompt, revise a resposta e teste qualquer código sugerido. Use dados sintéticos. Concluir significa que você aplicou e revisou o prompt."}{" "}
              <button
                className="text-button"
                onClick={() => switchTab("Notas técnicas")}
              >
                Consultar notas técnicas
                <ArrowRight size={14} />
              </button>
            </p>
            <div className="book-activities">
              {filtered.slice(0, limit).map((item) => (
                <details
                  className="book-activity"
                  data-testid={item.id}
                  key={item.id}
                >
                  <summary>
                    <span
                      className={`activity-check ${state.done[item.id] ? "checked" : ""}`}
                    >
                      {state.done[item.id] ? (
                        <Check size={18} />
                      ) : (
                        <Code2 size={18} />
                      )}
                    </span>
                    <div>
                      <small>
                        {item.topic} · #{String(item.number).padStart(3, "0")} ·{" "}
                        {short(item.page, item.endPage)}
                        {item.duplicate ? " · número repetido no PDF" : ""}
                      </small>
                      <h3>{item.title}</h3>
                    </div>
                    <span className="tag">
                      {item.kind === "prompt" ? "Prompt" : item.level}
                    </span>
                    <ChevronDown size={18} />
                  </summary>
                  <div className="activity-body">
                    <div className="activity-links">
                      <button
                        className="text-button"
                        onClick={() => goto(item.page)}
                      >
                        Ler página de origem
                        <ArrowRight size={14} />
                      </button>
                      <a
                        className="text-button"
                        href={bookLink(item.page)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF original
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    {item.kind === "exercise" ? (
                      <>
                        <p>
                          <strong>Seu desafio:</strong> {item.title}. Defina
                          entrada, resultado esperado e uma falha que o teste
                          deve detectar. Execute em um laboratório compatível
                          antes de registrar a conclusão.
                        </p>
                        <details className="original-solution">
                          <summary>
                            Consultar gabarito original
                            <ChevronDown size={16} />
                          </summary>
                          <pre tabIndex={0}>{item.body}</pre>
                          <CopyText text={item.body} />
                        </details>
                      </>
                    ) : (
                      <>
                        <pre className="prompt-text" tabIndex={0}>
                          {item.body}
                        </pre>
                        <CopyText text={item.body} />
                      </>
                    )}
                    <label
                      className="field-label"
                      htmlFor={item.id + "-evidence"}
                    >
                      {item.kind === "prompt"
                        ? "Seu contexto, revisão e resultado"
                        : "Adaptação, comando e evidência"}
                    </label>
                    <textarea
                      id={item.id + "-evidence"}
                      maxLength={10000}
                      value={state.evidence[item.id] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        update((s) => ({
                          ...s,
                          evidence: { ...s.evidence, [item.id]: value },
                        }));
                      }}
                      placeholder="O que adaptei… / Executei… / Observei… / Evidência em…"
                    />
                    <label className="reading-done">
                      <input
                        type="checkbox"
                        checked={!!state.done[item.id]}
                        onChange={() => toggle("done", item.id)}
                      />
                      Concluir {item.kind === "prompt" ? "prompt" : "exercício"}{" "}
                      {item.topic} #{String(item.number).padStart(3, "0")} da
                      página {item.page}
                    </label>
                  </div>
                </details>
              ))}
            </div>
            {!filtered.length && !error && (
              <div className="empty-state">
                <Search size={26} />
                <h3>
                  {activities.length
                    ? "Nenhum resultado com estes filtros."
                    : "Carregando atividades…"}
                </h3>
                {activities.length > 0 && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setQuery("");
                      setTheme("Todos os temas");
                      setLevel("Todos os níveis");
                      setPending(false);
                    }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
            {filtered.length > limit && (
              <button
                className="secondary book-more"
                onClick={() => setLimit((n) => n + 20)}
              >
                Mostrar mais 20 · {Math.min(limit, filtered.length)} de{" "}
                {filtered.length}
              </button>
            )}
          </>
        )}
        {tab === "Checklist" && (
          <>
            <p className="info-note">
              36 itens originais · {Object.keys(state.checklist).length}{" "}
              conferidos. Adapte metas ao risco do seu projeto. As marcações não
              aprovam os nove Quality Gates.
            </p>
            <div className="book-checklist">
              {[...new Set(book.checklist.map((c) => c.group))].map((group) => {
                const rows = book.checklist.filter(
                  (c) =>
                    c.group === group && fold(c.text).includes(fold(query)),
                );
                return (
                  rows.length > 0 && (
                    <article className="panel" key={group}>
                      <h2>{group}</h2>
                      {rows.map((c) => (
                        <label key={c.id}>
                          <input
                            type="checkbox"
                            checked={!!state.checklist[c.id]}
                            onChange={() => toggle("checklist", c.id)}
                          />
                          <span>
                            {c.text}
                            <small>p. {c.page}</small>
                          </span>
                        </label>
                      ))}
                    </article>
                  )
                );
              })}
            </div>
          </>
        )}
        {tab === "Glossário" && (
          <>
            <p className="info-note">
              62 termos presentes no arquivo. Definições originais; consulte as
              notas técnicas para ajustes de contexto e protocolos.
            </p>
            <div className="book-glossary">
              {book.glossary
                .filter((g) =>
                  fold(g.term + " " + g.definition).includes(fold(query)),
                )
                .map((g) => (
                  <article className="panel" key={g.term}>
                    <h2>{g.term}</h2>
                    <p>{g.definition}</p>
                    <button
                      className="text-button"
                      onClick={() => goto(g.page)}
                    >
                      Página {g.page}
                      <ArrowRight size={14} />
                    </button>
                  </article>
                ))}
            </div>
          </>
        )}
        {tab === "Notas técnicas" && (
          <>
            <div className="book-note-list">
              {reviewNotes
                .filter((n) =>
                  fold(n.title + " " + n.text).includes(fold(query)),
                )
                .map((n) => (
                  <article className="panel" key={n.title}>
                    <span className="eyebrow">{n.pages}</span>
                    <h2>{n.title}</h2>
                    <p>{n.text}</p>
                    {n.url && (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-button"
                      >
                        Conferir documentação oficial
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </article>
                ))}
            </div>
            <details className="panel book-audit">
              <summary>
                Conferência da numeração original
                <ChevronDown size={16} />
              </summary>
              {book.audit.map((a) => (
                <div key={a.topic}>
                  <h3>
                    {a.topic}: {a.entries} entradas, {a.uniqueNumbers} números
                    únicos
                  </h3>
                  <p>
                    Quantidade anunciada no PDF: {a.announced}.{" "}
                    {Object.keys(a.duplicates).length
                      ? `Números repetidos: ${Object.keys(a.duplicates).join(", ")}.`
                      : "Sem números repetidos."}
                  </p>
                  <p>
                    {a.missing.length
                      ? `Números ausentes: ${a.missing.join(", ")}.`
                      : "Nenhuma lacuna de numeração."}
                  </p>
                </div>
              ))}
            </details>
          </>
        )}
      </section>
      <section className="book-labs">
        <h2>Do livro para o seu terminal</h2>
        <p>
          Arquivos complementares do QA Atlas para uma primeira prática local.
        </p>
        <div className="downloads-grid">
          {[
            {
              file: "lab_sql.py",
              title: "SQL com dados reproduzíveis",
              sub: "Semana 17 · py lab_sql.py",
            },
            {
              file: "smoke.robot",
              title: "Primeiro teste Robot",
              sub: "Semana 20 · python -m robot smoke.robot",
            },
            {
              file: "api_local.py",
              title: "API de laboratório local",
              sub: "Semana 21 · py api_local.py",
            },
          ].map((f) => (
            <a key={f.file} href={publicAsset("leitura/" + f.file)} download>
              <FileText size={22} />
              <div>
                <strong>{f.title}</strong>
                <small>{f.sub}</small>
              </div>
              <Download size={18} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
function ClockLabel() {
  return (
    <span className="metric-icon purple">
      <BookOpen size={21} />
    </span>
  );
}
