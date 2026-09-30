import { rankScore, type LeaderRow } from "./supabase";

const STORAGE_KEY = "oa-board";

/** Optional shared board. Set VITE_PUBLIC_BOARD_BLOB to a jsonblob id when you want a campus-wide board. */
const SEED_BLOB = import.meta.env.VITE_PUBLIC_BOARD_BLOB as string | undefined;
const JSONBLOB = "https://jsonblob.com/api/jsonBlob";

function parseRows(data: unknown): LeaderRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter((r) => r && typeof r === "object" && "user_id" in r) as LeaderRow[];
}

export function readLocalBoard(): LeaderRow[] {
  try {
    return parseRows(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeLocalBoard(rows: LeaderRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function blobUrl(id: string) {
  return `${JSONBLOB}/${id}`;
}

export async function fetchPublicBoard(): Promise<LeaderRow[]> {
  if (!SEED_BLOB) return readLocalBoard();
  try {
    const res = await fetch(blobUrl(SEED_BLOB), { headers: { Accept: "application/json" } });
    if (!res.ok) return readLocalBoard();
    const rows = parseRows(await res.json());
    writeLocalBoard(rows);
    return rows;
  } catch {
    return readLocalBoard();
  }
}

export async function upsertPublicScore(row: LeaderRow): Promise<LeaderRow[]> {
  const local = readLocalBoard();
  const mergedLocal = [row, ...local.filter((r) => r.user_id !== row.user_id)];
  writeLocalBoard(mergedLocal);

  if (!SEED_BLOB) return mergedLocal;

  let remote: LeaderRow[] = [];
  try {
    const res = await fetch(blobUrl(SEED_BLOB), { headers: { Accept: "application/json" } });
    if (res.ok) remote = parseRows(await res.json());
  } catch {
    remote = [];
  }

  const byId = new Map<string, LeaderRow>();
  for (const r of [...remote, ...mergedLocal]) byId.set(r.user_id, r);
  byId.set(row.user_id, row);
  const next = [...byId.values()].sort((a, b) => rankScore(b) - rankScore(a)).slice(0, 100);
  writeLocalBoard(next);

  try {
    await fetch(blobUrl(SEED_BLOB), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(next),
    });
  } catch {
    /* local already saved */
  }
  return next;
}

export function guestUserId() {
  let stamp = localStorage.getItem("oa-guest-id");
  if (!stamp) {
    stamp = crypto.randomUUID();
    localStorage.setItem("oa-guest-id", stamp);
  }
  return `guest:${stamp}`;
}
