-- Remove os convites não usados gerados durante a simulação
DELETE FROM convites WHERE usado_por IS NULL;
