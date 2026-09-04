-- Leads da Fantasia Encantada.
--
-- Um registro por formulário de reserva concluído. A gravação acontece ANTES
-- de abrir o WhatsApp, então quem desiste no último segundo também fica aqui.

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  criado_em TEXT NOT NULL,              -- ISO 8601, UTC

  -- quem está falando com a gente
  responsavel_nome TEXT,
  responsavel_telefone TEXT,            -- só dígitos, como veio do formulário

  -- a festa
  personagem_slug TEXT,
  personagem_nome TEXT,
  mundo_nome TEXT,
  data_festa TEXT,                      -- YYYY-MM-DD no fuso de quem preencheu.
                                        -- NÃO usar toISOString: o calendário dá
                                        -- meia-noite local e em SP (UTC-3) isso
                                        -- jogaria a data para o dia anterior.
  periodo TEXT,
  horario TEXT,
  endereco TEXT,
  tipo_local TEXT,
  crianca_nome TEXT,
  crianca_idade TEXT,
  observacao TEXT,

  -- de onde veio
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  pagina_entrada TEXT,

  -- gestão no painel
  status TEXT NOT NULL DEFAULT 'novo'   -- novo | respondido | fechado | perdido
);

-- O painel lista sempre do mais recente para o mais antigo.
CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads (criado_em DESC);

-- E filtra por status.
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
