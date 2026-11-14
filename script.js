/* ==========================================================
   CONFIGURAÇÃO — edite só esta parte
   ========================================================== */

// Número do WhatsApp, só dígitos: 55 (Brasil) + DDD + número.
// Exemplo: (11) 98705-0303  ->  "5511987050303"
// Ao trocar, altere também os links "wa.me" do index.html (eles valem para quem
// navega sem JavaScript).
const WHATSAPP_NUMERO = "5511987050303";

// Mensagem que já aparece escrita quando o cliente abre a conversa.
const WHATSAPP_MENSAGEM =
  "Olá! Vi o site da DRV Portões Automáticos e gostaria de solicitar um orçamento.";

// Mensagem dos botões "Pedir orçamento" de cada serviço. O nome do serviço entra no fim.
const WHATSAPP_MENSAGEM_SERVICO =
  "Olá! Vi o site da DRV Portões Automáticos e gostaria de um orçamento de ";

// Telefone fixo, e-mail, endereço e horário ficam escritos no rodapé do index.html.

/* ========================================================== */


const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const raiz = document.documentElement;


// Links do WhatsApp: todo elemento com o atributo data-whatsapp.
// Com data-assunto, a mensagem já cita o serviço.
function linkWhatsapp(assunto) {
  const mensagem = assunto ? WHATSAPP_MENSAGEM_SERVICO + assunto + "." : WHATSAPP_MENSAGEM;
  return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensagem);
}

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = linkWhatsapp(link.dataset.assunto);
  link.target = "_blank";
  link.rel = "noopener";
});

// Telefone mostrado na página, formatado a partir do número acima: (11) 98705-0303
const numeroLocal = WHATSAPP_NUMERO.replace(/^55/, "");
const telefone =
  "(" + numeroLocal.slice(0, 2) + ") " + numeroLocal.slice(2, -4) + "-" + numeroLocal.slice(-4);

document.querySelectorAll("[data-telefone]").forEach((el) => (el.textContent = telefone));


// Ao rolar: cabeçalho fica sólido e o botão flutuante aparece
const header = document.querySelector(".site-header");
const botaoFlutuante = document.querySelector(".wa-float");

function aoRolar() {
  const y = window.scrollY;
  header.classList.toggle("is-solid", y > 30);
  botaoFlutuante.classList.toggle("is-shown", y > 420);
}

aoRolar();
window.addEventListener("scroll", aoRolar, { passive: true });


// Menu do celular e do tablet
const menu = document.getElementById("menu");
const botaoMenu = document.querySelector(".menu-btn");
const telaLarga = window.matchMedia("(min-width: 1040px)");

function definirMenu(aberto) {
  raiz.classList.toggle("menu-open", aberto);
  botaoMenu.setAttribute("aria-expanded", String(aberto));
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  // Fechado, o menu sai da ordem do Tab e do leitor de tela
  menu.inert = !aberto;
}

definirMenu(false);

botaoMenu.addEventListener("click", () => definirMenu(!raiz.classList.contains("menu-open")));
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) definirMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && raiz.classList.contains("menu-open")) {
    definirMenu(false);
    botaoMenu.focus();
  }
});

telaLarga.addEventListener("change", () => definirMenu(false));


// Ano no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();


// Faixa de serviços: duplica a lista para correr sem emendas
const faixa = document.querySelector(".marquee-track");

if (faixa && !semMovimento) {
  const lista = faixa.querySelector(".marquee-list");
  for (let i = 0; i < 3; i++) faixa.appendChild(lista.cloneNode(true));
  faixa.classList.add("is-running");
}


// Animação de entrada ao rolar
const animados = document.querySelectorAll(".reveal, .stagger");

if ("IntersectionObserver" in window && !semMovimento) {
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  animados.forEach((el) => observer.observe(el));
} else {
  animados.forEach((el) => el.classList.add("is-visible"));
}


// Showroom: fotos e vídeos abrem em tela cheia, com setas para passar de um ao outro.
// O vídeo só começa a ser baixado quando o cliente toca nele, e o download para ao fechar.
// Sem JavaScript, cada item é um link comum para o arquivo.
const itensShowroom = Array.from(document.querySelectorAll("[data-lightbox]"));
const telaCheia = document.getElementById("lightbox");

// Até quanto a foto ou o vídeo pode ser ampliado além do tamanho original
const AMPLIACAO_MAXIMA = 1.3;

