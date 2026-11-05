const toast = document.getElementById('toast');
const shellPanel = document.getElementById('shell-panel');
const sourceInput = document.getElementById('source-url');
const generatedCommand = document.getElementById('generated-command');
const copyCommand = document.getElementById('copy-command');
const cleanLinkButton = document.getElementById('clean-link');
const saveScriptButton = document.getElementById('save-script');
const saveLinksButton = document.getElementById('save-links');
const batchStatus = document.getElementById('batch-status');
const batchErrors = document.getElementById('batch-errors');

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
  const batch = CansCommands.inspect(sourceInput.value);
  const ready = batch.count > 0 && batch.errors.length === 0;
  batchStatus.textContent = `${batch.count} / ${CansCommands.MAX_URLS} links · ${batch.urls.length} unique` +
    (batch.duplicates ? ` · ${batch.duplicates} duplicate${batch.duplicates === 1 ? '' : 's'}` : '') +
    (batch.errors.length ? ' · fix the entries below' : ready ? ' · ready' : ' · paste your batch');
  batchErrors.textContent = batch.errors.join('\n');
  batchErrors.hidden = !batch.errors.length;
  sourceInput.setAttribute('aria-invalid', String(batch.errors.length > 0));
  [copyCommand, cleanLinkButton, saveScriptButton, saveLinksButton].forEach(button => { button.disabled = !ready; });
  const folder = selectedFormat === 'VIDAUD' ? 'VIDEO' : selectedFormat;
  document.getElementById('file-path').textContent = 'Files → On My iPhone / iPad → a-Shell → CRATE → ' + folder;
  document.getElementById('folder-label').textContent = 'On My iPad / A-Shell / CRATE / ' + folder;
  document.getElementById('check-command').textContent = `ls -lh "$HOME/Documents/CRATE/${folder}"`;
  document.getElementById('script-run').textContent = 'sh ' + scriptFilename();
  try {
    const command = CansCommands.build(sourceInput.value, selectedFormat, document.getElementById('playlist-mode').checked);
    generatedCommand.textContent = command;
    return command;
  } catch (error) {
    generatedCommand.textContent = error.message;
    copyCommand.disabled = true;
    return '';
  }
}

function scriptFilename() { return `cans-batch-${selectedFormat.toLowerCase()}.sh`; }

function saveTextFile(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Leave time for Safari to consume the object URL before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
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
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      buildCommand();
      showToast(`${button.textContent.trim()} selected`);
    });
  });

  sourceInput?.addEventListener('input', buildCommand);

  cleanLinkButton?.addEventListener('click', () => {
    if (!sourceInput) return;

    let cleaned;
    const batch = CansCommands.inspect(sourceInput.value);
    try { cleaned = CansCommands.urls(sourceInput.value).join('\n'); }
    catch (error) { showToast(error.message); return; }

    if (!cleaned) {
      showToast('paste link first');
      return;
    }

    sourceInput.value = cleaned;
    buildCommand();
    showToast(`${batch.urls.length} links cleaned` + (batch.duplicates ? ` · ${batch.duplicates} duplicate${batch.duplicates === 1 ? '' : 's'} removed` : ''));
  });

  copyCommand?.addEventListener('click', async () => {
    const command = buildCommand();
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      showToast('Batch copied — paste in a-Shell, then Return');
    } catch {
      showToast('copy failed — select command manually');
    }
  });

  saveScriptButton.addEventListener('click', () => {
    if (!buildCommand()) return;
    try {
      saveTextFile(scriptFilename(), CansCommands.script(sourceInput.value, selectedFormat, document.getElementById('playlist-mode').checked), 'text/plain;charset=utf-8');
      showToast('Script ready — save to a-Shell, then run it');
    } catch (error) { showToast('Could not save script: ' + error.message); }
  });

  saveLinksButton.addEventListener('click', () => {
    if (!buildCommand()) return;
    try {
      saveTextFile('cans-clean-links.txt', CansCommands.urls(sourceInput.value).join('\n') + '\n', 'text/plain;charset=utf-8');
      showToast('Clean link list ready to save');
    } catch (error) { showToast('Could not save links: ' + error.message); }
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

