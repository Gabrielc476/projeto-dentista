-- Adicionar colunas de controle de período de recorrência para médicos fixos
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS fixed_start_date DATE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS fixed_end_date DATE;
