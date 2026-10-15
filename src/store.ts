import { book, newBookState, type BookState } from "./book";
import { weeks, lessons } from "./content";
export type GateRecord = {
  status: "Pendente" | "Aprovado" | "Bloqueado";
  evidence: string;
  observed: string;
  commit: string;
  owner: string;
  checked: boolean;
  updatedAt: string;
};
export type State = {
  schemaVersion: 3;
  guide: "qa-atlas";
  done: Record<string, string>;
  notes: Record<string, string>;
  evidence: Record<string, string>;
  gates: Record<string, Record<string, GateRecord>>;
  start: string;
  book: BookState;
};
export const KEY = "qa-atlas-bruno-v3";
export function monday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fresh(): State {
  return {
    schemaVersion: 3,
    guide: "qa-atlas",
    done: {},
    notes: {},
    evidence: {},
    gates: { Greenfield: {}, Brownfield: {} },
    start: monday(),
    book: newBookState(),
  };
}
const obj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown) => typeof v === "string" && v.length <= 50000;
export function validate(input: unknown): State {
  if (!obj(input)) throw Error("Estrutura inválida.");
  const s = fresh();
  if (input.schemaVersion === 3 && input.guide === "qa-atlas") {
    if (
      !obj(input.done) ||
      !obj(input.notes) ||
      !obj(input.evidence) ||
      !obj(input.gates)
    )
      throw Error("Backup incompleto.");
    for (const l of lessons) {
      const d = input.done[l.id];
      if (d !== undefined) {
        if (typeof d !== "string" || isNaN(Date.parse(d)))
          throw Error("Data de conclusão inválida.");
        s.done[l.id] = d;
      }
    }
    for (const field of ["notes", "evidence"] as const) {
      for (const [k, v] of Object.entries(
        input[field] as Record<string, unknown>,
      )) {
        if (!text(v)) throw Error("Texto inválido.");
        if (
          lessons.some((l) => l.id === k) ||
          weeks.some((w) => "week" + w.id === k)
        )
          s[field][k] = v as string;
      }
    }
    for (const mode of ["Greenfield", "Brownfield"]) {
      const g = input.gates[mode];
      if (g === undefined) continue;
      if (!obj(g)) throw Error("Gates inválidos.");
      for (let i = 1; i <= 9; i++) {
        const r = g["G" + i];
        if (r === undefined) continue;
        if (
          !obj(r) ||
          !["Pendente", "Aprovado", "Bloqueado"].includes(String(r.status)) ||
          !["evidence", "observed", "commit", "owner", "updatedAt"].every((k) =>
            text(r[k]),
          ) ||
          typeof r.checked !== "boolean"
        )
          throw Error("Registro de gate inválido.");
        if (
          r.status === "Aprovado" &&
          (!r.checked ||
            !["evidence", "observed", "commit", "owner"].every((k) =>
              (r[k] as string).trim(),
            ))
        )
          throw Error("Gate aprovado sem evidências.");
        s.gates[mode]["G" + i] = r as unknown as GateRecord;
      }
    }
    if (
      typeof input.start === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.start) &&
      !isNaN(new Date(input.start + "T12:00:00").getTime())
    )
      s.start = input.start;
    if (input.book !== undefined) {
      if (!obj(input.book)) throw Error("Progresso do livro inválido.");
      for (const field of [
        "done",
        "evidence",
        "readPages",
        "checklist",
      ] as const) {
        const value = input.book[field];
        if (!obj(value)) throw Error("Backup do livro incompleto.");
        const validIds = new Set(
          field === "readPages"
            ? Array.from({ length: book.pageCount }, (_, i) => String(i + 1))
            : field === "checklist"
              ? book.checklist.map((c) => c.id)
              : book.items.map((i) => i.id),
        );
        for (const [key, v] of Object.entries(value)) {
          if (!validIds.has(key)) continue;
          if (
            !text(v) ||
            (field !== "evidence" && isNaN(Date.parse(v as string)))
          )
            throw Error("Registro do livro inválido.");
          s.book[field][key] = v as string;
        }
      }
      const page = input.book.lastPage;
      if (
        typeof page !== "number" ||
        !Number.isInteger(page) ||
        page < 1 ||
        page > book.pageCount
      )
        throw Error("Página do livro inválida.");
      s.book.lastPage = page;
    }
    return s;
  }
  if (
    obj(input.done) &&
    obj(input.notes) &&
    (input.guide === undefined || input.guide === "bruno-qa") &&
    (input.schemaVersion === undefined || input.schemaVersion === 2)
  ) {
    for (let i = 1; i <= 60; i++) {
      if (input.done[i] !== undefined && typeof input.done[i] !== "boolean")
        throw Error("Marcação inválida no backup anterior.");
    }
    for (const l of lessons) {
      if (l.legacyId && input.done[l.legacyId] === true)
        s.done[l.id] = new Date().toISOString();
    }
    const map: Record<number, number> = {
      1: 1,
      2: 2,
      3: 4,
      4: 5,
      5: 6,
      6: 7,
      7: 8,
      8: 9,
      9: 10,
      10: 11,
      11: 12,
      12: 16,
    };
    for (const [old, n] of Object.entries(map)) {
      const v = input.notes[old];
      if (v !== undefined && !text(v)) throw Error("Nota inválida.");
      if (v) s.notes["week" + n] = v as string;
    }
    return s;
  }
  throw Error(
    "Formato desconhecido. Use um backup QA Atlas ou do seu roadmap anterior.",
  );
}
export function load(): { state: State; warning: string } {
  try {
    const v = localStorage.getItem(KEY);
    return { state: v ? validate(JSON.parse(v)) : fresh(), warning: "" };
  } catch {
    return {
      state: fresh(),
      warning:
        "Não foi possível ler seu progresso. Importe um backup antes de continuar.",
    };
  }
}
export function merge(a: State, b: State): State {
  return {
    ...a,
    done: { ...b.done, ...a.done },
    notes: { ...b.notes, ...a.notes },
    evidence: { ...b.evidence, ...a.evidence },
    book: {
      done: { ...b.book.done, ...a.book.done },
      evidence: { ...b.book.evidence, ...a.book.evidence },
      readPages: { ...b.book.readPages, ...a.book.readPages },
      checklist: { ...b.book.checklist, ...a.book.checklist },
      lastPage: a.book.lastPage,
    },
    gates: {
      Greenfield: { ...b.gates.Greenfield, ...a.gates.Greenfield },
      Brownfield: { ...b.gates.Brownfield, ...a.gates.Brownfield },
    },
  };
}
export function download(
  name: string,
  data: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
