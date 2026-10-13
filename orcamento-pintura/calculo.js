/* Cálculo e texto do orçamento desta página */
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const R=window.orcaReais||(id=>+String($(id).value).replace(/\./g,'').replace(',','.')||0);
const FR=window.orcaFormataReais||(n=>String(n));
const atualizaZap=window.orcaEnvio('texto');
const assinatura=window.orcaAssinatura?window.orcaAssinatura(()=>calc()):()=>'';
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const m2=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:1})+' m²';
let rooms=[
  {nome:'Sala',c:5,l:4,h:2.7,portas:1,janelas:1,teto:true},
  {nome:'Quarto',c:3.5,l:3,h:2.7,portas:1,janelas:1,teto:true},
  {nome:'Cozinha',c:3,l:2.5,h:2.7,portas:1,janelas:1,teto:false}
];
let uid=0;
function renderRooms(){
  const box=$('rooms');box.innerHTML='';
  rooms.forEach((r,i)=>{
    const id='r'+i;
    const el=document.createElement('div');el.className='room';
    el.innerHTML=`<div class="room-head"><input id="${id}n" aria-label="Nome do cômodo" value="${esc(r.nome)}"><button class="btn-x" type="button" aria-label="Remover cômodo">Remover</button></div>
    <div class="grid3">
      <label for="${id}c">Comprimento<input id="${id}c" type="number" min="0" step="0.1" inputmode="decimal" value="${r.c}"></label>
      <label for="${id}l">Largura<input id="${id}l" type="number" min="0" step="0.1" inputmode="decimal" value="${r.l}"></label>
      <label for="${id}h">Pé-direito<input id="${id}h" type="number" min="0" step="0.1" inputmode="decimal" value="${r.h}"></label>
      <label for="${id}p">Portas<input id="${id}p" type="number" min="0" inputmode="numeric" value="${r.portas}"></label>
      <label for="${id}j">Janelas<input id="${id}j" type="number" min="0" inputmode="numeric" value="${r.janelas}"></label>
      <label class="chk" for="${id}t" style="align-self:end;padding-bottom:10px"><input id="${id}t" type="checkbox" ${r.teto?'checked':''}> Pintar teto</label>
    </div>`;
    el.querySelector('.btn-x').onclick=()=>{rooms.splice(i,1);renderRooms();calc()};
    el.addEventListener('input',()=>{
      r.nome=$(id+'n').value;r.c=+$(id+'c').value||0;r.l=+$(id+'l').value||0;r.h=+$(id+'h').value||0;
      r.portas=+$(id+'p').value||0;r.janelas=+$(id+'j').value||0;r.teto=$(id+'t').checked;calc();
    });
    box.appendChild(el);
  });
}
function calc(){
  let parede=0,teto=0;const linhas=[];
  rooms.forEach(r=>{
    const p=Math.max(0,2*(r.c+r.l)*r.h-r.portas*1.6-r.janelas*1.5);
    const t=r.teto?r.c*r.l:0;parede+=p;teto+=t;
    linhas.push(`• ${r.nome||'Cômodo'}: ${m2(p+t)}${r.teto?' (com teto)':''}`);
  });
  const area=parede+teto;
  const demaos=Math.max(1,+$('demaos').value||1);
  const rend=Math.max(1,+$('rend').value||10);
  const litros=area*demaos/rend;
  const latas=Math.ceil(litros/18*2)/2; // meia lata ≈ galões
  const preco=R('preco');
  const mao=area*preco;
  const lata=R('lata');
  const mat=lata>0?Math.ceil(litros/18)*lata:0;
  const ajuste=Math.abs(R('ajuste'))*(+$('ajusteTipo').value||1);
  const ajusteDesc=($('ajusteDesc').value||'').trim()||(ajuste<0?'Desconto':'Ajuste');
  const total=Math.max(0,mao+mat+ajuste);
  const sinal=v=>(v<0?'- ':'+ ')+brl(Math.abs(v));
  $('rParede').textContent=m2(parede);
  $('rTeto').textContent=m2(teto);
  $('rArea').textContent=m2(area);
  $('rTinta').textContent=`${litros.toLocaleString('pt-BR',{maximumFractionDigits:0})} L (≈ ${latas.toLocaleString('pt-BR')} lata${latas===1?'':'s'} de 18 L)`;
  $('rMao').textContent=brl(mao);
  $('rowMat').hidden=!(lata>0);
  $('rMat').textContent=brl(mat);
  $('rowAjuste').hidden=!ajuste;
  $('rAjusteDesc').textContent=ajusteDesc;
  $('rAjuste').textContent=sinal(ajuste);
  $('rTotal').textContent=brl(total);
  const tipo=$('tipo').selectedOptions[0].text;
  $('texto').value=
`Olá, ${$('cliente').value||'tudo bem'}! Segue o orçamento de pintura:

${linhas.join('\n')}

Serviço: ${tipo.toLowerCase()}, ${demaos} demão${demaos>1?'s':''}
Área total: ${m2(area)}
Tinta estimada: ${litros.toLocaleString('pt-BR',{maximumFractionDigits:0})} litros

Mão de obra: ${brl(mao)}${mat>0?`\nMaterial (tinta): ${brl(mat)}`:'\nMaterial: por conta do cliente'}${ajuste?`\n${ajusteDesc}: ${sinal(ajuste)}`:''}
*Total: ${brl(total)}*

Prazo estimado: ${$('prazo').value||'-'} dias úteis
Orçamento válido por 15 dias.

${$('pintor').value}${assinatura()}`;
  atualizaZap();
}
$('add').onclick=()=>{rooms.push({nome:'Novo cômodo',c:3,l:3,h:2.7,portas:1,janelas:1,teto:false});renderRooms();calc()};
$('ajusteTipo').onchange=calc;
$('tipo').onchange=()=>{$('preco').value=FR(+$('tipo').value);$('preco').dispatchEvent(new Event('input'));calc()};
['preco','demaos','rend','lata','prazo','pintor','cliente','ajuste','ajusteDesc','ajusteTipo'].forEach(id=>$(id).addEventListener('input',calc));
if(window.orcaLembrar)window.orcaLembrar('pintura',['pintor','tipo','preco','demaos','rend','lata','prazo'],calc);
renderRooms();calc();
