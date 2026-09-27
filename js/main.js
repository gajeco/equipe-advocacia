import { CONFIG, whatsappLink, fullAddress } from "./config.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduceMotion = () => motionQuery.matches;

const scrollSubs = new Set();
const layoutSubs = new Set();
let scrollQueued = false;
let layoutQueued = false;

function runScroll() {
  scrollQueued = false;
  scrollSubs.forEach((fn) => fn());
}

function runLayout() {
  layoutQueued = false;
  layoutSubs.forEach((fn) => fn());
}

function onScroll(fn) {
  scrollSubs.add(fn);
}

function onLayout(fn) {
  layoutSubs.add(fn);
}

addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(runScroll);
  },
  { passive: true },
);

addEventListener(
  "resize",
  () => {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(runLayout);
  },
  { passive: true },
);

function initConfig() {
  const map = {
    brand: CONFIG.brand.name,
    monogram: CONFIG.brand.monogram,
    descriptor: CONFIG.brand.descriptor,
    oab: CONFIG.brand.oab,
    phone: CONFIG.contact.phoneDisplay,
    phoneHref: CONFIG.contact.phoneHref,
    email: CONFIG.contact.email,
    emailHref: `mailto:${CONFIG.contact.email}`,
    address: fullAddress(),
    hours: CONFIG.contact.hours,
    year: String(new Date().getFullYear()),
  };

  $$("[data-bind]").forEach((el) => {
    const value = map[el.dataset.bind];
    if (value !== undefined) el.textContent = value;
  });

  $$("[data-bind-href]").forEach((el) => {
    const value = map[el.dataset.bindHref];
    if (value !== undefined) el.setAttribute("href", value);
  });

  $$("[data-wa]").forEach((el) => {
    const message = CONFIG.messages[el.dataset.wa] ?? CONFIG.contact.whatsappDefaultMessage;
    el.href = whatsappLink(message);
    el.target = "_blank";
    el.rel = "noopener";
  });
}

function initHeader() {
  const header = $("[data-header]");
  if (!header) return;

  onScroll(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });

  const links = $$('.nav a[href^="#"]');
  if (!links.length) return;

  const items = links
    .map((link) => ({ link, section: document.getElementById(link.getAttribute("href").slice(1)) }))
    .filter((item) => item.section);

  if (!items.length) return;

  onScroll(() => {
    const line = window.scrollY + header.offsetHeight + 40;
    let current = null;

    for (const { section } of items) {
      if (section.offsetTop <= line) current = section;
    }

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
      current = items[items.length - 1].section;
    }

    items.forEach(({ link, section }) => link.classList.toggle("is-active", section === current));
  });
}

const mobileNav = { close: () => {} };

function initMobileNav() {
  const burger = $("[data-burger]");
  const panel = $("[data-mobile-nav]");
  if (!burger || !panel) return;

  const focusables = () =>
    $$("a[href], button:not([disabled])", panel).filter((el) => el.offsetParent !== null);

  function open() {
    panel.classList.add("is-open");
    panel.removeAttribute("inert");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fechar menu de navegação");
    document.body.classList.add("is-locked");
    focusables()[0]?.focus();
  }

  function close({ restoreFocus = true } = {}) {
    if (!panel.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    panel.setAttribute("inert", "");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menu de navegação");
    document.body.classList.remove("is-locked");
    if (restoreFocus) burger.focus();
  }

  burger.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) close();
    else open();
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const desktop = window.matchMedia("(min-width: 64rem)");
  desktop.addEventListener("change", (e) => {
    if (e.matches) close({ restoreFocus: false });
  });

  mobileNav.close = close;
}

function initAnchors() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    mobileNav.close();

    target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });

    const hadTabindex = target.hasAttribute("tabindex");
    if (!hadTabindex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabindex) {
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }

    history.replaceState(null, "", `#${id}`);
  });
}

