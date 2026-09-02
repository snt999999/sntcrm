(function () {
  // Emergency cache reset: old service worker could serve a broken cached admin.js.
  function showCacheResetNote() {
    if (!/(^|\/)admin\.html($|[?#])/.test(window.location.pathname + window.location.search)) return;
    if (sessionStorage.getItem('solncanet_cache_reset_note') === '1') return;
    sessionStorage.setItem('solncanet_cache_reset_note', '1');
    const box = document.createElement('div');
    box.id = 'pwaCacheResetNote';
    box.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9999;background:#0f2347;color:white;border-radius:14px;padding:12px 14px;box-shadow:0 16px 48px rgba(0,0,0,.24);font:700 13px/1.35 Arial,sans-serif;max-width:330px';
    box.innerHTML = 'Кеш CRM очищен. Если кнопки не ожили — закройте все вкладки сайта и откройте админку заново.';
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 7000);
  }

  async function clearOldCacheAndWorkers() {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => String(key).includes('solncanet')).map((key) => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister().catch(() => null)));
      }
      showCacheResetNote();
    } catch (_) {}
  }

  window.addEventListener('load', clearOldCacheAndWorkers);
})();
