import Reveal from "@/components/fx/Reveal";
import styles from "./FAQ.module.css";

const perguntas = [
  {
    q: "Vocês atendem qual região?",
    a: "Atendemos toda a Grande São Paulo: capital, ABC, Zona Norte, Sul, Leste e Oeste. Para cidades mais afastadas, fale com a gente no WhatsApp. Dependendo da data, conseguimos organizar.",
  },
  {
    q: "Quanto tempo dura a visita do personagem?",
    a: "A visita padrão dura 45 minutos, com o personagem totalmente presente nas brincadeiras, na música, na dança, nas fotos e no momento do parabéns. Também temos pacotes de 30 min e 1h.",
  },
  {
    q: "Qual a faixa de preço?",
    a: "O valor varia conforme personagem, duração e região. As experiências começam a partir de uma faixa acessível para uma visita curta com um personagem, e há pacotes premium com múltiplos personagens. Peça um orçamento personalizado no WhatsApp.",
  },
  {
    q: "Precisa de espaço grande? Cabe em apartamento?",
    a: "Sim, cabe. Adaptamos a apresentação ao espaço disponível, de salão de festas grande a apartamentos compactos. O importante é ter um cantinho reservado para o personagem entrar em cena.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Reservamos a data com um sinal (via Pix ou transferência) e o restante pode ser pago no dia da festa ou combinado antes. Enviamos contrato simples por WhatsApp com todos os detalhes.",
  },
  {
    q: "Vocês têm personagens masculinos e femininos?",
    a: "Sim! Princesas, heróis (Heróis Aranha, Cavaleiro das Sombras, Heróis do Pijama), mascotes, personagens do K-Pop, do universo pop e brasileiros (Maria Bonita, Chico Bento e Rosinha). Veja o elenco completo na página de personagens.",
  },
  {
    q: "E se der problema no dia? Tem plano B?",
    a: "Nossa equipe tem atrizes reservas para cada personagem e monitoramos tudo em tempo real no dia da festa. Se acontecer algo imprevisto, garantimos substituição sem prejuízo. Não deixamos ninguém na mão.",
  },
  {
    q: "Como reservo uma data?",
    a: "É simples: escolha o personagem no site, clique em 'Reservar uma data' e preencha os detalhes (data, horário, local, nome da criança). Ao final, tudo vai direto pro nosso WhatsApp e respondemos em minutos.",
  },
];

export default function FAQ() {
  return (
    <section className={styles.section} data-scene="faq" id="faq">
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Perguntas frequentes</p>
        <h2 className={`display ${styles.title}`}>
          Antes de reservar, tira suas <span className={`script ${styles.titleScript}`}>dúvidas</span>
        </h2>
      </Reveal>

      <div className={styles.list}>
        {perguntas.map((p, i) => (
          <Reveal key={p.q} delay={i * 0.05} variant="rise" rise={16}>
            <details className={styles.item}>
              <summary className={styles.summary}>
                <span>{p.q}</span>
                <span className={styles.icon} aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={styles.answer}>{p.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
