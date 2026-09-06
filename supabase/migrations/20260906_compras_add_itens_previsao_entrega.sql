-- ComprasVarejo.tsx sempre teve campos de "itens" (descrição textual) e
-- "previsão de entrega" na ordem de compra, mas a tabela `compras` criada em
-- 20260906_varejo_compras_e_venda_avulso.sql não tinha essas colunas.

ALTER TABLE compras ADD COLUMN itens text;
ALTER TABLE compras ADD COLUMN previsao_entrega date;
