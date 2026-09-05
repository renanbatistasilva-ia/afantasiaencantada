import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/site/Footer";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import styles from "./privacidade.module.css";

const BASE = "https://afantasiaencantada.com";

export const metadata: Metadata = {
  title: "Privacidade — Fantasia Encantada",
  description:
    "Como a Fantasia Encantada trata os dados informados no formulário de reserva.",
  alternates: { canonical: `${BASE}/privacidade` },
  robots: { index: true, follow: true },
};

const telefoneFormatado = WHATSAPP_NUMBER.replace(
  /^55(\d{2})(\d{5})(\d{4})$/,
  "($1) $2-$3",
);

export default function PrivacidadePage() {
  return (
    <main className={styles.page}>
      <article className={styles.texto}>
        <Link href="/" className={styles.back}>
          ← início
        </Link>

        <h1 className={`display ${styles.titulo}`}>Privacidade</h1>
        <p className={styles.lede}>
          Esta página explica, sem juridiquês, quais dados o formulário de reserva coleta, para
          que servem e por quanto tempo ficam guardados.
        </p>

        <h2 className={styles.secao}>O que coletamos</h2>
        <p>
          Quando você preenche o formulário de reserva, guardamos o que você mesmo escreveu:
          seu nome e WhatsApp, o personagem escolhido, a data, o horário, o bairro e o tipo do
          local da festa, o primeiro nome e a idade da criança, e qualquer observação que você
          deixe.
        </p>
        <p>
          Guardamos também de onde sua visita veio — por exemplo, se você chegou por um link do
          Instagram. Isso nos ajuda a entender o que funciona. Não usamos cookies de
          publicidade e não rastreamos você em outros sites.
        </p>

        <h2 className={styles.secao}>Como contamos as visitas</h2>
        <p>
          Contamos quantas pessoas abrem o site e quais páginas elas veem, para saber o que está
          funcionando. Para isso o navegador guarda um número sorteado na hora, que existe só
          enquanto a aba estiver aberta e some quando você a fecha. Ele não tem seu nome, não tem
          seu telefone e não sai daqui.
        </p>
        <p>
          <strong>Não guardamos seu endereço de IP.</strong> Ficam só totais por dia — quantas
          visitas, de onde vieram, quais páginas — sem nada que aponte para uma pessoa. Se preferir
          não ser contado, abra{" "}
          <Link href="/?fe=off" className={styles.link}>
            este link
          </Link>{" "}
          e este aparelho para de contar.
        </p>

        <h2 className={styles.secao}>Sobre os dados da criança</h2>
        <p>
          Pedimos o primeiro nome e a idade da criança por um motivo único: o personagem chega
          chamando a aniversariante pelo nome, e a brincadeira é pensada para a idade dela. É o
          que faz a visita ser dela, e não uma apresentação genérica.
        </p>
        <p>
          Não pedimos sobrenome, escola, endereço completo, foto nem qualquer outro dado da
          criança. Quem preenche o formulário é o responsável, e é o responsável quem decide
          informar. Se preferir não dizer a idade, o campo é opcional.
        </p>

        <h2 className={styles.secao}>Para que usamos</h2>
        <p>
          Exclusivamente para responder você, organizar a festa e melhorar nosso atendimento.
          <strong> Não vendemos, não alugamos e não compartilhamos esses dados com terceiros</strong>{" "}
          para publicidade.
        </p>

        <h2 className={styles.secao}>Por quanto tempo guardamos</h2>
        <p>
          Um pedido que não vira festa é apagado em até <strong>12 meses</strong>. Se a festa
          acontecer, mantemos o registro enquanto você for nosso cliente, para lembrar do que
          já fizemos juntos e não pedir tudo de novo na próxima.
        </p>

        <h2 className={styles.secao}>Seus direitos</h2>
        <p>
          A qualquer momento você pode pedir para ver, corrigir ou apagar os seus dados e os da
          criança. Basta chamar no WhatsApp <strong>{telefoneFormatado}</strong> — atendemos
          sem burocracia e sem perguntar o motivo.
        </p>

        <h2 className={styles.secao}>Onde ficam</h2>
        <p>
          Os dados ficam em servidores da Cloudflare, na União Europeia, com acesso restrito à
          equipe da Fantasia Encantada.
        </p>

        <p className={styles.rodape}>
          Fantasia Encantada · São Paulo e região · WhatsApp {telefoneFormatado}
        </p>
      </article>

      <Footer />
    </main>
  );
}
