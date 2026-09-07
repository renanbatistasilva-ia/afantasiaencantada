-- Leads da Fantasia Encantada.
--
-- Um registro por formulário de reserva concluído. A gravação acontece ANTES
-- de abrir o WhatsApp, então quem desiste no último segundo também fica aqui.

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  criado_em TEXT NOT NULL,              -- ISO 8601, UTC

  -- quem está falando com a gente
  responsavel_nome TEXT,
  responsavel_telefone TEXT,            -- COM máscara: (11) 91234-5678. O formulário
                                        -- aplica formatPhone a cada tecla e é esse texto
                                        -- que chega aqui. Quem for comparar com telefone
                                        -- de outra origem precisa tirar a pontuação antes.

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

-- Contadores de tráfego.
--
-- Só totais por dia. Nenhum identificador, nenhum IP, nada que aponte para uma
-- pessoa — e nenhuma ligação com a tabela `leads`. Essa separação é deliberada:
-- no instante em que desse para ir do telefone de um lead até o rastro de
-- navegação dele, este arquivo inteiro viraria dado pessoal.
--
-- `metrica` diz o que a linha conta e `chave` o recorte:
--   visitas      chave ''                    sessões que abriram o site
--   paginas      chave = caminho             páginas vistas
--   origem       chave = fonte               sessões por origem
--   funil        chave = nome do passo       sessões que alcançaram o passo
--   permanencia  chave = 'caminho|segundos'  sessões que ficaram além do limiar
--   leads        chave ''                    formulários enviados
CREATE TABLE IF NOT EXISTS analitica_diaria (
  dia     TEXT    NOT NULL,             -- YYYY-MM-DD em America/Sao_Paulo, nunca UTC
  metrica TEXT    NOT NULL,
  chave   TEXT    NOT NULL DEFAULT '',
  valor   INTEGER NOT NULL,             -- primeiro INTEGER do projeto; o resto é TEXT
  PRIMARY KEY (dia, metrica, chave)
) WITHOUT ROWID;
-- WITHOUT ROWID de propósito: a chave primária É a tabela, então não existe um
-- índice separado para manter. No D1 cada índice cobra uma linha escrita a mais
-- por escrita, e aqui são zero. O painel só consulta por faixa de dia, que o
-- prefixo da chave primária já atende — nenhum índice secundário é necessário.
