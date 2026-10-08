/* ==========================================================================
   ZeroData — Demo do chat (simulado, sem backend e sem chamadas externas)
   ========================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const els = {
    app: $('#app'), sidebar: $('#sidebar'), scrim: $('#scrim'), menuBtn: $('#menu-btn'), closeBtn: $('#sidebar-close'),
    newChat: $('#new-chat'), history: $('#history-list'),
    scroll: $('#scroll'), empty: $('#empty'), messages: $('#messages'),
    form: $('#composer'), prompt: $('#prompt'), send: $('#send'), attach: $('#attach'), toast: $('#toast')
  };

  /* ---------- Base de respostas simuladas ---------- */
  const KB = {
    contrato: {
      q: 'Resuma os principais riscos do contrato com o fornecedor Alfa.',
      html: [
        '<p>Analisei o contrato com o fornecedor Alfa e destaquei os <strong>3 pontos de maior risco</strong>:</p>',
        '<ul><li><strong>Renovação automática (cláusula 12.1):</strong> renova por 24 meses se não houver aviso com 90 dias de antecedência.</li>' +
        '<li><strong>Multa rescisória (cláusula 14.3):</strong> equivale a 50% do saldo contratual restante, acima do padrão de mercado.</li>' +
        '<li><strong>Limitação de responsabilidade (cláusula 9.2):</strong> limitada a 3 meses de faturamento, mesmo em caso de vazamento de dados.</li></ul>',
        '<p>Recomendo negociar a janela de aviso para 30 dias e incluir cláusula específica de proteção de dados conforme a LGPD.</p>'
      ].join(''),
      sources: ['Contrato_Alfa_v3.pdf · p. 8', 'Contrato_Alfa_v3.pdf · p. 11', 'Politica_Contratos.docx']
    },
    politica: {
      q: 'Qual o prazo de reembolso previsto na política de viagens?',
      html: [
        '<p>Conforme a <strong>Política de Viagens Corporativas (seção 4.2)</strong>, o reembolso é pago em até <strong>7 dias úteis</strong> após a aprovação da prestação de contas.</p>',
        '<ul><li>A prestação de contas deve ser enviada em até <strong>5 dias úteis</strong> após o retorno.</li>' +
        '<li>Despesas acima de R$ 500,00 exigem aprovação do gestor direto.</li>' +
        '<li>Notas fiscais devem estar em nome da empresa.</li></ul>'
      ].join(''),
      sources: ['Politica_Viagens_2026.pdf · p. 6', 'Manual_Financeiro.pdf · p. 22']
    },
    vendas: {
      q: 'Faça um resumo das vendas do último trimestre por região.',
      html: [
        '<p>No último trimestre, o faturamento total foi de <strong>R$ 12,4 milhões</strong>, com crescimento de <strong>8,2%</strong> sobre o trimestre anterior.</p>',
        '<ul><li><strong>Sudeste:</strong> R$ 5,6 mi (45%) — maior volume, crescimento de 6%.</li>' +
        '<li><strong>Sul:</strong> R$ 3,1 mi (25%) — melhor desempenho, alta de 14%.</li>' +
        '<li><strong>Nordeste:</strong> R$ 2,2 mi (18%) — estável.</li>' +
        '<li><strong>Centro-Oeste e Norte:</strong> R$ 1,5 mi (12%) — queda de 3%.</li></ul>',
        '<p>O destaque negativo é a região Norte, impactada por atrasos logísticos. Posso detalhar por produto, se quiser.</p>'
      ].join(''),
      sources: ['BI_Vendas_T3.xlsx · aba Regiões', 'Relatorio_Logistica.pdf · p. 4']
    },
    privacidade: {
      html: [
        '<p><strong>Não.</strong> Este assistente foi projetado para processar os dados da sua empresa dentro da sua própria infraestrutura, sem depender de APIs externas para as consultas.</p>',
        '<ul><li>Documentos e perguntas são processados <strong>100% localmente</strong>.</li>' +
        '<li>Nenhum dado é enviado a terceiros nem usado para treinar modelos externos.</li>' +
        '<li>Cada acesso é registrado em <strong>logs de auditoria</strong>, com controle por perfil.</li>' +
        '<li>Criptografia em repouso e em trânsito, com aderência à LGPD.</li></ul>'
      ].join(''),
      sources: ['Arquitetura_ZeroData.pdf · p. 3', 'Politica_Seguranca.pdf · p. 9']
    },
    atendimento: {
      html: [
        '<p>Posso ajudar sua equipe de atendimento com respostas rápidas e consistentes, baseadas no <strong>conhecimento oficial</strong> da empresa.</p>',
        '<ul><li>Sugere respostas a partir de manuais, FAQs e histórico de chamados.</li>' +
        '<li>Classifica e prioriza solicitações automaticamente.</li>' +
        '<li>Mantém o tom de voz da marca e cita a fonte de cada informação.</li></ul>',
        '<p>Tudo isso sem que as conversas dos seus clientes saiam da sua infraestrutura.</p>'
      ].join(''),
      sources: ['Base_Conhecimento_Atendimento.pdf', 'FAQ_Clientes.docx']
    },
    padrao: {
      html: [
        '<p>Esta é uma <strong>demonstração simulada</strong> do Assistente ZeroData, então minhas respostas aqui são ilustrativas.</p>',
        '<p>Na versão real, eu consulto os <strong>documentos e sistemas da sua empresa</strong> e respondo citando as fontes, tudo dentro da sua infraestrutura. Experimente perguntar sobre:</p>',
        '<ul><li>Riscos e cláusulas de um <strong>contrato</strong></li>' +
        '<li>Prazos em <strong>políticas internas</strong></li>' +
        '<li>Resumo de <strong>vendas</strong> do trimestre</li>' +
        '<li>Como seus <strong>dados são protegidos</strong></li></ul>'
      ].join(''),
      sources: ['Demonstracao_ZeroData']
    }
  };

  function pickAnswer(text) {
    const t = text.toLowerCase();
    if (/contrat|cl[aá]usula|fornecedor|risco/.test(t)) return KB.contrato;
    if (/reembolso|viagem|pol[ií]tica|prazo/.test(t)) return KB.politica;
    if (/venda|trimestre|regi[aã]o|faturamento|indicador|relat[oó]rio/.test(t)) return KB.vendas;
    if (/dados|privacidade|lgpd|seguran|saem|nuvem|externa/.test(t)) return KB.privacidade;
    if (/atendimento|cliente|suporte|chamado/.test(t)) return KB.atendimento;
    return KB.padrao;
  }

  /* ---------- Utilidades ---------- */
  const markSvg = '<svg aria-hidden="true"><use href="#zd-mark"/></svg>';
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const scrollDown = () => { els.scroll.scrollTop = els.scroll.scrollHeight; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  let busy = false;

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => els.toast.classList.remove('is-on'), 2200);
  }

  /** Revela o HTML aos poucos sem quebrar as tags (tags entram inteiras, texto em pedaços). */
  async function streamHtml(target, html) {
    const tokens = html.split(/(<[^>]+>)/).filter(Boolean);
    let out = '';
    target.classList.add('is-streaming');
    for (const tok of tokens) {
      if (tok.startsWith('<')) { out += tok; target.innerHTML = out; continue; }
      const words = tok.split(/(\s+)/);
      for (const w of words) {
        out += w;
        target.innerHTML = out;
        scrollDown();
        if (reduceMotion) continue;
        if (/\S/.test(w)) await sleep(18 + Math.random() * 28);
      }
    }
    target.classList.remove('is-streaming');
  }

  /* ---------- Mensagens ---------- */
  function addUser(text) {
    const m = document.createElement('div');
    m.className = 'msg msg--user';
    const b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = text;
    m.appendChild(b);
    els.messages.appendChild(m);
    scrollDown();
  }

  function addAiShell() {
    const m = document.createElement('div');
    m.className = 'msg msg--ai';
    m.innerHTML =
      '<div class="avatar">' + markSvg + '</div>' +
      '<div class="ai-body"><div class="ai-name">Assistente ZeroData</div>' +
      '<div class="ai-content"><span class="typing" aria-label="Processando"><i></i><i></i><i></i> Consultando documentos locais…</span></div></div>';
    els.messages.appendChild(m);
    scrollDown();
    return m;
  }

  function finishAi(msg, answer, seconds) {
    const body = $('.ai-body', msg);
    const sources = answer.sources.map((s) => '<span class="source"><i data-lucide="file-text"></i>' + s + '</span>').join('');
    const extra = document.createElement('div');
    extra.className = 'ai-extra';
    extra.innerHTML =
      '<div class="sources"><span class="sources__label">Fontes:</span>' + sources + '</div>' +
      '<div class="meta">' +
      '<button class="meta__btn" type="button" data-act="copy" aria-label="Copiar resposta"><i data-lucide="copy"></i></button>' +
      '<button class="meta__btn" type="button" data-act="like" aria-label="Resposta útil" aria-pressed="false"><i data-lucide="thumbs-up"></i></button>' +
      '<button class="meta__btn" type="button" data-act="regen" aria-label="Gerar novamente"><i data-lucide="refresh-cw"></i></button>' +
      '<span class="meta__info"><i data-lucide="shield-check"></i>' + seconds + ' s · processado localmente · 0 chamadas externas</span></div>';
    body.appendChild(extra);
    icons();
    requestAnimationFrame(() => extra.classList.add('is-in'));
    msg._answer = answer;
    scrollDown();
  }

  async function respond(answer, existingMsg) {
    busy = true; updateSend();
    const msg = existingMsg || addAiShell();
    const content = $('.ai-content', msg);
    const old = $('.ai-extra', msg);
    if (old) old.remove();
    content.innerHTML = '<span class="typing" aria-label="Processando"><i></i><i></i><i></i> Consultando documentos locais…</span>';
    const delay = 900 + Math.random() * 700;
    await sleep(delay);
    await streamHtml(content, answer.html);
    finishAi(msg, answer, ((delay + 900) / 1000).toFixed(1).replace('.', ','));
    busy = false; updateSend();
  }

  async function submit(text) {
    text = text.trim();
    if (!text || busy) return;
    els.empty.hidden = true;
    els.app.classList.add('has-chat');
    setActive(null);
    addUser(text);
    els.prompt.value = '';
    autoGrow();
    await respond(pickAnswer(text));
  }

  /* ---------- Composer ---------- */
  function updateSend() { els.send.disabled = busy || !els.prompt.value.trim(); }
  function autoGrow() {
    els.prompt.style.height = 'auto';
    els.prompt.style.height = Math.min(els.prompt.scrollHeight, 180) + 'px';
    updateSend();
  }
  els.prompt.addEventListener('input', autoGrow);
  els.prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); els.form.requestSubmit(); }
  });
  els.form.addEventListener('submit', (e) => { e.preventDefault(); submit(els.prompt.value); });
  els.attach.addEventListener('click', () => toast('Na versão real, você anexa documentos que ficam apenas na sua infraestrutura.'));

  // Sugestões
  $$('.sug').forEach((b) => b.addEventListener('click', () => submit(b.dataset.prompt)));

  // Ações da resposta (copiar, curtir, regenerar)
  els.messages.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const msg = btn.closest('.msg');
    if (btn.dataset.act === 'copy') {
      const text = $('.ai-content', msg).innerText;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Resposta copiada.')).catch(() => toast('Não foi possível copiar.'));
    } else if (btn.dataset.act === 'like') {
      const on = btn.classList.toggle('is-on');
      btn.setAttribute('aria-pressed', String(on));
      if (on) toast('Obrigado pelo feedback!');
    } else if (btn.dataset.act === 'regen' && !busy) {
      respond(msg._answer, msg);
    }
  });

  /* ---------- Histórico e nova conversa ---------- */
  function setActive(btn) {
    $$('button', els.history).forEach((b) => b.classList.toggle('is-active', b === btn));
  }
  async function loadConversation(key, btn) {
    if (busy) return;
    const conv = KB[key];
    els.empty.hidden = true;
    els.app.classList.add('has-chat');
    els.messages.innerHTML = '';
    setActive(btn);
    addUser(conv.q);
    const msg = addAiShell();
    const content = $('.ai-content', msg);
    content.innerHTML = conv.html;
    finishAi(msg, conv, '1,4');
    closeSidebar();
  }
  $$('button', els.history).forEach((b) => b.addEventListener('click', () => loadConversation(b.dataset.conv, b)));

  els.newChat.addEventListener('click', () => {
    if (busy) return;
    els.messages.innerHTML = '';
    els.empty.hidden = false;
    els.app.classList.remove('has-chat');
    setActive(null);
    els.prompt.focus();
    closeSidebar();
  });

  /* ---------- Sidebar mobile ---------- */
  function openSidebar() { els.sidebar.classList.add('is-open'); els.scrim.hidden = false; els.menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeSidebar() { els.sidebar.classList.remove('is-open'); els.scrim.hidden = true; els.menuBtn.setAttribute('aria-expanded', 'false'); }
  els.menuBtn.addEventListener('click', openSidebar);
  els.closeBtn.addEventListener('click', closeSidebar);
  els.scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

  /* ---------- Init ---------- */
  icons();
  updateSend();
  els.prompt.focus({ preventScroll: true });
})();
