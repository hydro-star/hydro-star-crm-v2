# Geração de PDF de orçamento — plano de implementação

## Objetivo

Gerar, a partir de um orçamento salvo no CRM, um PDF reutilizável que preserve a identidade visual e a estrutura do modelo comercial Hydro Star usado no Canva. O PDF não deve ser publicado no sistema principal até passar por revisão visual e funcional.

## Escopo restrito

- Trabalhar somente no fluxo de orçamentos e nos arquivos estritamente necessários para a saída em PDF.
- Não alterar clientes, ordens de serviço, agenda, armazenamento local, endpoint de IA ou cálculo financeiro, salvo se um ajuste for indispensável e justificado.
- Não adicionar dados de clientes ou arquivos de orçamento preenchidos ao repositório.
- Não incluir observações internas no documento destinado ao cliente.

## Campos a preencher

| Página do modelo | Conteúdo | Origem no CRM |
| --- | --- | --- |
| 1 — Capa | Nome do cliente | Cliente selecionado |
| 1 — Capa | Nome do serviço | Título do orçamento |
| 1 — Capa | Responsável pela proposta | Campo Responsável |
| 1 — Capa | Data | Data do orçamento |
| 2 — Especificação | Texto da especificação | Campo specification, gerado por IA e revisável |
| 3 — Investimento | Materiais, mão de obra e total | Itens do orçamento e cálculo já existente |
| 3 — Investimento | Opções de desconto | Opções calculadas já existentes: 0%, 4%, 7%, 5%, 10% e 15% |
| 4 — Materiais | Relação de materiais | Itens com tipo material |
| 5 — Condições | Prazo de entrega | Campo deliveryDeadline, em dias |
| 5 — Condições | Garantia e contatos da empresa | Dados comerciais atuais da Hydro Star |

## Regras

1. Reutilizar os cálculos existentes; não recalcular os preços de maneira diferente no gerador de PDF.
2. Não mostrar notes (observações internas) ao cliente.
3. Não inventar procedimentos na especificação; utilizar somente o texto salvo no orçamento.
4. Textos longos devem quebrar linhas sem sobrepor outros elementos. Se o espaço não for suficiente, interromper a geração com uma mensagem clara em vez de criar um PDF visualmente quebrado.
5. O nome e os dados do cliente devem vir do orçamento aberto, nunca de um exemplo fixo.
6. A geração do arquivo não deve salvar automaticamente o orçamento nem mudar seu status.

## Estado atual da implementação

Foi adicionada uma primeira versão funcional do gerador de pré-visualização para impressão, com cinco páginas A4, identidade visual em ameixa/dourado, campos dinâmicos do orçamento, valores e descontos existentes, lista de materiais e condições comerciais. O botão **Gerar PDF** aparece na lista de orçamentos e abre uma nova janela; nela, a pessoa pode usar **Imprimir / Salvar como PDF** ou fechar a pré-visualização.

Esta versão recria a estrutura com CSS e HTML e **ainda não é uma cópia pixel a pixel do arquivo do Canva**. O PDF de referência contém dados de uma cliente real e não é usado como fundo. Para uma correspondência visual exata, ainda será necessário obter/exportar do Canva os elementos gráficos reutilizáveis sem os dados da cliente e fazer uma revisão visual comparativa.

## Critérios de validação

- Cliente e serviço corretos em todas as páginas em que aparecem.
- Valores de materiais, mão de obra, total e descontos iguais aos do CRM.
- Especificação longa e curta sem sobreposição.
- Prazo apresentado em dias.
- Nenhuma observação interna ou dado de outro cliente no arquivo.
- Pré-visualização antes de imprimir/baixar.
- Testar bloqueio de pop-ups e impressão em navegadores comuns.
- Teste sem alterações na agenda, clientes, ordens de serviço e armazenamento local.
- Comparar visualmente com o modelo do Canva antes de aprovar a publicação.