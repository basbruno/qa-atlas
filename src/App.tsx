import { publicAsset } from "./assets";
import {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
  Upload,
  ExternalLink,
  Layers3,
  Menu,
  X,
  Play,
  Pause,
  RotateCcw,
  Target,
  ShieldCheck,
  Sparkles,
  Terminal,
  FileText,
  SlidersHorizontal,
  Flag,
  Database,
  Link2,
  GitBranch,
  MoreHorizontal,
  NotebookPen,
} from "lucide-react";
import {
  weeks,
  lessons,
  topics,
  phases,
  resources,
  cases,
  examples,
  gates,
  setup,
  mcp,
  refsFor,
  fold,
  type Lesson,
  type Week,
} from "./content";
import {
  KEY,
  load,
  validate,
  merge,
  download,
  type State,
  type GateRecord,
} from "./store";
import { bookLink } from "./book";
const BookLibrary = lazy(() => import("./BookLibrary"));
const num = (n: number) => String(n).padStart(2, "0");
const topicIcon = (t: string) =>
  t === "Dados"
    ? Database
    : t === "BMAD"
      ? GitBranch
      : t === "MCP" || t === "IA"
        ? Sparkles
        : t === "Requests" || t === "Playwright API"
          ? Link2
          : t === "CI/CD"
            ? Terminal
            : Code2;
