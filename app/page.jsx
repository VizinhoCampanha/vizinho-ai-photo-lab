"use client";

import { useEffect, useState } from "react";

const flow = [
  { key: "briefing", label: "Briefing e referências", match: ["Conversando", "Interessado", "Pausado"] },
  { key: "arte", label: "Criação da arte", match: ["Criar ARTE"] },
  { key: "aprovada", label: "Arte aprovada", match: ["Arte Aprovada"] },
  { key: "render", label: "Render do molde", match: ["Renderizar MOLDE"] },
  { key: "molde", label: "Molde aprovado", match: ["Aprovar MOLDE"] },
  { key: "producao", label: "Produção na Worm", match: ["Em Produção", "Em produção"] },
  { key: "despacho", label: "Despacho", match: ["Enviado", "Despachado"] },
  { key: "entrega", label: "Entrega", match: ["Concluído"] },
];

function normalizeCode(value) {
  const match = value.trim().toUpperCase().match(/^WORM[-\s]*0*(\d+)$/i);
  return match ? `WORM-${String(Number(match[1])).padStart(4, "0")}` : value.trim().toUpperCase();
}

function currentStage(project) {
  const statuses = [project.graphicStatus, project.status].filter(Boolean).map((value) => value.toLowerCase());
  const index = flow.findIndex((stage) => stage.match.some((value) => statuses.includes(value.toLowerCase())));
  return Math.max(0, index);
}

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(undefined);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/data/projetos.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Não foi possível carregar os dados.");
        const data = await response.json();
        setProjects(data.projects ?? []);
        setUpdatedAt(data.updatedAt ?? null);
      } catch {
        setLoadError(true);
      }
    }
    loadProjects();
  }, []);

  function handleTracking(event) {
    event.preventDefault();
    setResult(projects.find((project) => project.id === normalizeCode(code)) ?? null);
  }

  const stageIndex = result ? currentStage(result) : 0;

  return (
    <>
      <header className="nav">
        <div className="wrap nav-content">
          <a className="brand" href="#inicio" aria-label="Worm Graphics, início">
            <span className="mark"><span>W</span></span> WORM GRAPHICS
          </a>
          <nav aria-label="Navegação principal">
            <a href="#projetos">Projetos</a>
            <a href="#acompanhar">Acompanhar</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="wrap">
            <div className="kicker">Worm Graphics • Motorcycle Graphics</div>
            <h1>Sua moto.<br /><span>Sua identidade.</span></h1>
            <p>Gráficos personalizados para transformar sua moto em algo único. Design, identidade e presença visual para quem não quer rodar igual a todo mundo.</p>
            <div className="actions">
              <a className="btn primary" href="#projetos">Ver projetos</a>
              <a className="btn secondary" href="#acompanhar">Acompanhar projeto</a>
              <a className="btn secondary" href="#contato">Pedir orçamento</a>
            </div>
          </div>
        </section>

        <section id="projetos">
          <div className="wrap">
            <h2 className="section-title">Projetos</h2>
            <p className="section-sub">Os dados abaixo são carregados do banco de Projetos da Worm Graphics no Notion.</p>
            {loadError ? <div className="empty">Não foi possível carregar os projetos agora.</div> : (
              <div className="grid">
                {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
                {!projects.length && <div className="empty">Nenhum projeto disponível.</div>}
              </div>
            )}
            {updatedAt && <div className="sync">Última sincronização: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(updatedAt))}</div>}
          </div>
        </section>

        <section id="acompanhar">
          <div className="wrap">
            <h2 className="section-title">Acompanhe seu projeto</h2>
            <p className="section-sub">Digite o código recebido da Worm para consultar o andamento.</p>
            <div className="track">
              <form onSubmit={handleTracking}>
                <label className="sr-only" htmlFor="code">Código do projeto</label>
                <input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ex.: WORM-0001" autoComplete="off" />
                <button type="submit">Consultar projeto</button>
              </form>
              {result !== undefined && <TrackingResult project={result} stageIndex={stageIndex} />}
            </div>
          </div>
        </section>

        <section id="contato">
          <div className="wrap">
            <h2 className="section-title">Vamos criar?</h2>
            <p className="section-sub">Entre em contato e conte como você quer deixar sua moto.</p>
            <div className="contact">
              <div className="contact-box"><div className="tag">WhatsApp</div><div className="big">Pedir orçamento</div><p>Link será conectado ao WhatsApp da Worm.</p></div>
              <div className="contact-box"><div className="tag">Instagram</div><div className="big">@wormgraphics</div><p>Perfil oficial da Worm Graphics.</p></div>
            </div>
          </div>
        </section>
      </main>
      <footer>© 2026 WORM GRAPHICS • SUA MOTO. SUA IDENTIDADE.</footer>
    </>
  );
}

function ProjectCard({ project }) {
  return <article className="card"><div className="tag">{project.brand || "Worm Graphics"}</div><h3>{project.title}</h3><p>{[project.model, project.year, project.style].filter(Boolean).join(" • ")}</p><p className="project-status">Status: <b>{project.status || "—"}</b></p></article>;
}

function TrackingResult({ project, stageIndex }) {
  if (!project) return <div className="status"><strong>Projeto não encontrado</strong><p>Confira o código informado ou fale com a Worm Graphics.</p></div>;
  const nextStage = flow[stageIndex + 1];
  return <div className="status">
    <div className="tag">Worm Graphics</div><strong>{project.title}</strong>
    <div className="status-current"><small>Status atual</small><b>{flow[stageIndex].label}</b></div>
    <p>Acompanhamento atualizado a partir dos dados operacionais da Worm.</p>
    <div className="timeline">{flow.map((stage, index) => {
      const state = index < stageIndex ? "done" : index === stageIndex ? "current" : "";
      const detail = index < stageIndex ? "Concluído" : index === stageIndex ? "Em andamento" : "Próxima etapa";
      return <div className={`timeline-item ${state}`} key={stage.key}><span className="timeline-dot" /><div className="timeline-label">{stage.label}<span>{detail}</span></div></div>;
    })}</div>
    <div className="next-step"><small>Próximo passo</small><b>{nextStage ? nextStage.label : "Projeto concluído"}</b></div>
    <div className="meta">{[project.id, project.brand, project.model, project.year, project.style, project.graphicStatus].filter(Boolean).map((item) => <span className="pill" key={item}>{item}</span>)}</div>
  </div>;
}
