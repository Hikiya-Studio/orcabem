/* Cálculo e texto do orçamento desta página */
const $=id=>document.getElementById(id);
const R=window.orcaReais||(id=>+String($(id).value).replace(/\./g,'').replace(',','.')||0);
const FR=window.orcaFormataReais||(n=>String(n));
const atualizaZap=window.orcaEnvio('texto');
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const num=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:2});

/* Serviços de exemplo. "chave" identifica o preço guardado no aparelho. */
const CATALOGO=[
  {chave:'tomada',nome:'Ponto de tomada novo',qtd:3,preco:80},
  {chave:'luz',nome:'Ponto de luz novo',qtd:2,preco:80},
  {chave:'troca',nome:'Troca de tomada ou interruptor',qtd:4,preco:30},
  {chave:'luminaria',nome:'Instalação de luminária ou lustre',qtd:2,preco:70},
  {chave:'chuveiro',nome:'Instalação de chuveiro',qtd:1,preco:150},
  {chave:'ventilador',nome:'Instalação de ventilador de teto',qtd:0,preco:180},
  {chave:'disjuntor',nome:'Troca de disjuntor',qtd:0,preco:70},
  {chave:'circuito',nome:'Circuito novo (ar-condicionado, forno)',qtd:0,preco:500},
  {chave:'quadro',nome:'Troca do quadro de distribuição',qtd:0,preco:900}
];
const GUARDA='orcabem:eletricista-precos';
let itens=[];

function precosGuardados(){
  try{return JSON.parse(localStorage.getItem(GUARDA)||'null')||{}}catch(e){return {}}
}
function guardaPrecos(){
  const p={};
  itens.forEach(it=>{if(it.chave)p[it.chave]=it.preco});
  try{localStorage.setItem(GUARDA,JSON.stringify(p))}catch(e){}
}
function carregaItens(usarGuardados){
  const g=usarGuardados?precosGuardados():{};
  itens=CATALOGO.map(c=>({chave:c.chave,nome:c.nome,qtd:c.qtd,preco:typeof g[c.chave]==='number'?g[c.chave]:c.preco}));
}

let uid=0;
function renderItens(){
  const box=$('itens');box.innerHTML='';
  itens.forEach((it,i)=>{
    const id='i'+(uid++);
    const el=document.createElement('div');el.className='item';
    const nomeBox=document.createElement('div');nomeBox.className='item-nome';
    let nomeInput=null;
    if(it.chave){
      const s=document.createElement('span');s.textContent=it.nome;nomeBox.appendChild(s);
    }else{
      nomeInput=document.createElement('input');nomeInput.id=id+'n';nomeInput.value=it.nome;
      nomeInput.setAttribute('aria-label','Nome do serviço');nomeInput.maxLength=60;
      const x=document.createElement('button');x.type='button';x.className='link';x.textContent='Remover';
      x.onclick=()=>{itens.splice(i,1);renderItens();calc()};
      nomeBox.append(nomeInput,x);
    }
    const q=document.createElement('input');
    q.id=id+'q';q.type='number';q.min='0';q.step='any';q.inputMode='decimal';q.value=it.qtd;
    q.setAttribute('aria-label','Quantidade: '+it.nome);
    const p=document.createElement('input');
    p.id=id+'p';p.type='text';p.inputMode='decimal';p.autocomplete='off';p.value=FR(it.preco);
    p.setAttribute('aria-label','Preço por unidade em reais: '+it.nome);
    p.addEventListener('blur',()=>{if(p.value.trim()!=='')p.value=FR(R(p.id))});
    el.append(nomeBox,q,p);
    el.addEventListener('input',()=>{
      if(nomeInput)it.nome=nomeInput.value;
      it.qtd=Math.max(0,+q.value||0);
      it.preco=Math.max(0,R(p.id));
      guardaPrecos();calc();
    });
    box.appendChild(el);
  });
}

