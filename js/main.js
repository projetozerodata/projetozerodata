/* ==========================================================================
   ZeroData — Interações
   JavaScript puro, modular. Dependência opcional: Lucide (ícones via CDN).
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Ícones (Lucide) ---------- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ---------- Navbar: fundo ao rolar ---------- */
  function initNavbarScroll() {
    const nav = $('#nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Menu: dropdowns + painel mobile ---------- */
  function initMenu() {
    const panel = $('#nav-panel');
    const toggle = $('#nav-toggle');
    const closeBtn = $('#nav-close');
    const backdrop = $('#nav-backdrop');
    const dropdowns = $$('.has-dd');
    const desktopMq = window.matchMedia('(min-width: 900px)');

    function setDropdown(item, open) {
      item.classList.toggle('open', open);
      const btn = $('.menu__link', item);
      if (btn) btn.setAttribute('aria-expanded', String(open));
    }
    function closeDropdowns(except) {
      dropdowns.forEach((d) => { if (d !== except) setDropdown(d, false); });
    }

    dropdowns.forEach((item) => {
      const btn = $('.menu__link', item);
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('open');
        // No desktop só um dropdown por vez; no mobile (acordeão) também.
        closeDropdowns(item);
        setDropdown(item, willOpen);
      });
      // Desktop: ao tirar o mouse, fecha (o hover é tratado via CSS)
      item.addEventListener('mouseleave', () => { if (desktopMq.matches) setDropdown(item, false); });
    });

    function openPanel() {
      panel.classList.add('is-open');
      backdrop.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      document.body.style.overflow = 'hidden';
      const first = $('.menu__link', panel);
      if (first) first.focus({ preventScroll: true });
    }
    function closePanel(returnFocus) {
      panel.classList.remove('is-open');
      backdrop.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
      closeDropdowns();
      if (returnFocus) toggle.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', () => (panel.classList.contains('is-open') ? closePanel(true) : openPanel()));
    closeBtn.addEventListener('click', () => closePanel(true));
    backdrop.addEventListener('click', () => closePanel(false));

    // Fecha ao clicar em qualquer link do painel
    $$('a', panel).forEach((a) => a.addEventListener('click', () => { closePanel(false); closeDropdowns(); }));

    // Esc fecha dropdowns e o painel
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const openDd = dropdowns.find((d) => d.classList.contains('open'));
      if (panel.classList.contains('is-open')) closePanel(true);
      else if (openDd) { setDropdown(openDd, false); $('.menu__link', openDd).focus(); }
    });

    // Clique fora fecha dropdowns (desktop)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dd')) closeDropdowns();
    });

    // Se redimensionar para desktop, garante estado limpo
    desktopMq.addEventListener('change', (e) => { if (e.matches) closePanel(false); });
  }

  /* ---------- Scroll spy ---------- */
  function initScrollSpy() {
    const links = $$('[data-spy]');
    const ids = [...new Set(links.map((l) => l.dataset.spy))];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    function setActive(id) {
      links.forEach((l) => {
        const on = l.dataset.spy === id;
        l.classList.toggle('is-active', on);
        if (on && l.tagName === 'A') l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => obs.observe(s));

    // Remove destaque ao voltar para o topo
    window.addEventListener('scroll', () => { if (window.scrollY < 200) setActive(''); }, { passive: true });
  }

  /* ---------- Revelação ao rolar ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    // Pequeno atraso escalonado entre irmãos
    $$('.grid, .solutions, .plans, .timeline, .metrics__grid, .faq').forEach((group) => {
      $$('.reveal', group).forEach((el, i) => el.style.setProperty('--rd', `${Math.min(i, 5) * 0.08}s`));
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => obs.observe(el));
  }

  /* ---------- Contadores animados ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function run(el) {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion || target === 0) { el.textContent = target + suffix; return; }
      const duration = 1600;
      const start = performance.now();
      (function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * easeOut(p)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    }

    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => obs.observe(el));
  }

  /* ---------- FAQ (acordeão acessível) ---------- */
  function initFaq() {
    $$('.faq__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  /* ---------- Formulário de contato ---------- */
  function initForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('#form-status');
    const submitBtn = $('#form-submit');

    const rules = {
      nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
      email: (v) => {
        if (!v.trim()) return 'Informe seu e-mail corporativo.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Digite um e-mail válido, como voce@empresa.com.br.';
        if (/@(gmail|hotmail|outlook|yahoo|live|icloud)\./i.test(v)) return 'Use seu e-mail corporativo (não pessoal).';
        return '';
      },
      empresa: (v) => (v.trim().length >= 2 ? '' : 'Informe o nome da empresa.'),
      mensagem: (v) => (v.trim().length >= 10 ? '' : 'Conte um pouco mais (mínimo de 10 caracteres).')
    };
    const errorIds = { nome: 'e-nome', email: 'e-email', empresa: 'e-empresa', mensagem: 'e-msg' };

    function validateField(input) {
      const msg = rules[input.name](input.value);
      const err = document.getElementById(errorIds[input.name]);
      err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    const fields = $$('input, textarea', form);
    fields.forEach((f) => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') validateField(f); });
    });

    /**
     * ENVIO DO FORMULÁRIO
     * GitHub Pages é estático (sem backend). Para receber as mensagens, conecte um serviço:
     *
     * Opção A — Formspree (https://formspree.io):
     *   const res = await fetch('https://formspree.io/f/SEU_ID', {
     *     method: 'POST',
     *     headers: { 'Accept': 'application/json' },
     *     body: new FormData(form)
     *   });
     *   if (!res.ok) throw new Error('Falha no envio');
     *
     * Opção B — EmailJS (https://www.emailjs.com):
     *   await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form, 'PUBLIC_KEY');
     *
     * Enquanto nenhum serviço estiver conectado, o envio é apenas simulado.
     */
    async function submitForm(formEl) {
      await new Promise((resolve) => setTimeout(resolve, 700)); // simulação
      return true;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.hidden = true;
      const results = fields.map(validateField);
      const firstInvalid = fields.find((f) => f.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) { firstInvalid.focus(); return; }
      if (results.includes(false)) return;

      submitBtn.disabled = true;
      const label = submitBtn.textContent;
      submitBtn.textContent = 'Enviando…';
      try {
        await submitForm(form);
        form.reset();
        fields.forEach((f) => f.setAttribute('aria-invalid', 'false'));
        status.hidden = false;
        initIcons();
      } catch (err) {
        const e2 = document.getElementById('e-msg');
        e2.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
      }
    });
  }

  /* ---------- Rodapé: ano e voltar ao topo ---------- */
  function initToTop() {
    const btn = $('#to-top');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Inicialização ---------- */
  function init() {
    initIcons();
    initNavbarScroll();
    initMenu();
    initScrollSpy();
    initReveal();
    initCounters();
    initFaq();
    initForm();
    initToTop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
