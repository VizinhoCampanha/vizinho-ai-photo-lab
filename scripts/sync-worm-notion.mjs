import fs from "node:fs/promises";

const token = process.env.NOTION_TOKEN;
const dataSourceId = "0ab7116c-d236-4331-be0f-50ab14b3efa1";

if (!token) throw new Error("NOTION_TOKEN is not configured.");

async function queryNotion() {
  const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ page_size: 100 })
  });
  if (!response.ok) {
    throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function text(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.map(x => x.plain_text ?? x.text?.content ?? "").join("") ?? "";
  if (prop.type === "rich_text") return prop.rich_text?.map(x => x.plain_text ?? x.text?.content ?? "").join("") ?? "";
  return "";
}

function select(prop) {
  return prop?.select?.name ?? "";
}

function number(prop) {
  if (!prop) return null;
  if (prop.type === "number") return prop.number ?? null;
  if (prop.type === "unique_id") return prop.unique_id?.number ?? null;
  return prop.number ?? null;
}

function publicTitle(raw) {
  const title = text(raw["Projeto"]);
  return title.replace(/\s+[—-]\s+[^—-]+$/, "").trim() || title;
}

const payload = await queryNotion();
const projects = (payload.results ?? []).map(page => {
  const p = page.properties ?? {};
  const id = number(p["🆔 Projeto ID"]);
  return {
    id: id ? `WORM-${String(id).padStart(4, "0")}` : null,
    title: publicTitle(p),
    brand: select(p["🏷️ Marca"]),
    model: select(p["🏍️ Modelo"]),
    year: number(p["📅 Ano"]),
    style: select(p["🎨 Estilo"]),
    status: select(p["🔥 Status"]),
    graphicStatus: select(p["🏭 Status gráfica"])
  };
}).filter(x => x.id);

const output = {
  source: "Notion — Worm Graphics / Projetos",
  updatedAt: new Date().toISOString(),
  projects
};

await fs.mkdir("worm-graphics/data", { recursive: true });
await fs.writeFile("worm-graphics/data/projetos.json", JSON.stringify(output, null, 2) + "\n");
console.log(`Synced ${projects.length} projects from Notion.`);
