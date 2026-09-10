"use client";

import { useEffect, useMemo, useState } from "react";
import { characterBySlug } from "@/data/characters";
import styles from "./PainelAdmin.module.css";

interface Linha {
  dia: string;
  metrica: string;
  chave: string;
  valor: number;
}

/**
 * Os passos na ordem em que a pessoa os encontra, com o nome que a dona usaria.
 * A última linha vem da métrica `leads`, não do funil: enviar é o desfecho, não
 * mais um passo do formulário.
 */
const PASSOS: [string, string][] = [
  ["abriu", "abriram o formulário"],
  ["personagem", "escolheram o personagem"],
  ["data", "escolheram a data"],
  ["cenario", "disseram onde é a festa"],
  ["estrela", "contaram da criança"],
  ["contato", "chegaram na revisão"],
];

const fmtDia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDiaLongo = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** A data vem como YYYY-MM-DD puro; `new Date()` nela assumiria UTC e voltaria um dia. */
function comoData(iso: string): Date | null {
  const [a, m, d] = iso.split("-").map(Number);
  return a && m && d ? new Date(a, m - 1, d) : null;
}

function diaCurto(iso: string): string {
  const d = comoData(iso);
  return d ? fmtDia.format(d) : iso;
}

/** 2026-09-06 → "sábado, 6 de setembro". */
function diaLongo(iso: string): string {
  const d = comoData(iso);
  return d ? fmtDiaLongo.format(d) : iso;
}

/** "3 visitas", "1 visita". */
function visitas(n: number): string {
  return `${n} ${n === 1 ? "visita" : "visitas"}`;
}

/** `/personagens/princesa-da-neve/` vira "Princesa da Neve". */
function nomeDaPagina(caminho: string): string {
  if (caminho === "/") return "Início";
  if (caminho === "/reservar/") return "Formulário de reserva";
  if (caminho === "/personagens/") return "Todos os personagens";
  if (caminho === "/privacidade/") return "Privacidade";
  const p = caminho.match(/^\/personagens\/([a-z0-9-]+)\/$/);
  if (p) return characterBySlug(p[1])?.name ?? p[1];
  const m = caminho.match(/^\/mundos\/([a-z0-9-]+)\/$/);
  if (m) return `Mundo: ${m[1].replace(/-/g, " ")}`;
  return caminho;
}

function somarPor(linhas: Linha[], metrica: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of linhas) {
    if (l.metrica !== metrica) continue;
    m.set(l.chave, (m.get(l.chave) ?? 0) + l.valor);
  }
  return m;
}

