# Segurança

- Nunca commitar senhas, tokens, chaves privadas, credenciais de serviço ou arquivos de conta de serviço.
- Não inserir dados reais de clientes nos exemplos, testes ou documentação.
- Manter arquivos locais de ambiente fora do Git e usar `.env.example` apenas para documentar nomes de variáveis.
- A configuração pública do Firebase não substitui regras de segurança; configurar Authentication, Firestore e Storage adequadamente.
- Negar acesso por padrão e liberar somente operações necessárias a usuários autenticados e autorizados.
- Validar permissões e dados sensíveis em regras do Firebase e/ou funções de servidor.
- Guardar segredos do WhatsApp Business e credenciais administrativas apenas em ambiente de servidor.
- Não registrar senhas, tokens ou conteúdo sensível nos logs.
- Antes de importar dados ou publicar mudanças, fazer backup e validar em ambiente de teste.
- Se um segredo for publicado por engano, revogá-lo/rotacioná-lo imediatamente; apagar o arquivo do Git não torna o segredo seguro novamente.