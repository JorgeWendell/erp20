# ERP20

Sistema ERP industrial em desenvolvimento. Este documento descreve como configurar e usar o sistema até o momento.

## Pré-requisitos

- **Node.js** 18+
- **PostgreSQL**
- **npm** ou **pnpm**

## Instalação

### 1. Clonar e instalar dependências

```bash
cd erp20
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/erp20"

# Autenticação (Better Auth)
BETTER_AUTH_SECRET="sua-chave-secreta-base64"
BETTER_AUTH_URL=http://localhost:3000

# Resend (e-mails: convites, suporte)
RESEND_API_KEY=sua-api-key
RESEND_FROM_EMAIL=email@seudominio.com
SUPPORT_EMAIL=email@seudominio.com

# URL base da aplicação
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Banco de dados

Aplique o schema com Drizzle:

```bash
npx drizzle-kit push
```

### 4. Subir a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Como usar o sistema

### Login e acesso

- **Login:** `/login` — e-mail e senha.
- **Esqueci a senha:** `/forgot-password`.
- **Cadastro:** `/signup` (quando habilitado).
- Após login, você é redirecionado para o **Dashboard** (`/dashboard`).

### Navegação (sidebar)

| Menu        | Rota          | Descrição                          |
|-------------|---------------|------------------------------------|
| Dashboard   | `/dashboard`  | Painel inicial                     |
| Produção    | `/producao`   | Em desenvolvimento                  |
| Estoque     | `/estoque`    | Consulta de estoque por local      |
| Compras     | `/compras`    | Em desenvolvimento                  |
| Engenharia  | `/engenharia` | Em desenvolvimento                  |
| Relatórios  | `/relatorios` | Em desenvolvimento                  |
| Configurações | `/configuracoes` | Cadastros e gestão              |
| Suporte     | `/suporte`    | Abrir chamados                      |

---

### Estoque (`/estoque`)

- Exibe **locais** cadastrados (Configurações → Cadastro de Locais).
- Clique em um local para ver a **tabela de estoque** daquele local.
- Colunas: **Código** (grupo - subgrupo - produto), **Produto**, **Quantidade**, **Unidade de medida**.
- Paginação: 10 itens por página.

Para haver itens em estoque, cadastre **produtos**, **locais**, **grupos** e **subgrupos** e use a aba **Localização e quantidade** ao editar um produto.

---

### Configurações (`/configuracoes`)

Painel com links para:

#### Gestão de usuários (`/configuracoes/gestao-usuarios`)

- Listar, criar, editar e excluir usuários.
- Vincular usuário a **cargo**.
- Status ativo/inativo.

#### Gestão de cargos (`/configuracoes/gestao-cargos`)

- CRUD de cargos (nome).

#### Cadastro de clientes (`/configuracoes/cadastro-clientes`)

- CRUD de clientes: nome, e-mail, telefone, CPF/CNPJ, endereço, cidade, estado, CEP.

#### Cadastro de fornecedores (`/configuracoes/cadastro-fornecedores`)

- CRUD de fornecedores com os mesmos campos de clientes.

#### Cadastro de locais (`/configuracoes/cadastro-locais`)

- CRUD de locais (filiais, galpões etc.): nome, endereço, número, bairro, cidade, CEP.
- Usado em **Estoque** e na **Localização e quantidade** dos produtos.

#### Grupos e subgrupos (`/configuracoes/grupos-subgrupos`)

- **Grupos:** código e nome.
- **Subgrupos:** código, nome e grupo vinculado.
- Usados na classificação de **produtos** e no código exibido em estoque.

#### Cadastro de produtos (`/configuracoes/cadastro-produtos`)

- **CRUD de produtos:** código, grupo, subgrupo, nome, referência 1, referência 2, **unidade de medida** (mts, br, un).
- Ao **editar** um produto, há a aba **Localização e quantidade**:
  - Ver estoque do produto por local.
  - Adicionar local e quantidade.
  - Editar quantidade ou remover registro de um local.
- Todas as tabelas com **paginação** (10 itens por página).

---

### Suporte (`/suporte`)

- Botão **Abrir chamado** abre um diálogo.
- Campos: usuário e e-mail (preenchidos automaticamente), **título** e **descrição**.
- Ao enviar, um e-mail é disparado para `SUPPORT_EMAIL` (Resend).

---

## Tecnologias

- **Next.js** (App Router)
- **React** 19
- **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **Better Auth** (autenticação)
- **next-safe-action** + **Zod** (server actions e validação)
- **Resend** (e-mail)
- **Tailwind CSS** + **shadcn/ui** (UI)
- **Lucide React** (ícones)

---

## Scripts

| Comando       | Descrição                |
|---------------|--------------------------|
| `npm run dev` | Desenvolvimento (hot reload) |
| `npm run build` | Build de produção    |
| `npm run start` | Servir build (após `build`) |
| `npm run lint`  | Executar ESLint     |

---

## Estrutura do banco (resumo)

- **users**, **sessions**, **accounts**, **verifications** — Better Auth.
- **jobs**, **job_users** — cargos e vínculo com usuários.
- **clients**, **suppliers** — clientes e fornecedores.
- **locations** — locais de estoque.
- **groups**, **subgroups** — grupos e subgrupos.
- **products** — produtos (grupo, subgrupo, undMedida, etc.).
- **stock** — estoque por produto e local (quantidade).

Schema completo em `src/db/schema.ts`.