function initReveal() {
  const items = $$("[data-reveal]");
  if (!items.length) return;

  const showAll = () => items.forEach((el) => el.classList.add("is-in"));

  if (reduceMotion() || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  items.forEach((el) => observer.observe(el));

  motionQuery.addEventListener("change", (e) => {
    if (e.matches) showAll();
  });
}

function initCounters() {
  const items = $$("[data-count-to]");
  if (!items.length) return;

  const format = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

  const final = (el) => {
    el.textContent = format.format(Number(el.dataset.countTo));
  };

  const run = (el) => {
    const target = Number(el.dataset.countTo);
    if (reduceMotion()) return final(el);

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = format.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  items.forEach((el) => {
    final(el);
    observer.observe(el);
  });

  motionQuery.addEventListener("change", (e) => {
    if (e.matches) items.forEach(final);
  });
}

function initAccordion() {
  $$("[data-accordion]").forEach((root) => {
    const items = $$(".accordion__item", root);
    if (!items.length) return;

    const setOpen = (item, open) => {
      const trigger = $(".accordion__trigger", item);
      if (!trigger) return;
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    items.forEach((item) => {
      const trigger = $(".accordion__trigger", item);
      if (!trigger) return;

      setOpen(item, item.classList.contains("is-open"));

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => setOpen(other, false));
        setOpen(item, willOpen);
      });
    });
  });
}

function initCarousels() {
  $$("[data-carousel]").forEach((root) => {
    const track = $("[data-carousel-track]", root);
    const viewport = $(".carousel__viewport", root);
    const dotsBox = $("[data-carousel-dots]", root);
    const status = $("[data-carousel-status]", root);
    if (!track || !viewport) return;

    const slides = $$(".carousel__slide", track);
    const total = slides.length;
    if (!total) return;

    const DELAY = 6500;
    let index = 0;
    let timer = null;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot";
      dot.setAttribute("aria-label", `Ir para o depoimento ${i + 1} de ${total}`);
      dot.addEventListener("click", () => {
        go(i);
        restart();
      });
      dotsBox?.appendChild(dot);
      return dot;
    });

    function render() {
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      slides.forEach((slide, i) => slide.toggleAttribute("inert", i !== index));
      slides.forEach((slide, i) => {
        if (i === index) slide.setAttribute("aria-label", `${i + 1} de ${total}`);
        else slide.removeAttribute("aria-label");
      });
      if (status) status.textContent = `Depoimento ${index + 1} de ${total}`;
    }

    function go(i) {
      index = (i + total) % total;
      render();
    }

    const nextSlide = () => go(index + 1);
    const prevSlide = () => go(index - 1);

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (reduceMotion() || total < 2) return;
      timer = setInterval(() => {
        if (dragging) return;
        nextSlide();
      }, DELAY);
    };

    const restart = () => {
      stop();
      start();
    };

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0.25 },
      ).observe(root);
    } else {
      start();
    }

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : restart()));

    let dragging = false;
    let startX = 0;
    let delta = 0;

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      delta = 0;
      root.classList.add("is-dragging");
      viewport.setPointerCapture?.(e.pointerId);
      stop();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      delta = e.clientX - startX;

      if ((index === 0 && delta > 0) || (index === total - 1 && delta < 0)) delta *= 0.35;
      track.style.transform = `translate3d(calc(${-index * 100}% + ${delta}px), 0, 0)`;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-dragging");
      const threshold = viewport.offsetWidth * 0.18;
      if (delta < -threshold) nextSlide();
      else if (delta > threshold) prevSlide();
      else render();
      start();
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);

    root.addEventListener("pointerenter", stop);
    root.addEventListener("pointerleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) start();
    });

    $("[data-carousel-prev]", root)?.addEventListener("click", () => {
      prevSlide();
      restart();
    });

    $("[data-carousel-next]", root)?.addEventListener("click", () => {
      nextSlide();
      restart();
    });

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        restart();
      } else if (e.key === "ArrowRight") {
        nextSlide();
        restart();
      }
    });

    render();
    start();
  });
}

function initProcessProgress() {
  const root = $("[data-process]");
  if (!root) return;

  const track = $(".process__track", root);
  const fill = $("[data-progress-fill]", root);
  if (!track || !fill) return;

  const horizontal = window.matchMedia("(min-width: 56rem)");
  const steps = $$(".step", track);
  let last = -1;

  function update() {
    const rect = track.getBoundingClientRect();
    const anchor = window.innerHeight * (horizontal.matches ? 0.62 : 0.6);

    const p = horizontal.matches
      ? (anchor - rect.left) / (rect.width || 1)
      : (anchor - rect.top) / (rect.height || 1);

    const progress = Math.max(0, Math.min(1, p));
    fill.style.transform = horizontal.matches ? `scaleX(${progress})` : `scaleY(${progress})`;

    if (progress === last) return;
    last = progress;
    steps.forEach((step, i) => {
      step.classList.toggle("is-reached", progress >= (i + 0.2) / steps.length);
    });
  }

  onScroll(update);
  onLayout(update);
  update();
}

