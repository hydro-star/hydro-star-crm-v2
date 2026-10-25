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

## Evolução segura da arquitetura

O CRM é uma aplicação estática, sem etapa de build ou suíte de testes automatizada no estado atual. O JavaScript principal fica em `js/app.js`; por isso, mudanças estruturais devem ser graduais e validadas antes de avançar.

### Regras para refatoração

1. Trabalhar em uma branch de desenvolvimento; não editar `main` diretamente.
2. Fazer uma mudança funcional por vez e manter os fluxos existentes.
3. Validar a sintaxe JavaScript antes de cada alteração ser considerada pronta.
4. Conferir inicialização, navegação, formulários e persistência local após mudanças que afetem o núcleo.
5. Separar responsabilidades em módulos pequenos quando houver fronteiras claras, começando por funcionalidades isoláveis como geração de PDF.
6. Não introduzir frameworks, ferramentas de build ou dependências novas sem necessidade demonstrada.
7. Manter a lógica de cálculo separada da apresentação e não expor margem, risco ou cálculos internos no PDF do cliente.
8. Não considerar uma mudança concluída apenas porque o código foi gravado: testar o comportamento no navegador.

### Aplicação gradual de SOLID

SOLID será usado como guia, não como reescrita geral. O foco inicial é responsabilidade única e dependências explícitas: isolar cálculo de orçamento, armazenamento e exportação de PDF sem alterar a interface ou o formato dos dados existentes. Cada extração deve preservar compatibilidade e ser revisada separadamente.
