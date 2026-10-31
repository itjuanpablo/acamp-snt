/* Configure Properties > Script properties:
 SPREADSHEET_ID: ID da planilha de inscrições
 ALLOWED_ORIGIN: origem do site (sem barra final)
 RECIPIENTS: e-mails separados por vírgula; padrão: jp664165@gmail.com
 Execute setup() uma vez para criar o cabeçalho e autorizar o acesso.
 Implante como aplicativo da Web, executar como você, acesso Qualquer pessoa.
*/
function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SPREADSHEET_ID')) {
    var ss = SpreadsheetApp.create('Acampamento Raízes 2026 — Inscrições');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  if (!props.getProperty('ALLOWED_ORIGIN')) props.setProperty('ALLOWED_ORIGIN', 'https://raizes-acamp-sara-pouso-alegre-2026.jp664165.chatgpt.site');
  if (!props.getProperty('RECIPIENTS')) props.setProperty('RECIPIENTS', 'jp664165@gmail.com');
  var sheet = getSheet_();
  if (!sheet.getLastRow()) sheet.appendRow(['Protocolo','Data da inscrição','Nome completo','Líder','Equipe','Forma de pagamento','Data de pagamento informada','E-mail','Celular','Lote','Valor','Consentimento','Notificação por e-mail','Tamanho da camiseta']);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,14).setFontWeight('bold').setBackground('#4d3220').setFontColor('#f3ecdf');
  MailApp.getRemainingDailyQuota();
  console.log('Planilha: https://docs.google.com/spreadsheets/d/' + props.getProperty('SPREADSHEET_ID'));
}
function getSheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Execute setup() antes de receber inscrições.');
  var ss = SpreadsheetApp.openById(id);
  return ss.getSheetByName('Inscrições') || ss.insertSheet('Inscrições');
}
function doPost(e) {
  var p = e.parameter || {}, result = {requestId:p.requestId,ok:false}, lock = LockService.getScriptLock();
  var origin = PropertiesService.getScriptProperties().getProperty('ALLOWED_ORIGIN');
  if (!origin || !/^https?:\/\/[^/]+$/.test(origin)) return HtmlService.createHtmlOutput('Origem não configurada.');
  try {
    if (p.website) throw new Error('Solicitação inválida.');
    if (!/^[a-f0-9-]{36}$/.test(p.requestId || '')) throw new Error('Protocolo inválido.');
    if (!p.name || p.name.trim().length < 3 || p.name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '') || p.email.length > 180 || !/^[0-9()+ .-]{10,20}$/.test(p.phone || '') || p.consent !== 'on') throw new Error('Confira os dados e a autorização.');
    if (!p.leader || !p.leader.trim() || p.leader.length > 120 || !p.team || !p.team.trim() || p.team.length > 100) throw new Error('Informe líder e equipe.');
    if (['PP','P','M','G','GG','XG','XXG'].indexOf(p.shirtSize) < 0) throw new Error('Selecione o tamanho da camiseta.');
    if (['PIX','Dinheiro','Crédito'].indexOf(p.payment) < 0) throw new Error('Selecione uma forma de pagamento.');
    var today = Utilities.formatDate(new Date(),'America/Sao_Paulo','yyyy-MM-dd');
    if (p.paymentDate && (!/^\d{4}-\d{2}-\d{2}$/.test(p.paymentDate) || isNaN(Date.parse(p.paymentDate)) || new Date(p.paymentDate).toISOString().slice(0,10) !== p.paymentDate || p.paymentDate > today)) throw new Error('Data de pagamento inválida.');
    var tier = today <= '2026-11-15' ? 1 : today <= '2026-11-30' ? 2 : today <= '2026-12-06' ? 3 : 0;
    if (!tier) throw new Error('O prazo de inscrições terminou.');
    var prices = [[120,140],[150,180],[200,220]], price = prices[tier-1][p.payment === 'Crédito' ? 1 : 0];
    lock.waitLock(10000);
    var sheet = getSheet_();
    if (!sheet.getLastRow()) throw new Error('Execute setup() antes de liberar as inscrições.');
    if (sheet.getLastRow() > 1 && sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(p.requestId).matchEntireCell(true).findNext()) { result.ok = true; }
    else {
      var safe = function(v) { return /^[=+@\-]/.test(v) ? "'"+v : v; };
      sheet.appendRow([p.requestId,new Date(),safe(p.name.trim()),safe(p.leader.trim()),safe(p.team.trim()),p.payment,p.paymentDate || '',safe(p.email.trim()),safe(p.phone),tier,price,'Autorizado em '+new Date().toISOString(),'Pendente',p.shirtSize]);
      var row = sheet.getLastRow();
      result.ok = true;
      try {
        var recipients = PropertiesService.getScriptProperties().getProperty('RECIPIENTS') || 'jp664165@gmail.com';
        MailApp.sendEmail({to:recipients,subject:'Nova solicitação — Acampamento Raízes',body:'Nova solicitação de inscrição (pagamento sujeito à conferência).\n\nProtocolo: '+p.requestId+'\nNome: '+p.name+'\nLíder: '+p.leader+'\nEquipe: '+p.team+'\nTamanho da camiseta: '+p.shirtSize+'\nData de pagamento informada: '+(p.paymentDate || 'Ainda não informado')+'\nE-mail: '+p.email+'\nCelular: '+p.phone+'\nPagamento: '+p.payment+'\nLote: '+tier+'\nValor: R$ '+price+',00'+(p.payment === 'Dinheiro' ? '\nAcertar na tesouraria da igreja e avisar ao seu líder o pagamento.' : '')+'\n\nPlanilha: https://docs.google.com/spreadsheets/d/'+PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')});
        sheet.getRange(row,13).setValue('Enviado');
      } catch(mailError) { sheet.getRange(row,13).setValue('Falha: verificar execução'); console.error('Inscrição salva; falha na notificação por e-mail: '+mailError.message); }
    }
  } catch(error) { console.error(error); result.error = 'Não foi possível registrar. Confira os dados ou entre em contato com a organização.'; }
  finally { if (lock.hasLock()) lock.releaseLock(); }
  var data = JSON.stringify(result).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>Processamento concluído. Você pode voltar ao site.</p><script>window.top.postMessage('+data+','+JSON.stringify(origin)+');<\/script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
