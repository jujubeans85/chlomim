const toast = document.getElementById('toast');
const shellPanel = document.getElementById('shell-panel');
const sourceInput = document.getElementById('source-url');
const generatedNote = document.getElementById('generated-note');
const copyNote = document.getElementById('copy-note');

let selectedFormat = 'MP3 NOTE';

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function buildNote() {
  const source = sourceInput?.value.trim() || 'URL';

  const note = `SOURCE:
${source}

FORMAT:
${selectedFormat}

RUN IN:
A-Shell / Files / headphones

NOTE:
Use only for personal files, your own media, permitted downloads, or properly licensed sources.`;

  if (generatedNote) generatedNote.textContent = note;

  return note;
}

function handleAction(action) {
  switch (action) {
    case 'portal':
      showToast('portal ready');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'shell':
      shellPanel?.classList.toggle('show');
      showToast(shellPanel?.classList.contains('show') ? 'notes shown' : 'notes hidden');
      break;
  }
}

function bootFridayPortal() {
  document.querySelectorAll('.sign[data-action]').forEach(card => {
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

  document.querySelectorAll('.format-btn').forEach(button => {
    button.addEventListener('click', () => {
      selectedFormat = button.dataset.format || 'MP3 NOTE';

      document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      button.classList.add('active');
      buildNote();
      showToast(selectedFormat);
    });
  });

  sourceInput?.addEventListener('input', buildNote);

  copyNote?.addEventListener('click', async () => {
    const note = buildNote();

    try {
      await navigator.clipboard.writeText(note);
      showToast('note copied');
    } catch {
      showToast('copy failed — select note manually');
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {
      console.log('sw skipped');
    });
  }

  buildNote();
  showToast('PLUR online');
}

window.addEventListener('load', bootFridayPortal);
