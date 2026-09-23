-- Arquivar em vez de apagar.
--
-- "Apagar" era um DELETE definitivo a dois toques num celular, sem volta. Num
-- painel que a dona usa com o polegar, entre uma festa e outra, isso é um
-- registro de família perdido por um encosto na tela — e o pedido carrega nome
-- e telefone de quem confiou o contato à empresa.
--
-- Arquivar tira da tela na mesma hora, que é o que ela quer, e deixa 30 dias
-- para desfazer. Depois disso o cron das 4h apaga de vez, e é a mesma promessa
-- que /privacidade já faz sobre pedido que não vira festa.

ALTER TABLE leads ADD COLUMN arquivado_em TEXT;

-- A listagem passa a filtrar por isto em toda consulta do painel.
CREATE INDEX IF NOT EXISTS idx_leads_arquivado ON leads (arquivado_em);
