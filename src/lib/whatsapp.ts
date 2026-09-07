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
  parentName?: string;
  parentPhone?: string;
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
  if (d.parentName) lines.push(`👋 Falo com vocês: ${d.parentName}`);
  if (d.parentPhone) lines.push(`📱 Meu contato: ${d.parentPhone}`);
  lines.push("", "Podem me confirmar a disponibilidade?");
  return lines.join("\n");
}

/* ——— telefone do responsável ——— */

/** Só os dígitos, para validar e para montar o link do WhatsApp. */
export function phoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Máscara progressiva: (11) 91234-5678 — aplicada enquanto a pessoa digita. */
export function formatPhone(value: string) {
  const d = phoneDigits(value);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Celular brasileiro: 11 dígitos, DDD de 11 a 99 e nono dígito 9.
 * Fixo não serve — o contato precisa receber WhatsApp.
 */
export function isValidPhone(value: string) {
  const d = phoneDigits(value);
  if (d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  return ddd >= 11 && ddd <= 99 && d[2] === "9";
}

/**
 * Conversa com um número específico — o oposto de `whatsappUrl`, que sempre
 * abre a conversa com a empresa.
 *
 * O telefone vem do banco como a pessoa digitou, com máscara. Só os dígitos
 * servem no link, e o 55 do Brasil precisa ser somado.
 */
export function whatsappUrlPara(telefone: string, mensagem: string) {
  return `https://wa.me/55${phoneDigits(telefone)}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Primeira resposta a quem preencheu o formulário, já pronta no painel.
 *
 * Diz "a festa de Helena", nunca "da Helena": o nome de uma criança não informa
 * o gênero dela, e errar isso na primeira mensagem é um mau começo.
 */
export function mensagemDeResposta(responsavel: string, crianca?: string | null) {
  const primeiro = responsavel.trim().split(/\s+/)[0] || "tudo bem";
  const festa = crianca?.trim() ? `a festa de ${crianca.trim()}` : "a festa";
  return `Olá, ${primeiro}! Aqui é da Fantasia Encantada ✨ Recebemos seu pedido sobre ${festa} e já quero ajudar a deixar tudo pronto. Posso confirmar alguns detalhes com você?`;
}