function calc(){
  const usados=itens.filter(it=>it.qtd>0);
  let soma=0;const linhas=[];
  const lista=$('rItens');lista.innerHTML='';
  usados.forEach(it=>{
    const v=it.qtd*it.preco;soma+=v;
    const nome=(it.nome||'').trim()||'Serviço';
    linhas.push(`• ${num(it.qtd)} × ${nome}: ${brl(v)}`);
    const row=document.createElement('div');row.className='row';
    const a=document.createElement('span');a.textContent=`${num(it.qtd)} × ${nome}`;
    const b=document.createElement('span');b.textContent=brl(v);
    row.append(a,b);lista.appendChild(row);
  });
  const minimo=R('minimo');
  const usaMinimo=soma<minimo;
  const mao=Math.max(soma,minimo);
  const mat=R('material');
  const desl=R('deslocamento');
  const ajuste=Math.abs(R('ajuste'))*(+$('ajusteTipo').value||1);
  const ajusteDesc=($('ajusteDesc').value||'').trim()||(ajuste<0?'Desconto':'Extra');
  const sinal=v=>(v<0?'- ':'+ ')+brl(Math.abs(v));
  const total=Math.max(0,mao+mat+desl+ajuste);
  const prazo=Math.max(1,+$('prazo').value||1);
  const garantia=Math.max(0,+$('garantia').value||0);

  $('rMao').textContent=brl(mao)+(usaMinimo?' (mínimo)':'');
  $('rowMat').hidden=!(mat>0);$('rMat').textContent=brl(mat);
  $('rowDesl').hidden=!(desl>0);$('rDesl').textContent=brl(desl);
  $('rowAjuste').hidden=!ajuste;$('rAjusteDesc').textContent=ajusteDesc;$('rAjuste').textContent=sinal(ajuste);
  $('rTotal').textContent=brl(total);
  const avisos=[];
  if(!usados.length)avisos.push('Coloque a quantidade de pelo menos um serviço.');
  else if(usaMinimo)avisos.push('Os serviços somam '+brl(soma)+', abaixo do seu valor mínimo. O orçamento usa o mínimo.');
  $('aviso').hidden=!avisos.length;$('aviso').textContent=avisos.join(' ');

  $('texto').value=
`Olá, ${$('cliente').value||'tudo bem'}! Segue o orçamento do serviço elétrico:

${linhas.length?linhas.join('\n'):'• (nenhum serviço informado)'}

Mão de obra${usaMinimo?' (valor mínimo do atendimento)':''}: ${brl(mao)}
${mat>0?`Material: ${brl(mat)}`:'Material: por conta do cliente'}${desl>0?`\nDeslocamento: ${brl(desl)}`:''}${ajuste?`\n${ajusteDesc}: ${sinal(ajuste)}`:''}
*Total: ${brl(total)}*

Prazo estimado: ${prazo} dia${prazo>1?'s':''} de serviço${garantia?`\nGarantia do serviço: ${garantia} dias`:''}
Orçamento válido por 15 dias.

${$('nome').value}`;
  atualizaZap();
}

$('add').onclick=()=>{
  itens.push({chave:null,nome:'Outro serviço',qtd:1,preco:0});
  renderItens();calc();
  const ultimo=$('itens').lastElementChild;
  const campo=ultimo&&ultimo.querySelector('input');
  if(campo){campo.focus();campo.select()}
};
['minimo','deslocamento','material','prazo','garantia','nome','cliente','ajuste','ajusteDesc'].forEach(id=>$(id).addEventListener('input',calc));
$('ajusteTipo').addEventListener('change',calc);

carregaItens(true);
if(window.orcaLembrar)window.orcaLembrar('eletricista',['nome','minimo','deslocamento','prazo','garantia'],()=>{
  try{localStorage.removeItem(GUARDA)}catch(e){}
  carregaItens(false);renderItens();calc();
});
renderItens();calc();
