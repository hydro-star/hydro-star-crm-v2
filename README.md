# Hydro Star CRM

Sistema de CRM da Hydro Star para organizar clientes, orçamentos, instalações e manutenções de banheiras de hidromassagem, spas e ofurôs.

## Funcionalidades planejadas

- Cadastro de clientes e equipamentos, com histórico de atendimentos.
- Orçamentos com materiais, mão de obra, custos e margem estimada.
- Agenda e ordens de serviço.
- Relatórios operacionais e financeiros.
- Integração futura com WhatsApp Business.

## Tecnologias planejadas

- Next.js, React e TypeScript.
- Firebase Authentication, Cloud Firestore e Firebase Storage.
- Firebase Cloud Functions para operações privilegiadas e integrações.
- GitHub Actions para validação e publicação.

## Segurança

- Nunca enviar senhas, tokens ou chaves privadas para o Git.
- Manter configurações locais em `.env.local` e versionar somente um `.env.example` sem segredos.
- Não incluir dados reais de clientes em exemplos ou testes.
- Configurar regras do Firestore e Storage com acesso negado por padrão.
- Guardar segredos do WhatsApp Business no servidor, nunca no navegador.

O desenvolvimento será realizado por etapas, com testes e documentação antes de cada implantação.