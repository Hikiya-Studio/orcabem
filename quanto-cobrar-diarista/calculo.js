/* Cálculo e texto do orçamento desta página */
const $=id=>document.getElementById(id);
const R=window.orcaReais||(id=>+String($(id).value).replace(/\./g,'').replace(',','.')||0);
const FR=window.orcaFormataReais||(n=>String(n));
const atualizaZap=window.orcaEnvio('texto');
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function horasTxt(h){
  const t=Math.round(h*2)/2;
  return t.toLocaleString('pt-BR',{maximumFractionDigits:1})+' h';
}
function calc(){
  const quartos=Math.max(0,+$('quartos').value||0);
  const banheiros=Math.max(0,+$('banheiros').value||0);
  const mult=+$('tipo').value||1;
  let extrasH=0;const extras=[];
  document.querySelectorAll('#extras input:checked').forEach(c=>{extrasH+=+c.dataset.h;extras.push(c.dataset.txt)});
  const horas=(1.5+quartos*1+banheiros*0.75)*mult+extrasH;
  const hora=R('hora');
  const transp=R('transporte');
  const prod=R('produtos');
  const minimo=R('minimo');
  const trabalho=horas*hora;
  const conta=Math.ceil((trabalho+transp+prod)/5)*5;
  const base=Math.max(conta,minimo);
  const ajuste=Math.abs(R('ajuste'))*(+$('ajusteTipo').value||1);
  const ajusteDesc=($('ajusteDesc').value||'').trim()||(ajuste<0?'Desconto':'Extra');
  const sinal=v=>(v<0?'- ':'+ ')+brl(Math.abs(v));
  const total=Math.max(0,base+ajuste);
  $('rTempo').textContent=horasTxt(horas);
  $('rTrabalho').textContent=brl(trabalho);
  $('rTransp').textContent=brl(transp);
  $('rowProd').hidden=!(prod>0);
  $('rProd').textContent=brl(prod);
  $('rowAjuste').hidden=!ajuste;
  $('rAjusteDesc').textContent=ajusteDesc;
  $('rAjuste').textContent=sinal(ajuste);
  $('rTotal').textContent=brl(total);
  const avisos=[];
  if(conta<minimo)avisos.push('A conta deu '+brl(conta)+', abaixo da sua diária mínima. O valor sugerido usa o mínimo.');
  if(horas>8)avisos.push('O serviço passa de 8 horas. Considere dividir em dois dias ou cobrar mais.');
  $('aviso').hidden=!avisos.length;
  $('aviso').textContent=avisos.join(' ');
  const tipo=$('tipo').selectedOptions[0].text.split(' (')[0];
  const casa=[quartos+' quarto'+(quartos===1?'':'s'),banheiros+' banheiro'+(banheiros===1?'':'s'),'sala e cozinha'].join(', ');
  $('texto').value=
`Olá, ${$('cliente').value||'tudo bem'}! Segue o orçamento da faxina:

Imóvel: ${casa}
Tipo: ${tipo.toLowerCase()}${extras.length?`\nInclui também: ${extras.join(', ')}`:''}
Produtos de limpeza: ${prod>0?'incluídos':'por conta do cliente'}
Tempo estimado: cerca de ${horasTxt(horas).replace(' h',' horas')}${ajuste?`\n${ajusteDesc}: ${sinal(ajuste)}`:''}

*Valor da diária: ${brl(total)}*

Qualquer dúvida, estou à disposição.
${$('nome').value}`;
  atualizaZap();
}
document.querySelector('main').addEventListener('input',e=>{if(e.target.id!=='texto')calc()});
document.querySelector('main').addEventListener('change',e=>{if(e.target.id!=='texto')calc()});
if(window.orcaLembrar)window.orcaLembrar('diarista',['nome','hora','minimo','transporte','produtos'],calc);
calc();
