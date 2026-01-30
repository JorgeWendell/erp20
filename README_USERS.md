# Manual do Usuário — ERP20

Este manual descreve como usar o **ERP20** no dia a dia, na visão de um **usuário padrão**. As telas e opções podem variar conforme seu perfil de acesso.

---

## 1. Acesso ao sistema

### 1.1 Fazer login

1. Acesse o endereço do sistema (ex.: `http://localhost:3000` ou o informado pela sua empresa).
2. Na tela de **login**, informe:
   - **E-mail:** o e-mail da sua conta.
   - **Senha:** sua senha.
3. Opcional: marque **Lembrar de mim** para manter o acesso no mesmo navegador.
4. Clique em **Entrar**.

Se os dados estiverem corretos, você será levado ao **Dashboard**.

**Dica:** Use um navegador atualizado (Chrome, Edge, Firefox, etc.) e evite bloqueadores que possam atrapalhar o login.

---

### 1.2 Esqueci minha senha

1. Na tela de login, clique em **Esqueci minha senha** (ou link equivalente).
2. Informe o **e-mail** da sua conta.
3. Clique em **Enviar** (ou **Recuperar senha**).
4. Verifique seu e-mail. Você receberá um link para **redefinir a senha**.
5. Clique no link, defina uma nova senha e confirme.

Se não receber o e-mail, verifique a pasta de spam ou entre em contato com o suporte.

---

### 1.3 Sair do sistema (logout)

Use a opção de **sair** ou **logout** no canto superior da tela (ou no menu do usuário, se existir). Isso encerra sua sessão de forma segura.

---

## 2. Interface principal

Após o login, você verá:

- **Menu lateral (sidebar):** links para as principais áreas do sistema.
- **Área central:** o conteúdo da tela atual (ex.: Dashboard, Estoque, Configurações).

### 2.1 Menu lateral

No menu à esquerda aparecem, por exemplo:

| Item | O que faz |
|------|-----------|
| **Dashboard** | Painel inicial |
| **Produção** | Módulo em desenvolvimento |
| **Estoque** | Consultar estoque por local |
| **Compras** | Módulo em desenvolvimento |
| **Engenharia** | Módulo em desenvolvimento |
| **Relatórios** | Módulo em desenvolvimento |
| **Configurações** | Cadastros e gestão (usuários, clientes, fornecedores, etc.) |
| **Suporte** | Abrir chamados |

Clique em um item para ir até a tela correspondente.

---

## 3. Dashboard

O **Dashboard** é a primeira tela após o login. Ela mostra um resumo inicial do sistema. Use o menu lateral para acessar as outras funções.

---

## 4. Estoque

Aqui você **consulta o estoque** por local (filial, galpão, etc.).

### 4.1 Ver estoque de um local

1. Acesse **Estoque** no menu.
2. Serão exibidos **botões com os nomes dos locais** cadastrados.
3. Clique no **local** desejado. O botão do local selecionado fica destacado (ex.: em azul).
4. Abaixo aparece a **tabela de estoque** daquele local, com:
   - **Código** (no formato grupo - subgrupo - produto)
   - **Produto**
   - **Quantidade**
   - **Unidade** (mts, br, un, etc.)

### 4.2 Paginação

Se houver muitos itens, use os controles de **paginação** (Anterior, Próximo e números de página) no rodapé da tabela para navegar. Por padrão são mostrados **10 itens por página**.

### 4.3 Nenhum local aparece

Se não houver locais, a tela informa que é necessário cadastrar locais em **Configurações → Cadastro de Locais**. Peça ao responsável pelo sistema para configurar os locais.

---

## 5. Suporte

Use **Suporte** para **abrir chamados** (dúvidas, problemas, solicitações).

### 5.1 Abrir um chamado

1. Acesse **Suporte** no menu.
2. Clique no botão **Abrir chamado**.
3. Um formulário será aberto. Os campos **Usuário** e **E-mail** já vêm preenchidos com seus dados.
4. Preencha:
   - **Título:** assunto do chamado (ex.: “Erro ao imprimir relatório”).
   - **Descrição:** explique o problema ou a dúvida em detalhes (mínimo de caracteres pode ser solicitado).
5. Clique em **Enviar**.

Após o envio, você verá uma mensagem de confirmação. O suporte responderá pelo e-mail cadastrado ou pelo próprio sistema, conforme o processo da sua empresa.

---

## 6. Configurações

Em **Configurações** ficam os **cadastros** e a **gestão** de usuários, clientes, fornecedores, locais, grupos, subgrupos e produtos. O que aparece aí depende das permissões da sua conta.

Ao clicar em **Configurações**, você verá cartões com links para cada módulo. Clique no que deseja usar.

---

### 6.1 Gestão de usuários

- **O que é:** Cadastro e alteração de usuários do sistema (nome, e-mail, cargo, status ativo/inativo).
- **Onde:** Configurações → **Gestão de usuários**.

**Cadastrar usuário:** Clique em **Cadastrar Usuário**, preencha o formulário e em **Cadastrar**.

**Editar usuário:** Na tabela, clique no ícone de **ações** (⋮) na linha do usuário → **Editar**. Altere os dados e salve.

**Excluir usuário:** Ações (⋮) → **Excluir** → confirme na mensagem.

A tabela tem **paginação** (10 itens por página). Use Anterior/Próximo ou o número da página para navegar.

---

### 6.2 Gestão de cargos

- **O que é:** Cadastro de cargos (ex.: Vendedor, Analista, Gerente).
- **Onde:** Configurações → **Gestão de Cargos**.

