# Design system — TransFluxo

Este diretório reúne a base visual do produto TransFluxo. A direção foi inspirada
nas referências `transport.webp` e `transport2.webp`, com superfícies claras,
cartões amplos, cantos generosos, tipografia forte e detalhes de alto contraste.

**Assinatura da marca:** Movendo entregas, conectando oportunidades.

## Arquivos

- `index.html`: catálogo navegável de fundações e componentes.
- `tokens.css`: cores, tipografia, espaçamentos, raios, sombras e movimentos.
- `design-system.css`: estilos dos componentes e da página de documentação.
- `script.js`: navegação ativa e cópia dos valores de cor.
- `references/`: imagens fornecidas como referência visual e símbolo original do “A”.

## Como usar

Abra `index.html` no navegador para consultar o sistema. Em novas telas, importe
primeiro `tokens.css` e use as variáveis `--color-*`, `--space-*`, `--radius-*`
e `--shadow-*` em vez de repetir valores.

## Princípios

1. Branco como superfície principal e azul profundo como cor de confiança.
2. Amarelo de destaque para atenção, seleção e momentos de decisão.
3. Laranja reservado para urgência operacional e leilões encerrando.
4. Informação logística deve ser escaneável: rota primeiro, detalhes depois.

## Arquitetura de acesso

O produto possui três perfis com permissões diferentes:

1. **Empresa:** publica rotas, compara propostas, acompanha entregas, financeiro,
   equipe e configurações.
2. **Transportador:** encontra oportunidades, envia propostas, acompanha
   entregas, veículos, documentos, financeiro, avaliações e configurações.
3. **Administrador:** aprova ou reprova cadastros, gerencia usuários, supervisiona
   rotas, ocorrências, financeiro e configurações da plataforma.

Empresas e transportadores entram inicialmente com o status `Em análise`.
As funções operacionais são liberadas somente depois da aprovação administrativa.
Na fila administrativa, cadastros de empresas e transportadores são alternados por
abas, exibindo um perfil por vez em largura total. Cada cadastro possui uma análise
documental com prévia de imagens e PDFs, lista de pendências e decisão de aprovação
ou reprovação.

Quando um cadastro é aprovado, a TransFluxo gera um e-mail transacional personalizado
para o perfil. A comunicação confirma a liberação, apresenta os próximos passos,
oferece acesso direto à plataforma e reforça orientações de segurança. O histórico
do envio deverá ser conectado ao futuro provedor de e-mail.

A área `Comunicações` funciona como central de atendimento. Empresas e
transportadores podem abrir chamados de dúvida, bug, documentação, financeiro,
sugestão ou outro assunto. Administradores recebem todos os chamados em uma caixa
de entrada, respondem pelo chat e controlam os estados de espera e resolução.

Na área administrativa, a base de usuários possui abas alternáveis de `Empresas`
e `Transportadores`, exibindo somente o perfil selecionado. Cada registro permite
consultar todos os dados fornecidos no cadastro e abrir os documentos armazenados,
mesmo depois da aprovação.

> As credenciais fixas e a persistência no navegador existem apenas para demonstrar
> o protótipo. A versão real deve usar autenticação no servidor, hash de senhas,
> armazenamento privado dos documentos, recuperação segura, trilha de auditoria e
> autenticação em dois fatores para admins.
5. Cartões devem ter bastante respiro, borda discreta e hierarquia forte.
