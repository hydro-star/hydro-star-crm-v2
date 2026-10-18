# Integração Gemini — ESPECIFICAÇÃO do orçamento

Esta pasta contém um Cloudflare Worker para manter a chave da API do Gemini fora do navegador. A interface do CRM fica em GitHub Pages; por isso, a chamada de IA precisa de um endpoint separado.

## O que já está implementado na branch

- Campo ESPECIFICAÇÃO no formulário do orçamento.
- Botão Gerar especificação com IA, que usa os itens de Mão de obra / serviços.
- O texto gerado fica editável e só é salvo no orçamento quando o usuário salva o formulário.
- Configuração da URL do Worker em Dados e configurações. O endereço fica salvo apenas no navegador utilizado.
- O Worker mantém a chave do Gemini como segredo, limita o tamanho da entrada e tem um limitador de solicitações por IP.

## Publicar o serviço de IA (uma vez)

É necessário ter uma conta Cloudflare e uma chave da Gemini API. O nível gratuito da API tem limites e condições que podem mudar. No nível gratuito, o Google informa que o conteúdo enviado pode ser usado para melhorar os produtos; não envie dados pessoais do cliente, endereço, telefone, valores ou outras informações sensíveis para a IA. O Worker encaminha apenas a descrição dos serviços.

1. Instale o Wrangler seguindo a documentação oficial da Cloudflare e entre na sua conta com o comando: npx wrangler login.
2. Entre nesta pasta: worker.
3. Publique o Worker com o comando: npx wrangler deploy.
4. Configure a chave como segredo, sem colocá-la em arquivos do repositório: npx wrangler secret put GEMINI_API_KEY. Cole a chave quando o terminal solicitar.
5. Opcionalmente, configure o modelo com npx wrangler secret put GEMINI_MODEL se precisar usar outro modelo habilitado no nível gratuito. O padrão configurado é gemini-2.5-flash.
6. No CRM, abra Dados e configurações, cole a URL HTTPS do Worker seguida de /generate-specification e clique em Salvar conexão.

## Teste seguro

Crie um orçamento de teste com uma descrição genérica, por exemplo: “substituir a fonte da cromoterapia”. Gere a especificação, confira se o texto não inventa etapas e salve o orçamento.

## Importante

- A branch não publica automaticamente o Worker nem altera a main.
- A API gratuita tem limites de uso e disponibilidade por modelo/região. A configuração da conta Google pode ser necessária.
- A política de dados do nível gratuito pode permitir uso dos prompts para melhorar produtos; use somente descrições técnicas sem dados pessoais.
- O CORS permite o site oficial do CRM e localhost para testes. Se o domínio de publicação mudar, atualize ALLOWED_ORIGINS em worker/index.js.
- O limitador do Worker é configurado em worker/wrangler.toml; confirme que o recurso está disponível na conta/plano Cloudflare antes da publicação.
- A chave do Gemini nunca deve ser colocada no JavaScript do CRM, em index.html ou em um commit do Git.
