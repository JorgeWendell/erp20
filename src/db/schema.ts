import {
  boolean,
  date,
  decimal,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});


export const jobTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(), 
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const jobUsersTable = pgTable("job_users", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const clientsTable = pgTable("clients", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  cpfCnpj: text("cpf_cnpj"),
  endereco: text("endereco"),
  numero: text("numero"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const suppliersTable = pgTable("suppliers", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  cpfCnpj: text("cpf_cnpj"),
  endereco: text("endereco"),
  numero: text("numero"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const locationsTable = pgTable("locations", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  endereco: text("endereco"),
  numero: text("numero"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  cep: text("cep"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const groupsTable = pgTable("groups", {
  id: text("id").primaryKey(),
  cod: text("cod").notNull(),
  nome: text("nome").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const subgroupsTable = pgTable("subgroups", {
  id: text("id").primaryKey(),
  cod: text("cod").notNull(),
  nome: text("nome").notNull(),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const undMedidaEnum = pgEnum("und_medida", ["mts", "br", "un"]);

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  cod: text("cod").notNull(),
  grupoId: text("grupo_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "restrict" }),
  subgrupoId: text("subgrupo_id")
    .notNull()
    .references(() => subgroupsTable.id, { onDelete: "restrict" }),
  nome: text("nome").notNull(),
  undMedida: undMedidaEnum("und_medida").notNull().default("un"),
  referencia1: text("referencia_1"),
  referencia2: text("referencia_2"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const stockTable = pgTable("stock", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => locationsTable.id, { onDelete: "cascade" }),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const comprasStatusEnum = pgEnum("compras_status", [
  "pendente",
  "aprovado",
  "reprovado",
  "entregue",
]);

export const comprasTable = pgTable("compras", {
  id: text("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "restrict" }),
  supplierId: text("supplier_id")
    .notNull()
    .references(() => suppliersTable.id, { onDelete: "restrict" }),
  locationId: text("location_id")
    .notNull()
    .references(() => locationsTable.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  undMedida: undMedidaEnum("und_medida").notNull(),
  temNota: boolean("tem_nota").notNull().default(false),
  notaFileUrl: text("nota_file_url"),
  status: comprasStatusEnum("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});