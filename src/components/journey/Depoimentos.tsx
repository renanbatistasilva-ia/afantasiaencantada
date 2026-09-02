import Reveal from "@/components/fx/Reveal";
import styles from "./Depoimentos.module.css";

const depoimentos = [
  {
    text: "A princesa entrou pela porta cantando o nome da Isabela e minha filha começou a chorar de emoção. Foi o momento mais mágico dos 5 anos dela. Recomendo de coração.",
    name: "Camila Rossi",
    detail: "Mãe da Isabela, 5 anos",
  },
  {
    text: "Contratamos o Homem-Aranha para o Miguel e o menino ficou uma semana falando disso. O ator era caracterizado dos pés à cabeça e brincou com a criançada como se fosse um deles.",
    name: "Renata Mendes",
    detail: "Mãe do Miguel, 6 anos",
  },
  {
    text: "Achei que uma visita de 45 minutos seria pouco, mas passou tão intenso que ninguém queria que a Elsa fosse embora. Teve foto, música, brincadeira. Foi uma festa dentro da festa.",
    name: "Juliana Prado",
    detail: "Mãe da Sofia, 4 anos",
  },
  {
    text: "A equipe é impecável desde o primeiro contato pelo WhatsApp. Chegaram no horário, ajustaram o roteiro pra minha filha tímida e ainda deixaram lembrancinhas encantadas. Um serviço premium de verdade.",
    name: "Fernanda Oliveira",
    detail: "Mãe da Lorena, 7 anos",
  },
];

export default function Depoimentos() {
  return (
    <section className={styles.section} data-scene="depoimentos" id="depoimentos">
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Vozes de quem viveu</p>
        <h2 className={`display ${styles.title}`}>
          Histórias que ficam para <span className={`script ${styles.titleScript}`}>sempre</span>
        </h2>
        <p className={styles.lede}>
          O que as famílias contam depois que a magia bate na porta. Cada visita vira uma memória
          que a criança revisita no café da manhã, no álbum, nas conversas de escola.
        </p>
      </Reveal>

      <div className={styles.grid}>
        {depoimentos.map((d, i) => (
          <Reveal key={d.name} delay={i * 0.08} variant="rise">
            <article className={styles.card}>
              <span className={styles.quote} aria-hidden="true">
                &ldquo;
              </span>
              <p className={styles.text}>{d.text}</p>
              <div className={styles.author}>
                <span className={styles.star} aria-hidden="true">
                  ★★★★★
                </span>
                <div className={styles.who}>
                  <span className={styles.whoName}>{d.name}</span>
                  <span className={styles.whoDetail}>{d.detail}</span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
