(function () {
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
  }

  function shouldShowInstallBox() {
    // Установочный баннер показываем только в админке.
    // На клиентском главном экране он не нужен и не должен отвлекать клиентов.
    return /(^|\/)admin\.html($|[?#])/.test(window.location.pathname + window.location.search);
  }

  function createInstallButton() {
    if (!shouldShowInstallBox() || document.getElementById('pwaInstallBox') || isStandalone()) return;
    const box = document.createElement('div');
    box.id = 'pwaInstallBox';
    box.className = 'pwa-install-box';
    const iosText = 'На iPhone: нажмите «Поделиться» → «На экран Домой».';
    box.innerHTML = `
      <div><b>СОЛНЦАНЕТ как приложение</b><span>${isIOS() ? iosText : 'Установите ярлык на телефон для быстрого входа.'}</span></div>
      <button type="button" id="pwaInstallBtn">Установить</button>
      <button type="button" id="pwaInstallClose" aria-label="Скрыть">×</button>
    `;
    document.body.appendChild(box);
    const btn = document.getElementById('pwaInstallBtn');
    const close = document.getElementById('pwaInstallClose');
    close.addEventListener('click', () => { localStorage.setItem('solncanet_pwa_install_hidden', '1'); box.remove(); });
    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => null);
        deferredPrompt = null;
        box.remove();
      } else if (isIOS()) {
        alert(iosText);
      } else {
        alert('Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».');
      }
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => null);
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (localStorage.getItem('solncanet_pwa_install_hidden') !== '1') createInstallButton();
  });

  window.addEventListener('load', () => {
    if (isIOS() && !isStandalone() && localStorage.getItem('solncanet_pwa_install_hidden') !== '1') {
      setTimeout(createInstallButton, 1600);
    }
  });
})();
