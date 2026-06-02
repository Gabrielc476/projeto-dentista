# Dental Clinic Backend

Backend do sistema de gerenciamento de consultório odontológico construído com NestJS, Clean Architecture e Supabase.

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com separação em 4 camadas:

- **Domain**: Entidades e interfaces de repositório (sem dependências externas)
- **Application**: Casos de uso e DTOs
- **Infrastructure**: Implementações de repositórios (Supabase) seguindo SOLID
- **Presentation**: Controllers REST e Response DTOs

## 🚀 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Criar o banco de dados

Execute o script SQL `database-schema.sql` no SQL Editor do Supabase para criar as tabelas necessárias.

### 4. Iniciar o servidor

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

O servidor estará rodando em `http://localhost:3001`

## 📡 API Endpoints

### Pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients` - Listar todos os pacientes
- `GET /api/patients/:id` - Buscar paciente por ID
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Procedimentos
- `POST /api/procedures` - Criar procedimento
- `GET /api/procedures` - Listar todos os procedimentos
- `GET /api/procedures/:id` - Buscar procedimento por ID
- `PUT /api/procedures/:id` - Atualizar procedimento
- `DELETE /api/procedures/:id` - Deletar procedimento

### Consultas
- `POST /api/appointments` - Criar consulta com procedimentos
- `GET /api/appointments` - Listar consultas (com filtros: patientId, status, date)
- `GET /api/appointments/:id` - Buscar consulta por ID
- `PUT /api/appointments/:id` - Atualizar consulta
- `DELETE /api/appointments/:id` - Deletar consulta

### Pagamentos
- `POST /api/payments` - Criar pagamento
- `GET /api/payments` - Listar pagamentos (com filtros: patientId, appointmentId, status)
- `GET /api/payments/pending` - Listar pagamentos pendentes
- `GET /api/payments/:id` - Buscar pagamento por ID
- `PUT /api/payments/:id` - Atualizar pagamento
- `DELETE /api/payments/:id` - Deletar pagamento

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Tecnologias

- NestJS 10
- TypeScript
- Supabase (PostgreSQL)
- Class Validator
- Class Transformer

## 🎯 Princípios SOLID

O código segue rigorosamente os princípios SOLID:

- **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Implementações são intercambiáveis através de interfaces
- **I**nterface Segregation: Interfaces específicas e focadas
- **D**ependency Inversion: Dependência de abstrações, não de implementações concretas
