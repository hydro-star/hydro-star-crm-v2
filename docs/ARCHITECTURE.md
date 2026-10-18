# Arquitetura inicial

## Visão geral
A aplicação será uma interface web responsiva para uso interno da Hydro Star. O frontend será separado das operações privilegiadas e das integrações externas.

## Componentes planejados
- **Web:** Next.js, React e TypeScript.
- **Identidade:** Firebase Authentication.
- **Persistência:** Cloud Firestore.
- **Arquivos:** Firebase Storage, quando necessário.
- **Servidor:** Firebase Cloud Functions para validações privilegiadas, webhooks e integrações que usem segredos.
- **Automação:** GitHub Actions para checagens e publicação.

## Áreas funcionais
1. Clientes e contatos.
2. Equipamentos e histórico.
3. Catálogo de serviços e materiais.
4. Orçamentos.
5. Agenda e ordens de serviço.
6. Relatórios e administração.

## Regras de domínio importantes
- Orçamentos emitidos devem guardar uma cópia dos nomes, quantidades, preços e custos usados na emissão. Alterar o catálogo depois não deve mudar orçamentos antigos.
- Valores financeiros devem ser validados e calculados de forma consistente; não confiar apenas em valores enviados pelo navegador.
- Operações sensíveis devem validar identidade e autorização no servidor.
- Integrações externas devem ter limites, tratamento de erros e registro de eventos sem expor segredos.

## Ambientes
Separar desenvolvimento e produção. Não usar dados reais de clientes em testes. Configurações locais ficam fora do Git; o repositório contém apenas nomes de variáveis de exemplo.