**Cadastrar cargo:** **Novo Cargo** (ou **Cadastrar Cargo**) → preencha o nome → **Cadastrar**.

**Editar / Excluir:** Use **Ações** (⋮) na linha → **Editar** ou **Excluir** → confirme quando pedido.

---

### 6.3 Cadastro de clientes

- **O que é:** Cadastro de clientes (nome, e-mail, telefone, CPF/CNPJ, endereço, cidade, estado, CEP, etc.).
- **Onde:** Configurações → **Cadastro de Clientes**.

**Cadastrar:** **Cadastrar Cliente** → preencha o formulário → **Cadastrar**.

**Editar / Excluir:** Ações (⋮) na linha do cliente → **Editar** ou **Excluir** → confirme.

A lista possui paginação.

---

### 6.4 Cadastro de fornecedores

- **O que é:** Cadastro de fornecedores, com os mesmos tipos de dados dos clientes.
- **Onde:** Configurações → **Cadastro de Fornecedores**.

**Cadastrar:** **Cadastrar Fornecedor** → preencha → **Cadastrar**.

**Editar / Excluir:** Ações (⋮) → **Editar** ou **Excluir** → confirme.

---

### 6.5 Cadastro de locais

- **O que é:** Cadastro de locais de estoque (filiais, galpões, etc.): nome, endereço, número, bairro, cidade, CEP.
- **Onde:** Configurações → **Cadastro de Locais**.

**Cadastrar:** **Cadastrar Local** → preencha → **Cadastrar**.

**Editar / Excluir:** Ações (⋮) → **Editar** ou **Excluir** → confirme.

Os locais cadastrados aparecem em **Estoque** para consulta.

---

### 6.6 Grupos e subgrupos

- **O que é:** **Grupos** e **subgrupos** usados para organizar produtos (ex.: grupo “Ferramentas”, subgrupo “Brocas”).
- **Onde:** Configurações → **Grupos e Subgrupos**.

Na tela há abas ou seções para **Grupos** e **Subgrupos**.

**Grupos:**
- **Novo Grupo** → informe **Código** e **Nome** → **Cadastrar**.
- **Editar / Excluir:** Ações (⋮) na linha do grupo.

**Subgrupos:**
- **Novo Subgrupo** → informe **Código**, **Nome** e **Grupo** → **Cadastrar**.
- **Editar / Excluir:** Ações (⋮) na linha do subgrupo.

---

### 6.7 Cadastro de produtos

- **O que é:** Cadastro de produtos (código, grupo, subgrupo, nome, referências, unidade de medida) e definição de **em qual local** cada produto está e **em qual quantidade**.
- **Onde:** Configurações → **Cadastro de Produtos**.

**Cadastrar produto:** **Cadastrar Produto** → preencha:
- Código, **Grupo**, **Subgrupo**, Nome, Referência 1, Referência 2, **Unidade de medida** (mts, br, un) → **Cadastrar**.

**Editar produto:** Ações (⋮) → **Editar**. No diálogo haverá:
- **Dados do produto:** altere o que precisar e salve.
- **Localização e quantidade** (aba disponível só ao editar):
  - Lista de **locais** em que o produto possui estoque e a **quantidade** em cada um.
  - **Adicionar local:** clique no botão → escolha o **Local** e informe a **Quantidade** → **Salvar**.
  - Para **alterar** a quantidade: **Editar** na linha → ajuste o valor → **Salvar**.
  - Para **remover** um local do produto: **Excluir** na linha → confirme.

As quantidades informadas aqui são as que aparecem em **Estoque** ao selecionar cada local.

**Excluir produto:** Ações (⋮) → **Excluir** → confirme.

A tabela de produtos também usa **paginação** (10 itens por página).

---

## 7. Ações nas tabelas (resumo)

Em várias telas de cadastro você verá:

- **Botão principal** (ex.: Cadastrar Cliente, Novo Grupo): abre o formulário para **incluir** um novo registro.
- **Coluna “Ações”** (ícone ⋮ ou similar) em cada linha:
  - **Editar:** abre o formulário para alterar aquele registro.
  - **Excluir:** remove o registro. Sempre aparece uma **confirmação** antes de excluir.

**Importante:** A exclusão em geral não pode ser desfeita. Use com cuidado.

---

## 8. Paginação

Nas tabelas com muitos registros, são exibidos **10 itens por página**. No rodapé da tabela você encontra:

- **Anterior** / **Próximo:** mudar de página.
- **Números de página:** clicar leva direto à página desejada.

Use isso para navegar pela lista sem precisar rolar demais.

---

## 9. Glossário rápido

| Termo | Significado |
|-------|-------------|
| **Local** | Filial, galpão ou outro endereço onde há estoque. |
| **Grupo** | Categoria para organizar produtos (ex.: Ferramentas, Elétrica). |
| **Subgrupo** | Subcategoria dentro de um grupo (ex.: Brocas, Parafusos). |
| **Código (produto)** | No estoque, costuma aparecer como **grupo - subgrupo - produto**. |
| **Unidade de medida** | mts (metros), br (barras), un (unidade), etc. |
| **Chamado** | Solicitação enviada pelo Suporte (dúvida, problema ou pedido). |

---

## 10. Dúvidas ou problemas

- Use **Suporte** no menu para **abrir um chamado**.
- Em caso de erro na tela, anote a mensagem (ou tire um print) e informe no chamado.
- Para **esqueci senha**, use o link na tela de login e siga as instruções enviadas por e-mail.

---

*Manual do usuário — ERP20. Atualizado conforme as funcionalidades disponíveis no sistema.*
