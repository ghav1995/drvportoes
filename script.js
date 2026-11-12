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
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const assunto = link.dataset.assunto;
  const mensagem = assunto ? WHATSAPP_MENSAGEM_SERVICO + assunto + "." : WHATSAPP_MENSAGEM;
  link.href = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensagem);
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


// Portão do topo: a animação só roda enquanto ele está na tela
const portao = document.querySelector(".gate");

if (portao && "IntersectionObserver" in window) {
  new IntersectionObserver(([entrada]) => {
    portao.classList.toggle("is-paused", !entrada.isIntersecting);
  }).observe(portao);
}
