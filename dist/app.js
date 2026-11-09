const tiers=[{number:1,end:'2026-11-16T00:00:00-03:00',cash:120,credit:140,installments:4},{number:2,end:'2026-12-01T00:00:00-03:00',cash:150,credit:180,installments:4},{number:3,end:'2026-12-07T00:00:00-03:00',cash:200,credit:220,installments:5}];
const tier=tiers.find(t=>Date.now()<new Date(t.end).getTime());
const money=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const form=document.querySelector('form'),note=document.querySelector('#form-note');
document.querySelectorAll('[data-tier]').forEach(card=>{const n=Number(card.dataset.tier);card.classList.toggle('featured',n===tier?.number);card.querySelector('.status').textContent=n===tier?.number?'ABERTO':!tier||n<tier.number?'ENCERRADO':'EM BREVE';const a=card.querySelector('a');if(a&&n!==tier?.number)a.remove();if(n===tier?.number&&!a){card.querySelector('.tier-note')?.remove();const link=document.createElement('a');link.href='#inscricao';link.className='button';link.textContent='Escolher este lote ↗';card.append(link)}});
function updateSummary(){document.querySelector('#pix-note').hidden=form.payment.value!=='PIX';document.querySelector('#cash-note').hidden=!['Dinheiro','Crédito'].includes(form.payment.value);document.querySelector('#summary-tier').textContent=tier?`${tier.number}º lote`:'Inscrições encerradas';document.querySelector('#summary-price').textContent=tier?form.payment.value==='Crédito'?`${money(tier.credit)} · até ${tier.installments}x`:form.payment.value?money(tier.cash):`A partir de ${money(tier.cash)}`:'Prazo encerrado'}
form.paymentDate.max=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
form.payment.addEventListener('change',updateSummary);updateSummary();
if(window.RAIZES_CONFIG?.scriptUrl)note.textContent='Confira as orientações acima antes de enviar. Envie apenas uma inscrição por participante.';
if(!tier){form.querySelector('button').disabled=true;note.textContent='O prazo de inscrição terminou em 6 de dezembro de 2026.'}
let pendingSubmission;
form.addEventListener('submit', async event => {
  event.preventDefault();
  const scriptUrl = window.RAIZES_CONFIG?.scriptUrl;
  const button = form.querySelector('button');
  if (!tier || !scriptUrl || button.disabled) return;

  button.disabled = true;
  note.textContent = 'Enviando sua solicitação…';
  const fields = new URLSearchParams(new FormData(form));
  const fingerprint = fields.toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  try {
    if (pendingSubmission?.fingerprint !== fingerprint) {
      pendingSubmission = {fingerprint, requestId: crypto.randomUUID()};
    }
    const {requestId} = pendingSubmission;
    fields.set('requestId', requestId);
    fields.set('responseFormat', 'json');
    const response = await fetch(scriptUrl, {
      method: 'POST', body: fields, credentials: 'omit', signal: controller.signal
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const result = await response.json();
    if (result.requestId !== requestId || typeof result.ok !== 'boolean') {
      throw new Error('Resposta sem confirmação');
    }
    if (!result.ok) {
      note.textContent = result.error || 'Não foi possível registrar a solicitação. Confira os dados.';
      return;
    }
    const paidByPix = fields.get('payment') === 'PIX';
    pendingSubmission = undefined;
    form.reset();
    updateSummary();
    note.textContent = paidByPix
      ? 'Solicitação recebida! ATENÇÃO: envie o comprovante PIX ao seu líder responsável. A conferência será feita após o encerramento do lote. Sua inscrição só será validada após ele conferir o comprovante.'
      : 'Solicitação recebida! Pague presencialmente na igreja, diretamente com a tesouraria. Sua vaga será confirmada após a conferência do pagamento.';
  } catch {
    note.textContent = pendingSubmission
      ? 'Não recebemos a confirmação. Sua solicitação pode já ter sido registrada. Não envie outra inscrição. Consulte a organização com este protocolo: ' + pendingSubmission.requestId
      : 'Não foi possível iniciar o envio. Abra o site no Safari ou Chrome e tente novamente.';
  } finally {
    clearTimeout(timer);
    button.disabled = false;
  }
});
