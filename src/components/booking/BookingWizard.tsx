"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import MagicCalendar from "./MagicCalendar";
import CharacterMedallion from "@/components/character/CharacterMedallion";
import CharacterModal from "@/components/character/CharacterModal";
import type { Character } from "@/data/types";
import { visibleWorlds } from "@/data/worlds";
import { characterBySlug, visibleCharacters } from "@/data/characters";
import { bookingMessage, whatsappUrl } from "@/lib/whatsapp";
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
}

const PERIODS = ["Manhã", "Tarde", "Noite"];
const VENUES = ["Em casa", "Salão do prédio", "Buffet", "Escola", "Outro"];
const AGES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13+"];

const STEP_COUNT = 6;
const ease = [0.22, 1, 0.36, 1] as const;

export default function BookingWizard() {
  // Lidos no cliente para funcionar em host estático (output: export).
  const params = useSearchParams();
  const initialCharacter = params.get("personagem") ?? undefined;
  const initialWorld = params.get("mundo") ?? undefined;

  // Se já chegou com personagem escolhido (via cartão de história), começa na data.
  const presetCharacter = !!(initialCharacter && characterBySlug(initialCharacter));
  const [step, setStep] = useState(presetCharacter ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [infoChar, setInfoChar] = useState<Character | null>(null);
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState<Draft>({
    characterSlug: presetCharacter ? initialCharacter! : "",
    date: null,
    period: "",
    time: "",
    place: "",
    venueType: "",
    childName: "",
    childAge: "",
    special: "",
  });

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

  const go = (delta: number) => {
    setDir(delta);
    setStep((s) => Math.min(Math.max(s + delta, 0), STEP_COUNT - 1));
  };

  const jump = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const message = bookingMessage({
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
    {
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
              {orderedWorlds.map((world) => {
                const cast = visibleCharacters.filter((c) => c.worlds.includes(world.slug));
                if (cast.length === 0) return null;
                return (
                  <fieldset key={world.slug} className={styles.worldGroup}>
                    <legend className={styles.worldLegend}>{world.name}</legend>
                    <div className={styles.chips}>
                      {cast.map((c) => (
                        <button
                          key={`${world.slug}-${c.slug}`}
                          type="button"
                          className={styles.chip}
                          onClick={() => setInfoChar(c)}
                        >
                          <CharacterMedallion character={c} size={34} className={styles.chipAvatar} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                );
              })}

              <p className={styles.pickHint}>
                Toque num personagem para conhecer a história dele.
              </p>
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

          {step === 5 && (
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

              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-ouro ${styles.send}`}
              >
                Enviar a história pelo WhatsApp
              </a>
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

      <CharacterModal character={infoChar} onClose={() => setInfoChar(null)} />
    </div>
  );
}
