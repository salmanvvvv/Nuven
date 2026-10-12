/*
 * Nuven Digital: interacciones de la versión estática (sin Next.js).
 * Animaciones de entrada, vídeo de fondo, menú móvil, FAQ, banner de cookies y formulario.
 */
(() => {
  // Formulario: pega aquí la URL de un servicio de formularios (Formspree, Getform, Basin...)
  // para recibir los mensajes por email. Si se deja vacío, se abre el programa de correo
  // del visitante con el mensaje ya escrito.
  const FORM_ENDPOINT = "";
  const CONTACT_EMAIL = "nuvenndigitaal@gmail.com";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const X_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
  const ALERT_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>';
  const CHECK_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="size-10 text-fg" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
  const SPIN_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';

  /* ---------- Reveal on scroll (content stays visible without JS) ---------- */
  const revealEls = $$("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.remove("rv-pre");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      const i = sibs.indexOf(el);
      if (sibs.length > 1) el.style.transitionDelay = `${(i % 4) * 80}ms`;
      el.classList.add("rv-pre");
      io.observe(el);
    });
  }




  /* ---------- Hero background video (same rules as components/HeroVideo.tsx) ---------- */
  (() => {
    const video = $("section[aria-labelledby=hero-title] video");
    if (!video) return;
    const section = video.closest("section");
    let started = false, visible = true, loaded = false, closeBtn = null, returnFocus = null;
    const ensureLoaded = () => { if (!loaded) { loaded = true; video.preload = "auto"; video.load(); } };
    const play = () => started && visible && !reduce && video.play().catch(() => {});
    const start = () => { if (!started) { started = true; play(); } };
    video.addEventListener("playing", () => video.setAttribute("data-on", ""));

    // "Ver vídeo": show the background video on its own, uncovered, from the start.
    const stop = () => {
      if (!section.hasAttribute("data-watching")) return;
      section.removeAttribute("data-watching");
      closeBtn?.remove();
      closeBtn = null;
      video.loop = true;
      if (reduce) video.pause();
      else play();
      returnFocus?.focus?.({ preventScroll: true });
    };
    const watch = () => {
      returnFocus = document.activeElement;
      ensureLoaded();
      section.setAttribute("data-watching", "");
      video.loop = false;
      video.currentTime = 0;
      video.play().catch(() => {});
      closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "fixed right-5 bottom-6 z-[60] inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-ink/60 px-5 text-[0.8125rem] font-medium text-fg backdrop-blur-md transition-colors duration-200 hover:border-fg/40 hover:bg-ink/80 sm:right-8 sm:bottom-8";
      closeBtn.innerHTML = X_ICON.replace('class="size-5"', 'class="size-4"') + "Cerrar vídeo";
      closeBtn.addEventListener("click", stop);
      section.appendChild(closeBtn);
      closeBtn.focus({ preventScroll: true });
    };
    $$("button", section).forEach((b) => b.textContent.trim() === "Ver vídeo" && b.addEventListener("click", watch));
    video.addEventListener("ended", stop);
    addEventListener("keydown", (e) => e.key === "Escape" && stop());

    if (!reduce) {
      ensureLoaded();
      if (document.documentElement.classList.contains("intro-active")) addEventListener("nuven:intro-leaving", start, { once: true });
      else if (document.readyState === "complete") start();
      else addEventListener("load", start, { once: true });
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else { video.pause(); stop(); }
    }).observe(video);
  })();

  /* ---------- Entrance video (same rules as components/Intro.tsx) ---------- */
  (() => {
    const root = document.documentElement;
    const box = $("#intro");
    const video = box && $("video", box);
    if (!video || !root.classList.contains("intro-active")) return;
    const bar = $("div > div", box);
    const skip = $("button", box);
    let done = false, raf = 0;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      try { sessionStorage.setItem("nuven-intro-seen", "1"); } catch {}
      root.classList.add("intro-leaving");
      dispatchEvent(new Event("nuven:intro-leaving"));
      setTimeout(() => {
        root.classList.remove("intro-active", "intro-leaving");
        video.pause();
        dispatchEvent(new Event("nuven:intro-done"));
      }, 800);
    };
    const tick = () => {
      if (video.duration) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
      raf = requestAnimationFrame(tick);
    };
    video.preload = "auto";
    video.load();
    video.play().then(() => (raf = requestAnimationFrame(tick))).catch(finish);
    video.addEventListener("ended", finish);
    video.addEventListener("error", finish);
    skip.addEventListener("click", finish);
    addEventListener("keydown", (e) => ["Escape", " ", "ArrowDown", "PageDown"].includes(e.key) && finish());
    addEventListener("wheel", (e) => e.deltaY > 0 && finish(), { passive: true });
    addEventListener("touchmove", finish, { passive: true });
    setTimeout(finish, 10000);
    skip.focus({ preventScroll: true });
  })();

  /* ---------- Hero ribbon: bars rise, ribbon unfolds, gentle tilt ---------- */
  const tween = (ms, delay, fn) =>
    new Promise((res) => {
      const start = performance.now() + delay;
      const step = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / ms));
        fn(easeOutExpo(t));
        if (t < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  const playRibbon = () => {
    if (reduce) return;
    $$("[data-bar]").forEach((el, i) => {
      const from = el.dataset.bar === "up" ? 10 : -10;
      el.animate(
        [
          { opacity: 0, transform: `translateY(${from}px)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: 1000, delay: 100 + i * 100, easing: EASE, fill: "backwards" },
      );
    });
    const rect = $("[data-ribbon-mask]");
    if (rect) {
      rect.setAttribute("width", "0");
      tween(1500, 450, (v) => rect.setAttribute("width", String(v * 120)));
    }
  };
  playRibbon();
  addEventListener("nuven:intro-done", playRibbon);
  if (!reduce) {
    const tilt = $("#hero-tilt");
    if (tilt && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      addEventListener("pointermove", (e) => {
        tx = (e.clientX / innerWidth) * 2 - 1;
        ty = (e.clientY / innerHeight) * 2 - 1;
      }, { passive: true });
      const loop = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        tilt.style.transform = `translate(${(cx * 10).toFixed(2)}px, ${(cy * 8).toFixed(2)}px)`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  /* ---------- Header: translucent on scroll + mobile menu ---------- */
  const header = $("header");
  const toggle = $('button[aria-controls="mobile-menu"]');
  const menuIcon = toggle ? toggle.innerHTML : "";
  let menu = null;
  const paintHeader = () => {
    const solid = scrollY > 12 || !!menu;
    header.classList.toggle("border-line", solid);
    header.classList.toggle("bg-ink/75", solid);
    header.classList.toggle("backdrop-blur-xl", solid);
    header.classList.toggle("backdrop-saturate-150", solid);
    header.classList.toggle("border-transparent", !solid);
    header.classList.toggle("bg-transparent", !solid);
  };
  addEventListener("scroll", paintHeader, { passive: true });
  paintHeader();

  const navLinks = $$('nav[aria-label="Principal"] a').map((a) => ({ href: a.getAttribute("href"), label: a.textContent }));
  const headerCta = $('header a[href*="contacto"]');
  const ctaHref = headerCta ? headerCta.getAttribute("href") : "index.html#contacto";
  const ctaClass = (headerCta ? headerCta.className : "").replace(/h-9 px-4 text-\[0\.8125rem\]/, "h-12 px-6 text-[0.9375rem]");

  function onMenuKey(e) {
    if (e.key === "Escape") return closeMenu();
    if (e.key !== "Tab" || !menu) return;
    const items = [toggle, ...$$("a", menu)];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openMenu() {
    menu = document.createElement("div");
    menu.id = "mobile-menu";
    menu.className = "fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-ink sm:top-[4.5rem] lg:hidden";
    menu.innerHTML = `<div class="mx-auto w-full max-w-[1240px] px-5 sm:px-8 flex min-h-full flex-col justify-between gap-12 py-10">
      <nav aria-label="Móvil"><ul class="flex flex-col">${navLinks
        .map((l) => `<li class="border-b border-line"><a href="${l.href}" class="block py-4 font-display text-[1.75rem] font-medium tracking-[-0.02em] text-fg">${l.label}</a></li>`)
        .join("")}</ul></nav>
      <a href="${ctaHref}" class="${ctaClass} w-full">Solicitar presupuesto</a></div>`;
    document.body.appendChild(menu);
    if (!reduce) {
      menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      $$("li", menu).forEach((li, i) =>
        li.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], {
          duration: 500, delay: 40 + i * 35, easing: EASE, fill: "backwards",
        }),
      );
    }
    $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
    document.body.style.overflow = "hidden";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    toggle.innerHTML = X_ICON;
    document.addEventListener("keydown", onMenuKey);
    $("a", menu).focus();
    paintHeader();
  }
  function closeMenu() {
    if (!menu) return;
    menu.remove();
    menu = null;
    document.body.style.overflow = "";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    toggle.innerHTML = menuIcon;
    document.removeEventListener("keydown", onMenuKey);
    toggle.focus();
    paintHeader();
  }
  toggle?.addEventListener("click", () => (menu ? closeMenu() : openMenu()));
  addEventListener("resize", () => innerWidth >= 1024 && closeMenu());

  /* ---------- Process timeline progress ---------- */
  const track = $("[data-progress]")?.parentElement;
  const bars = $$("[data-progress]");
  const paintProgress = () => {
    if (!track) return;
    const r = track.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3)));
    bars.forEach((b) => (b.style.transform = b.dataset.progress === "y" ? `scaleY(${p})` : `scaleX(${p})`));
  };
  addEventListener("scroll", paintProgress, { passive: true });
  addEventListener("resize", paintProgress);
  paintProgress();

  /* ---------- FAQ accordion ---------- */
  const faqButtons = $$("#faq button[aria-controls]");
  const setFaq = (btn, open) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("grid-rows-[1fr]", open);
    panel.classList.toggle("opacity-100", open);
    panel.classList.toggle("grid-rows-[0fr]", !open);
    panel.classList.toggle("opacity-0", !open);
    panel.inert = !open;
    $("svg", btn).classList.toggle("rotate-45", open);
  };
  faqButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      faqButtons.forEach((b) => setFaq(b, b === btn && willOpen));
    }),
  );

  /* ---------- Cookie banner ---------- */
  const KEY = "nuven-consent";
  const readConsent = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  };
  let banner = null;
  const btnBase = "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] active:scale-[0.97] h-9 px-4 text-[0.8125rem]";
  function showBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "cookie-title");
    banner.setAttribute("aria-describedby", "cookie-text");
    banner.className = "fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-line-strong bg-raised/95 p-5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm sm:p-6";
    banner.innerHTML = `<h2 id="cookie-title" class="font-display text-[0.9375rem] font-medium">Tu privacidad</h2>
      <p id="cookie-text" class="mt-2 text-[0.875rem] leading-relaxed text-muted">Usamos cookies técnicas necesarias para que la web funcione. Solo usaremos cookies de análisis si nos das tu permiso. <a href="cookies.html" class="link-underline text-fg">Leer la política de cookies</a></p>
      <div class="mt-5 grid grid-cols-2 gap-2">
        <button type="button" data-choice="0" class="${btnBase} border border-line-strong text-fg hover:border-fg/40 hover:bg-white/[0.04]">Rechazar</button>
        <button type="button" data-choice="1" class="${btnBase} bg-fg text-ink hover:bg-white">Aceptar</button>
      </div>`;
    document.body.appendChild(banner);
    if (!reduce) banner.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: EASE });
    $$("[data-choice]", banner).forEach((b) =>
      b.addEventListener("click", () => {
        try { localStorage.setItem(KEY, JSON.stringify({ analytics: b.dataset.choice === "1", date: new Date().toISOString() })); } catch {}
        banner.remove();
        banner = null;
      }),
    );
  }
  setTimeout(() => !readConsent() && showBanner(), 600);
  $$("footer button").forEach((b) => /cookies/i.test(b.textContent) && b.addEventListener("click", showBanner));

  /* ---------- Contact form ---------- */
  const form = $("#contacto form");
  if (!form) return;
  const MSG = {
    name: "Escribe tu nombre.",
    email: "Escribe un email válido, por ejemplo nombre@dominio.com.",
    projectType: "Elige el tipo de proyecto.",
    budget: "Elige un presupuesto aproximado.",
    message: "Cuéntanos un poco más (al menos 20 caracteres).",
    privacy: "Necesitamos que aceptes la política de privacidad para responderte.",
  };
  const validate = () => {
    const v = (n) => (form.elements[n].value || "").trim();
    const err = {};
    if (v("name").length < 2) err.name = MSG.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) err.email = MSG.email;
    if (!v("projectType")) err.projectType = MSG.projectType;
    if (!v("budget")) err.budget = MSG.budget;
    if (v("message").length < 20) err.message = MSG.message;
    if (!form.elements.privacy.checked) err.privacy = MSG.privacy;
    return err;
  };
  let shown = {};
  const render = (err) => {
    for (const name of Object.keys(MSG)) {
      const el = form.elements[name];
      const anchor = el.tagName === "SELECT" || el.type === "checkbox" ? el.parentElement : el;
      document.getElementById(name + "-error")?.remove();
      el.setAttribute("aria-invalid", String(!!err[name]));
      if (el.type !== "checkbox") {
        el.classList.toggle("border-danger/70", !!err[name]);
        el.classList.toggle("border-line", !err[name]);
      }
      if (err[name]) {
        const p = document.createElement("p");
        p.id = name + "-error";
        p.className = "mt-2 flex items-center gap-1.5 text-[0.8125rem] text-danger";
        p.innerHTML = ALERT_ICON;
        p.append(err[name]);
        anchor.after(p);
        el.setAttribute("aria-describedby", p.id);
      } else el.removeAttribute("aria-describedby");
    }
    shown = err;
  };
  const recheck = (e) => {
    const n = e.target.name;
    if (!shown[n]) return;
    const err = validate();
    render(Object.fromEntries(Object.entries(shown).filter(([k]) => k !== n || err[k])));
  };
  form.addEventListener("input", recheck);
  form.addEventListener("change", recheck);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = validate();
    render(err);
    const first = Object.keys(err)[0];
    if (first) return form.elements[first].focus();
    const submit = $('button[type="submit"]', form);
    const original = submit.innerHTML;
    const data = Object.fromEntries(["name", "email", "projectType", "budget", "message"].map((n) => [n, form.elements[n].value.trim()]));
    if (form.elements.company_website?.value) return; // honeypot: bots fill it in

    const showResult = (title, text) => {
      const ok = document.createElement("div");
      ok.tabIndex = -1;
      ok.setAttribute("role", "status");
      ok.className = "flex min-h-[28rem] flex-col items-start justify-center outline-none";
      ok.innerHTML = `${CHECK_ICON}
        <h3 class="mt-6 text-[1.75rem] font-semibold tracking-[-0.03em]"></h3>
        <p class="mt-3 max-w-[40ch] text-muted"></p>
        <button type="button" class="${btnBase} mt-8 border border-line-strong text-fg hover:border-fg/40 hover:bg-white/[0.04]">Enviar otro mensaje</button>`;
      $("h3", ok).textContent = title;
      $("p", ok).textContent = text;
      form.replaceWith(ok);
      if (!reduce) ok.animate([{ opacity: 0, transform: "translateY(12px)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 500, easing: EASE });
      ok.focus();
      $("button", ok).addEventListener("click", () => {
        form.reset();
        render({});
        ok.replaceWith(form);
        form.elements.name.focus();
      });
    };

    if (!FORM_ENDPOINT) {
      const body = `Nombre: ${data.name}\nEmail: ${data.email}\nTipo de proyecto: ${data.projectType}\nPresupuesto: ${data.budget}\n\n${data.message}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Solicitud de presupuesto: ${data.projectType}`)}&body=${encodeURIComponent(body)}`;
      showResult("Ya casi está.", `Se ha abierto tu correo con el mensaje listo: solo tienes que enviarlo. Si no se ha abierto, escríbenos a ${CONTACT_EMAIL}.`);
      return;
    }

    submit.disabled = true;
    submit.innerHTML = SPIN_ICON + "Enviando…";
    const errorBox = $("#form-error");
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        showResult("Mensaje enviado.", "Gracias por escribirnos. Te responderemos en menos de 24 horas laborables.");
      })
      .catch(() => {
        if (errorBox) errorBox.textContent = `No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos a ${CONTACT_EMAIL}.`;
      })
      .finally(() => {
        submit.disabled = false;
        submit.innerHTML = original;
      });
  });
})();
