# 🔍 BuscaPneu

**Plataforma inteligente de comparação, análise e gerenciamento de cotações de pneus automotivos.**

Desenvolvido com arquitetura full stack moderna, design SaaS premium e sistema de score automatizado para auxiliar na tomada de decisão na compra de pneus.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 📊 **Dashboard** | Visão geral com KPIs, gráficos e insights automáticos |
| 📋 **Cotações** | Tabela com busca, filtros, ordenação e paginação |
| ➕ **Nova Cotação** | Formulário com validação Zod + React Hook Form |
| ⚡ **Comparador** | Compare até 3 pneus lado a lado com veredicto automático |
| 📈 **Analytics** | 6+ gráficos: ranking, distribuição, preço por marca |
| 🏆 **Score inteligente** | Algoritmo automático de custo-benefício (0–100) |
| 🌙 **Dark mode** | Toggle persistente entre temas claro e escuro |
| 🔐 **Autenticação** | JWT com rotas protegidas e persistência de sessão |

---

## 🚀 Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — design system customizado
- **Framer Motion** — animações e transições
- **Recharts** — gráficos interativos
- **React Hook Form** + **Zod** — formulários com validação
- **Zustand** — estado global (auth + tema)
- **React Router DOM** — navegação SPA
- **Axios** — comunicação com a API

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** — queries tipadas
- **PostgreSQL** — banco de dados relacional
- **JWT** — autenticação stateless
- **bcryptjs** — hash de senhas
- **Zod** — validação de dados de entrada

---

## 🗂 Estrutura do Projeto

```
buscapneu/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Layout, Sidebar, Topbar
│   │   │   └── ui/            # StatCard, ScoreBar, CategoryBadge, Toast
│   │   ├── pages/             # Dashboard, Quotes, NewQuote, Compare, Analytics
│   │   ├── store/             # Zustand: auth.store, theme.store
│   │   ├── lib/               # api.ts (axios), utils.ts
│   │   └── types/             # TypeScript interfaces
│   └── ...
│
└── server/                    # Backend Node.js
    ├── prisma/
    │   └── schema.prisma      # Modelos: User, TireQuote
    └── src/
        ├── controllers/       # auth, quote, analytics
        ├── routes/            # auth, quote, analytics
        ├── middlewares/       # authenticate (JWT)
        ├── utils/             # prisma singleton
        └── prisma/            # seed.ts com 29 cotações reais
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/buscapneu.git
cd buscapneu
```

### 2. Configure o Backend

```bash
cd server
cp .env.example .env
# Edite o .env com sua DATABASE_URL
npm install
npx prisma migrate dev --name init
npx ts-node src/prisma/seed.ts   # Popula com 29 cotações reais
npm run dev
```

### 3. Configure o Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |

**Credenciais demo:** `admin@buscapneu.com` / `admin123`

---

## 🌐 Variáveis de Ambiente

### Server (`server/.env`)

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/buscapneu"
JWT_SECRET="sua-chave-secreta-super-segura"
PORT=3001
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📡 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### Cotações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/quotes` | Listar com filtros e paginação |
| POST | `/api/quotes` | Criar nova cotação |
| PUT | `/api/quotes/:id` | Atualizar cotação |
| DELETE | `/api/quotes/:id` | Remover cotação |
| POST | `/api/quotes/compare` | Comparar cotações (2–3 IDs) |

### Analytics
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/analytics/stats` | KPIs do dashboard |
| GET | `/api/analytics/price-by-brand` | Preço médio por marca |
| GET | `/api/analytics/company-ranking` | Ranking de empresas |
| GET | `/api/analytics/price-distribution` | Distribuição de preços |
| GET | `/api/analytics/insights` | Insights automáticos |

---

## 🧠 Algoritmo de Score

O score (0–100) é calculado automaticamente com base em:

- **Preço relativo** (30pts) — quanto mais barato em relação ao mercado
- **Serviços inclusos** (até 25pts) — montagem, balanceamento, geometria, válvulas
- **Parcelamento** (+8pts) — facilidade de pagamento
- **Categoria da marca** (+7pts premium / +4pts médio)

---

## 🎨 Design

Inspirado em Stripe, Linear e Vercel:
- Paleta laranja (#f97316) sobre neutros quentes
- Tipografia **DM Sans** + **JetBrains Mono**
- Cards com bordas suaves e micro-animações
- Dark mode completo com CSS variables
- Skeleton loaders em todos os estados de carregamento

---

## 🚢 Deploy

| Plataforma | Serviço |
|------------|---------|
| **Vercel** | Frontend (`client/`) |
| **Render** | Backend (`server/`) |
| **Supabase / Railway** | PostgreSQL |

---

## 📄 Licença

MIT © 2024 BuscaPneu
