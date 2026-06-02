# Dental Clinic Frontend

Frontend do sistema de gerenciamento de consultório odontológico construído com Next.js 16, React 19, shadcn/ui e TypeScript.

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará rodando em `http://localhost:3000`

## 🏗️ Arquitetura

### Padrão Atômico (Atomic Design)

```
components/
├── ui/           # Átomos (shadcn components)
├── molecules/    # Componentes pequenos reutilizáveis
├── organisms/    # Componentes complexos
└── templates/    # Layouts de páginas
```

### Estrutura por Features

```
features/
├── patients/
│   ├── components/    # Componentes específicos
│   ├── hooks/         # Custom hooks
│   └── services/      # Serviços (SOLID)
├── appointments/
├── procedures/
└── payments/
```

## 📦 Tecnologias

- **Next.js 16** - App Router
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component Library
- **SOLID Principles** - Services Layer

## 🎨 Componentes shadcn/ui Instalados

- Button
- Dialog
- Table
- Form
- Input
- Select
- Card
- Badge
- Tabs
- Label
- Textarea
- Calendar
- Popover
- Dropdown Menu

## 📄 Páginas

### Dashboard (`/`)
- Estatísticas gerais
- Ações rápidas
- Atividade recente

### Pacientes (`/pacientes`)
✅ **TOTALMENTE FUNCIONAL**
- Listagem completa de pacientes
- Criar novo paciente (modal)
- Editar paciente existente
- Deletar paciente
- Campos calculados (consultas, pagamentos)

### Consultas (`/consultas`)
- Interface para agendamento
- Vinculação com procedimentos
- Controle de status

### Procedimentos (`/procedimentos`)
- Catálogo de procedimentos
- Preços e durações
- CRUD completo

### Pagamentos (`/pagamentos`)
- Controle de pagamentos
- Status (pendente/realizado)
- Filtros por paciente e consulta

## 🔧 Serviços (SOLID)

Todos os serviços seguem princípios SOLID com interfaces abstratas:

```typescript
// features/patients/services/patient.service.ts
interface IPatientService {
  getAll(): Promise<Patient[]>;
  getById(id: string): Promise<Patient>;
  create(data: PatientFormData): Promise<Patient>;
  update(id: string, data: Partial<PatientFormData>): Promise<Patient>;
  delete(id: string): Promise<void>;
}
```

## 🎯 Próximos Passos

Para completar as páginas restantes, siga o padrão da **página de Pacientes**:

1. Use os serviços já criados em `features/*/services/*.service.ts`
2. Implemente hooks customizados em `features/*/hooks/`
3. Crie componentes específicos em `features/*/components/`
4. Utilize os componentes shadcn/ui já instalados

## 📝 Exemplo de Implementação

A **página de Pacientes** (`app/pacientes/page.tsx`) é um exemplo completo:
- ✅ Listagem com tabela
- ✅ Modal de criação/edição
- ✅ Validação de formulário
- ✅ Loading states
- ✅ Error handling
- ✅ CRUD completo

Use-a como referência para implementar as demais páginas!

## 🛠️ Scripts

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar build de produção
npm run start

# Linting
npm run lint
```

## 📚 Documentação

- [Next.js 16](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🔗 Conexão com Backend

O frontend se conecta ao backend via API REST em:
- **Local**: `http://localhost:3001`
- **Configurável via**: `.env.local`

Certifique-se de que o backend está rodando antes de usar o frontend!

## ⚠️ Observações

- A página de **Pacientes** está totalmente funcional como demonstração
- As demais páginas têm placeholders e devem ser implementadas seguindo o mesmo padrão
- Todos os serviços estão prontos e podem ser utilizados imediatamente
- 14 componentes shadcn/ui já instalados e prontos para uso
