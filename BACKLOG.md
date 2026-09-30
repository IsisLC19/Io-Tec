# BACKLOG DE DESENVOLVIMENTO - E-COMMERCE I-TEC (LOJA & ADMIN)

## 1. Visão Geral e Requisitos
Este documento especifica o backlog de requisitos, validações e esquema do banco de dados Supabase para a aplicação do Lado da Loja do E-commerce I-Tec.

---

## 2. Esquema do Banco de Dados Supabase & Operações
Todas as tabelas do banco de dados foram auditadas para garantir alinhamento total com as operações REST do Supabase.

### 2.1. Tabelas
1. **`categories`**
   - `id`: uuid (PK)
   - `name`: text
   - `created_at`: timestamptz

2. **`products`**
   - `id`: uuid (PK)
   - `category_id`: uuid (FK -> categories.id)
   - `name`: text
   - `description`: text
   - `price`: numeric (>= 0)
   - `stock`: integer (>= 0)
   - `photo_url`: text
   - `created_at`: timestamptz

3. **`coupons`**
   - `id`: uuid (PK)
   - `code`: text
   - `type`: text ('percent' | 'fixed')
   - `value`: numeric (> 0)
   - `expires_at`: timestamptz
   - `active`: boolean

4. **`promotions`**
   - `id`: uuid (PK)
   - `product_id`: uuid (FK -> products.id, opcional)
   - `category_id`: uuid (FK -> categories.id, opcional)
   - `discount_percent`: numeric (0 a 100)
   - `starts_at`: timestamptz
   - `expires_at`: timestamptz

5. **`customers`**
   - `id`: uuid (PK)
   - `name`: text
   - `email`: text
   - `phone`: text
   - `address`: jsonb / text
   - `created_at`: timestamptz

6. **`orders` & `order_items`**
   - `orders`: `id`, `customer_id`, `coupon_id`, `total`, `status`, `created_at`
   - `order_items`: `id`, `order_id`, `product_id`, `quantity`, `unit_price`

---

## 3. Itens do Backlog & Regras de Negócio (Ajustes e Correções)

| ID | Item / Requisito | Descrição / Solução | Status |
|---|---|---|---|
| **CORR-01** | **Chave de Autenticação Supabase** | Substituir chave anon pública pela secret key para evitar erro `401 Unauthorized` / RLS nas operações de escrita (POST/PATCH/DELETE). | Pendente |
| **AJUS-01** | **Máscaras e Validação em Clientes** | Implementar máscaras em tempo de digitação no cadastro de cliente: Telefone `(XX) XXXXX-XXXX`, e validação de formato para Email e Endereço. | Pendente |
| **AJUS-02** | **Validação de Estoque Negativo no Cadastro** | Impedir a digitação ou envio de valores de estoque menores que 0 ao cadastrar produto (`min="0"` e validação JS). | Pendente |
| **AJUS-03** | **Edição do Estoque via Modal e Botões +/-** | Corrigir a persistência do valor de estoque tanto ao salvar a edição no modal quanto ao utilizar os botões de incremento/decremento rápido. | Pendente |
| **AJUS-04** | **Validação de Valores Negativos em Cupons/Promoções** | Garantir que cupons e promoções aceitem apenas valores positivos (`min="0.01"` ou `min="1"`). | Pendente |
| **REL-01** | **Relatório do Backlog** | Armazenar o documento de relatório de execução `RELATORIO_BACKLOG.md` no repositório. | Pendente |
