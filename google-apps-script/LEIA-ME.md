# Ativar inscrições

A integração foi implantada na conta jp664165@gmail.com. Nenhuma cobrança é realizada pelo formulário.

1. A função `setup()` cria automaticamente a planilha no Google Drive da conta que autorizar o script.
2. Na planilha, abra **Extensões → Apps Script**. Cole o conteúdo de `Code.gs`.
3. Em **Configurações do projeto → Propriedades do script**, adicione:
   - `SPREADSHEET_ID`: preenchido automaticamente por `setup()`.
   - `ALLOWED_ORIGIN`: origem exata do site, sem barra final: `https://raizes-acamp-sara-pouso-alegre-2026.jp664165.chatgpt.site`. Para teste local: `http://localhost:4173`.
   - `RECIPIENTS`: `jp664165@gmail.com`. Depois, acrescente os outros dois e-mails separados por vírgula.
4. Execute `setup` e autorize acesso à planilha e envio de e-mail.
5. Selecione **Implantar → Nova implantação → Aplicativo da Web**. Executar como: sua conta. Quem tem acesso: **Qualquer pessoa**.
6. Copie a URL terminada em `/exec` para `dist/config.js`, no campo `scriptUrl`.
7. Publique a atualização e faça uma inscrição de teste. Confira tanto a linha na planilha como a notificação no e-mail.

A planilha é o registro principal. Se a cota de e-mail do Apps Script for atingida, a inscrição continua gravada e a falha de notificação aparece no registro de execução. O e-mail do participante não recebe mensagens automáticas nesta versão.

O lote e o valor são calculados novamente no servidor, pelo horário de São Paulo. Reenvios do mesmo protocolo não duplicam o registro. A organização confirma a vaga após conferir o pagamento; o envio do formulário é apenas a solicitação.

O Apps Script tem limites de uso. Antes de divulgar amplamente, teste a integração publicada, restrinja o acesso à planilha à equipe e defina o processo de cobrança e confirmação. Para modificar o código do script após publicar, atualize sua implantação.

## Projeto preparado no Google

https://script.google.com/home/projects/1SONoGFABcIVY-2RwQmNfWkRE0ixp_dPum2W8yJMgzACujQYkbvgm4QPv/edit

O código já foi salvo nesse projeto. Falta autorizar a execução de `setup`, publicar como aplicativo da Web e preencher a URL `/exec` em `dist/config.js`.

Campos incluídos: nome completo, líder, equipe, forma de pagamento e data de pagamento informada (opcional). A planilha também guarda contato, data de inscrição, lote, valor, consentimento e situação da notificação. Data informada não é comprovação de pagamento.

Planilha criada: https://docs.google.com/spreadsheets/d/1V8raNd3QahwDd5vqRR254QqgQ5PxzTlqmaEmDjl3QqI/edit

Endpoint: https://script.google.com/macros/s/AKfycbz3a8nJFGAozRHfAOoYt38ogerU0V7N5KWl099yLd2LV64N8ajD1uNvrxhsSJMp4I9qkQ/exec
