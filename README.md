# Hydro Star CRM

CRM inicial da Hydro Star para organizar clientes, orçamentos e ordens de serviço de instalação e manutenção de banheiras de hidromassagem, spas e ofurôs.

## Como usar

A aplicação inicial é uma página estática: abra `index.html` em um navegador moderno ou publique o repositório pelo GitHub Pages. Não precisa configurar Firebase, instalar dependências nem criar servidor.

## Funcionalidades disponíveis

- Cadastro, edição, pesquisa e exclusão de clientes.
- Cadastro, edição e acompanhamento de orçamentos.
- Cadastro, edição e acompanhamento de ordens de serviço.
- Painel com contagens e valores.
- Exportação e importação de backup em JSON.
- Armazenamento local pelo IndexedDB, com fallback para localStorage.

## Importante sobre os dados

Os dados são guardados **somente no navegador e no perfil de usuário atual**. Eles não são enviados ao GitHub nem sincronizados entre dispositivos ou navegadores. Limpar os dados do navegador pode apagar os registros. Exporte backups regularmente e guarde-os em local seguro. Evite armazenar informações altamente sensíveis.

O repositório contém o código da aplicação, não os cadastros feitos pelos usuários.

## Publicar com GitHub Pages

1. Abra **Settings** do repositório.
2. Entre em **Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`, depois salve.
5. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

## Próximas etapas planejadas

- Melhorar impressão e geração de orçamentos.
- Adicionar catálogo de serviços e materiais e cálculo de custos/margem.
- Expandir histórico dos equipamentos e atendimentos.
- Avaliar futuramente sincronização segura entre usuários, caso seja necessária.

## Segurança

- Não coloque dados de clientes, backups, senhas, tokens ou chaves privadas no repositório.
- O armazenamento local não é um backup automático; exporte o arquivo JSON periodicamente.
- Para uso em equipe ou sincronização entre dispositivos, será necessário adicionar um backend com autenticação e regras de acesso adequadas.
