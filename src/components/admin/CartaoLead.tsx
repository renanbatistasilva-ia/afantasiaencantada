"use client";

import { useState } from "react";
import { formatPhone, mensagemDeResposta, whatsappUrlPara } from "@/lib/whatsapp";
import {
  diasDesde,
  horaBonita,
  idadeEmTexto,
  linhaDoTempo,
  origemDoLead,
  periodoBonito,
  rotuloDia,
  type Choque,
  type Evento,
  type Lead,
} from "./agenda";
import styles from "./PainelAdmin.module.css";

/**
 * O ciclo de vida do pedido, na ordem em que acontece — `perdido` fecha a lista
 * porque pode vir de qualquer ponto. Ver migrations/0002_ciclo_de_vida.sql.
 */
export const STATUS = ["novo", "conversa", "reservado", "realizado", "perdido"] as const;
export type Status = (typeof STATUS)[number];

/**
 * O que a tela diz. O valor guardado é curto para caber no chip a 375px; o
 * rótulo pode ser mais claro que ele onde há espaço.
 */
export const ROTULO: Record<string, string> = {
  novo: "novo",
  conversa: "em conversa",
  reservado: "reservado",
  realizado: "realizado",
  perdido: "perdido",
};

/**
 * Um tom por situação, só com a paleta do site — nenhuma cor nova.
 *
 * `reservado` é o mais forte: é o estado em que o sinal entrou, o momento que
 * paga a conta. `realizado` recua para o tom de histórico — já aconteceu, não
 * pede nada de ninguém.
 */
const PILULA: Record<string, string> = {
  novo: styles.pilulaNovo,
  conversa: styles.pilulaConversa,
  reservado: styles.pilulaReservado,
  realizado: styles.pilulaRealizado,
  perdido: styles.pilulaPerdido,
};

const fmtCompleto = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

interface Props {
  lead: Lead;
  /**
   * Dentro de um grupo de dia a data já está no título; o cartão mostra só a
   * hora. Na caixa de entrada e em "sem data" não há título, então ela volta.
   */
  mostrarData: boolean;
  choque?: Choque;
  eventos: Evento[];
  onStatus: (id: string, status: Status) => void;
  onNotas: (id: string, notas: string) => void;
  onApagar: (id: string) => void;
}

