/* Aplica o tema escolhido antes de a página aparecer, para não piscar */
try { var t = localStorage.getItem('tema'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
