"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPhone, mensagemDeResposta, whatsappUrlPara } from "@/lib/whatsapp";
import styles from "./PainelAdmin.module.css";

/**
 * Painel de leads.
 *
 * Nada aqui usa dangerouslySetInnerHTML nem script de terceiro, e não é
 * frescura: o cookie de sessão é HttpOnly, o que impede um XSS de LÊ-LO, mas não
 * de usá-lo num fetch da mesma origem. Nesta página, XSS seria acesso total.
 */

const STATUS = ["novo", "respondido", "fechado", "perdido"] as const;
type Status = (typeof STATUS)[number];

interface Lead {
  id: string;
  criado_em: string;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  personagem_nome: string | null;
  mundo_nome: string | null;
  data_festa: string | null;
  periodo: string | null;
  horario: string | null;
  endereco: string | null;
  tipo_local: string | null;
  crianca_nome: string | null;
  crianca_idade: string | null;
  observacao: string | null;
  utm_source: string | null;
  referrer: string | null;
  pagina_entrada: string | null;
  status: string;
}

const fmtData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
const fmtCurto = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** A data da festa é YYYY-MM-DD puro; `new Date()` nela assumiria UTC e voltaria um dia. */
function dataDaFesta(iso: string | null): string | null {
  if (!iso) return null;
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return null;
  return fmtData.format(new Date(a, m - 1, d));
}

function origemDe(l: Lead): string {
  if (l.utm_source) return l.utm_source;
  if (l.referrer) {
    try {
      return new URL(l.referrer).hostname.replace(/^www\./, "");
    } catch {
      return l.referrer;
    }
  }
  return "direto";
}

