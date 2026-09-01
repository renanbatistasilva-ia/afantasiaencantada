export const WHATSAPP_NUMBER = "5511932237456";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Mensagem curta para os botões de contato direto. */
export const quickMessage =
  "Olá, equipe Fantasia Encantada! ✨ Vi o site de vocês e quero saber mais sobre uma visita de personagem.";

/** Mensagem de interesse por um personagem específico (botão do cartão de história). */
export function characterInterestMessage(name: string) {
  return `Olá, equipe Fantasia Encantada! ✨ Quero saber mais sobre ${name} e como funciona uma visita mágica na festa. Podem me contar?`;
}

export interface BookingDraft {
  characterName?: string;
  worldName?: string;
  date?: Date;
  period?: string;
  time?: string;
  place?: string;
  venueType?: string;
  childName?: string;
  childAge?: string;
  special?: string;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function bookingMessage(d: BookingDraft) {
  const lines = [
    "Olá, equipe Fantasia Encantada! ✨",
    "Quero reservar uma visita mágica:",
    "",
  ];
  if (d.characterName)
    lines.push(`👑 Personagem: ${d.characterName}${d.worldName ? ` (${d.worldName})` : ""}`);
  if (d.date) lines.push(`📅 Data: ${dateFmt.format(d.date)}`);
  if (d.period || d.time)
    lines.push(`🕒 Horário: ${[d.period, d.time].filter(Boolean).join(", por volta das ")}`);
  if (d.place || d.venueType)
    lines.push(`📍 Local: ${[d.place, d.venueType].filter(Boolean).join(", ")}`);
  if (d.childName)
    lines.push(`⭐ Estrela da festa: ${d.childName}${d.childAge ? `, ${d.childAge}` : ""}`);
  if (d.special) lines.push(`💌 Algo especial: ${d.special}`);
  lines.push("", "Podem me confirmar a disponibilidade?");
  return lines.join("\n");
}
