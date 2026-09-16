const toast = document.getElementById('toast');
const shellPanel = document.getElementById('shell-panel');
const sourceInput = document.getElementById('source-url');
const generatedCommand = document.getElementById('generated-command');
const copyCommand = document.getElementById('copy-command');
const cleanLinkButton = document.getElementById('clean-link');

let selectedFormat = 'MP3';

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function buildCommand() {
  try {
    const command = CansCommands.build(sourceInput.value, selectedFormat, document.getElementById('playlist-mode').checked);
    generatedCommand.textContent = command;
    copyCommand.disabled = false;
    document.getElementById('file-path').textContent = 'Files → On My iPhone / iPad → a-Shell → CRATE → ' + (selectedFormat === 'VIDAUD' ? 'VIDEO' : selectedFormat);
    return command;
  } catch (error) {
    generatedCommand.textContent = error.message;
    copyCommand.disabled = true;
    return '';
  }
}

function handleAction(action) {
  switch (action) {
    case 'portal':
      showToast('command helper ready');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'shell':
      shellPanel?.classList.toggle('show');
      showToast(shellPanel?.classList.contains('show') ? 'path shown' : 'path hidden');
      break;
  }
}

function bootChlomimCommandHelper() {
  document.querySelectorAll('.sign[data-action]').forEach(card => {
    card.addEventListener('click', () => {
      handleAction(card.dataset.action);
    });

    card.addEventListener('keypress', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleAction(card.dataset.action);
      }
    });
  });

  document.querySelectorAll('.format-btn').forEach(button => {
    button.addEventListener('click', () => {
      selectedFormat = button.dataset.format || 'MP3';

      document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      button.classList.add('active');
      buildCommand();
      showToast(`${button.textContent.trim()} selected`);
    });
  });

  sourceInput?.addEventListener('input', buildCommand);

  cleanLinkButton?.addEventListener('click', () => {
    if (!sourceInput) return;

    let cleaned;
    try { cleaned = CansCommands.urls(sourceInput.value).join('\n'); }
    catch (error) { showToast(error.message); return; }

    if (!cleaned) {
      showToast('paste link first');
      return;
    }

    sourceInput.value = cleaned;
    buildCommand();
    showToast('link cleaned');
  });

  copyCommand?.addEventListener('click', async () => {
    const command = buildCommand();
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      showToast('command copied');
    } catch {
      showToast('copy failed — select command manually');
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {
      console.log('service worker skipped');
    });
  }

  document.getElementById('playlist-mode').addEventListener('change', buildCommand);
  document.getElementById('csv-input').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error('Use a CSV smaller than 2 MB.');
      const found = CansCommands.csv(await file.text());
      const combined = [sourceInput.value.trim(), ...found].filter(Boolean).join('\n');
      sourceInput.value = CansCommands.urls(combined).join('\n');
      buildCommand(); showToast('CSV links added');
    } catch (error) { showToast(error.message); }
    finally { event.target.value = ''; }
  });
  buildCommand();
  showToast('PLUR online');
}

window.addEventListener('load', bootChlomimCommandHelper);
