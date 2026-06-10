-- Torna os campos phone e cpf opcionais (nullable) na tabela de pacientes
ALTER TABLE patients ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN cpf DROP NOT NULL;
