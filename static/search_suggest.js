/* 首頁搜尋框：輸入科目時即時顯示該科目所在年級（學期）的雲端資料夾按鈕。
 * 資料來自 /api/subjects（subject_links.py），比對規則與後端 find_subjects 相同。 */
(function () {
  'use strict';
  var input = document.getElementById('searchInput');
  var form = document.getElementById('searchForm');
  var panel = document.getElementById('ssPanel');
  if (!input || !form || !panel) return;

  var data = null;
  var loading = null;
  var rows = [];
  var active = -1;

  var CLOUD_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>';

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      loading = fetch('/api/subjects')
        .then(function (r) { return r.json(); })
        .then(function (d) { data = d; return d; })
        .catch(function () { loading = null; return null; });
    }
    return loading;
  }

  function normalize(t) {
    return String(t || '').toLowerCase().replace(/[\s()（）［］\[\]・·．.,，、\-_/]+/g, '');
  }

  function score(q, names) {
    var best = null;
    for (var i = 0; i < names.length; i++) {
      var n = normalize(names[i]);
      if (!n) continue;
      var s = null;
      if (q === n) s = i === 0 ? 0 : 1;
      else if (n.indexOf(q) === 0) s = 2;
      else if (q.length >= 2 && n.indexOf(q) !== -1) s = 3;
      else if (n.length >= 2 && q.indexOf(n) !== -1) s = 4;
      if (s !== null && (best === null || s < best)) best = s;
    }
    return best;
  }

  function findSubjects(q) {
    var hits = [];
    data.subjects.forEach(function (subj, order) {
      var sc = score(q, [subj.name].concat(subj.aliases || []));
      if (sc !== null) hits.push({ sc: sc, order: order, subj: subj });
    });
    hits.sort(function (a, b) { return a.sc - b.sc || a.order - b.order; });
    return hits.slice(0, 6).map(function (h) { return h.subj; });
  }

  function findSemesters(q) {
    return data.semesters.filter(function (s) {
      var n = normalize(s.semester);
      var short = n.replace('學期', '');
      return q === n || q === short || (q.length >= 2 && n.indexOf(q) === 0) ||
        (short.length >= 2 && q.indexOf(short) !== -1);
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function linkBtn(cls, href, label, withIcon) {
    var a = el('a', 'ss-btn ' + cls);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    if (withIcon) a.innerHTML = CLOUD_SVG;
    a.appendChild(document.createTextNode(label));
    return a;
  }

  function hide() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function setActive(i) {
    rows.forEach(function (r, k) { r.classList.toggle('active', k === i); });
    active = i;
    if (rows[i]) rows[i].scrollIntoView({ block: 'nearest' });
  }

  function render() {
    var raw = input.value.trim();
    var q = normalize(raw);
    if (!q || !data) { hide(); return; }

    var subjects = findSubjects(q);
    var semesters = findSemesters(q);
    panel.innerHTML = '';
    rows = [];
    active = -1;

    if (subjects.length) {
      panel.appendChild(el('div', 'ss-head', '科目雲端資料夾'));
      subjects.forEach(function (s) {
        var row = el('div', 'ss-row');
        row.setAttribute('role', 'option');
        row.dataset.drive = s.drive;
        var info = el('div', 'ss-info');
        info.appendChild(el('div', 'ss-name', s.name));
        info.appendChild(el('span', 'ss-tag', s.semester));
        row.appendChild(info);
        row.appendChild(linkBtn('ss-drive', s.drive, s.semester.replace('學期', '') + ' 雲端', true));
        if (s.notebook) row.appendChild(linkBtn('ss-nb', s.notebook, 'NotebookLM', false));
        panel.appendChild(row);
        rows.push(row);
      });
    }

    if (semesters.length) {
      panel.appendChild(el('div', 'ss-head', '學期雲端資料夾'));
      var chips = el('div', 'ss-chips');
      semesters.forEach(function (s) {
        chips.appendChild(linkBtn('ss-drive', s.drive, s.semester, true));
      });
      panel.appendChild(chips);
    }

    if (!subjects.length && !semesters.length) {
      panel.appendChild(el('div', 'ss-empty', '找不到符合的科目，按 Enter 搜尋全站'));
    }

    var all = el('a', 'ss-all', '搜尋全站「' + raw + '」 →');
    all.href = '/search?q=' + encodeURIComponent(raw);
    panel.appendChild(all);

    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('focus', function () { load().then(render); });
  input.addEventListener('input', function () { load().then(render); });

  input.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'ArrowDown' && rows.length) {
      e.preventDefault();
      setActive((active + 1) % rows.length);
    } else if (e.key === 'ArrowUp' && rows.length) {
      e.preventDefault();
      setActive((active - 1 + rows.length) % rows.length);
    } else if (e.key === 'Enter' && active >= 0 && rows[active]) {
      e.preventDefault();
      window.open(rows[active].dataset.drive, '_blank', 'noopener');
    } else if (e.key === 'Escape') {
      hide();
    }
  });

  // 點擊列的空白處也開啟雲端
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var row = e.target.closest('.ss-row');
    if (row) window.open(row.dataset.drive, '_blank', 'noopener');
  });

  // 首頁其他地方的 click 監聽不會關掉面板，這裡自己處理
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !form.contains(e.target)) hide();
  });
})();
