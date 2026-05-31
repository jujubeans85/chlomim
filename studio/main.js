const toast = document.getElementById('toast');
const shellPanel = document.getElementById('shell-panel');
const sourceInput = document.getElementById('source-url');
const generatedNote = document.getElementById('generated-note');
const copyNote = document.getElementById('copy-note');
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

function cleanUrl(value) {
  let url = (value || '').trim();
  url = url.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  url = url.replace(/^['"]+|['"]+$/g, '');

  if (!url) return '';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    }

    const removable = ['si', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'feature', 'fbclid', 'igsh', 'igshid'];
    removable.forEach(key => parsed.searchParams.delete(key));
    return parsed.toString();
  } catch {
    return url.split('?')[0];
  }
}

function buildWorkflow() {
  const rawSource = sourceInput?.value.trim() || '';
  const cleanSource = cleanUrl(rawSource) || 'CLEAN_URL_HERE';

  const workflow = `STEP 1 — CLEAN LINK
${cleanSource}

STEP 2 — PICK OUTPUT
${selectedFormat}

STEP 3 — RUN IN A-SHELL
Use your personal A-Shell media workflow with the clean link above.

STEP 4 — FIND FILE
Files app → On My iPad → A-Shell → CRATE → MP3

CHECK:
ls -lh "$HOME/Documents/CRATE/MP3"

TROUBLESHOOT:
If URL fails, remove everything after ?
If file is missing, check On My iPad / A-Shell / CRATE / MP3
If command not found, update your tool in A-Shell
If shell gets weird, stop and return to prompt`;

  if (generatedNote) generatedNote.textContent = workflow;
  return workflow;
}

function handleAction(action) {
  switch (action) {
    case 'portal':
      showToast('workflow ready');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'shell':
      shellPanel?.classList.toggle('show');
      showToast(shellPanel?.classList.contains('show') ? 'path shown' : 'path hidden');
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
      selectedFormat = button.dataset.format || 'MP3';

      document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      button.classList.add('active');
      buildWorkflow();
      showToast(`${selectedFormat} selected`);
    });
  });

  sourceInput?.addEventListener('input', buildWorkflow);

  cleanLinkButton?.addEventListener('click', () => {
    if (!sourceInput) return;
    const cleaned = cleanUrl(sourceInput.value);
    sourceInput.value = cleaned;
    buildWorkflow();
    showToast(cleaned ? 'link cleaned' : 'paste link first');
  });

  copyNote?.addEventListener('click', async () => {
    const workflow = buildWorkflow();

    try {
      await navigator.clipboard.writeText(workflow);
      showToast('workflow copied');
    } catch {
      showToast('copy failed — select manually');
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {
      console.log('sw skipped');
    });
  }

  buildWorkflow();
  showToast('PLUR online');
}

window.addEventListener('load', bootFridayPortal);