export default function CartaoLead({
  lead,
  mostrarData,
  choque,
  eventos,
  onStatus,
  onNotas,
  onApagar,
}: Props) {
  const [abrindoStatus, setAbrindoStatus] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [anotando, setAnotando] = useState(false);
  const [rascunho, setRascunho] = useState(lead.notas ?? "");

  const nome = lead.responsavel_nome ?? "sem nome";
  const hora = horaBonita(lead.horario) ?? periodoBonito(lead.periodo);
  const perdido = lead.status === "perdido";
  // Só grita quando é pedido por responder que já passou de um dia. Um cartão
  // já respondido não precisa de alarme, por mais antigo que seja.
  const urgente = lead.status === "novo" && diasDesde(lead.criado_em) >= 1;

  const crianca = lead.crianca_nome
    ? `festa de ${lead.crianca_nome}${lead.crianca_idade ? `, ${lead.crianca_idade} anos` : ""}`
    : null;

  const origem = origemDoLead(lead);

  // A identidade do registro é a festa, não quem ligou: numa agenda, "sábado, 19
  // de setembro" localiza o pedido; o nome de quem preencheu, não.
  //
  // Dia e hora ficam em linhas separadas de propósito. Juntos em 375px eles
  // quebravam no meio e a segunda linha começava com "· 15h30", que se lê como
  // erro. Dentro de um grupo de dia o título já diz a data, então a hora sobe
  // para a linha de destaque e nada se repete.
  const dataLinha = mostrarData ? (lead.data_festa ? rotuloDia(lead.data_festa) : "sem data marcada") : null;
  const destaque = dataLinha ?? hora ?? "sem horário";
  const detalhe = [dataLinha ? hora : null, crianca].filter(Boolean).join(" · ");

  return (
    <li className={`${styles.cartao} ${perdido ? styles.cartaoApagado : ""}`}>
      <header className={styles.cabecalho}>
        <div className={styles.identidade}>
          <p className={styles.quando}>{destaque}</p>
          {detalhe && <p className={styles.crianca}>{detalhe}</p>}
        </div>
        <span
          className={`${styles.selo} ${urgente ? styles.seloUrgente : ""}`}
          title={`chegou em ${fmtCompleto.format(new Date(lead.criado_em))}`}
        >
          {idadeEmTexto(lead.criado_em)}
        </span>
      </header>

      {lead.personagem_nome && <p className={styles.personagem}>{lead.personagem_nome}</p>}

      {/* Isto já estava gravado em toda linha do banco e nunca aparecia: dava
          para ver quantas VISITAS vieram do Instagram, mas não de onde veio o
          pedido que virou festa. É a razão entre as duas que decide onde
          investir. */}
      <p
        className={`${styles.origem} ${origem.incerto ? styles.origemIncerta : ""}`}
        title={
          origem.incerto
            ? "O link não trazia etiqueta de origem e ninguém indicou. Costuma ser link de app de mensagem, ou o link da bio sem UTM — não quer dizer que a pessoa digitou o endereço."
            : `origem registrada no pedido${lead.referrer ? ` · veio de ${lead.referrer}` : ""}`
        }
      >
        veio {origem.incerto ? "sem origem identificada" : `do ${origem.canal}`}
        {origem.detalhe ? ` · ${origem.detalhe}` : ""}
      </p>

      {choque && (
        <p className={choque.mesmoPeriodo ? styles.choqueForte : styles.choqueLeve}>
          {choque.mesmoPeriodo ? "⚠ mesmo dia e período de " : "mesmo dia de "}
          {choque.outros.slice(0, 2).join(", ")}
          {choque.outros.length > 2 ? ` e mais ${choque.outros.length - 2}` : ""}
        </p>
      )}

      <dl className={styles.dados}>
        <div className={styles.linha}>
          <dt className={styles.rotulo}>Responsável</dt>
          <dd className={styles.valor}>
            {nome}
            {lead.responsavel_telefone ? ` · ${formatPhone(lead.responsavel_telefone)}` : ""}
          </dd>
        </div>
        {lead.endereco && (
          <div className={styles.linha}>
            <dt className={styles.rotulo}>Local</dt>
            <dd className={styles.valor}>
              {lead.endereco}
              {lead.tipo_local ? ` (${lead.tipo_local})` : ""}
            </dd>
          </div>
        )}
        {lead.observacao && (
          <div className={styles.linha}>
            <dt className={styles.rotulo}>Observação</dt>
            <dd className={styles.valor}>{lead.observacao}</dd>
          </div>
        )}
      </dl>

      {/* O que foi combinado no WhatsApp vivia exclusivamente no WhatsApp, onde
          ninguém acha seis meses depois. Este é o primeiro campo do painel que a
          dona escreve — por isso salva com botão, e não ao perder o foco: em
          celular, perder o foco acontece sem querer o tempo todo. */}
      <div className={styles.notas}>
        {anotando ? (
          <>
            <label className="visually-hidden" htmlFor={`notas-${lead.id}`}>
              Anotações sobre o pedido de {nome}
            </label>
            <textarea
              id={`notas-${lead.id}`}
              className={styles.notasCampo}
              value={rascunho}
              rows={3}
              placeholder="valor combinado, horário confirmado, o que a criança gosta…"
              onChange={(e) => setRascunho(e.target.value)}
            />
            <div className={styles.confirmaBotoes}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={() => {
                  setRascunho(lead.notas ?? "");
                  setAnotando(false);
                }}
              >
                cancelar
              </button>
              <button
                type="button"
                className={styles.salvar}
                onClick={() => {
                  onNotas(lead.id, rascunho);
                  setAnotando(false);
                }}
              >
                salvar
              </button>
            </div>
          </>
        ) : (
          <>
            {lead.notas && <p className={styles.notasTexto}>{lead.notas}</p>}
            <button type="button" className={styles.anotar} onClick={() => setAnotando(true)}>
              {lead.notas ? "editar anotação" : "anotar"}
            </button>
          </>
        )}
      </div>

      <p className={styles.tempo}>{linhaDoTempo(lead, eventos, (st) => ROTULO[st] ?? st)}</p>

      {lead.responsavel_telefone && (
        <a
          className={`btn btn-ouro ${styles.responder}`}
          href={whatsappUrlPara(lead.responsavel_telefone, mensagemDeResposta(nome, lead.crianca_nome))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Responder no WhatsApp
        </a>
      )}

      {/* Quatro botões iguais em cada cartão eram o grosso do peso visual do
          painel: vinte pedidos viravam oitenta botões. Fechada, a pílula mostra
          a situação; aberta, oferece as outras três. */}
      <div className={styles.situacao}>
        {abrindoStatus ? (
          <div className={styles.opcoes} role="group" aria-label={`Situação do pedido de ${nome}`}>
            {STATUS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${lead.status === s ? styles.chipAtivo : ""}`}
                aria-pressed={lead.status === s}
                onClick={() => {
                  if (lead.status !== s) onStatus(lead.id, s);
                  setAbrindoStatus(false);
                }}
              >
                {ROTULO[s] ?? s}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.pilula} ${PILULA[lead.status] ?? ""}`}
            aria-expanded={false}
            onClick={() => setAbrindoStatus(true)}
          >
            {ROTULO[lead.status] ?? lead.status}
            <span aria-hidden="true"> ▾</span>
          </button>
        )}

        {!abrindoStatus && !confirmando && (
          <button type="button" className={styles.apagar} onClick={() => setConfirmando(true)}>
            apagar
          </button>
        )}
      </div>

      {confirmando && (
        <div className={styles.confirma}>
          <p className={styles.confirmaTexto}>
            Apagar o pedido de <strong>{nome}</strong>? Some do painel na hora.
          </p>
          <div className={styles.confirmaBotoes}>
            <button type="button" className={styles.cancelar} onClick={() => setConfirmando(false)}>
              cancelar
            </button>
            <button type="button" className={styles.apagarMesmo} onClick={() => onApagar(lead.id)}>
              apagar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
