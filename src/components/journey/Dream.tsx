import Reveal from "@/components/fx/Reveal";
import ChapterMark from "./ChapterMark";
import styles from "./Dream.module.css";

const promises = [
  { title: "Presença que encanta", text: "Figurinos impecáveis e artistas que vivem o personagem do primeiro ao último minuto." },
  { title: "Magia em cada detalhe", text: "Voz, gestos, música e história: nada quebra o encanto na frente das crianças." },
  { title: "Histórias que ganham vida", text: "Cada visita é um pequeno espetáculo escrito em torno de uma única estrela: seu filho." },
];

export default function Dream() {
  return (
    <section className={styles.section} data-scene="sonho">
      <ChapterMark
        numeral="I"
        name="O sonho"
        title="A magia acontece com personagens vivos"
        lede="Antes de ser uma festa, é um sonho de criança. Nosso trabalho é fazer esse sonho abrir a porta, chamar pelo nome e dançar na sala de casa."
        tone="dark"
      />
      <div className={styles.promises}>
        {promises.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.12} className={styles.promise}>
            <span className={styles.promiseStar} aria-hidden="true">
              ✦
            </span>
            <h3 className={`display ${styles.promiseTitle}`}>{p.title}</h3>
            <p className={styles.promiseText}>{p.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