function initFloatingCta() {
  const fab = $("[data-fab]");
  const sticky = $("[data-sticky-cta]");
  if (!fab && !sticky) return;

  const hero = $("#inicio");
  let shown = null;

  onScroll(() => {
    const past = window.scrollY > (hero ? hero.offsetHeight * 0.55 : 320);
    if (past === shown) return;
    shown = past;
    fab?.classList.toggle("is-visible", past);
    sticky?.classList.toggle("is-visible", past);
    document.body.classList.toggle("has-sticky-cta", past);
  });
}

function initContactForm() {
  const form = $("[data-contact-form]");
  if (!form) return;

  const panel = form.closest(".cta__panel") || form;
  const status = $("[data-form-status]", form);
  const submit = $('[type="submit"]', form);

  const fields = {
    name: $("#f-name", form),
    contact: $("#f-contact", form),
    area: $("#f-area", form),
    message: $("#f-message", form),
    consent: $("#f-consent", form),
  };

  const rules = {
    name: (v) => (v.trim().length >= 3 ? true : "Informe seu nome completo."),
    contact: (v) =>
      /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim()) || /^\+?[\d\s().-]{8,}$/.test(v.trim())
        ? true
        : "Informe um e-mail válido ou telefone com DDD.",
    area: (v) => (v ? true : "Selecione a área de atuação."),
    message: (v) =>
      v.trim().length >= 10 ? true : "Conte brevemente o seu caso (mínimo 10 caracteres).",
    consent: (_v, el) => (el.checked ? true : "É necessário aceitar o aviso de privacidade."),
  };

  function validate(key) {
    const el = fields[key];
    if (!el) return true;

    const value = el.type === "checkbox" ? "" : el.value;
    const result = rules[key](value, el);
    const message = result === true ? "" : result;
    const errorBox = document.getElementById(`${el.id}-error`);

    el.setAttribute("aria-invalid", String(Boolean(message)));
    if (errorBox) errorBox.textContent = message;

    return !message;
  }

  Object.keys(fields).forEach((key) => {
    const el = fields[key];
    if (!el) return;

    const revalidate = () => {
      if (el.getAttribute("aria-invalid") === "true") validate(key);
    };

    el.addEventListener("input", revalidate);
    el.addEventListener("change", revalidate);
    el.addEventListener("blur", () => validate(key));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const invalid = Object.keys(fields).filter((key) => !validate(key));

    if (invalid.length) {
      panel.classList.remove("is-shaking");
      void panel.offsetWidth;
      panel.classList.add("is-shaking");
      fields[invalid[0]]?.focus();
      if (status) status.textContent = "Revise os campos destacados antes de enviar.";
      return;
    }

    const area = fields.area.selectedOptions[0]?.textContent?.trim() || "Não informada";
    const text = [
      "Olá! Gostaria de solicitar uma consulta com um advogado.",
      "",
      `*Nome:* ${fields.name.value.trim()}`,
      `*Contato:* ${fields.contact.value.trim()}`,
      `*Área de atuação:* ${area}`,
      "",
      fields.message.value.trim(),
    ].join("\n");

    window.open(whatsappLink(text), "_blank", "noopener");

    if (submit) submit.dataset.state = "loading";

    setTimeout(() => {
      if (submit) delete submit.dataset.state;
      panel.classList.add("is-done");
      if (status) status.textContent = "Mensagem montada. Abrimos o WhatsApp com o resumo do seu caso.";
    }, reduceMotion() ? 0 : 650);
  });

  $("[data-form-reset]", panel)?.addEventListener("click", () => {
    form.reset();
    Object.keys(fields).forEach((key) => {
      const el = fields[key];
      el?.removeAttribute("aria-invalid");
      const errorBox = el && document.getElementById(`${el.id}-error`);
      if (errorBox) errorBox.textContent = "";
    });
    panel.classList.remove("is-done");
    fields.name?.focus();
  });
}

function initDialogs() {
  $$("[data-dialog-open]").forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.dialogOpen);
    if (!dialog) return;

    trigger.addEventListener("click", () => {
      dialog.showModal();
      $("[data-dialog-close]", dialog)?.focus();
    });
  });

  $$("dialog").forEach((dialog) => {
    $$("[data-dialog-close]", dialog).forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  });
}

function init() {
  initConfig();
  initHeader();
  initMobileNav();
  initAnchors();
  initReveal();
  initCounters();
  initAccordion();
  initCarousels();
  initProcessProgress();
  initFloatingCta();
  initContactForm();
  initDialogs();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
