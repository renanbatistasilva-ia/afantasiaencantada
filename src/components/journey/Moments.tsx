import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import ChapterMark from "./ChapterMark";
import styles from "./Moments.module.css";

const album = [
  {
    src: "/images/momentos/piscina-bolinhas.jpg",
    alt: "Princesas e uma bebê batendo palminhas na piscina de bolinhas",
    caption: "Palminhas na piscina de bolinhas",
    rotate: -2.2,
  },
  {
    src: "/images/reino/princesas-fera.jpg",
    alt: "Fileira de princesas com a Fera no salão da festa",
    caption: "O reino inteiro veio à festa",
    rotate: 1.6,
  },
  {
    src: "/images/momentos/kpop-crianca.jpg",
    alt: "Trio de guerreiras do k-pop abraçando uma menina",
    caption: "Virou estrela por um dia",
    rotate: -1.4,
  },
  {
    src: "/images/mascotes/bluey-bingo.jpg",
    alt: "Mascotes das cachorrinhas de mãos dadas na festa",
    caption: "As irmãs mais pedidas da TV",
    rotate: 2,
  },
];

export default function Moments() {
  return (
    <section id="momentos" className={styles.section} data-scene="momentos">
      <ChapterMark
        numeral="III"
        name="A prova"
        title="Momentos que aconteceram de verdade"
        lede="A fantasia encanta na tela. Mas é no encontro que ela vira memória. Estes registros são de festas reais, com crianças reais."
      />

      <div className={styles.feature}>
        <Reveal variant="bloom" className={styles.featureFrame}>
          <figure className={styles.featurePhoto}>
            <Image
              src="/images/momentos/moana-vela.jpg"
              alt="Navegante dos mares soprando a vela do bolo junto com a aniversariante"
              width={1275}
              height={1700}
              sizes="(max-width: 860px) 92vw, 52vw"
              style={{ width: "100%", height: "auto" }}
            />
            <figcaption className={styles.featureCaption}>
              <span className={`script ${styles.featureScript}`}>o pedido</span>
              <span>
                Um sopro, um desejo, e a certeza de que a heroína favorita
                estava ali, de verdade, só para ela.
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <div className={styles.albumWrap}>
        <ul className={styles.album}>
          {album.map((photo, i) => (
            <li
              key={photo.src}
              className={styles.card}
              style={{ "--rot": `${photo.rotate}deg` } as React.CSSProperties}
            >
              <Reveal delay={i * 0.08}>
                <div className={styles.cardPhoto}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 860px) 74vw, 22vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className={`script ${styles.cardCaption}`}>{photo.caption}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
