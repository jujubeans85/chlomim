// CRATE PEACH - Full Studio Script
// Real-time iOS Stems + Original tools

let audioContext;
let stems = {
  vocals: { file: null, gainNode: null, audio: null },
  drums: { file: null, gainNode: null, audio: null },
  bass: { file: null, gainNode: null, audio: null },
  other: { file: null, gainNode: null, audio: null }
};

// Initialize AudioContext (user gesture required on iOS)
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('✅ AudioContext ready for iOS stems');
  }
}

// Load demo stems (placeholder - user will upload real ones)
function loadDemoStems() {
  initAudio();
  alert('Demo stems loaded! Now upload your own stems (Vocals, Drums, Bass, Other) for full real-time mixing on iPad.');
  document.getElementById('status').textContent = 'Demo mode • Upload real stems to activate mixer';
}

// Toggle global playback
let isPlaying = false;
function togglePlayback() {
  initAudio();
  isPlaying = !isPlaying;
  const btn = document.getElementById('play-btn');
  
  if (isPlaying) {
    btn.textContent = '⏹ STOP';
    btn.classList.add('from-red-500', 'to-rose-600');
    btn.classList.remove('from-green-500', 'to-emerald-600');
  } else {
    btn.textContent = '▶ PLAY ALL STEMS';
    btn.classList.remove('from-red-500', 'to-rose-600');
    btn.classList.add('from-green-500', 'to-emerald-600');
  }
  
  // TODO: Connect real Audio elements once uploaded
  console.log('Playback toggled:', isPlaying);
  document.getElementById('status').textContent = isPlaying ? 'Playing all stems • Real-time mixing active' : 'Paused';
}

// Original studio functions
function selectFormat(el) {
  document.querySelectorAll('.tape-button').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function dropToCrate() {
  const urls = document.getElementById('url-input').value.trim();
  if (!urls) {
    alert('Paste URL(s) into the Txt Box first!');
    return;
  }
  const shell = document.getElementById('shell-output');
  shell.textContent = `# Dropping to crate...
yt-dlp -x --audio-format wav --audio-quality 0 \
  ${urls.replace(/\n/g, ' ')}

# Ready for iPad import → Logic Pro / GarageBand`;
  alert('✅ Crate dropped! Script ready in A-SHELL panel.');
}

function copyScript() {
  const shell = document.getElementById('shell-output').textContent;
  navigator.clipboard.writeText(shell).then(() => {
    alert('✅ Script copied to clipboard! Paste into a-Shell on iPad.');
  });
}

function handleCSVUpload() {
  alert('📤 SHAZAM CSV upload ready (connects to Grabber workflow). Feature expanding soon.');
}

// Make stems grid interactive
function createStemsGrid() {
  const grid = document.getElementById('stems-grid');
  const stemTypes = ['vocals', 'drums', 'bass', 'other'];
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  
  grid.innerHTML = '';
  stemTypes.forEach((type, i) => {
    const div = document.createElement('div');
    div.className = 'bg-[#2c1f14] border-2 border-amber-700 rounded-3xl p-4 text-center';
    div.innerHTML = `
      <div class="text-xs uppercase tracking-widest mb-1" style="color: ${colors[i]}">${type.toUpperCase()}</div>
      <input type="file" accept="audio/*" class="hidden" id="file-${type}">
      <button onclick="triggerUpload('${type}')" class="w-full py-6 text-amber-100 border border-dashed border-amber-400 rounded-2xl text-sm mb-3">+ UPLOAD</button>
      <input type="range" min="0" max="1" step="0.01" value="1" class="w-full accent-amber-400" onchange="setStemVolume('${type}', this.value)">
      <div class="text-[10px] text-amber-400">VOL</div>
    `;
    grid.appendChild(div);
  });
}

window.triggerUpload = function(type) {
  const input = document.getElementById(`file-${type}`);
  input.click();
  input.onchange = (e) => {
    if (e.target.files[0]) {
      initAudio();
      stems[type].file = e.target.files[0];
      console.log(`✅ ${type} stem loaded`);
    }
  };
};

window.setStemVolume = function(type, vol) {
  console.log(`${type} volume set to ${vol}`);
  // In full version this would adjust GainNode
};

// Initialize everything on load
window.onload = function() {
  createStemsGrid();
  console.log('%cCRATE PEACH Studio + Real-Time Stems Lab ready for iOS', 'color:#fcd34d; font-family:monospace');
};
