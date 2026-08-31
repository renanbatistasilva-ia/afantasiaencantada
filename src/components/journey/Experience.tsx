import Arch from "@/components/fx/Arch";
import Reveal from "@/components/fx/Reveal";
import Sparkles from "@/components/fx/Sparkles";
import ChapterMark from "./ChapterMark";
import styles from "./Experience.module.css";

const acts = [
  {
    numeral: "Ato I",
    title: "A chegada",
    text: "A campainha toca e a sala inteira prende a respiração. O personagem entra em cena caracterizado dos pés à cabeça, com voz, gestos e história, e procura primeiro por uma pessoa: a estrela da festa.",
    photo: {
      src: "/images/reino/neve-e-torre.jpg",
      alt: "Princesa da neve e princesa da torre chegando juntas ao jardim",
      position: "50% 28%",
    },
  },
  {
    numeral: "Ato II",
    title: "O encanto",
    text: "Música, dança, brincadeiras e aquele papo que só os personagens sabem ter. Cada visita é conduzida como um pequeno espetáculo, no ritmo das crianças, nunca no do relógio.",
    photo: {
      src: "/images/pop/guerreira-tranca.jpg",
      alt: "Guerreira do k-pop sorrindo no cenário da festa",
      position: "50% 10%",
    },
  },
  {
    numeral: "Ato III",
    title: "A memória",
    text: "Fotos, abraços de despedida e uma promessa de voltar. A festa termina, mas a história fica: é dela que seu filho vai falar no café da manhã seguinte, e em muitos outros depois.",
    photo: {
      src: "/images/reino/ariel-close.jpg",
      alt: "Retrato da princesa do mar sorrindo, cabelos ruivos ao sol",
      position: "50% 28%",
    },
  },
];

export default function Experience() {
  return (
    <section className={styles.section} data-scene="espetaculo">
      <Sparkles density={1} />
      <ChapterMark
        numeral="IV"
        name="O espetáculo"
        title="Como a magia acontece"
        lede="Uma visita da Fantasia Encantada é encenada como um conto em três atos."
        tone="dark"
      />

      <div className={styles.acts}>
        {acts.map((act, i) => (
          <article key={act.numeral} className={`${styles.act} ${i % 2 ? styles.flip : ""}`}>
            <Reveal variant="bloom" className={styles.actPhoto}>
              <Arch
                src={act.photo.src}
                alt={act.photo.alt}
                position={act.photo.position}
                parallax={4}
                sizes="(max-width: 860px) 70vw, 30vw"
                className={styles.arch}
              />
            </Reveal>
            <Reveal delay={0.1} variant={i % 2 ? "drift-left" : "drift-right"} className={styles.actCopy}>
              <p className={`script ${styles.actNumeral}`}>{act.numeral}</p>
              <h3 className={`display ${styles.actTitle}`}>{act.title}</h3>
              <p className={styles.actText}>{act.text}</p>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