function maiores(m: Map<string, number>, n: number): [string, number][] {
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function PainelTrafego() {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [falhou, setFalhou] = useState(false);
  /**
   * O dia que a pessoa tocou no gráfico.
   *
   * As barras tinham só um `title`, que aparece no hover do desktop e NUNCA no
   * toque — no celular os números simplesmente não existiam. E o gráfico era
   * `aria-hidden`, então não existiam para leitor de tela em lugar nenhum.
   */
  const [diaEscolhido, setDiaEscolhido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analitica?dias=30")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("falhou"))))
      .then((d: { analitica: Linha[] }) => setLinhas(d.analitica ?? []))
      .catch(() => setFalhou(true));
  }, []);

  const dados = useMemo(() => {
    if (!linhas) return null;

    const porDia = new Map<string, number>();
    for (const l of linhas) {
      if (l.metrica === "visitas") porDia.set(l.dia, (porDia.get(l.dia) ?? 0) + l.valor);
    }
    const dias = [...porDia].sort((a, b) => a[0].localeCompare(b[0]));
    const total = dias.reduce((s, [, v]) => s + v, 0);

    // Sete dias contra os sete anteriores: é a comparação que cabe na tela e
    // responde "melhorou ou piorou" sem precisar de gráfico.
    const ultimos = dias.slice(-7).reduce((s, [, v]) => s + v, 0);
    const anteriores = dias.slice(-14, -7).reduce((s, [, v]) => s + v, 0);

    // Só o limiar de 15s: quem ficou mais de um minuto já está contado nele.
    const atencao = new Map<string, number>();
    for (const [chave, v] of somarPor(linhas, "permanencia")) {
      const [caminho, seg] = chave.split("|");
      if (seg === "15") atencao.set(caminho, (atencao.get(caminho) ?? 0) + v);
    }

    const funil = somarPor(linhas, "funil");
    const enviados = [...somarPor(linhas, "leads").values()].reduce((s, v) => s + v, 0);

    return {
      dias,
      total,
      ultimos,
      anteriores,
      origens: maiores(somarPor(linhas, "origem"), 6),
      // Já vinha na resposta e era descartada. Comparada com quem é mais
      // PEDIDO, na aba de agenda, é a conta que decide a próxima fantasia.
      paginas: maiores(somarPor(linhas, "paginas"), 6),
      atencao: maiores(atencao, 6),
      funil,
      enviados,
    };
  }, [linhas]);

  if (falhou) return <p className={styles.aviso}>não consegui carregar os números.</p>;
  if (!dados) return <p className={styles.aviso}>carregando…</p>;
  if (dados.total === 0) {
    return (
      <p className={styles.vazio}>
        Ainda não há visitas contadas. Os números começam a aparecer assim que alguém abrir o
        site — e o primeiro dia completo só fecha amanhã.
      </p>
    );
  }

  const pico = Math.max(...dados.dias.map(([, v]) => v), 1);
  const escolhido = dados.dias.find(([d]) => d === diaEscolhido) ?? null;
  const variacao =
    dados.anteriores > 0
      ? Math.round(((dados.ultimos - dados.anteriores) / dados.anteriores) * 100)
      : null;

  // O funil precisa cair sempre: uma contagem fora de ordem se lê como erro.
  const degraus = PASSOS.map(([chave, rotulo]) => [rotulo, dados.funil.get(chave) ?? 0] as const);
  const linhasFunil = [...degraus, ["mandaram no WhatsApp", dados.enviados] as const];

  return (
    <div className={styles.trafego}>
      <section className={styles.bloco}>
        <h2 className={styles.blocoTitulo}>Visitas</h2>
        <p className={styles.destaque}>
          {dados.ultimos} <span className={styles.destaqueNota}>nos últimos 7 dias</span>
        </p>
        {variacao !== null && (
          <p className={styles.comparacao}>
            {variacao >= 0 ? "↑" : "↓"} {Math.abs(variacao)}% em relação aos 7 dias anteriores
            {" "}({dados.anteriores})
          </p>
        )}
        <div className={styles.barras} role="group" aria-label="Visitas por dia">
          {dados.dias.map(([dia, v]) => (
            <button
              key={dia}
              type="button"
              className={`${styles.barraCol} ${diaEscolhido === dia ? styles.barraColAtiva : ""}`}
              // Tocar de novo na mesma barra volta para a legenda do período.
              onClick={() => setDiaEscolhido((d) => (d === dia ? null : dia))}
              aria-pressed={diaEscolhido === dia}
              aria-label={`${diaLongo(dia)}: ${visitas(v)}`}
              // Fica para quem está no mouse; no toque quem responde é a legenda.
              title={`${diaCurto(dia)}: ${v}`}
            >
              <span className={styles.barra} style={{ height: `${Math.max((v / pico) * 100, 3)}%` }} />
            </button>
          ))}
        </div>
        {/* Legenda fixa em vez de balão flutuante: funciona igual no toque, no
            mouse e no teclado, e não corre o risco de sair da tela numa barra
            da ponta. */}
        <p className={styles.legenda} aria-live="polite">
          {escolhido
            ? `${diaLongo(escolhido[0])} · ${visitas(escolhido[1])}`
            : dados.dias.length > 0 &&
              `${diaCurto(dados.dias[0][0])} até ${diaCurto(dados.dias[dados.dias.length - 1][0])}`}
        </p>
      </section>

      <section className={styles.bloco}>
        <h2 className={styles.blocoTitulo}>De onde vieram</h2>
        <dl className={styles.dados}>
          {dados.origens.map(([fonte, v]) => (
            <div key={fonte} className={styles.linha}>
              <dt className={styles.rotulo}>{fonte}</dt>
              <dd className={styles.valor}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.bloco}>
        <h2 className={styles.blocoTitulo}>Páginas mais vistas</h2>
        <dl className={styles.dados}>
          {dados.paginas.length === 0 && <p className={styles.legenda}>ainda sem dados</p>}
          {dados.paginas.map(([caminho, v]) => (
            <div key={caminho} className={styles.linha}>
              <dt className={styles.rotulo}>{nomeDaPagina(caminho)}</dt>
              <dd className={styles.valor}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.bloco}>
        <h2 className={styles.blocoTitulo}>O que prendeu atenção</h2>
        <p className={styles.blocoNota}>quantas visitas ficaram mais de 15 segundos na página</p>
        <dl className={styles.dados}>
          {dados.atencao.length === 0 && <p className={styles.legenda}>ainda sem dados</p>}
          {dados.atencao.map(([caminho, v]) => (
            <div key={caminho} className={styles.linha}>
              <dt className={styles.rotulo}>{nomeDaPagina(caminho)}</dt>
              <dd className={styles.valor}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.bloco}>
        <h2 className={styles.blocoTitulo}>Onde param no formulário</h2>
        <ul className={styles.funil}>
          {linhasFunil.map(([rotulo, v], i) => {
            const anterior = i > 0 ? linhasFunil[i - 1][1] : null;
            const perdidos = anterior !== null ? anterior - v : 0;
            const maiorPerda =
              perdidos > 0 &&
              perdidos ===
                Math.max(
                  ...linhasFunil.map((l, j) => (j > 0 ? linhasFunil[j - 1][1] - l[1] : 0)),
                );
            return (
              <li key={rotulo} className={styles.degrau}>
                <span className={styles.degrauNome}>{rotulo}</span>
                <span className={styles.degrauValor}>{v}</span>
                {perdidos > 0 && (
                  <span className={maiorPerda ? styles.perdaMaior : styles.perda}>
                    −{perdidos}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