if (itensShowroom.length && telaCheia && typeof telaCheia.showModal === "function") {
  const palco = telaCheia.querySelector(".lb-stage");
  const titulo = telaCheia.querySelector(".lb-title strong");
  const subtitulo = telaCheia.querySelector(".lb-title span");
  const botaoOrcamento = telaCheia.querySelector(".lb-cta");
  let atual = 0;

  function ajustarTamanho() {
    const midia = palco.firstElementChild;
    if (!midia) return;
    const largura = Number(midia.dataset.w);
    const altura = Number(midia.dataset.h);
    const escala = Math.min(
      (palco.clientWidth - 32) / largura,
      palco.clientHeight / altura,
      AMPLIACAO_MAXIMA
    );
    midia.style.width = Math.round(largura * escala) + "px";
    midia.style.height = Math.round(altura * escala) + "px";
  }

  function esvaziarPalco() {
    const video = palco.querySelector("video");
    if (video) {
      // Interrompe o download do vídeo
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    palco.replaceChildren();
  }

  function mostrar(indice) {
    atual = (indice + itensShowroom.length) % itensShowroom.length;
    const item = itensShowroom[atual];
    const capa = item.querySelector("img");
    const legenda = item.querySelector(".tile-cap");
    let midia;

    esvaziarPalco();

    if (item.dataset.lightbox === "video") {
      midia = document.createElement("video");
      midia.poster = capa.currentSrc || capa.src;
      midia.controls = true;
      midia.loop = true;
      midia.muted = true;
      midia.playsInline = true;
      midia.autoplay = true;
      midia.setAttribute("controlslist", "nodownload noplaybackrate");
      midia.disablePictureInPicture = true;
      midia.src = item.href;
    } else {
      midia = document.createElement("img");
      midia.alt = capa.alt;
      midia.src = item.href;
    }

    midia.className = "lb-media";
    midia.dataset.w = item.dataset.w;
    midia.dataset.h = item.dataset.h;
    palco.appendChild(midia);

    titulo.textContent = legenda.querySelector("strong").textContent;
    subtitulo.textContent = legenda.querySelector("span") ? legenda.querySelector("span").textContent : "";
    botaoOrcamento.href = linkWhatsapp(item.dataset.assunto);
    ajustarTamanho();
  }

  itensShowroom.forEach((item, indice) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      telaCheia.showModal();
      raiz.classList.add("lightbox-open");
      mostrar(indice);
    });
  });

  telaCheia.querySelector(".lb-close").addEventListener("click", () => telaCheia.close());
  telaCheia.querySelector(".lb-prev").addEventListener("click", () => mostrar(atual - 1));
  telaCheia.querySelector(".lb-next").addEventListener("click", () => mostrar(atual + 1));

  // Toque fora da foto ou do vídeo fecha
  palco.addEventListener("click", (e) => {
    if (e.target === palco) telaCheia.close();
  });

  telaCheia.addEventListener("keydown", (e) => {
    if (e.target.closest("video")) return;
    if (e.key === "ArrowLeft") mostrar(atual - 1);
    if (e.key === "ArrowRight") mostrar(atual + 1);
  });

  // Vale para o botão de fechar, a tecla Esc e o toque fora
  telaCheia.addEventListener("close", () => {
    esvaziarPalco();
    raiz.classList.remove("lightbox-open");
  });

  window.addEventListener("resize", ajustarTamanho);

  // No celular: deslizar o dedo para o lado troca de item. A faixa de baixo do
  // vídeo fica de fora, porque ali está a barra de tempo.
  let toqueX = null;
  let toqueY = null;

  palco.addEventListener("touchstart", (e) => {
    const toque = e.touches[0];
    const video = e.target.closest("video");
    const naBarra = video && toque.clientY > video.getBoundingClientRect().bottom - 70;
    toqueX = e.touches.length === 1 && !naBarra ? toque.clientX : null;
    toqueY = toque.clientY;
  }, { passive: true });

  palco.addEventListener("touchend", (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    const dy = e.changedTouches[0].clientY - toqueY;
    toqueX = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) mostrar(atual + (dx < 0 ? 1 : -1));
  }, { passive: true });
}


// Portão do topo: a animação só roda enquanto ele está na tela
const portao = document.querySelector(".gate");

if (portao && "IntersectionObserver" in window) {
  new IntersectionObserver(([entrada]) => {
    portao.classList.toggle("is-paused", !entrada.isIntersecting);
  }).observe(portao);
}