export default function PainelAdmin() {
  const [fase, setFase] = useState<"conferindo" | "senha" | "lista">("conferindo");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apagando, setApagando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch("/api/admin/leads");
    if (!r.ok) {
      setFase("senha");
      return;
    }
    const dados = (await r.json()) as { leads: Lead[] };
    setLeads(dados.leads ?? []);
    setFase("lista");
  }, []);

  // Pergunta ao servidor se já há sessão, para não piscar a tela errada.
  useEffect(() => {
    fetch("/api/admin/sessao")
      .then((r) => (r.ok ? carregar() : setFase("senha")))
      .catch(() => setFase("senha"));
  }, [carregar]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setErro(null);
    try {
      const r = await fetch("/api/admin/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (r.ok) {
        setSenha("");
        await carregar();
      } else {
        const d = (await r.json().catch(() => ({}))) as { erro?: string };
        setErro(r.status === 429 ? "Muitas tentativas. Espere um minuto." : (d.erro ?? "Não deu certo."));
      }
    } catch {
      setErro("Sem conexão com o servidor.");
    } finally {
      setEntrando(false);
    }
  }

  async function sair() {
    await fetch("/api/admin/sessao", { method: "DELETE" }).catch(() => {});
    setLeads([]);
    setFase("senha");
  }

  async function mudarStatus(id: string, novo: Status) {
    const antes = leads;
    // Otimista: o toque responde na hora e desfaz se o servidor recusar.
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: novo } : l)));
    const r = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novo }),
    }).catch(() => null);
    if (!r?.ok) setLeads(antes);
  }

  async function apagar(id: string) {
    const r = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" }).catch(() => null);
    if (r?.ok) setLeads((ls) => ls.filter((l) => l.id !== id));
    setApagando(null);
  }

  if (fase === "conferindo") {
    return (
      <main className={styles.page}>
        <p className={styles.aviso}>carregando…</p>
      </main>
    );
  }

  if (fase === "senha") {
    return (
      <main className={styles.page}>
        <form className={styles.entrada} onSubmit={entrar}>
          <h1 className={`display ${styles.titulo}`}>Painel</h1>
          <p className={styles.lede}>Os pedidos de reserva que chegaram pelo site.</p>
          <label className={styles.campo}>
            <span className="visually-hidden">Senha</span>
            <input
              className={styles.input}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="senha"
              autoComplete="current-password"
              // O teclado do celular maiusculiza a primeira letra em silêncio e
              // o corretor troca a palavra inteira. Os dois estragam a senha.
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
            />
          </label>
          {erro && <p className={styles.erro}>{erro}</p>}
          <button className={`btn btn-ouro ${styles.acaoPrincipal}`} type="submit" disabled={entrando}>
            {entrando ? "conferindo…" : "Entrar"}
          </button>
          <Link href="/" className={styles.voltar}>
            ← início
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topo}>
        <div>
          <h1 className={`display ${styles.titulo}`}>Painel</h1>
          <p className={styles.contagem}>
            {leads.length === 0
              ? "nenhum pedido ainda"
              : `${leads.length} pedido${leads.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <button className={styles.sair} onClick={sair} type="button">
          sair
        </button>
      </header>

      {leads.length === 0 && (
        <p className={styles.vazio}>
          Quando alguém preencher o formulário de reserva, o pedido aparece aqui — mesmo que a
          pessoa desista antes de enviar a mensagem no WhatsApp.
        </p>
      )}

      <ul className={styles.lista}>
        {leads.map((l) => {
          const nome = l.responsavel_nome ?? "sem nome";
          const festa = dataDaFesta(l.data_festa);
          return (
            <li key={l.id} className={styles.cartao}>
              <div className={styles.cabecalho}>
                <span className={styles.responsavel}>{nome}</span>
                <span className={styles.quando}>{fmtCurto.format(new Date(l.criado_em))}</span>
              </div>

              <dl className={styles.dados}>
                {l.responsavel_telefone && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>WhatsApp</dt>
                    <dd className={styles.valor}>{formatPhone(l.responsavel_telefone)}</dd>
                  </div>
                )}
                {l.personagem_nome && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>Personagem</dt>
                    <dd className={styles.valor}>{l.personagem_nome}</dd>
                  </div>
                )}
                {festa && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>Festa</dt>
                    <dd className={styles.valor}>
                      {festa}
                      {l.periodo ? `, ${l.periodo}` : ""}
                      {l.horario ? ` — ${l.horario}` : ""}
                    </dd>
                  </div>
                )}
                {l.crianca_nome && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>Criança</dt>
                    <dd className={styles.valor}>
                      {l.crianca_nome}
                      {l.crianca_idade ? `, ${l.crianca_idade} anos` : ""}
                    </dd>
                  </div>
                )}
                {l.endereco && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>Local</dt>
                    <dd className={styles.valor}>
                      {l.endereco}
                      {l.tipo_local ? ` (${l.tipo_local})` : ""}
                    </dd>
                  </div>
                )}
                {l.observacao && (
                  <div className={styles.linha}>
                    <dt className={styles.rotulo}>Observação</dt>
                    <dd className={styles.valor}>{l.observacao}</dd>
                  </div>
                )}
                <div className={styles.linha}>
                  <dt className={styles.rotulo}>Veio de</dt>
                  <dd className={styles.valor}>{origemDe(l)}</dd>
                </div>
              </dl>

              {l.responsavel_telefone && (
                <a
                  className={`btn btn-ouro ${styles.responder}`}
                  href={whatsappUrlPara(
                    l.responsavel_telefone,
                    mensagemDeResposta(nome, l.crianca_nome),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Responder no WhatsApp
                </a>
              )}

              <div className={styles.chips} role="group" aria-label={`Situação do pedido de ${nome}`}>
                {STATUS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.chip} ${l.status === s ? styles.chipAtivo : ""}`}
                    aria-pressed={l.status === s}
                    onClick={() => mudarStatus(l.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {apagando === l.id ? (
                <div className={styles.confirma}>
                  <p className={styles.confirmaTexto}>
                    Apagar o pedido de <strong>{nome}</strong>? Some do painel na hora.
                  </p>
                  <div className={styles.confirmaBotoes}>
                    <button type="button" className={styles.cancelar} onClick={() => setApagando(null)}>
                      cancelar
                    </button>
                    <button type="button" className={styles.apagarMesmo} onClick={() => apagar(l.id)}>
                      apagar
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className={styles.apagar} onClick={() => setApagando(l.id)}>
                  apagar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
