"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./MagicCalendar.module.css";

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function MagicCalendar({ value, onChange }: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState(() =>
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dir, setDir] = useState(1);
  const reduced = useReducedMotion();

  const maxView = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = view < maxView;

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    const out: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    return out;
  }, [view]);

  const move = (delta: number) => {
    setDir(delta);
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  };

  const monthLabel = monthFmt.format(view);

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => move(-1)}
          disabled={!canPrev}
          aria-label="Mês anterior"
        >
          ←
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={monthLabel}
            className={styles.month}
            initial={reduced ? false : { opacity: 0, x: 18 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -18 * dir }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {monthLabel}
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => move(1)}
          disabled={!canNext}
          aria-label="Próximo mês"
        >
          →
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className={styles.grid} role="listbox" aria-label={`Dias de ${monthLabel}`}>
        {cells.map((date, i) =>
          date ? (
            <button
              key={date.toISOString()}
              type="button"
              role="option"
              aria-selected={!!value && date.getTime() === startOfDay(value).getTime()}
              disabled={date < today}
              className={`${styles.day} ${
                value && date.getTime() === startOfDay(value).getTime() ? styles.selected : ""
              } ${date.getTime() === today.getTime() ? styles.today : ""}`}
              onClick={() => onChange(date)}
            >
              {date.getDate()}
            </button>
          ) : (
            <span key={`pad-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
