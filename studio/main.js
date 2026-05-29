const toast = document.getElementById('toast');
const shellPanel = document.getElementById('shell-panel');

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList is.remove('show');
  }, 1800);
}

function handleAction(action) {

  switch(action) {

    case 'portal':
      showToast('portal cracked open ✨');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      break;

    case 'batch':
      showToast('START BATCH • OK 5');

      document.body.style.filter =
        'contrast(1.08) saturate(1.15)';

      setTimeout(() => {
        document.body.style.filter = '';
      }, 600);

      break;

    case 'shell':
      shellPanel.classList.toggle('show');

      showToast(
        shellPanel.classList.contains('show')
          ? 'AI shell exposed'
          : 'shell hidden'
      );

      break;
  }
}

function bootFridayPortal() {

  document.querySelectorAll('.sign').forEach(card => {

    card.addEventListener('click', () => {
      handleAction(card.dataset.action);
    });

    card.addEventListener('keypress', e => {

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAction(card.dataset.action);
      }

    });

  });

  if ('serviceWorker' in navigator) {

    navigator.serviceWorker
      .register('../sw.js')
      .catch(() => {
        console.log('sw skipped');
      });

  }

  console.log('CHLOMIM Friday portal ready');

  showToast('PLUR online');
}

window.addEventListener('load', bootFridayPortal);
