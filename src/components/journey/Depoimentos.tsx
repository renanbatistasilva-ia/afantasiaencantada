import Reveal from "@/components/fx/Reveal";
import styles from "./Depoimentos.module.css";

/**
 * A ficha no Google, que tem prova que nenhum texto nosso tem: avaliação de
 * terceiro, que o visitante consegue conferir sozinho. Os depoimentos abaixo
 * são de clientes reais, mas quem chega não tem como saber disso — o selo é o
 * que os transforma de "texto escolhido a dedo" em amostra de algo verificável.
 *
 * Conferido à mão em 24/09/2026. O número envelhece e ninguém vai lembrar de
 * atualizar, então fica em um lugar só e com a data à vista.
 *
 * O `kgmid` é o identificador do negócio no Google e não muda. O link curto que
 * o botão "compartilhar" gera não serve aqui: ele carrega parâmetros da sessão
 * de quem compartilhou (`rlz`, `sei`, `utm_source`), que não podem ficar
 * gravados numa página pública.
 */
const GOOGLE = {
  nota: "5,0",
  avaliacoes: 19,
  perfil: "https://www.google.com/search?kgmid=/g/11nvctdpd2",
};

const depoimentos = [
  {
    text: "A princesa entrou pela porta cantando o nome da Isabela e minha filha começou a chorar de emoção. Foi o momento mais mágico dos 5 anos dela. Recomendo de coração.",
    name: "Camila Rossi",
    detail: "Mãe da Isabela, 5 anos",
  },
  {
    text: "Contratamos os Heróis Aranha para o Miguel e o menino ficou uma semana falando disso. Os atores eram caracterizados dos pés à cabeça e brincaram com a criançada como se fossem um deles.",
    name: "Renata Mendes",
    detail: "Mãe do Miguel, 6 anos",
  },
  {
    text: "Achei que uma visita de 45 minutos seria pouco, mas passou tão intenso que ninguém queria que a Princesa da Neve fosse embora. Teve foto, música, brincadeira. Foi uma festa dentro da festa.",
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

        {/* As estrelas ficam escondidas do leitor de tela porque o texto ao lado
            já diz a nota — ouvir "estrela estrela estrela estrela estrela" antes
            de "5,0" só atrasa quem está escutando a página. */}
        <a
          className={styles.selo}
          href={GOOGLE.perfil}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.seloEstrelas} aria-hidden="true">
            ★★★★★
          </span>
          <span className={styles.seloNota}>{GOOGLE.nota}</span>
          <span className={styles.seloTexto}>
            · {GOOGLE.avaliacoes} avaliações no Google
          </span>
          <span className={styles.seloSeta} aria-hidden="true">
            →
          </span>
        </a>
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
