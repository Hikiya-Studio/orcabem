# OrçaBem

Site de calculadoras grátis para profissionais autônomos brasileiros (pintor, diarista, e depois outras profissões) calcularem quanto cobrar e mandarem o orçamento pronto no WhatsApp.

- Dono: Marino (organização GitHub Hikiya-Studio). Conversa sempre em português.
- Domínio: orcabem.com.br (registrado no Registro.br em 13/10/2026, DNS no modo avançado apontando para o GitHub Pages). Endereço provisório: hikiya-studio.github.io/orcabem
- Hospedagem: GitHub Pages, branch `main`, pasta raiz. Todo push entra no ar em 1 a 2 minutos.
- Medição de visitas: GoatCounter (painel em marinogneto.goatcounter.com), script no fim de cada página.

## Público e tom

- Pintores, diaristas e outros autônomos, quase sempre no celular, às vezes com vista cansada. Linguagem do dia a dia, sem jargão técnico.
- Tudo o que o público vê é em português; endereços sem acento, com hífen (`/orcamento-pintura/`).
- Sem cadastro, sem login. Nada é enviado para servidor: valores ficam só no aparelho (localStorage).
- Os preços pré-preenchidos são exemplos. Quem decide o preço é o profissional; as calculadoras guardam os valores dele no aparelho e têm "Voltar ao exemplo". Não fazer tabela de preços por estado (não temos dados confiáveis).
- Faixas de preço com ano ("em 2026, costuma ficar entre...") só aparecem no texto: na dica "Para ter uma ideia" e nas perguntas frequentes. Nunca colocar o ano no título, na descrição para o Google, no h1 nem no endereço. Revisão anual em janeiro: atualizar o ano e as faixas em todas as calculadoras e o bloco `FAQPage` junto; há uma tarefa agendada para 05/01/2027 que abre um pull request com essa revisão.

## Marca e visual

- Nome: "OrçaBem" em textos e títulos; logo escrito "orçabem" minúsculo com "bem" em azul, ao lado do ícone.
- Ícone: quadrado azul com um "o" branco e sinal de certo amarelo (`favicon.svg`). Não usar símbolos de uma profissão só.
- Cores (claro): fundo #f3f1ec, superfície #fffdf8, texto #1d2433, azul #1f4fa3, amarelo "fita" #e7c873. Modo escuro com tokens próprios. Segue o sistema do aparelho e tem botão para trocar.
- Fontes: Archivo (títulos e números) e Figtree (texto). Evitar fontes com zero cortado.
- Mobile primeiro, botões grandes, rótulos legíveis (14px+). Botão verde "Enviar no WhatsApp" abre wa.me com o texto.

## Estrutura

- `index.html`: página inicial com a lista de ferramentas (cartões "Disponível" e "Em breve").
- `orcamento-pintura/`: área de parede, tinta, mão de obra por m², material opcional, ajuste (extra ou desconto) com descrição.
- `quanto-cobrar-diarista/`: horas estimadas por quartos, banheiros, tipo de faxina e extras; valor da hora, diária mínima, transporte, produtos, ajuste.
- `orcamento-eletricista/`: lista de serviços (quantidade × preço por unidade; pontos de tomada e luz, troca, luminária, chuveiro, ventilador, disjuntor, circuito, quadro) e serviços extras com nome livre; valor mínimo do atendimento, deslocamento, material, prazo, garantia, ajuste. Os preços por serviço ficam guardados em `orcabem:eletricista-precos`.
- `privacidade/`: página de privacidade em linguagem simples (localStorage, WhatsApp, GoatCounter sem cookies e sem IP, Google Fonts, LGPD). Link "Privacidade" no rodapé de todas as páginas. Atualizar antes de qualquer mudança no uso de dados (anúncios, afiliados com rastreio, formulário de contato).
- `404.html`: página de "não encontrado" do GitHub Pages. Usa links que começam com `/` (não relativos), porque aparece em qualquer pasta. Ao criar uma calculadora, acrescentar o link nela.
- `assets/ferramenta.css`: estilos comuns das calculadoras.
- `assets/tema.js`: aplica o tema salvo antes da página aparecer. Cada calculadora tem seu `calculo.js` na própria pasta.
- Segurança: cada página tem uma regra CSP (meta `Content-Security-Policy`) que só permite scripts do próprio site e do GoatCounter. Por isso não pode haver `<script>` embutido no HTML: todo script vai para um arquivo `.js`. Texto digitado pela pessoa que entra em HTML passa pela função `esc`.
- `assets/app.js`: tema, instalação como app, campos de dinheiro (aceitam "6500", "22,50", "22.50" e mostram "6.500"), memória de valores (`orcaLembrar`), envio WhatsApp e copiar (`orcaEnvio`).
- `manifest.webmanifest`, `sw.js`, ícones PNG: app instalável e uso sem internet. Ao mudar arquivos de forma que versões antigas quebrem, subir a versão `VERSAO` em `sw.js`.
- `sitemap.xml` e `robots.txt`: atualizar o sitemap a cada página nova.
- Links internos são relativos (funcionam no endereço provisório e no domínio).
- Imagens de prévia para compartilhar (WhatsApp/Facebook): `assets/previa-<nome>.jpg`, 1200×630, geradas por `_ferramentas/gerar-previas.py` (a pasta `_ferramentas` não é publicada). Cada página tem `og:image` com endereço completo em orcabem.com.br.
- Perguntas frequentes também ficam num bloco `FAQPage` (ld+json) no `<head>`. Ao mudar o texto de uma pergunta, mudar o bloco junto.

## Padrão de uma calculadora nova

Página própria em `/nome-com-hifen/` (HTML + `calculo.js`, sem script embutido), com: título e descrição para o Google, `canonical` em orcabem.com.br, eyebrow "Para ...", campos com exemplo, resultado no bloco "RESULTADO", texto para o cliente, botões WhatsApp e Copiar, perguntas frequentes (ajudam no SEO), rodapé explicando o cálculo, bloco `FAQPage` com as mesmas perguntas, imagem de prévia (`og:image`, gerada pelo script), GoatCounter, entrada no sitemap, no `sw.js` e cartão na página inicial. Testar num navegador de celular (390px) nos modos claro e escuro antes de publicar.

## Pendências

- Domínio ligado em 13/10/2026 (arquivo `CNAME`). Google Search Console verificado por DNS (registro TXT no Registro.br: não apagar) e sitemap enviado em 13/10/2026. "Enforce HTTPS" ativado.
- Calculadora de eletricista publicada em 13/10/2026. Próxima calculadora ainda não escolhida.
- Contato: o Marino vai criar um e-mail (ou WhatsApp) só para o OrçaBem. Depois, colocar no rodapé de todas as páginas e na página de privacidade.
- Domínio vence em 13/10/2027: conferir a renovação automática no Registro.br.
- Bing Webmaster Tools configurado em 13/10/2026 (importado do Search Console).
- Monetização só depois de ter visitas: primeiro links de afiliado discretos, depois anúncios, depois versão paga (logo do profissional, PDF, histórico).
- Divulgação cruzada com o sistema de agenda da Hikiya (AgendarBem, agendarbem.com.br), só quando ele estiver no ar: linha discreta no rodapé ("Da mesma equipe: ...") e sugestão contextual depois do resultado da diarista. Nada de banner no meio das calculadoras.
