-- Anotações e linha do tempo.
--
-- Até aqui o painel sabia em que estado o pedido está, e nada sobre como ele
-- chegou lá. `conversa` não tem data: a dona não sabia há quanto tempo tinha
-- respondido, só há quanto tempo o pedido existia. E tudo que foi combinado no
-- WhatsApp — o valor, o horário que mudou, a criança que é tímida — vivia
-- exclusivamente no WhatsApp, onde não dá para procurar seis meses depois.

ALTER TABLE leads ADD COLUMN notas TEXT;

-- Uma linha por acontecimento, preenchida pelo próprio painel. Separada da
-- tabela `leads` de propósito: um pedido tem muitos acontecimentos, e enfiar
-- isso numa coluna de texto significaria reescrever o histórico inteiro a cada
-- mudança de estado — e perder tudo se uma escrita falhasse no meio.
CREATE TABLE IF NOT EXISTS historico (
  id       TEXT PRIMARY KEY,
  lead_id  TEXT NOT NULL,
  em       TEXT NOT NULL,              -- ISO 8601, UTC, igual a leads.criado_em
  tipo     TEXT NOT NULL,              -- status | nota
  detalhe  TEXT,                       -- o estado novo, ou um resumo do que mudou
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Sempre lido por pedido, do mais recente para o mais antigo.
CREATE INDEX IF NOT EXISTS idx_historico_lead ON historico (lead_id, em DESC);
