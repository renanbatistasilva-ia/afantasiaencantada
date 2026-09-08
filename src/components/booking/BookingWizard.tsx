"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MagicCalendar from "./MagicCalendar";
import CharacterMedallion from "@/components/character/CharacterMedallion";
import type { Character } from "@/data/types";
import { useEfeitoAntesDePintar } from "@/lib/useEnv";
import { visibleWorlds } from "@/data/worlds";
import { characterBySlug, visibleCharacters } from "@/data/characters";
import { bookingMessage, formatPhone, isValidPhone, whatsappUrl } from "@/lib/whatsapp";
import { dataLocalISO, enviarLead } from "@/lib/lead";
import { medirLead, medirPasso } from "@/lib/medicao";
import styles from "./BookingWizard.module.css";

interface Draft {
  characterSlug: string;
  date: Date | null;
  period: string;
  time: string;
  place: string;
  venueType: string;
  childName: string;
  childAge: string;
  special: string;
  parentName: string;
  parentPhone: string;
}

const PERIODS = ["Manhã", "Tarde", "Noite"];
const VENUES = ["Em casa", "Salão do prédio", "Buffet", "Escola", "Outro"];
const AGES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13+"];

const STEP_COUNT = 6;

/**
 * O que significa ter ALCANÇADO cada tela — não o que a tela pede.
 *
 * Chegar à tela 1 é o que prova que a pessoa escolheu o personagem; estar na
 * tela 0 só prova que ela abriu o formulário. Por isso os nomes estão deslocados
 * em relação ao conteúdo das telas, e "segredo" não aparece: chegar à revisão já
 * implica ter passado por ele.
 *
 * O painel lê nome, e não número, porque o índice não é comparável entre quem
 * entra pela home e quem chega por link direto de personagem, que começa em 1.
 */
const PASSOS = ["abriu", "personagem", "data", "cenario", "estrela", "contato"];
const ease = [0.22, 1, 0.36, 1] as const;

