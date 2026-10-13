/* OrçaBem: tema claro/escuro, instalação como app, funcionamento offline e envio pelo WhatsApp */
(function () {
  var raiz = document.documentElement;
  var base = new URL('../', document.currentScript.src); // raiz do site

  /* Tema */
  var botaoTema = document.getElementById('tema');
  function temaAtual() {
    var t = raiz.getAttribute('data-theme');
    if (t) return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function rotuloTema() {
    if (botaoTema) botaoTema.textContent = temaAtual() === 'dark' ? '☀ Modo claro' : '☾ Modo escuro';
  }
  if (botaoTema) {
    botaoTema.addEventListener('click', function () {
      var novo = temaAtual() === 'dark' ? 'light' : 'dark';
      raiz.setAttribute('data-theme', novo);
      try { localStorage.setItem('tema', novo); } catch (e) {}
      rotuloTema();
    });
    rotuloTema();
  }

  /* Funcionamento offline */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.pathname }).catch(function () {});
    });
  }

  /* Botão Instalar */
  var botaoInstalar = document.getElementById('instalar');
  var dica = document.getElementById('dica-ios');
  var pedido = null;
  var instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    pedido = e;
    if (botaoInstalar && !instalado) botaoInstalar.hidden = false;
  });
  window.addEventListener('appinstalled', function () {
    if (botaoInstalar) botaoInstalar.hidden = true;
    if (dica) dica.hidden = true;
  });
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (botaoInstalar && ios && !instalado) botaoInstalar.hidden = false;
  if (botaoInstalar) {
    botaoInstalar.addEventListener('click', function () {
      if (pedido) {
        pedido.prompt();
        pedido.userChoice.finally(function () { pedido = null; botaoInstalar.hidden = true; });
      } else if (dica) {
        dica.hidden = !dica.hidden;
      }
    });
  }



  /* Campos de dinheiro: aceitam "6500", "6.500", "22,50" ou "22.50" e mostram no formato brasileiro */
  function lerReais(texto) {
    var t = String(texto || '').replace(/[^\d.,-]/g, '');
    if (!t) return 0;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if ((t.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(t)) t = t.replace(/\./g, '');
    var n = parseFloat(t);
    return isFinite(n) ? n : 0;
  }
  function formataReais(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  window.orcaReais = function (id) { var el = document.getElementById(id); return el ? lerReais(el.value) : 0; };
  window.orcaFormataReais = formataReais;
  document.querySelectorAll('input[data-reais]').forEach(function (el) {
    el.value = formataReais(lerReais(el.value));
    el.addEventListener('blur', function () { if (el.value.trim() !== '') el.value = formataReais(lerReais(el.value)); });
  });

  /* Lembra os valores da pessoa neste aparelho */
  window.orcaLembrar = function (chave, ids, aoMudar) {
    var nome = 'orcabem:' + chave;
    try {
      var salvos = JSON.parse(localStorage.getItem(nome) || 'null');
      if (salvos) {
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el && salvos[id] !== undefined) el.value = el.hasAttribute('data-reais') ? formataReais(lerReais(salvos[id])) : salvos[id];
        });
      }
    } catch (e) {}
    function salva() {
      var dados = {};
      ids.forEach(function (id) { var el = document.getElementById(id); if (el) dados[id] = el.value; });
      try { localStorage.setItem(nome, JSON.stringify(dados)); } catch (e) {}
    }
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', salva); el.addEventListener('change', salva); }
    });
    var limpar = document.getElementById('limpar-valores');
    if (limpar) {
      limpar.addEventListener('click', function () {
        try { localStorage.removeItem(nome); } catch (e) {}
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          if (el.tagName === 'SELECT') {
            for (var i = 0; i < el.options.length; i++) if (el.options[i].defaultSelected) { el.selectedIndex = i; return; }
            el.selectedIndex = 0;
          } else el.value = el.hasAttribute('data-reais') ? formataReais(lerReais(el.defaultValue)) : el.defaultValue;
        });
        if (aoMudar) aoMudar();
      });
    }
  };

  /* Linha "feito no OrçaBem" no fim da mensagem (a pessoa pode desligar; a escolha vale para todas as calculadoras) */
  window.orcaAssinatura = function (aoMudar) {
    var caixa = document.getElementById('assinatura');
    var ligada = true;
    try { ligada = localStorage.getItem('orcabem:assinatura') !== 'nao'; } catch (e) {}
    if (caixa) {
      caixa.checked = ligada;
      caixa.addEventListener('change', function () {
        ligada = caixa.checked;
        try { localStorage.setItem('orcabem:assinatura', ligada ? 'sim' : 'nao'); } catch (e) {}
        if (aoMudar) aoMudar();
      });
    }
    return function () { return ligada ? '\n\nOrçamento feito no orcabem.com.br' : ''; };
  };

  /* Envio do texto: WhatsApp e copiar */
  window.orcaEnvio = function (idTexto) {
    var texto = document.getElementById(idTexto);
    var zap = document.getElementById('zap');
    var copiar = document.getElementById('copiar');
    var aviso = document.getElementById('toast');
    function atualiza() { if (zap) zap.href = 'https://wa.me/?text=' + encodeURIComponent(texto.value); }
    texto.addEventListener('input', atualiza);
    if (copiar) {
      copiar.addEventListener('click', function () {
        function ok() { if (aviso) { aviso.hidden = false; setTimeout(function () { aviso.hidden = true; }, 2500); } }
        try { navigator.clipboard.writeText(texto.value).then(ok, function () { texto.select(); }); }
        catch (e) { texto.select(); }
      });
    }
    return atualiza;
  };
})();
