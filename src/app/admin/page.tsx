import type { Metadata } from "next";
import PainelAdmin from "@/components/admin/PainelAdmin";

/**
 * A página é Server Component só para poder exportar `metadata` — Client
 * Component não pode. O painel em si é o componente cliente abaixo.
 *
 * `noindex` no lugar de Disallow no robots.txt: bloquear o rastreamento
 * impediria o Google de LER o noindex, e ainda publicaria o caminho num
 * arquivo que todo mundo lê.
 */
export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function Pagina() {
  return <PainelAdmin />;
}