const initials = load();
type View = "trilha" | "semana" | "lab" | "livro";
type Lab = "pratica" | "gates" | "fontes" | "ambiente";
function IconTag({ topic }: { topic: string }) {
  const I = topicIcon(topic);
  return (
    <span
      className={
        "topic-icon " +
        (topic === "Dados" ? "mint" : topic === "BMAD" ? "peach" : "")
      }
    >
      <I size={20} />
    </span>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const r = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    r.current?.showModal();
  }, []);
  return (
    <dialog
      ref={r}
      className={"modal " + (wide ? "wide" : "")}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-top">
        <span className="eyebrow">SEU ESPAÇO DE ESTUDO</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Code({
  value,
  label = "Python / PowerShell",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block">
      <div>
        <span>{label}</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{value}</code>
      </pre>
    </div>
  );
}
export default function App() {
  const [state, setState] = useState<State>(initials.state),
    [toast, setToast] = useState(initials.warning),
    [view, setView] = useState<View>("trilha"),
    [lab, setLab] = useState<Lab>("pratica"),
    [menu, setMenu] = useState(false);
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState("Todos os temas"),
    [level, setLevel] = useState("Todos os níveis"),
    [onlyPending, setOnlyPending] = useState(false),
    [openWeeks, setOpenWeeks] = useState<number[]>([1]);
  const [lesson, setLesson] = useState<Lesson | null>(null),
    [selectedWeek, setSelectedWeek] = useState(1),
    [resourceType, setResourceType] = useState("Todas"),
    [labQuery, setLabQuery] = useState("");
  const [mode, setMode] = useState("Greenfield"),
    [gate, setGate] = useState<(typeof gates)[number] | null>(null),
    [gateDraft, setGateDraft] = useState<GateRecord | null>(null),
    [gateError, setGateError] = useState(""),
    [imported, setImported] = useState<State | null>(null);
  const [seconds, setSeconds] = useState(120 * 60),
    [running, setRunning] = useState(false);
  const upload = useRef<HTMLInputElement>(null),
    lastSaved = useRef(JSON.stringify(initials.state)),
    timer = useRef<number | null>(null);
  const doneCount = lessons.filter((l) => state.done[l.id]).length,
    percent = Math.round((doneCount / lessons.length) * 100),
    completeWeeks = weeks.filter((w) =>
      w.lessons.every((l) => state.done[l.id]),
    ).length;
  const next = lessons.find((l) => !state.done[l.id]) || lessons[0],
    currentWeek = weeks.find((w) => w.id === next.week)!;
  useEffect(() => {
    const serialized = JSON.stringify(state);
    if (lastSaved.current === serialized) return;
    try {
      localStorage.setItem(KEY, serialized);
      lastSaved.current = serialized;
    } catch {
      setToast(
        "Armazenamento indisponível. Exporte um backup para guardar suas alterações.",
      );
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (running) {
      timer.current = window.setInterval(
        () =>
          setSeconds((s) => {
            if (s <= 1) {
              setRunning(false);
              setToast(
                "Sessão concluída. Registre sua evidência antes de marcar a aula.",
              );
              return 0;
            }
            return s - 1;
          }),
        1000,
      );
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);
  function go(v: View, l?: Lab) {
    setView(v);
    if (l) setLab(l);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title =
      v === "trilha"
        ? "QA Atlas · Roadmap do Bruno"
        : v === "semana"
          ? "Agenda semanal · QA Atlas"
          : "Laboratório · QA Atlas";
  }
  function toggle(id: string) {
    setState((s) => {
      const done = { ...s.done };
      if (done[id]) delete done[id];
      else done[id] = new Date().toISOString();
      return { ...s, done };
    });
  }
  function note(
    id: string,
    value: string,
    field: "notes" | "evidence" = "notes",
  ) {
    setState((s) => ({ ...s, [field]: { ...s[field], [id]: value } }));
  }
  function resetFilters() {
    setQuery("");
    setTopic("Todos os temas");
    setLevel("Todos os níveis");
    setOnlyPending(false);
  }
  const filtersActive =
    !!query ||
    topic !== "Todos os temas" ||
    level !== "Todos os níveis" ||
    onlyPending;
  function matching(w: Week) {
    return w.lessons.filter(
      (l) =>
        (topic === "Todos os temas" || l.topic === topic) &&
        (level === "Todos os níveis" || l.level === level) &&
        (!onlyPending || !state.done[l.id]) &&
        fold(
          [l.title, l.concept, l.challenge, l.topic, w.title].join(" "),
        ).includes(fold(query)),
    );
  }
  const filtered = weeks
      .map((w) => ({ ...w, lessons: matching(w) }))
      .filter((w) => w.lessons.length),
    visibleCount = filtered.reduce((n, w) => n + w.lessons.length, 0);
  function exportProgress() {
    download(
      "qa-atlas-progresso.json",
      JSON.stringify(
        { ...state, exportedAt: new Date().toISOString() },
        null,
        2,
      ),
    );
    setToast("Backup exportado com aulas, livro, notas, evidências e gates.");
  }
  async function readImport(file?: File) {
    if (!file) return;
    try {
      if (file.size > 25000000) throw Error("O limite é 25 MB.");
      setImported(validate(JSON.parse(await file.text())));
    } catch (e) {
      setToast("Não foi possível importar: " + (e as Error).message);
    }
    if (upload.current) upload.current.value = "";
  }
  function openGate(g: (typeof gates)[number]) {
    setGate(g);
    setGateError("");
    setGateDraft({
      ...(state.gates[mode][g.id] || {
        status: "Pendente",
        evidence: "",
        observed: "",
        commit: "",
        owner: "Bruno",
        checked: false,
        updatedAt: "",
      }),
    });
  }
  function saveGate() {
    if (!gate || !gateDraft) return;
    if (
      gateDraft.status === "Aprovado" &&
      (!gateDraft.checked ||
        !["evidence", "observed", "commit", "owner"].every((k) =>
          String(gateDraft[k as keyof GateRecord]).trim(),
        ))
    ) {
      setGateError(
        "Para aprovar, informe commit/versão, responsável, evidência e resultado, e confirme o critério.",
      );
      return;
    }
    setState((s) => ({
      ...s,
      gates: {
        ...s.gates,
        [mode]: {
          ...s.gates[mode],
          [gate.id]: { ...gateDraft, updatedAt: new Date().toISOString() },
        },
      },
    }));
    setGate(null);
    setToast(`${gate.id} · ${mode}: decisão registrada.`);
  }
  function dateFor(week: number, day: number) {
    const d = new Date(state.start + "T12:00:00");
    d.setDate(d.getDate() + (week - 1) * 7 + day);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  function lessonRows(w: Week) {
    return (
      <div className="lesson-list">
        {w.lessons.map((l) => (
          <div
            className={"lesson-row " + (state.done[l.id] ? "is-done" : "")}
            key={l.id}
          >
            <label className="check-label">
              <input
                type="checkbox"
                checked={!!state.done[l.id]}
                onChange={() => toggle(l.id)}
                aria-label={"Concluir aula " + l.title}
              />
              <span className="custom-check">
                {state.done[l.id] && <Check size={13} />}
              </span>
            </label>
            <button className="lesson-open" onClick={() => setLesson(l)}>
              <span className="lesson-n">{num(l.day)}</span>
              <span>{l.title}</span>
              <small>
                <Clock3 size={13} />
                2h
              </small>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  }
  const activeWeek = weeks.find((w) => w.id === selectedWeek)!;
  return (
    <div className="app">
      <a className="skip" href="#main">
        Pular para o conteúdo
      </a>
      <aside className={"sidebar " + (menu ? "mobile-open" : "")}>
        <div className="brand">
          <div className="brand-mark">
            <Layers3 size={24} />
          </div>
          <span>
            QA<span className="brand-light">atlas</span>
            <small>SEU PRÓXIMO NÍVEL</small>
          </span>
          <button
            className="mobile-close icon-button"
            onClick={() => setMenu(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE PESSOAL</div>
        <nav aria-label="Navegação principal">
          {(
            [
              {
                id: "trilha",
                icon: BookOpen,
                title: "Minha trilha",
                count: String(weeks.length),
              },
              { id: "semana", icon: CalendarDays, title: "Agenda semanal" },
              { id: "lab", icon: FlaskConical, title: "Laboratório" },
              { id: "livro", icon: FileText, title: "Meu livro", count: "256" },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              className={"nav-link " + (view === n.id ? "active" : "")}
              aria-current={view === n.id ? "page" : undefined}
              onClick={() => go(n.id)}
            >
              <n.icon size={19} />
              <span>{n.title}</span>
              {"count" in n && <small>{n.count}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-progress">
          <div>
            <span>Sua evolução</span>
            <strong>{percent}%</strong>
          </div>
          <progress
            max={lessons.length}
            value={doneCount}
            aria-label="Progresso geral"
          />
          <small>
            {doneCount} de {lessons.length} aulas concluídas
          </small>
        </div>
        <div className="sidebar-bottom">
          <div className="side-note">
            <Sparkles size={20} />
            <strong>Consistência &gt; pressa.</strong>
            <p>
              Duas horas por dia.
              <br />
              Um passo melhor a cada sessão.
            </p>
          </div>
          <button
            className="settings-link"
            onClick={() => go("lab", "ambiente")}
          >
            <Terminal size={17} />
            Ambiente e backup
            <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <span className="avatar">B</span>
            <div>
              <strong>Bruno Araujo</strong>
              <small>Rumo a QA Sênior</small>
            </div>
            <span className="profile-dot" title="Espaço pessoal" />
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-shade"
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <span>Meu aprendizado</span>
            <ChevronRight size={14} />
            <strong>
              {view === "trilha"
                ? "Minha trilha"
                : view === "semana"
                  ? "Agenda semanal"
                  : view === "livro"
                    ? "Meu livro"
                    : "Laboratório"}
            </strong>
          </div>
          <div className="top-actions">
            <span className="saved">
              <span />
              Progresso neste navegador
            </span>
            <button
              className="quiet-button backup-button"
              onClick={exportProgress}
            >
              <Download size={16} />
              <span>Exportar progresso</span>
            </button>
            <span className="avatar small">B</span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {view === "trilha" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">SEU PLANO. SEU RITMO.</div>
                  <h1>
                    Um passo mais perto de QA Sênior<span>.</span>
                  </h1>
                  <p>
                    Bruno, transforme experiência em domínio. E cada estudo em
                    evidência.
                  </p>
                </div>
                <span className="outline-pill">
                  <span />
                  Windows + VS Code
                </span>
              </div>
              <section className="hero" aria-label="Resumo do roadmap">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <span />
                    ROADMAP QUALITY ENGINEER
                  </span>
                  <h2>
                    Da primeira assertion
                    <br />à decisão de qualidade.
                  </h2>
                  <p>
                    Python, APIs, Playwright e IA em uma trilha prática.
                    <br className="desktop-br" /> Duas horas por dia para
                    construir autonomia.
                  </p>
                  <button className="primary" onClick={() => setLesson(next)}>
                    <Play size={16} fill="currentColor" />
                    {doneCount === 0
                      ? "Começar minha trilha"
                      : doneCount === lessons.length
                        ? "Revisitar primeira aula"
                        : "Continuar de onde parei"}
                    <ArrowRight size={17} />
                  </button>
                  <div className="hero-meta">
                    <span>
                      <CalendarDays size={14} />
                      {weeks.length} semanas
                    </span>
                    <span>
                      <BookOpen size={14} />
                      {lessons.length} aulas práticas
                    </span>
                    <span>
                      <Clock3 size={14} />
                      {lessons.length * 2}h de percurso
                    </span>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-grid" />
                  <svg viewBox="0 0 400 260">
                    <path
                      d="M30 210h70q20 0 20-20v-50q0-20 20-20h85q20 0 20-20V60q0-20 20-20h90"
                      fill="none"
                      stroke="#c4b5e9"
                      strokeWidth="2"
                      strokeDasharray="5 6"
                    />
                    <circle cx="30" cy="210" r="5" fill="#a18acb" />
                    <circle cx="355" cy="40" r="5" fill="#8262c1" />
                  </svg>
                  <div className="float-card code-card">
                    <div>
                      <span className="tiny-dot" />
                      <span className="tiny-dot" />
                      <span className="tiny-dot" />
                      <span>test_future.py</span>
                    </div>
                    <code>
                      <em>def</em> test_next_level():
                      <br />
                      &nbsp;&nbsp;practice = <em>True</em>
                      <br />
                      &nbsp;&nbsp;<em>assert</em> practice
                    </code>
                  </div>
                  <div className="float-card pass-card">
                    <span>
                      <Check size={17} />
                    </span>
                    <div>
                      <strong>Prática com propósito</strong>
                      <small>Aprender. Testar. Evoluir.</small>
                    </div>
                  </div>
                  <div className="art-spark">✧</div>
                  <span className="art-label">BUILD YOUR NEXT CHAPTER</span>
                </div>
              </section>
              <div className="metrics">
                <div>
                  <span className="metric-icon purple">
                    <Target size={19} />
                  </span>
                  <div>
                    <small>Progresso da trilha</small>
                    <strong>
                      {percent}%{" "}
                      <span>
                        {doneCount}/{lessons.length} aulas
                      </span>
                    </strong>
                  </div>
                  <div className="mini-progress">
                    <i style={{ width: percent + "%" }} />
                  </div>
                </div>
                <div>
                  <span className="metric-icon mint">
                    <CheckCircle2 size={19} />
                  </span>
                  <div>
                    <small>Semanas concluídas</small>
                    <strong>
                      {num(completeWeeks)} <span>/ {weeks.length} semanas</span>
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="metric-icon peach">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <small>Carga de aulas concluídas</small>
                    <strong>
                      {doneCount * 2}h{" "}
                      <span>de {lessons.length * 2}h previstas</span>
                    </strong>
                  </div>
                </div>
              </div>
              <div className="content-columns">
                <section
                  className="roadmap-section"
                  aria-labelledby="roadmap-heading"
                >
                  <div className="section-heading">
                    <div>
                      <h2 id="roadmap-heading">Seu caminho de evolução</h2>
                      <p>
                        Fundamentos sólidos. Desafios reais. Decisões melhores.
                      </p>
                    </div>
                    <span className="text-count">
                      {filtersActive
                        ? visibleCount + " aulas"
                        : `${weeks.length} semanas`}
                    </span>
                  </div>
                  <div className="filters">
                    <div className="search-box">
                      <Search size={17} />
                      <input
                        aria-label="Buscar aulas"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar aula, habilidade ou desafio…"
                      />
                      {query && (
                        <button
                          aria-label="Limpar busca"
                          onClick={() => setQuery("")}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                    <div className="filter-selects">
                      <label>
                        <span className="sr-only">Filtrar por tema</span>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        >
                          {["Todos os temas", ...topics].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="sr-only">Filtrar por nível</span>
                        <select
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
                      </label>
                      <button
                        className={
                          "filter-toggle " + (onlyPending ? "selected" : "")
                        }
                        aria-pressed={onlyPending}
                        onClick={() => setOnlyPending(!onlyPending)}
                        title="Mostrar apenas aulas pendentes"
                      >
                        <SlidersHorizontal size={16} />
                        <span>Pendentes</span>
                      </button>
                    </div>
                  </div>
                  {filtersActive && (
                    <div className="filter-status" role="status">
                      {visibleCount} aulas encontradas
                      <button onClick={resetFilters}>Limpar filtros</button>
                    </div>
                  )}
                  {filtered.length === 0 ? (
                    <div className="empty">
                      <Search size={25} />
                      <h3>Nenhuma aula por aqui.</h3>
                      <p>Tente outro termo ou combine menos filtros.</p>
                      <button className="secondary" onClick={resetFilters}>
                        Ver todas as aulas
                      </button>
                    </div>
                  ) : (
                    phases.map((p, pi) => {
                      const items = filtered.filter(
                        (w) => w.id >= p.from && w.id <= p.to,
                      );
                      if (!items.length) return null;
                      return (
                        <div className="phase" key={p.name}>
                          <div className="phase-heading">
                            <span>0{pi + 1}</span>
                            <h3>{p.name}</h3>
                            <small>{p.range}</small>
                          </div>
                          <div className="week-stack">
                            {items.map((w) => {
                              const original = weeks.find(
                                  (a) => a.id === w.id,
                                )!,
                                count = original.lessons.filter(
                                  (l) => state.done[l.id],
                                ).length,
                                expanded =
                                  filtersActive || openWeeks.includes(w.id);
                              return (
                                <article
                                  key={w.id}
                                  className={
                                    "week-card " +
                                    (w.id === currentWeek.id ? "current" : "") +
                                    (count === 5 ? " complete" : "")
                                  }
                                >
                                  <button
                                    className="week-card-head"
                                    onClick={() =>
                                      setOpenWeeks((o) =>
                                        o.includes(w.id)
                                          ? o.filter((i) => i !== w.id)
                                          : [...o, w.id],
                                      )
                                    }
                                    aria-expanded={expanded}
                                    aria-controls={"week-" + w.id}
                                  >
                                    <IconTag topic={w.topic} />
                                    <div className="week-card-text">
                                      <span className="week-eyebrow">
                                        SEMANA {num(w.id)}
                                        <span
                                          className={"level " + fold(w.level)}
                                        >
                                          {w.level}
                                        </span>
                                        {w.id === currentWeek.id &&
                                          doneCount < lessons.length && (
                                            <span className="current-label">
                                              Você está aqui
                                            </span>
                                          )}
                                      </span>
                                      <h4>{w.title}</h4>
                                      <p>{w.goal}</p>
                                      <div className="week-card-meta">
                                        <span>
                                          <BookOpen size={12} />
                                          {filtersActive
                                            ? w.lessons.length
                                            : 5}{" "}
                                          aulas
                                        </span>
                                        <span>
                                          <Clock3 size={12} />
                                          10h
                                        </span>
                                        <span>{w.gates.join(" · ")}</span>
                                      </div>
                                    </div>
                                    <div className="week-end">
                                      <span>{count}/5</span>
                                      {count === 5 ? (
                                        <CheckCircle2 size={18} />
                                      ) : (
                                        <ChevronDown
                                          className={expanded ? "rotated" : ""}
                                          size={18}
                                        />
                                      )}
                                    </div>
                                  </button>
                                  {expanded && (
                                    <div id={"week-" + w.id}>
                                      {lessonRows(w)}
                                    </div>
                                  )}
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
                <aside className="study-aside">
                  <div className="today-card">
                    <div className="card-eyebrow">
                      <span className="small-icon">
                        <Flag size={15} />
                      </span>
                      SEU PRÓXIMO PASSO
                    </div>
                    <span className="subtle-label">
                      SEMANA {num(next.week)} · AULA {num(next.day)}
                    </span>
                    <h3>
                      {doneCount === lessons.length
                        ? "Trilha concluída. Revise seu portfólio."
                        : next.title}
                    </h3>
                    <p>
                      {doneCount === lessons.length
                        ? "Revisite um desafio e explique suas decisões sem consultar."
                        : next.challenge}
                    </p>
                    <div className="today-meta">
                      <span>
                        <Clock3 size={14} />2 horas
                      </span>
                      <span className="tag">{next.topic}</span>
                    </div>
                    <button
                      className="primary full"
                      onClick={() => setLesson(next)}
                    >
                      Abrir aula
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="session-card">
                    <div className="section-heading compact">
                      <h3>Sua sessão de 2h</h3>
                      <Clock3 size={16} />
                    </div>
                    {[
                      {
                        time: "15",
                        title: "Revisar",
                        text: "Conectar com o que já sabe.",
                      },
                      {
                        time: "25",
                        title: "Aprender",
                        text: "Um conceito, uma referência.",
                      },
                      {
                        time: "65",
                        title: "Praticar",
                        text: "Código, teste e investigação.",
                      },
                      {
                        time: "15",
                        title: "Registrar",
                        text: "Evidência e próxima hipótese.",
                      },
                    ].map((a, i) => (
                      <div className="session-step" key={a.title}>
                        <span className={"step-dot dot" + i} />
                        <div>
                          <strong>{a.title}</strong>
                          <small>{a.text}</small>
                        </div>
                        <span>
                          {a.time}
                          <small>min</small>
                        </span>
                      </div>
                    ))}
                    <button
                      className="text-button"
                      onClick={() => go("semana")}
                    >
                      Ver minha semana
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="gate-teaser">
                    <ShieldCheck size={24} />
                    <h3>Qualidade tem evidência.</h3>
                    <p>Acompanhe 9 Quality Gates em Greenfield e Brownfield.</p>
                    <button
                      className="text-button"
                      onClick={() => go("lab", "gates")}
                    >
                      Abrir painel de gates
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="source-note">
                    <Link2 size={15} />
                    <span>
                      Seu plano original + o livro completo.
                      <br />
                      Referências conferidas em 15 out. 2026.
                    </span>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "semana" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">UM DIA DE CADA VEZ</div>
                  <h1>
                    Sua semana, com espaço para evoluir<span>.</span>
                  </h1>
                  <p>
                    Cinco sessões de estudo, um dia de recuperação e um dia
                    livre.
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => {
                    setSelectedWeek(currentWeek.id);
                    setToast("Agenda aberta na próxima semana de estudo.");
                  }}
                >
                  <Target size={16} />
                  Minha semana atual
                </button>
              </div>
              <div className="planner-bar">
                <div>
                  <button
                    className="icon-button"
                    aria-label="Semana anterior"
                    disabled={selectedWeek === 1}
                    onClick={() => setSelectedWeek((n) => n - 1)}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <label className="sr-only" htmlFor="week-select">
                    Selecionar semana
                  </label>
                  <select
                    id="week-select"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  >
                    {weeks.map((w) => (
                      <option key={w.id} value={w.id}>
                        Semana {num(w.id)} · {w.title}
                      </option>
                    ))}
                  </select>
                  <button
                    className="icon-button"
                    aria-label="Próxima semana"
                    disabled={selectedWeek === weeks.length}
                    onClick={() => setSelectedWeek((n) => n + 1)}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <span>
                  {activeWeek.lessons.filter((l) => state.done[l.id]).length}/5
                  sessões concluídas · 10h planejadas
                </span>
              </div>
              <div className="week-planner">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map(
                  (day, i) => {
                    const l = activeWeek.lessons[i];
                    return (
                      <article
                        key={day}
                        className={
                          "day-card " + (state.done[l.id] ? "day-done" : "")
                        }
                      >
                        <div className="day-label">
                          {day}
                          <span>{dateFor(selectedWeek, i)}</span>
                        </div>
                        <span className="day-number">0{i + 1}</span>
                        <span className="tag">{l.topic}</span>
                        <h3>{l.title}</h3>
                        <p>{l.criteria}</p>
                        <div className="day-actions">
                          <button
                            className="secondary"
                            onClick={() => setLesson(l)}
                          >
                            Estudar
                            <ArrowUpRight size={15} />
                          </button>
                          <label>
                            <input
                              type="checkbox"
                              checked={!!state.done[l.id]}
                              onChange={() => toggle(l.id)}
                              aria-label={"Concluir sessão de " + day}
                            />
                            {state.done[l.id] ? "Concluída" : "Concluir"}
                          </label>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
              <div className="weekly-bottom">
                <article className="panel reflection">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        DIÁRIO DA SEMANA {num(selectedWeek)}
                      </span>
                      <h2>O que mudou na sua forma de testar?</h2>
                    </div>
                    <NotebookPen size={23} />
                  </div>
                  <label htmlFor="week-note">
                    Registre um resultado, uma falha investigada e o próximo
                    passo.
                  </label>
                  <textarea
                    id="week-note"
                    value={state.notes["week" + selectedWeek] || ""}
                    onChange={(e) =>
                      note("week" + selectedWeek, e.target.value)
                    }
                    placeholder="Consegui… / A evidência está em… / Preciso investigar…"
                    maxLength={50000}
                  />
                  <small>
                    Salvo neste navegador. Exporte um backup para levar a outro
                    dispositivo.
                  </small>
                </article>
                <div className="rest-days">
                  <article>
                    <span className="calendar-icon">
                      <RotateCcw size={19} />
                    </span>
                    <div>
                      <small>SÁBADO · {dateFor(selectedWeek, 5)}</small>
                      <h3>Recuperar, sem acumular.</h3>
                      <p>
                        Até 2h opcionais para repetir o desafio mais difícil.
                        Não dobre a carga no dia seguinte.
                      </p>
                    </div>
                  </article>
                  <article>
                    <span className="calendar-icon mint">
                      <Sparkles size={19} />
                    </span>
                    <div>
                      <small>DOMINGO · {dateFor(selectedWeek, 6)}</small>
                      <h3>Descansar também faz parte.</h3>
                      <p>
                        Dia livre. Retome com uma hipótese clara para a próxima
                        sessão.
                      </p>
                    </div>
                  </article>
                </div>
              </div>
              <div className="panel cycle">
                <div>
                  <h3>Quando começa seu ciclo?</h3>
                  <p>
                    Escolha uma segunda-feira. Alterar datas preserva suas
                    conclusões.
                  </p>
                </div>
                <label>
                  Data de início
                  <input
                    type="date"
                    value={state.start}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      const d = new Date(v + "T12:00:00");
                      if (d.getDay() !== 1) {
                        setToast(
                          "Escolha uma segunda-feira para alinhar a agenda.",
                        );
                        return;
                      }
                      setState((s) => ({ ...s, start: v }));
                    }}
                  />
                </label>
              </div>
            </>
          )}
          {view === "lab" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    MENOS TEORIA SOLTA. MAIS EVIDÊNCIA.
                  </div>
                  <h1>
                    Seu laboratório de qualidade<span>.</span>
                  </h1>
                  <p>
                    Um lugar para praticar, consultar e sustentar suas decisões.
                  </p>
                </div>
                <span className="outline-pill">
                  <FlaskConical size={15} />
                  Prática com dados fictícios
                </span>
              </div>
              <div
                className="tabs"
                role="tablist"
                aria-label="Áreas do laboratório"
              >
                {(
                  [
                    { id: "pratica", title: "Banco de prática", icon: Code2 },
                    {
                      id: "gates",
                      title: "9 Quality Gates",
                      icon: ShieldCheck,
                    },
                    { id: "fontes", title: "Referências", icon: BookOpen },
                    {
                      id: "ambiente",
                      title: "Ambiente e backup",
                      icon: Terminal,
                    },
                  ] as const
                ).map((t, i) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={lab === t.id}
                    aria-controls={"panel-" + t.id}
                    id={"tab-" + t.id}
                    tabIndex={lab === t.id ? 0 : -1}
                    onKeyDown={(e) => {
                      if (
                        ["ArrowRight", "ArrowLeft", "Home", "End"].includes(
                          e.key,
                        )
                      ) {
                        e.preventDefault();
                        const ids: Lab[] = [
                          "pratica",
                          "gates",
                          "fontes",
                          "ambiente",
                        ];
                        const j =
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? 3
                              : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                        setLab(ids[j]);
                        document.getElementById("tab-" + ids[j])?.focus();
                      }
                    }}
                    onClick={() => setLab(t.id)}
                  >
                    <t.icon size={17} />
                    {t.title}
                  </button>
                ))}
              </div>
              <div
                role="tabpanel"
                id={"panel-" + lab}
                aria-labelledby={"tab-" + lab}
              >
                {lab === "pratica" && (
                  <>
                    <div className="lab-intro">
                      <div>
                        <span className="eyebrow">SEU TERRENO DE TESTES</span>
                        <h2>Escolha um risco. Prove um comportamento.</h2>
                        <p>
                          30 cenários extras, com dados, oráculo e evidência.
                          Eles complementam as {lessons.length} aulas.
                        </p>
                      </div>
                      <a
                        className="secondary"
                        href="https://www.saucedemo.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir SauceDemo
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    <div className="downloads-grid">
                      <a href={publicAsset("defeitos.csv")} download>
                        <span className="metric-icon mint">
                          <Database size={20} />
                        </span>
                        <div>
                          <strong>Dataset de defeitos</strong>
                          <small>CSV · 10 registros · semana 03</small>
                        </div>
                        <Download size={18} />
                      </a>
                      <a href={publicAsset("test_valor_local.py")} download>
                        <span className="metric-icon purple">
                          <Code2 size={20} />
                        </span>
                        <div>
                          <strong>Teste web sem internet</strong>
                          <small>Python · HTML controlado · pytest</small>
                        </div>
                        <Download size={18} />
                      </a>
                    </div>
                    <div className="filter-selects lab-filters">
                      <div className="search-box">
                        <Search size={17} />
                        <input
                          value={labQuery}
                          onChange={(e) => setLabQuery(e.target.value)}
                          placeholder="Buscar cenário ou tipo…"
                          aria-label="Buscar cenário"
                        />
                      </div>
                      <span>
                        {
                          cases.filter((c) =>
                            fold(
                              c.title +
                                " " +
                                c.topic +
                                " " +
                                c.blocks.join(" "),
                            ).includes(fold(labQuery)),
                          ).length
                        }{" "}
                        cenários
                      </span>
                    </div>
                    <div className="case-grid">
                      {cases
                        .filter((c) =>
                          fold(
                            c.title + " " + c.topic + " " + c.blocks.join(" "),
                          ).includes(fold(labQuery)),
                        )
                        .map((c) => (
                          <details className="case-card" key={c.id}>
                            <summary>
                              <span className="case-id">{c.id}</span>
                              <span>{c.title}</span>
                              <span className="tag">{c.topic}</span>
                              <ChevronDown size={16} />
                            </summary>
                            <div>
                              {c.blocks.map((b, i) => (
                                <p key={i}>
                                  <strong>{b.split(":")[0]}:</strong>
                                  {b.slice(b.indexOf(":") + 1)}
                                </p>
                              ))}
                            </div>
                          </details>
                        ))}
                    </div>
                    {!cases.some((c) =>
                      fold(
                        c.title + " " + c.topic + " " + c.blocks.join(" "),
                      ).includes(fold(labQuery)),
                    ) && (
                      <div className="empty">
                        <p>Nenhum cenário encontrado.</p>
                        <button
                          className="secondary"
                          onClick={() => setLabQuery("")}
                        >
                          Limpar busca
                        </button>
                      </div>
                    )}
                    <div className="section-heading code-heading">
                      <div>
                        <h2>Código para comparar depois de tentar</h2>
                        <p>
                          Exemplos didáticos. Serviços externos precisam ser
                          revalidados no seu ambiente.
                        </p>
                      </div>
                    </div>
                    {examples.map((e, i) => (
                      <details className="example" key={e.title}>
                        <summary>
                          <Code2 size={18} />
                          {e.title.replace(/ — semana \d+/, "")}
                          <ChevronDown size={16} />
                        </summary>
                        <Code value={e.code} />
                        {i === 3 && (
                          <p className="muted">
                            A quantidade de produtos é uma observação do demo.
                            Confirme o contrato atual antes de fixá-la como
                            regra.
                          </p>
                        )}
                      </details>
                    ))}
                    <div className="info-note">
                      Ambientes públicos são compartilhados. Use dados próprios
                      e baixo volume. Exercícios de carga e segurança ficam em
                      ambiente local autorizado.
                    </div>
                  </>
                )}
                {lab === "gates" && (
                  <>
                    <div className="lab-intro">
                      <div>
                        <span className="eyebrow">
                          CRITÉRIO → EVIDÊNCIA → DECISÃO
                        </span>
                        <h2>Uma decisão que você consegue explicar.</h2>
                        <p>
                          9 gates adaptados do seu plano. Matriz didática, sem
                          equivalência a uma lista oficial fixa do BMAD.
                        </p>
                      </div>
                      <div className="segmented" aria-label="Tipo de projeto">
                        {["Greenfield", "Brownfield"].map((m) => (
                          <button
                            className={mode === m ? "active" : ""}
                            aria-pressed={mode === m}
                            onClick={() => setMode(m)}
                            key={m}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="gate-summary">
                      <ShieldCheck size={24} />
                      <div>
                        <strong>
                          {
                            Object.values(state.gates[mode]).filter(
                              (g) => g.status === "Aprovado",
                            ).length
                          }{" "}
                          de 9 gates aprovados · {mode}
                        </strong>
                        <span>
                          {mode === "Greenfield"
                            ? "Funcionalidade nova: requisitos e aceitação antes da implementação."
                            : "Mudança em sistema existente: baseline, impacto, caracterização e regressão."}
                        </span>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          download(
                            "gates-" + mode.toLowerCase() + ".json",
                            JSON.stringify(
                              {
                                model:
                                  "Matriz didática QA Atlas; não padrão oficial fixo BMAD",
                                mode,
                                gates: gates.map((g) => ({
                                  ...g,
                                  record: state.gates[mode][g.id] || null,
                                })),
                              },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Download size={16} />
                        Exportar dossiê
                      </button>
                    </div>
                    <div className="gates-grid">
                      {gates.map((g) => {
                        const record = state.gates[mode][g.id];
                        return (
                          <article className="gate-card" key={g.id}>
                            <div className="gate-card-top">
                              <span className="gate-id">{g.id}</span>
                              <span
                                className={
                                  "status " +
                                  (record?.status === "Aprovado"
                                    ? "approved"
                                    : record?.status === "Bloqueado"
                                      ? "blocked"
                                      : "pending")
                                }
                              >
                                {record?.status || "Pendente"}
                              </span>
                            </div>
                            <small className="eyebrow">{g.phase}</small>
                            <h3>{g.title}</h3>
                            <p>{mode === "Greenfield" ? g.green : g.brown}</p>
                            <div className="gate-artifact">
                              <FileText size={14} />
                              {g.artifact}
                            </div>
                            <button
                              className="text-button"
                              onClick={() => openGate(g)}
                            >
                              Validar evidências
                              <ArrowUpRight size={16} />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                    <div className="info-note">
                      As decisões são registradas por você. O painel exige
                      campos e confirmação para aprovar, mas não verifica o
                      conteúdo dos arquivos citados. Reavalie o gate quando
                      requisito, código ou ambiente mudar.
                    </div>
                    <article className="panel bmad-map">
                      <h3>O mesmo ciclo, dois pontos de partida.</h3>
                      <div>
                        <p>
                          <strong>Greenfield · semanas 14 e 16</strong>
                          <br />
                          Problema → critérios → riscos → contratos → aceitação
                          vermelha → implementação → regressão/NFR → parecer.
                        </p>
                        <p>
                          <strong>Brownfield · semanas 15 e 16</strong>
                          <br />
                          Contexto/baseline → impacto → caracterização →
                          critérios da mudança → diff → regressão/NFR → parecer
                          e rollback.
                        </p>
                      </div>
                      <a
                        className="text-button"
                        href="https://docs.bmad-method.org/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Conferir o fluxo da sua versão do BMAD
                        <ExternalLink size={15} />
                      </a>
                    </article>
                  </>
                )}
                {lab === "fontes" && (
                  <>
                    <div className="lab-intro">
                      <div>
                        <span className="eyebrow">ESTUDE NA FONTE</span>
                        <h2>Boas referências. Uso com intenção.</h2>
                        <p>
                          Reserve até 25 minutos para a referência e volte ao
                          desafio. Você não precisa terminar todos os cursos.
                        </p>
                      </div>
                    </div>
                    <div className="source-filters">
                      <div className="segmented">
                        {["Todas", "Documentação", "Laboratório", "Alura"].map(
                          (t) => (
                            <button
                              key={t}
                              aria-pressed={resourceType === t}
                              className={resourceType === t ? "active" : ""}
                              onClick={() => setResourceType(t)}
                            >
                              {t}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="resource-grid">
                      {resources
                        .filter(
                          (r) =>
                            resourceType === "Todas" || r.type === resourceType,
                        )
                        .map((r) => (
                          <a
                            className="resource-card"
                            key={r.topic + r.url}
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div>
                              <span
                                className={
                                  "tag " + (r.type === "Alura" ? "alura" : "")
                                }
                              >
                                {r.type}
                              </span>
                              <ArrowUpRight size={18} />
                            </div>
                            <h3>{r.title}</h3>
                            <p>{r.description}</p>
                            <small>
                              {r.topic}
                              <span>
                                {new URL(r.url).hostname.replace("www.", "")}
                              </span>
                            </small>
                          </a>
                        ))}
                    </div>
                    <div className="info-note">
                      Documentação principal e páginas públicas da Alura
                      conferidas em 15/10/2026. Conteúdo das aulas e desafios é
                      original ou adaptado do seu plano anterior; não reproduz
                      aulas pagas. Catálogo, assinatura e versões podem mudar.
                    </div>
                  </>
                )}
                {lab === "ambiente" && (
                  <>
                    <div className="lab-intro">
                      <div>
                        <span className="eyebrow">
                          PRONTO PARA O SEU WINDOWS
                        </span>
                        <h2>Prepare uma vez. Reproduza sempre.</h2>
                        <p>
                          Windows 11, VS Code e Python em ambiente isolado. Para
                          o sistema web local, use Node.js 22.12+ ou 24 LTS.
                        </p>
                      </div>
                    </div>
                    <div className="setup-grid">
                      <article className="panel">
                        <h3>
                          <Terminal size={20} />
                          Seu ambiente de estudos
                        </h3>
                        <p>
                          Instale Python e a extensão Python da Microsoft. Abra
                          a pasta do projeto no VS Code e execute no PowerShell:
                        </p>
                        <Code value={setup} />
                        <p className="muted">
                          Os comandos usam o Python do venv diretamente, sem
                          alterar a política de execução do PowerShell. O
                          primeiro pytest exige um arquivo test_*.py; “no tests
                          ran” indica ausência de testes.
                        </p>
                        <a
                          className="text-button"
                          href="https://playwright.dev/python/docs/intro"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Verificar compatibilidade do Playwright
                          <ExternalLink size={15} />
                        </a>
                      </article>
                      <div>
                        <article className="panel backup-panel">
                          <span className="metric-icon purple">
                            <Download size={21} />
                          </span>
                          <h3>Seu progresso é seu.</h3>
                          <p>
                            Aulas, livro, notas e gates ficam neste navegador.
                            Não há sincronização entre dispositivos ou entre
                            localhost e o site privado.
                          </p>
                          <button
                            className="primary full"
                            onClick={exportProgress}
                          >
                            <Download size={17} />
                            Exportar backup completo
                          </button>
                          <button
                            className="secondary full"
                            onClick={() => upload.current?.click()}
                          >
                            <Upload size={17} />
                            Importar backup
                          </button>
                          <small>
                            Aceita o QA Atlas e o JSON do seu roadmap anterior.
                            A importação combina os dados e preserva os
                            registros atuais em conflitos.
                          </small>
                        </article>
                        <article className="panel local-panel">
                          <h3>Rodar o sistema no seu PC</h3>
                          <p>
                            Extraia o projeto entregue, abra a pasta no VS Code
                            e execute:
                          </p>
                          <Code
                            label="PowerShell · sistema web"
                            value={
                              "npm ci\nnpm run dev\n# Abra http://127.0.0.1:5173"
                            }
                          />
                          <p className="muted">
                            React + TypeScript + Vite. Os estudos em Python são
                            executados no terminal, e não nesta página.
                          </p>
                        </article>
                      </div>
                    </div>
                    <article className="panel mcp-panel">
                      <span className="eyebrow">
                        SEMANA 13 · IA COM EVIDÊNCIA
                      </span>
                      <h3>Playwright MCP no VS Code</h3>
                      <p>
                        Use Node.js compatível e um cliente de IA com suporte
                        MCP. Salve a configuração abaixo em{" "}
                        <code>.vscode/mcp.json</code> para o cliente nativo do
                        VS Code. Extensões podem usar outro formato. Confirme as
                        ferramentas disponíveis antes de começar.
                      </p>
                      <Code value={mcp} label=".vscode/mcp.json" />
                      <p>
                        Comece com a versão atual para experimentar; depois fixe
                        a versão validada. O servidor opera o navegador; sua
                        regressão continua em pytest + Playwright Python.
                        Explore apenas contas de laboratório em contexto
                        isolado.
                      </p>
                      <div className="inline-links">
                        <a
                          href="https://github.com/microsoft/playwright-mcp"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Projeto oficial
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href="https://code.visualstudio.com/docs/agent-customization/mcp-servers"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Configuração do VS Code
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </article>
                    <article className="panel">
                      <h3>SauceDemo e Sauce Labs no seu plano</h3>
                      <p>
                        <strong>SauceDemo:</strong> laboratório web público para
                        sua automação Python local.{" "}
                        <strong>Sauce Labs Cloud:</strong> extensão opcional de
                        execução remota; o suporte Playwright documentado é
                        JS/TS com saucectl, com conta e limites próprios. Na
                        semana 11, porte apenas um smoke para TypeScript se
                        quiser experimentar a nuvem.
                      </p>
                      <p>
                        Para browser equivalente ao MCP, mantenha o mesmo ciclo:
                        observar → agir → observar → registrar → converter em
                        teste independente. Só adote ferramentas que tenham
                        suporte oficial ao seu Windows e ao cliente escolhido.
                      </p>
                    </article>
                  </>
                )}
              </div>
            </>
          )}
          {view === "livro" && (
            <Suspense fallback={<p role="status">Abrindo seu livro…</p>}>
              <BookLibrary
                state={state.book}
                update={(fn) => setState((s) => ({ ...s, book: fn(s.book) }))}
                openWeek={(id) => {
                  setSelectedWeek(id);
                  go("semana");
                }}
              />
            </Suspense>
          )}
          <footer>
            <span>
              <Layers3 size={15} />
              QA Atlas <span>·</span> Construído para o seu próximo nível.
            </span>
            <span>2h por dia. Evidência a cada passo.</span>
          </footer>
        </main>
      </div>
      {running && (
        <div className="floating-timer">
          <Clock3 size={18} />
          <strong>
            {num(Math.floor(seconds / 60))}:{num(seconds % 60)}
          </strong>
          <span>Sessão de estudo</span>
          <button
            className="icon-button"
            onClick={() => setRunning(false)}
            aria-label="Pausar cronômetro"
          >
            <Pause size={17} />
          </button>
        </div>
      )}
      <div
        className={"toast " + (toast ? "show" : "")}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <CheckCircle2 size={18} />
            <span>{toast}</span>
            <button aria-label="Dispensar aviso" onClick={() => setToast("")}>
              <X size={16} />
            </button>
          </>
        )}
      </div>
      <input
        ref={upload}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Importar backup JSON"
        onChange={(e) => readImport(e.target.files?.[0])}
      />
      {lesson && (
        <Modal title={lesson.title} wide onClose={() => setLesson(null)}>
          <div className="lesson-modal-heading">
            <span className="tag">
              SEMANA {num(lesson.week)} · AULA {num(lesson.day)} ·{" "}
              {lesson.level}
            </span>
            <h2>{lesson.title}</h2>
            <p>
              <Clock3 size={15} />2 horas<span>·</span>
              {lesson.topic}
            </p>
          </div>
          <div className="lesson-modal-grid">
            <div>
              <section className="lesson-section">
                <h3>
                  <BookOpen size={19} />O conceito
                </h3>
                <p>{lesson.concept}</p>
              </section>
              <section className="challenge-section">
                <span className="eyebrow">AGORA É COM VOCÊ</span>
                <h3>Seu desafio de hoje</h3>
                <p>{lesson.challenge}</p>
              </section>
              <section className="lesson-section criteria-section">
                <h3>
                  <Target size={19} />
                  Como saber que conseguiu
                </h3>
                <p>{lesson.criteria}</p>
              </section>
              {lesson.bookPages && (
                <section className="lesson-section book-lesson-link">
                  <span className="eyebrow">
                    APOIO DO LIVRO QUE VOCÊ ENVIOU
                  </span>
                  <h3>Perca o Medo da Automação</h3>
                  <p>
                    Páginas {lesson.bookPages[0]}–{lesson.bookPages[1]}. Escolha
                    um trecho ou exercício para a sessão; não é necessário ler
                    toda a faixa de uma vez.
                  </p>
                  <button
                    className="secondary"
                    onClick={() => {
                      const p = lesson.bookPages![0];
                      setState((s) => ({
                        ...s,
                        book: { ...s.book, lastPage: p },
                      }));
                      setLesson(null);
                      go("livro");
                    }}
                  >
                    <BookOpen size={16} />
                    Ler no Meu livro
                  </button>
                  <a
                    className="text-button"
                    href={bookLink(lesson.bookPages[0])}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir página no PDF
                    <ExternalLink size={14} />
                  </a>
                </section>
              )}
              {lesson.week === 3 && (
                <a className="secondary" href={publicAsset("defeitos.csv")} download>
                  <Database size={16} />
                  Baixar dataset de defeitos
                </a>
              )}
              {lesson.id === "w1d1" && <Code value={setup} />}
              <section className="lesson-section">
                <h3>
                  <Link2 size={18} />
                  Referências para esta aula
                </h3>
                <div className="lesson-refs">
                  {refsFor(lesson).map((r) => (
                    <a
                      key={r.topic + r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.title}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              </section>
              <details className="hint">
                <summary>
                  <Sparkles size={17} />
                  Travou? Peça uma pista à IA
                  <ChevronDown size={16} />
                </summary>
                <Code value={lesson.prompt} label="Prompt de estudo" />
              </details>
              <label className="field-label" htmlFor="lesson-note">
                Sua hipótese, descoberta ou dúvida
              </label>
              <textarea
                id="lesson-note"
                value={state.notes[lesson.id] || ""}
                onChange={(e) => note(lesson.id, e.target.value)}
                placeholder="O que aprendi? Qual hipótese ainda preciso testar?"
                maxLength={50000}
              />
              <label className="field-label" htmlFor="lesson-evidence">
                Evidência da aula
              </label>
              <textarea
                id="lesson-evidence"
                className="short-textarea"
                value={state.evidence[lesson.id] || ""}
                onChange={(e) => note(lesson.id, e.target.value, "evidence")}
                placeholder="Caminho do teste, commit, comando executado e resultado observado…"
                maxLength={50000}
              />
              <small className="muted">
                {lesson.evidence} O link ou caminho é apenas registrado;
                arquivos não são enviados.
              </small>
            </div>
            <aside className="lesson-side">
              <h3>Seu roteiro de 2h</h3>
              {lesson.steps.map((s, i) => (
                <div className="lesson-step" key={s}>
                  <span>0{i + 1}</span>
                  <p>
                    <strong>{s.split(" · ")[0]}</strong>
                    {s.split(" · ")[1]}
                  </p>
                </div>
              ))}
              <div className="timer-box">
                <span>Tempo de foco</span>
                <strong>
                  {num(Math.floor(seconds / 60))}:{num(seconds % 60)}
                </strong>
                <div>
                  <button
                    className="secondary"
                    onClick={() => {
                      if (seconds === 0) setSeconds(7200);
                      setRunning(!running);
                    }}
                  >
                    {running ? <Pause size={15} /> : <Play size={15} />}{" "}
                    {running ? "Pausar" : "Iniciar"}
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => {
                      setRunning(false);
                      setSeconds(7200);
                    }}
                    aria-label="Reiniciar cronômetro"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <small>
                  O cronômetro funciona enquanto esta página permanece ativa;
                  não comprova horas estudadas.
                </small>
              </div>
            </aside>
          </div>
          <div className="lesson-modal-footer">
            <button
              className={
                "primary " + (state.done[lesson.id] ? "done-button" : "")
              }
              onClick={() => {
                toggle(lesson.id);
                setToast(
                  state.done[lesson.id]
                    ? "Aula reaberta para revisão."
                    : "Aula concluída. Mais uma evidência de evolução.",
                );
              }}
            >
              <CheckCircle2 size={18} />
              {state.done[lesson.id]
                ? "Concluída · reabrir aula"
                : "Marcar aula como concluída"}
            </button>
            <button
              className="text-button"
              disabled={
                lessons.findIndex((l) => l.id === lesson.id) ===
                lessons.length - 1
              }
              onClick={() => {
                const n = lessons.findIndex((l) => l.id === lesson.id);
                setLesson(lessons[n + 1]);
                document.querySelector("dialog")?.scrollTo({ top: 0 });
              }}
            >
              Próxima aula
              <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
      {gate && gateDraft && (
        <Modal title={"Validar " + gate.id} onClose={() => setGate(null)}>
          <span className="tag">
            {mode} · {gate.id} · {gate.phase}
          </span>
          <h2>{gate.title}</h2>
          <div className="gate-criterion">
            <strong>Critério de aprovação</strong>
            <p>{gate.criterion}</p>
          </div>
          <p className="muted">Evidência esperada: {gate.artifact}</p>
          <label className="field-label">
            Versão ou commit
            <input
              value={gateDraft.commit}
              maxLength={50000}
              onChange={(e) =>
                setGateDraft({ ...gateDraft, commit: e.target.value })
              }
              placeholder="Ex.: commit a1b2c3d, ambiente local"
            />
          </label>
          <label className="field-label">
            Responsável
            <input
              value={gateDraft.owner}
              maxLength={50000}
              onChange={(e) =>
                setGateDraft({ ...gateDraft, owner: e.target.value })
              }
            />
          </label>
          <label className="field-label">
            Evidência e data
            <textarea
              value={gateDraft.evidence}
              maxLength={50000}
              onChange={(e) =>
                setGateDraft({ ...gateDraft, evidence: e.target.value })
              }
              placeholder="Arquivo, relatório ou URL, comando e data da execução"
            />
          </label>
          <label className="field-label">
            Resultado, lacunas e risco residual
            <textarea
              value={gateDraft.observed}
              maxLength={50000}
              onChange={(e) =>
                setGateDraft({ ...gateDraft, observed: e.target.value })
              }
              placeholder="Compare observado e critério. Registre pendências e condição de reavaliação."
            />
          </label>
          <label className="gate-check">
            <input
              type="checkbox"
              checked={gateDraft.checked}
              onChange={(e) =>
                setGateDraft({ ...gateDraft, checked: e.target.checked })
              }
            />
            Revisei as evidências e confirmei o critério acima.
          </label>
          <label className="field-label">
            Decisão
            <select
              aria-label="Decisão"
              value={gateDraft.status}
              onChange={(e) =>
                setGateDraft({
                  ...gateDraft,
                  status: e.target.value as GateRecord["status"],
                })
              }
            >
              <option>Pendente</option>
              <option>Aprovado</option>
              <option>Bloqueado</option>
            </select>
          </label>
          {gateError && (
            <p className="error-message" role="alert">
              {gateError}
            </p>
          )}
          <div className="modal-actions">
            <button className="secondary" onClick={() => setGate(null)}>
              Cancelar
            </button>
            <button className="primary" onClick={saveGate}>
              Salvar decisão
              <Check size={16} />
            </button>
          </div>
        </Modal>
      )}
      {imported && (
        <Modal title="Revisar importação" onClose={() => setImported(null)}>
          <span className="eyebrow">SEU HISTÓRICO CONTINUA AQUI</span>
          <h2>Combinar este backup?</h2>
          <p>
            O arquivo contém{" "}
            <strong>
              {Object.keys(imported.done).length} aulas concluídas
            </strong>{" "}
            e <strong>{Object.keys(imported.notes).length} notas</strong>, além
            de{" "}
            <strong>
              {Object.keys(imported.book.done).length} atividades do livro
            </strong>{" "}
            e {Object.keys(imported.book.readPages).length} páginas lidas. As
            conclusões serão combinadas. Suas notas e decisões atuais têm
            prioridade em conflitos.
          </p>
          <p>
            O backup do roadmap anterior é convertido para as semanas
            correspondentes. Datas antigas não disponíveis são registradas como
            a data da importação.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setImported(null)}>
              Cancelar
            </button>
            <button
              className="primary"
              onClick={() => {
                setState((s) => merge(s, imported));
                setImported(null);
                setToast(
                  "Backup combinado. Seu progresso está pronto para continuar.",
                );
              }}
            >
              Combinar progresso
              <Upload size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
