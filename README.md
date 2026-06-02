# Sistema de Gerenciamento de Consultório Odontológico

Sistema completo de gerenciamento para consultórios odontológicos com agendamento de consultas, controle de pacientes, procedimentos e pagamentos.

## 📋 Funcionalidades

- ✅ Cadastro e gerenciamento de pacientes
- ✅ Agendamento de consultas
- ✅ Catálogo de procedimentos odontológicos
- ✅ Controle de pagamentos (realizados e pendentes)
- ✅ Vinculação de múltiplos procedimentos por consulta
- ✅ Dashboard com estatísticas e ações rápidas
- ✅ Filtros avançados de busca

## 🏗️ Arquitetura

### Backend (NestJS + Clean Architecture)
- **Domain Layer**: Entidades e interfaces (sem dependências externas)
- **Application Layer**: Casos de uso e DTOs
- **Infrastructure Layer**: Repositórios Supabase (implementação SOLID)
- **Presentation Layer**: Controllers REST

### Frontend (Next.js 16 + shadcn/ui)
- **Atomic Design**: Atoms, Molecules, Organisms, Templates
- **Feature-based Structure**: Organização por funcionalidade
- **Services Layer**: Camada de serviços seguindo SOLID
- **Hooks personalizados**: Separação de lógica de negócio

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Backend

```bash
cd backend
npm install

# Configurar .env com credenciais do Supabase
cp .env.example .env

# Executar script SQL database-schema.sql no Supabase
# Iniciar servidor
npm run start:dev
```

O backend estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar aplicação
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📡 API Endpoints

Consulte o [README do Backend](./backend/README.md) para documentação completa das rotas.

## 🗄️ Banco de Dados

O sistema utiliza Supabase (PostgreSQL) com as seguintes tabelas:

- `patients` - Dados dos pacientes
- `procedures` - Catálogo de procedimentos
- `appointments` - Consultas agendadas
- `appointment_procedures` - Relação N:N entre consultas e procedimentos
- `payments` - Pagamentos realizados e pendentes

Execute o arquivo `backend/database-schema.sql` no SQL Editor do Supabase para criar a estrutura.

## 🎨 Tecnologias

### Backend
- NestJS 10
- TypeScript
- Supabase Client
- Class Validator/Transformer

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## 🔒 Segurança

⚠️ **IMPORTANTE**: Este é um MVP sem autenticação. Em produção, implemente:
- Autenticação de usuários
- Row Level Security (RLS) no Supabase
- Validação de permissões
- HTTPS obrigatório

## 📖 Documentação

- [README do Backend](./backend/README.md)
- [Database Schema](./backend/database-schema.sql)
- [Contexto do Projeto](./contexto.md)

## 👥 Usuários Principais

- Recepcionista
- Dentista

## 📝 Licença

Este projeto é privado e proprietário.
