"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CartaoLead, { type Status } from "./CartaoLead";
import PainelTrafego from "./PainelTrafego";
import { agrupar, choques, resumo, rotuloDia, rotuloMes, hojeEmSaoPaulo, type Lead } from "./agenda";
import styles from "./PainelAdmin.module.css";

/**
 * Painel de pedidos.
 *
 * Nada aqui usa dangerouslySetInnerHTML nem script de terceiro, e não é
 * frescura: o cookie de sessão é HttpOnly, o que impede um XSS de LÊ-LO, mas não
 * de usá-lo num fetch da mesma origem. Nesta página, XSS seria acesso total.
 *
 * A tela é uma agenda, não uma lista: em cima o que precisa de resposta, embaixo
 * o calendário das festas. A ordem por `criado_em` que o banco entrega serve
 * para saber o que chegou; não serve para saber o que vem por aí — e num negócio
 * que vende datas é a segunda pergunta que se faz de manhã. Ver ./agenda.ts.
 */

/** O teto que `listarLeads` aceita. Acima disto a faixa de resumo avisa. */
const LIMITE = 200;

export default function PainelAdmin() {
  const [fase, setFase] = useState<"conferindo" | "senha" | "lista">("conferindo");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [verPassados, setVerPassados] = useState(false);
  // Aba fica fora de `fase` de propósito: `carregar()` trata qualquer valor
  // diferente de "lista" como sessão expirada e voltaria para a senha.
  const [aba, setAba] = useState<"pedidos" | "trafego">("pedidos");

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/admin/leads?limite=${LIMITE}`);
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
    // Otimista: o toque responde na hora e desfaz se o servidor recusar. É o que
    // faz o pedido sair da caixa de entrada e cair no dia dele sem recarregar.
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
  }

  const hoje = hojeEmSaoPaulo();
  const grupos = useMemo(() => agrupar(leads, hoje), [leads, hoje]);
  const disputas = useMemo(() => choques(leads), [leads]);
  const numeros = useMemo(() => resumo(leads), [leads]);

  const cartao = (l: Lead, mostrarData: boolean) => (
    <CartaoLead
      key={l.id}
      lead={l}
      mostrarData={mostrarData}
      choque={disputas.get(l.id)}
      onStatus={mudarStatus}
      onApagar={apagar}
    />
  );

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
          <p className={styles.ajuda}>Esqueceu a senha? A troca é feita por quem cuida do site.</p>
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

      <div className={styles.abas} role="group" aria-label="O que mostrar">
        <button
          type="button"
          className={`${styles.chip} ${aba === "pedidos" ? styles.chipAtivo : ""}`}
          aria-pressed={aba === "pedidos"}
          onClick={() => setAba("pedidos")}
        >
          agenda
        </button>
        <button
          type="button"
          className={`${styles.chip} ${aba === "trafego" ? styles.chipAtivo : ""}`}
          aria-pressed={aba === "trafego"}
          onClick={() => setAba("trafego")}
        >
          visitas
        </button>
      </div>

      {aba === "trafego" && <PainelTrafego />}

      {aba === "pedidos" && leads.length === 0 && (
        <p className={styles.vazio}>
          Quando alguém preencher o formulário de reserva, o pedido aparece aqui — mesmo que a
          pessoa desista antes de enviar a mensagem no WhatsApp.
        </p>
      )}

      {aba === "pedidos" && leads.length > 0 && (
        <>
          <section className={styles.resumo} aria-label="Resumo">
            <div className={styles.numero}>
              <span className={styles.numeroValor}>{numeros.noMes}</span>
              <span className={styles.numeroNota}>
                {numeros.noMes === 1 ? "pedido" : "pedidos"} em {numeros.mesAtual}
              </span>
            </div>
            <div className={styles.numero}>
              <span
                className={`${styles.numeroValor} ${
                  numeros.esperaMaisAntiga >= 2 ? styles.numeroAlerta : ""
                }`}
              >
                {numeros.aResponder}
              </span>
              <span className={styles.numeroNota}>
                esperando resposta
                {numeros.aResponder > 0 && numeros.esperaMaisAntiga >= 1
                  ? ` · há ${numeros.esperaMaisAntiga} ${
                      numeros.esperaMaisAntiga === 1 ? "dia" : "dias"
                    }`
                  : ""}
              </span>
            </div>
            <div className={styles.numero}>
              <span className={styles.numeroValor}>{numeros.festas30}</span>
              <span className={styles.numeroNota}>festas nos próximos 30 dias</span>
            </div>
            <div className={styles.numero}>
              <span className={styles.numeroTexto}>{numeros.campeao?.[0] ?? "—"}</span>
              <span className={styles.numeroNota}>
                {numeros.campeao ? `mais pedido · ${numeros.campeao[1]}×` : "sem pedidos"}
              </span>
            </div>
          </section>

          {/* Um painel que mente sobre o próprio total é pior que um simples. */}
          {leads.length >= LIMITE && (
            <p className={styles.rodapeResumo}>
              Os números cobrem os {LIMITE} pedidos mais recentes.
            </p>
          )}

          {grupos.aResponder.length > 0 && (
            <section className={styles.grupo}>
              <h2 className={styles.grupoTitulo}>
                Precisam de resposta
                <span className={styles.grupoContagem}>{grupos.aResponder.length}</span>
              </h2>
              <ul className={styles.lista}>{grupos.aResponder.map((l) => cartao(l, true))}</ul>
            </section>
          )}

          {grupos.proximos.length > 0 && (
            <section className={styles.grupo}>
              <h2 className={styles.grupoTitulo}>Próximos 7 dias</h2>
              {grupos.proximos.map((d) => (
                <div key={d.data} className={styles.dia}>
                  <h3 className={styles.diaTitulo}>{rotuloDia(d.data)}</h3>
                  <ul className={styles.lista}>{d.leads.map((l) => cartao(l, false))}</ul>
                </div>
              ))}
            </section>
          )}

          {grupos.adiante.length > 0 && (
            <section className={styles.grupo}>
              <h2 className={styles.grupoTitulo}>Mais para frente</h2>
              {grupos.adiante.map((m) => (
                <div key={m.chave} className={styles.dia}>
                  <h3 className={styles.diaTitulo}>{rotuloMes(`${m.chave}-01`, hoje)}</h3>
                  <ul className={styles.lista}>{m.leads.map((l) => cartao(l, true))}</ul>
                </div>
              ))}
            </section>
          )}

          {grupos.semData.length > 0 && (
            <section className={styles.grupo}>
              <h2 className={styles.grupoTitulo}>Sem data marcada</h2>
              <ul className={styles.lista}>{grupos.semData.map((l) => cartao(l, true))}</ul>
            </section>
          )}

          {grupos.passados.length > 0 && (
            <section className={styles.grupo}>
              <h2 className={styles.grupoTitulo}>
                Já passou
                <span className={styles.grupoContagem}>{grupos.passados.length}</span>
                <button
                  type="button"
                  className={styles.recolher}
                  aria-expanded={verPassados}
                  onClick={() => setVerPassados((v) => !v)}
                >
                  {verPassados ? "esconder" : "mostrar"}
                </button>
              </h2>
              {verPassados && (
                <ul className={styles.lista}>{grupos.passados.map((l) => cartao(l, true))}</ul>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
