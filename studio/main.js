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

function stripOuterQuotes(value) {
  return String(value || '')
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/^['"]+|['"]+$/g, '');
}

function cleanUrl(value) {
  const input = stripOuterQuotes(value);

  if (!input) return '';

  try {
    const parsed = new URL(input);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    }

    const removable = [
      'si',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'feature',
      'fbclid',
      'igsh',
      'igshid'
    ];

    removable.forEach(key => parsed.searchParams.delete(key));
    parsed.hash = '';

    return parsed.toString();
  } catch {
    return input.split('?')[0];
  }
}

function shellQuote(value) {
  const safe = String(value || 'CLEAN_URL_HERE')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`');

  return `"${safe}"`;
}

function buildCommand() {
  const cleanSource = cleanUrl(sourceInput?.value || '') || 'CLEAN_URL_HERE';
  const quotedUrl = shellQuote(cleanSource);

  const commands = {
    MP3:
      `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "$HOME/Documents/CRATE/MP3/%(title)s.%(ext)s" ${quotedUrl}`,

    WAV:
      `yt-dlp -x --audio-format wav -o "$HOME/Documents/CRATE/WAV/%(title)s.%(ext)s" ${quotedUrl}`,

    VIDEO:
      `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "$HOME/Documents/CRATE/VIDEO/%(title)s.%(ext)s" ${quotedUrl}`,

    VIDAUD:
      `yt-dlp -f "bv*+ba/b" --write-thumbnail --embed-metadata --merge-output-format mp4 -o "$HOME/Documents/CRATE/VIDEO/%(title)s.%(ext)s" ${quotedUrl}`
  };

  const command = commands[selectedFormat] || commands.MP3;

  if (generatedCommand) {
    generatedCommand.textContent = command;
  }

  return command;
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

    const cleaned = cleanUrl(sourceInput.value);

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

  buildCommand();
  showToast('PLUR online');
}

window.addEventListener('load', bootChlomimCommandHelper);
