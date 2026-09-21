// Apply the preference before paint; storage may be unavailable in private contexts.
(() => {
  const key = 'life-playbook-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  if (!['light', 'dark'].includes(preference)) preference = null;
  function apply() {
    const dark = preference ? preference === 'dark' : system.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.textContent = dark ? '浅色模式' : '深色模式';
      button.title = dark ? '切换为浅色模式' : '切换为深色模式';
    }
  }
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    });
  });
})();
