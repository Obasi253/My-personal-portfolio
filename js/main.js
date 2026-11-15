(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Navigation toggle (every page)
  const toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Academic planner (planner.html)
  const list = $('#task-list'), pform = $('#task-form'), summary = $('#planner-summary');
  if (list && pform && summary) {
    const KEY = 'cos106-planner-tasks-v2';
    const seed = [
      { id: 1, title: 'Revise COS 102 Problem Solving', due: '2026-12-08', done: false },
      { id: 2, title: 'Revise COS 106 (CSC 106) Introduction to Web Technologies', due: '2026-12-10', done: false },
      { id: 3, title: 'Revise MTH 102 Elementary Mathematics II', due: '2026-12-11', done: false }
    ];
    let filter = 'all';
    const load = () => {
      try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s)) return s; } catch (e) {}
      return seed;
    };
    let tasks = load();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} };
    const today = () => new Date().toISOString().slice(0, 10);

    function render() {
      list.textContent = '';
      const shown = tasks.filter((t) => filter === 'all' || (filter === 'done' ? t.done : !t.done));
      if (!shown.length) {
        const li = document.createElement('li');
        li.className = 'empty-state';
        li.textContent = tasks.length ? 'No tasks in this view.' : 'No tasks yet. Add one above.';
        list.appendChild(li);
      }
      shown.forEach((t) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (t.done ? ' is-done' : '') + (!t.done && t.due && t.due < today() ? ' is-overdue' : '');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = t.done;
        cb.setAttribute('aria-label', 'Mark "' + t.title + '" as completed');
        cb.addEventListener('change', () => { t.done = cb.checked; save(); render(); });
        const body = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'task-title'; title.textContent = t.title;
        body.appendChild(title);
        if (t.due) {
          const meta = document.createElement('div');
          meta.className = 'task-meta';
          const d = document.createElement('span');
          d.className = 'date'; d.textContent = 'Due ' + t.due;
          meta.appendChild(d); body.appendChild(meta);
        }
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        const del = document.createElement('button');
        del.type = 'button'; del.className = 'btn btn-danger btn-sm'; del.textContent = 'Delete';
        del.addEventListener('click', () => { tasks = tasks.filter((x) => x.id !== t.id); save(); render(); });
        actions.appendChild(del);
        li.append(cb, body, actions);
        list.appendChild(li);
      });
      const done = tasks.filter((t) => t.done).length;
      summary.innerHTML = '<span><strong>' + tasks.length + '</strong> tasks</span><span><strong>' + done + '</strong> done</span><span><strong>' + (tasks.length - done) + '</strong> to do</span>';
    }

    pform.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#task-title'), due = $('#task-due'), err = $('#task-error');
      if (!input || !due || !err) return;
      const title = input.value.trim();
      input.closest('.field').classList.toggle('has-error', !title);
      err.textContent = title ? '' : 'Enter a task.';
      if (!title) return;
      tasks.push({ id: Date.now(), title: title, due: due.value, done: false });
      save(); pform.reset(); render();
    });
    $$('.filter-btn').forEach((b) => {
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        $$('.filter-btn').forEach((x) => x.classList.toggle('is-active', x === b));
        render();
      });
    });
    render();
  }

  // Contact form (contact.html)
  const form = $('#contact-form'), card = $('#confirmation');
  if (form && card) {
    const rules = {
      name: (v) => (v ? '' : 'Enter your name.'),
      email: (v) => (!v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.'),
      phone: (v) => (!v ? 'Enter your phone number.' : /^\d+$/.test(v) ? '' : 'Use digits only, with no spaces or symbols.'),
      message: (v) => (v ? '' : 'Enter a message.')
    };
    const status = $('#form-status');
    const check = (f) => {
      const msg = rules[f.name](f.value.trim());
      const field = f.closest('.field');
      field.classList.toggle('has-error', !!msg);
      field.querySelector('.error-message').textContent = msg;
      f.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    };
    Object.keys(rules).forEach((n) => form.elements[n].addEventListener('blur', (e) => check(e.target)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map((n) => check(form.elements[n])).every(Boolean);
      if (!ok) {
        status.className = 'form-status is-error';
        status.textContent = 'Fix the highlighted fields and try again.';
        return;
      }
      status.className = 'form-status';
      status.textContent = '';
      const v = (n) => form.elements[n].value.trim();
      $('#sum-name').textContent = v('name');
      $('#sum-email').textContent = v('email');
      $('#sum-phone').textContent = v('phone');
      $('#sum-message').textContent = v('message');
      const body = v('message') + '\n\nFrom: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone');
      $('#send-email').href = 'mailto:o.obi0800@miva.edu.ng?subject=' + encodeURIComponent('Portfolio message from ' + v('name')) + '&body=' + encodeURIComponent(body);
      form.hidden = true;
      card.hidden = false;
      card.focus();
    });
    $('#new-message').addEventListener('click', () => {
      form.reset();
      $$('.field', form).forEach((f) => { f.classList.remove('has-error'); f.querySelector('.error-message').textContent = ''; });
      card.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  // CGPA calculator (cgpa.html)
  const cform = $('#cgpa-form'), rowsEl = $('#course-rows'), result = $('#result'), cstatus = $('#calc-status');
  if (cform && rowsEl && result && cstatus) {
    const GRADES = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    const DEFAULTS = ['COS 102', 'COS 106 (CSC 106)', 'MTH 102', 'PHY 102', 'GST 122'];
    const el = (tag, props) => Object.assign(document.createElement(tag), props || {});
    function addRow(code, units) {
      const row = el('div', { className: 'calc-row' });
      const c = el('input', { type: 'text', className: 'c-code', value: code, placeholder: 'Course code' });
      c.setAttribute('aria-label', 'Course code');
      const u = el('input', { type: 'number', className: 'c-units', value: units });
      u.setAttribute('aria-label', 'Credit units');
      u.min = '1'; u.max = '10'; u.step = '1';
      const g = el('select', { className: 'c-grade' });
      g.setAttribute('aria-label', 'Grade');
      g.appendChild(el('option', { value: '', textContent: 'Grade' }));
      Object.keys(GRADES).forEach((k) => g.appendChild(el('option', { value: k, textContent: k + ' (' + GRADES[k] + ')' })));
      const rm = el('button', { type: 'button', className: 'btn btn-danger btn-sm', textContent: 'Remove' });
      rm.addEventListener('click', () => row.remove());
      row.append(c, u, g, rm);
      rowsEl.appendChild(row);
      return c;
    }
    const seedRows = () => { rowsEl.textContent = ''; DEFAULTS.forEach((d) => addRow(d, 3)); };
    const show = (msg, ok) => { cstatus.className = 'form-status ' + (ok ? 'is-success' : 'is-error'); cstatus.textContent = msg; };
    seedRows();

    const add = $('#add-course'), reset = $('#reset-courses');
    if (add) add.addEventListener('click', () => addRow('', 3).focus());
    if (reset) reset.addEventListener('click', () => {
      seedRows(); result.hidden = true; cstatus.className = 'form-status'; cstatus.textContent = '';
      ['#prev-units', '#prev-cgpa'].forEach((s) => { const i = $(s); if (i) i.value = ''; });
    });

    cform.addEventListener('submit', (e) => {
      e.preventDefault();
      result.hidden = true;
      let units = 0, points = 0, counted = 0, problem = '';
      $$('.calc-row', rowsEl).forEach((r) => {
        const g = $('.c-grade', r).value;
        if (!g) return;
        const u = Number($('.c-units', r).value);
        const name = $('.c-code', r).value.trim() || 'a course';
        if (!Number.isInteger(u) || u < 1 || u > 10) { problem = 'Credit units for ' + name + ' must be a whole number from 1 to 10.'; return; }
        units += u; points += u * GRADES[g]; counted++;
      });
      if (problem) return show(problem, false);
      if (!counted) return show('Select a grade for at least one course.', false);
      const pu = $('#prev-units').value.trim(), pc = $('#prev-cgpa').value.trim();
      let cum = null;
      if (pu || pc) {
        const puN = Number(pu), pcN = Number(pc);
        if (!pu || !pc || !Number.isInteger(puN) || puN < 0 || pcN < 0 || pcN > 5) {
          return show('For cumulative CGPA, enter whole-number units so far and a CGPA between 0 and 5.', false);
        }
        cum = (pcN * puN + points) / (puN + units);
      }
      $('#res-gpa').textContent = (points / units).toFixed(2);
      $('#res-units').textContent = String(units);
      $('#res-points').textContent = String(points);
      $('#res-cgpa').textContent = cum === null ? 'Add previous units and CGPA to see this' : cum.toFixed(2);
      result.hidden = false;
      show(counted + (counted === 1 ? ' course counted.' : ' courses counted.'), true);
    });
  }
})();