export default function BookingWizard() {
  /**
   * `?personagem=` e `?mundo=` são lidos do endereço, não por `useSearchParams`.
   *
   * Aquele gancho obrigava esta tela a viver dentro de um `<Suspense>`, e com
   * exportação estática o limite não renderiza nada: o HTML de /reservar saía
   * com 197 bytes e zero texto. O Google via uma página vazia e o visitante via
   * roxo em branco até o JavaScript hidratar — na página onde ele decide comprar.
   *
   * Começa sempre no passo 0, que é o que vai para o HTML. Quem chega com
   * personagem na URL salta para a data no efeito abaixo.
   */
  const [entrada, setEntrada] = useState<{ personagem?: string; mundo?: string }>({});
  const initialCharacter = entrada.personagem;
  const initialWorld = entrada.mundo;

  const presetCharacter = !!(initialCharacter && characterBySlug(initialCharacter));
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState<Draft>({
    characterSlug: "",
    date: null,
    period: "",
    time: "",
    place: "",
    venueType: "",
    childName: "",
    childAge: "",
    special: "",
    parentName: "",
    parentPhone: "",
  });

  // O site abre o WhatsApp, mas não tem como saber se a mensagem foi enviada
  // de fato — o envio acontece dentro do app. Este estado só registra que o
  // encaminhamento aconteceu, e a tela final é redigida com esse limite em mente.
  const [sent, setSent] = useState(false);
  const maxPasso = useRef(-1);

  /**
   * Aplica o que vem no endereço ANTES da primeira pintura.
   *
   * Com `useEffect` (que roda depois de pintar) quem clica no link de um
   * personagem veria um quadro da lista antes de saltar para o calendário. Antes
   * de pintar, a hidratação casa com o HTML — que é o passo 0 — e o salto não
   * aparece. Ver `useEfeitoAntesDePintar`.
   */
  useEfeitoAntesDePintar(() => {
    const p = new URLSearchParams(window.location.search);
    const personagem = p.get("personagem") ?? undefined;
    const mundo = p.get("mundo") ?? undefined;
    if (!personagem && !mundo) return;

    setEntrada({ personagem, mundo });
    if (personagem && characterBySlug(personagem)) {
      setDraft((d) => ({ ...d, characterSlug: personagem }));
      setStep(1);
    }
  }, []);
  const [busca, setBusca] = useState("");
  // Vive enquanto o formulário estiver montado, então "revisar os dados" e
  // enviar de novo atualiza o mesmo pedido em vez de criar outro.
  const idRascunho = useRef("");

  const contactValid = draft.parentName.trim().length > 1 && isValidPhone(draft.parentPhone);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const character = draft.characterSlug ? characterBySlug(draft.characterSlug) : undefined;

  // Mundos ordenados — o mundo de origem (se veio de um portal) abre a lista.
  const orderedWorlds = useMemo(() => {
    if (!initialWorld) return visibleWorlds;
    const rest = visibleWorlds.filter((w) => w.slug !== initialWorld);
    const first = visibleWorlds.find((w) => w.slug === initialWorld);
    return first ? [first, ...rest] : visibleWorlds;
  }, [initialWorld]);

  /**
   * O elenco agrupado por mundo, cada personagem UMA vez.
   *
   * Dez dos vinte e oito pertencem a mais de um mundo, e a versão anterior
   * mostrava um chip em cada — trinta e oito opções para vinte e oito pessoas.
   * Aqui cada um aparece no primeiro mundo em que couber.
   */
  const elencoPorMundo = useMemo(() => {
    const jaMostrado = new Set<string>();
    const grupos: { world: (typeof visibleWorlds)[number]; cast: Character[] }[] = [];
    for (const world of orderedWorlds) {
      const cast = visibleCharacters.filter(
        (c) => !jaMostrado.has(c.slug) && c.worlds.includes(world.slug),
      );
      cast.forEach((c) => jaMostrado.add(c.slug));
      if (cast.length) grupos.push({ world, cast });
    }
    return grupos;
  }, [orderedWorlds]);

  /**
   * Busca sem acento: quem digita "principe" precisa achar "Príncipe", e quem
   * digita "neve" precisa achar a Princesa da Neve sem saber o nome inteiro.
   */
  const gruposVisiveis = useMemo(() => {
    const semAcento = (s: string) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const termo = semAcento(busca.trim());
    if (!termo) return elencoPorMundo;
    return elencoPorMundo
      .map((g) => ({ ...g, cast: g.cast.filter((c) => semAcento(c.name).includes(termo)) }))
      .filter((g) => g.cast.length > 0);
  }, [elencoPorMundo, busca]);

  const worldOfCharacter = character
    ? visibleWorlds.find((w) => character.worlds.includes(w.slug))
    : undefined;

  const stepValid = [
    !!draft.characterSlug,
    !!draft.date,
    !!draft.period && draft.place.trim().length > 1,
    draft.childName.trim().length > 0,
    true,
    true,
  ][step];

  /**
   * Registra o passo mais avançado que a pessoa alcançou.
   *
   * Fica num efeito sobre `step`, e não dentro de `go`/`jump`, porque assim
   * pega também a montagem — inclusive quando o link traz `?personagem=` e o
   * assistente já começa no passo 1. Instrumentar as duas funções perderia
   * justamente a entrada, que é onde mais gente desiste.
   *
   * Só conta para frente: voltar para revisar não é passo novo.
   */
  useEffect(() => {
    if (step <= maxPasso.current) return;
    // Os passos pulados por quem chegou com o personagem escolhido contam
    // também. Sem isso o funil deixaria de cair sempre, e um passo apareceria
    // com mais gente que o anterior — que se lê como erro, não como dado.
    for (let n = maxPasso.current + 1; n <= step; n++) {
      if (PASSOS[n]) medirPasso(PASSOS[n]);
    }
    maxPasso.current = step;
  }, [step]);

  const go = (delta: number) => {
    setDir(delta);
    setStep((s) => Math.min(Math.max(s + delta, 0), STEP_COUNT - 1));
  };

  const jump = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const message = bookingMessage({
    parentName: draft.parentName.trim() || undefined,
    parentPhone: draft.parentPhone.trim() || undefined,
    characterName: character?.name,
    worldName: worldOfCharacter?.name,
    date: draft.date ?? undefined,
    period: draft.period || undefined,
    time: draft.time || undefined,
    place: draft.place || undefined,
    venueType: draft.venueType || undefined,
    childName: draft.childName || undefined,
    childAge: draft.childAge ? `${draft.childAge} ano${draft.childAge === "1" ? "" : "s"}` : undefined,
    special: draft.special || undefined,
  });

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const questions = [
    {
      script: "o personagem",
      title: draft.childName
        ? `Quem ${draft.childName} sonha em conhecer?`
        : "Quem seu filho sonha em conhecer?",
    },
    { script: "a data", title: "Quando essa história vai acontecer?" },
    { script: "o cenário", title: "Onde e a que horas a magia entra em cena?" },
    { script: "a estrela", title: "Como devemos chamar a estrela dessa história?" },
    { script: "o segredo", title: "Existe algo que o personagem deveria saber?" },
    sent
      ? {
          script: "pronto",
          title: "Abrimos seu WhatsApp com a história pronta",
        }
      : {
          script: "quase lá",
          title: draft.childName
            ? `A história de ${draft.childName} está quase escrita`
            : "A história está quase escrita",
        },
  ][step];

  return (
    <div className={styles.wizard}>
      <div className={styles.progress} aria-label={`Passo ${step + 1} de ${STEP_COUNT}`}>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.progressStar} ${i <= step ? styles.progressDone : ""}`}
            onClick={() => i < step && jump(i)}
            disabled={i >= step}
            aria-label={`Voltar ao passo ${i + 1}`}
          >
            ✦
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.section
          key={step}
          className={styles.step}
          initial={reduced ? false : { opacity: 0, x: 46 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -46 * dir }}
          transition={{ duration: 0.45, ease }}
        >
          <p className={`script ${styles.stepScript}`}>{questions.script}</p>
          <h1 className={`display ${styles.stepTitle}`}>{questions.title}</h1>

          {step === 0 && (
            <div className={styles.characterPick}>
              <input
                className={styles.busca}
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="buscar pelo nome"
                aria-label="Buscar personagem pelo nome"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />

              {gruposVisiveis.map(({ world, cast }) => (
                <fieldset key={world.slug} className={styles.worldGroup}>
                  <legend className={styles.worldLegend}>{world.name}</legend>
                  <div className={styles.elenco}>
                    {cast.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        className={`${styles.cartao} ${
                          draft.characterSlug === c.slug ? styles.cartaoEscolhido : ""
                        }`}
                        aria-pressed={draft.characterSlug === c.slug}
                        onClick={() => {
                          // Escolher É avançar. Antes o toque abria um modal por
                          // cima da lista e o botão de continuar ficava a quase
                          // três mil pixels de rolagem — quatro pessoas abriram o
                          // formulário e nenhuma passou desta tela.
                          set("characterSlug", c.slug);
                          go(1);
                        }}
                      >
                        <CharacterMedallion character={c} size={40} className={styles.cartaoFoto} />
                        <span className={styles.cartaoNome}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}

              {gruposVisiveis.length === 0 ? (
                <p className={styles.pickHint}>
                  Nenhum personagem com esse nome. Apague a busca para ver todos.
                </p>
              ) : (
                <p className={styles.pickHint}>Toque em quem seu filho quer conhecer.</p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className={styles.calendarWrap}>
              <MagicCalendar value={draft.date} onChange={(d) => set("date", d)} />
              {draft.date && (
                <p className={styles.datePicked}>
                  ✦ {dateFmt.format(draft.date)}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.stack}>
              <div>
                <p className={styles.fieldLabel}>Período da festa</p>
                <div className={styles.chips}>
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.chip} ${draft.period === p ? styles.chipSelected : ""}`}
                      onClick={() => set("period", p)}
                      aria-pressed={draft.period === p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Horário aproximado (se já souber)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="ex: 15h"
                  value={draft.time}
                  onChange={(e) => set("time", e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Bairro e cidade</span>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="ex: Moema, São Paulo"
                  value={draft.place}
                  onChange={(e) => set("place", e.target.value)}
                />
              </label>
              <div>
                <p className={styles.fieldLabel}>Onde vai ser</p>
                <div className={styles.chips}>
                  {VENUES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`${styles.chip} ${draft.venueType === v ? styles.chipSelected : ""}`}
                      onClick={() => set("venueType", draft.venueType === v ? "" : v)}
                      aria-pressed={draft.venueType === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stack}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Nome da criança</span>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="ex: Sofia"
                  autoComplete="off"
                  value={draft.childName}
                  onChange={(e) => set("childName", e.target.value)}
                />
              </label>
              <div>
                <p className={styles.fieldLabel}>Quantos anos ela faz</p>
                <div className={styles.chips}>
                  {AGES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.chip} ${styles.chipRound} ${draft.childAge === a ? styles.chipSelected : ""}`}
                      onClick={() => set("childAge", draft.childAge === a ? "" : a)}
                      aria-pressed={draft.childAge === a}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stack}>
              <label className={styles.field}>
                <span className={styles.visuallyHiddenLabel}>Algo especial</span>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  placeholder="ex: Ela sabe a coreografia inteira e sonha em dançar junto…"
                  value={draft.special}
                  onChange={(e) => set("special", e.target.value)}
                />
              </label>
              <p className={styles.hint}>
                Música favorita, tema da festa, uma surpresa combinada: tudo o
                que ajudar o personagem a chegar já conhecendo a estrela.
              </p>
            </div>
          )}

          {step === 5 && sent && (
            <div className={styles.done}>
              <p className={styles.doneMark} aria-hidden="true">
                ✦
              </p>
              <p className={styles.doneLede}>
                Falta um passo: <strong>toque em enviar dentro do WhatsApp</strong> para a
                mensagem chegar até nós. Assim que ela chegar, confirmamos a disponibilidade
                {draft.parentName ? `, ${draft.parentName.trim().split(" ")[0]}` : ""}.
              </p>

              <ul className={styles.doneSummary}>
                <li>
                  <span className={styles.reviewLabel}>Personagem</span>
                  <span className={styles.reviewValue}>{character?.name}</span>
                </li>
                <li>
                  <span className={styles.reviewLabel}>Data</span>
                  <span className={styles.reviewValue}>
                    {draft.date ? dateFmt.format(draft.date) : "—"}
                  </span>
                </li>
                <li>
                  <span className={styles.reviewLabel}>Estrela</span>
                  <span className={styles.reviewValue}>{draft.childName}</span>
                </li>
              </ul>

              <p className={styles.doneNote}>
                A data só fica reservada depois da nossa confirmação. Nada é cobrado agora.
              </p>

              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-ouro ${styles.send}`}
              >
                Não abriu? Abrir o WhatsApp de novo
              </a>

              <button type="button" className={styles.back} onClick={() => setSent(false)}>
                ← revisar os dados
              </button>
            </div>
          )}

          {step === 5 && !sent && (
            <div className={styles.review}>
              <ul className={styles.reviewList}>
                <li>
                  <button type="button" onClick={() => jump(0)} className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Personagem</span>
                    <span className={styles.reviewValue}>
                      {character?.name}
                      {worldOfCharacter ? ` · ${worldOfCharacter.name}` : ""}
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => jump(1)} className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Data</span>
                    <span className={styles.reviewValue}>
                      {draft.date ? dateFmt.format(draft.date) : "—"}
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => jump(2)} className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Cenário</span>
                    <span className={styles.reviewValue}>
                      {[draft.period, draft.time, draft.place, draft.venueType]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => jump(3)} className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Estrela</span>
                    <span className={styles.reviewValue}>
                      {draft.childName}
                      {draft.childAge ? `, fazendo ${draft.childAge} ano${draft.childAge === "1" ? "" : "s"}` : ""}
                    </span>
                  </button>
                </li>
                {draft.special && (
                  <li>
                    <button type="button" onClick={() => jump(4)} className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Segredo</span>
                      <span className={styles.reviewValue}>{draft.special}</span>
                    </button>
                  </li>
                )}
              </ul>

              <div className={styles.contact}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Seu nome</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={draft.parentName}
                    onChange={(e) => set("parentName", e.target.value)}
                    placeholder="ex: Camila"
                    autoComplete="name"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Seu WhatsApp</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className={styles.input}
                    value={draft.parentPhone}
                    onChange={(e) => set("parentPhone", formatPhone(e.target.value))}
                    placeholder="(11) 91234-5678"
                    autoComplete="tel"
                    aria-describedby="contato-motivo"
                  />
                </label>

                <p id="contato-motivo" className={styles.contactWhy}>
                  Para garantirmos sua reserva mesmo se a mensagem não chegar. Usamos seus
                  dados só para organizar a festa — veja como em{" "}
                  <Link href="/privacidade" className={styles.contactWhyLink}>
                    privacidade
                  </Link>
                  .
                </p>
              </div>

              <button
                type="button"
                className={`btn btn-ouro ${styles.send}`}
                disabled={!contactValid}
                onClick={() => {
                  // Grava primeiro: quem desiste dentro do WhatsApp continua
                  // sendo alguém que dá para responder. sendBeacon não bloqueia,
                  // então o window.open abaixo segue síncrono e não é barrado
                  // pelo bloqueador de pop-up.
                  // Só aqui, nunca na renderização: crypto.randomUUID não
                  // existe na geração estática do site.
                  if (!idRascunho.current) idRascunho.current = crypto.randomUUID();
                  medirLead();
                  enviarLead({
                    id: idRascunho.current,
                    personagem_slug: draft.characterSlug || undefined,
                    personagem_nome: character?.name,
                    mundo_nome: worldOfCharacter?.name,
                    data_festa: draft.date ? dataLocalISO(draft.date) : undefined,
                    periodo: draft.period || undefined,
                    horario: draft.time || undefined,
                    endereco: draft.place || undefined,
                    tipo_local: draft.venueType || undefined,
                    crianca_nome: draft.childName || undefined,
                    crianca_idade: draft.childAge || undefined,
                    observacao: draft.special || undefined,
                    responsavel_nome: draft.parentName || undefined,
                    responsavel_telefone: draft.parentPhone || undefined,
                  });
                  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
                  setSent(true);
                }}
              >
                Enviar a história pelo WhatsApp
              </button>
              <p className={styles.hint}>
                A mensagem já vai prontinha. Nossa equipe responde confirmando
                a disponibilidade. Nada é cobrado agora.
              </p>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {step < 5 && (
        <div className={styles.nav}>
          {step > (presetCharacter ? 1 : 0) ? (
            <button type="button" className={styles.back} onClick={() => go(-1)}>
              ← voltar
            </button>
          ) : (
            <Link href="/" className={styles.back}>
              ← início
            </Link>
          )}
          {/* Na escolha do personagem o toque já avança; um "Continuar" ali
              seria um degrau a mais para a mesma decisão. */}
          {step > 0 && (
            <button
              type="button"
              className={`btn btn-ouro ${styles.next}`}
              onClick={() => go(1)}
              disabled={!stepValid}
            >
              {step === 4 ? "Rever a história" : "Continuar"}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
