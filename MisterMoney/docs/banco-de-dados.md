# Banco de dados — MisterMoney

Levantamento feito diretamente no SQL Server (SSMS) em `localhost`, database `MisterMoney`.

## Visão geral

- 7 tabelas base, todas vazias no momento do levantamento.
- 4 views de apoio para os indicadores do dashboard.
- Nenhuma stored procedure criada, mas existe a trigger `trg_usuarios_dados_iniciais`:
  ao inserir em `usuarios`, ela cria as contas `Pessoal` (cpf) e `Empresa (MEI)` (cnpj)
  e 15 categorias padrão (8 para cnpj, 7 para cpf). O seed do backend reaproveita esses registros.
- Convenções: `id int` identity por tabela, `criado_em datetime2 default sysdatetime()`,
  valores monetários `decimal`, dados de tempo como `date`/`datetime2`.

## Conexão

Variáveis sugeridas (ver `.env.example`):

| Variável | Valor atual no ambiente |
| --- | --- |
| `MSSQL_SERVER` | `localhost` |
| `MSSQL_PORT` | `1433` |
| `MSSQL_DATABASE` | `MisterMoney` |
| `MSSQL_WINDOWS_AUTH` | `true` |
| `MSSQL_ENCRYPT` | `false` |

> A configuração atual usa Windows Authentication. Para user/password, trocar
> `MSSQL_WINDOWS_AUTH` para `false` e preencher `MSSQL_USER`/`MSSQL_PASSWORD`.

## Tabelas

### `usuarios`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `nome` | nvarchar(100) | obrigatório |
| `email` | nvarchar(255) | obrigatório, UNIQUE |
| `senha_hash` | nvarchar(255) | obrigatório |
| `criado_em` | datetime2 | default `sysdatetime()` |

### `contas`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE) |
| `tipo` | nvarchar(10) | CHECK: `cpf` ou `cnpj`; UNIQUE por usuário |
| `nome` | nvarchar(100) | obrigatório |
| `documento` | nvarchar(20) | opcional |
| `saldo_inicial` | decimal | default 0 |
| `criado_em` | datetime2 | default `sysdatetime()` |

### `categorias`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE, composta) |
| `conta_id` | int | FK → `contas(id, usuario_id)` (CASCADE); UNIQUE `(conta_id, nome, tipo)` |
| `nome` | nvarchar(60) | obrigatório |
| `tipo` | nvarchar(10) | CHECK: `despesa` ou `receita` |

### `transacoes`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE, composta) |
| `conta_id` | int | FK → `contas(id, usuario_id)` (CASCADE) |
| `categoria_id` | int | opcional; FK → `categorias(id, conta_id)` (NO_ACTION) |
| `tipo` | nvarchar(10) | CHECK: `receita`, `despesa` ou `imposto` |
| `valor` | decimal | CHECK > 0 |
| `descricao` | nvarchar(255) | opcional |
| `data` | date | default = data atual |
| `criado_em` | datetime2 | default `sysdatetime()` |

### `transferencias`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE, composta) |
| `origem_conta_id` | int | FK → `contas(id, usuario_id)` |
| `destino_conta_id` | int | FK → `contas(id, usuario_id)` |
| `valor` | decimal | CHECK > 0 |
| `descricao` | nvarchar(255) | opcional |
| `data` | date | default = data atual |
| `criado_em` | datetime2 | default `sysdatetime()` |

CHECK adicional: `origem_conta_id <> destino_conta_id`.

### `orcamentos`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE, composta) |
| `categoria_id` | int | FK → `categorias(id, usuario_id)` (CASCADE); UNIQUE `(categoria_id, mes)` |
| `mes` | date | CHECK: sempre dia 1 |
| `limite` | decimal | CHECK > 0 |
| `criado_em` | datetime2 | default `sysdatetime()` |

### `impostos`
| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | int | PK |
| `usuario_id` | int | FK → `usuarios.id` (CASCADE, composta) |
| `conta_id` | int | FK → `contas(id, usuario_id)` (CASCADE) |
| `tipo` | nvarchar(10) | CHECK: `irpf` ou `das` |
| `competencia` | date | CHECK: sempre dia 1; UNIQUE `(conta_id, tipo, competencia)` |
| `valor_estimado` | decimal | CHECK >= 0 |
| `vencimento` | date | opcional |
| `pago_em` | date | opcional |
| `criado_em` | datetime2 | default `sysdatetime()` |

## Views

| View | O que entrega |
| --- | --- |
| `v_saldo_contas` | `saldo = saldo_inicial + receitas - despesas/impostos + transferências recebidas - enviadas`, por conta. |
| `v_resumo_mensal` | `receita`, `custos`, `impostos` e `lucro_liquido` agrupados por usuário/conta/mês. |
| `v_receita_anual` | Soma das receitas do ano para contas do tipo `cnpj`. |
| `v_orcamento_progresso` | `gasto`, `percentual` e `estourou` por orçamento, comparando despesas do mês com o limite. |

## Observações para a integração

- Toda consulta de dados do usuário deve filtrar por `usuario_id` (as FKs compostas reforçam isso).
- As views já entregam os números usados pelo dashboard; evite recalcular isso no front.
- `categorias` e `orcamentos` são por conta/mês — o front precisa enviar `conta_id` e `usuario_id` nas escritas.
- Como o banco está vazio, o primeiro passo funcional pode incluir um seed de desenvolvimento (usuário de teste + contas + categorias).
