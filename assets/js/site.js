// Light and dark mode, and the date of the last update. Each part does
// nothing where its element is absent.
(function () {
  'use strict';

  var root = document.documentElement;

  // ----- Light and dark -----
  // The choice is kept in local storage. Without one, the page follows the
  // system setting, in CSS alone.
  var button = document.querySelector('.toggle');
  var system = window.matchMedia('(prefers-color-scheme: dark)');

  function theme() {
    return root.dataset.theme || (system.matches ? 'dark' : 'light');
  }

  function show() {
    var dark = theme() === 'dark';
    if (button) button.setAttribute('aria-pressed', String(dark));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#111111' : '#ffffff';
  }

  if (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      show();
    });
  }
  if (system.addEventListener) system.addEventListener('change', show);
  show();

  // ----- Date of the last push to the repository of this site -----
  var line = document.getElementById('updated');
  if (!line) return;

  var key = 'lastPushDate';
  var maxAge = 1000 * 60 * 60;

  function write(iso) {
    var day = new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    line.textContent = 'Adam Bekkar, last updated ' + day;
  }

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { cached = null; }
  if (cached && Date.now() - cached.fetchedAt < maxAge) { write(cached.date); return; }

  fetch('https://api.github.com/repos/Zeleph25/adam.bekkar.ch/commits/main')
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (!data) return;
      var date = data.commit.committer.date;
      write(date);
      try { localStorage.setItem(key, JSON.stringify({ date: date, fetchedAt: Date.now() })); } catch (e) { /* private mode */ }
    })
    .catch(function () { /* offline: the static line stays */ });
})();
