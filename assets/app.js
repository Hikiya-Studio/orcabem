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
