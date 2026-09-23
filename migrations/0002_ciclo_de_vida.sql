-- O ciclo de vida real do pedido.
--
-- Os quatro estados antigos (novo | respondido | fechado | perdido) descreviam
-- a caixa de entrada, não o negócio. O FAQ do próprio site conta outro fluxo:
-- reservamos a data com um sinal, e o restante é pago no dia. "fechado"
-- misturava as duas coisas mais diferentes que existem aqui — a festa que ainda
-- vai acontecer e a que já aconteceu —, e era justamente essa distinção que o
-- choque de agenda e qualquer conta de faturamento precisavam.
--
--   novo       chegou e ninguém respondeu
--   conversa   em negociação
--   reservado  sinal pago; É O ÚNICO QUE OCUPA A DATA
--   realizado  a festa aconteceu
--   perdido    não vai acontecer
--
-- A ordem dos UPDATEs importa: o primeiro é o caso específico (festa que já
-- passou), e o segundo varre o que sobrou de 'fechado'.

UPDATE leads SET status = 'conversa' WHERE status = 'respondido';

-- `date('now','-3 hours')` é hoje em São Paulo. O Brasil não tem mais horário
-- de verão desde 2019, então UTC-3 vale o ano inteiro.
UPDATE leads
   SET status = 'realizado'
 WHERE status = 'fechado'
   AND data_festa IS NOT NULL
   AND data_festa <> ''
   AND data_festa < date('now', '-3 hours');

UPDATE leads SET status = 'reservado' WHERE status = 'fechado';
