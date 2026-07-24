-- Remove convites não usados acumulados pelos testes de hoje
DELETE FROM convites WHERE usado_por IS NULL;
