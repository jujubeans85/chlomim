const processingControls = [
            { id: 'warmth', label: 'Warmth EQ + Analog CD', min: -6, max: 6, step: 0.5, default: 2.5, unit: 'dB' },
            { id: 'bass', label: 'Bass Boost', min: -3, max: 6, step: 0.5, default: 1.5, unit: 'dB' },
            { id: 'air', label: 'Air / Sparkle', min: -3, max: 6, step: 0.5, default: 2.0, unit: 'dB' },
            { id: 'compression', label: 'Compression Ratio', min: 1, max: 6, step: 0.1, default: 3.0, unit: ':1' },
            { id: 'normalize', label: 'Normalize Level', min: -3, max: 0, step: 0.1, default: -1.0, unit: 'dBTP' },

            { id: 'swing', label: 'Swing', min: 0, max: 10, step: 1, default: 3, unit: '' },
            { id: 'swagger', label: 'Swagger / Bounce', min: 0, max: 10, step: 1, default: 4, unit: '' },
            { id: 'tightness', label: 'Tight vs Loose Feel', min: 0, max: 10, step: 1, default: 5, unit: '' },
            { id: 'drag', label: 'Drag / Layback', min: 0, max: 10, step: 1, default: 3, unit: '' },
            { id: 'quantize', label: 'Quantize Amount', min: 0, max: 10, step: 1, default: 4, unit: '' },
            { id: 'humanize', label: 'Humanization / Micro-timing', min: 0, max: 10, step: 1, default: 5, unit: '' },
            { id: 'pocket', label: 'Pocket / Groove Feel', min: 0, max: 10, step: 1, default: 5, unit: '' },
            { id: 'shuffle', label: 'Shuffle Amount', min: 0, max: 10, step: 1, default: 2, unit: '' },

            { id: 'stems', label: 'Stem Separation (Vox/Inst/Drums)', min: 0, max: 10, step: 1, default: 4, unit: '' },
            { id: 'vocal', label: 'Vocal Presence & Clarity', min: 0, max: 10, step: 1, default: 5, unit: '' },
            { id: 'stereo', label: 'Stereo Width', min: 0, max: 10, step: 1, default: 5, unit: '' },
            { id: 'saturation', label: 'Saturation / Drive', min: 0, max: 8, step: 1, default: 2, unit: '' },
            { id: 'gift', label: 'Emotional Gift Highlights', min: 0, max: 10, step: 1, default: 3, unit: '' }
        ];

        function createSliderControls() {
            const container = document.getElementById('slider-controls');
            container.innerHTML = '';
            processingControls.forEach(ctrl => {
                const div = document.createElement('div');
                div.className = 'post-control';
                div.innerHTML = `
                    <div class="flex justify-between mb-1">
                        <div class="font-medium text-sm">${ctrl.label}</div>
                        <div class="slider-value" id="val-${ctrl.id}"></div>
                    </div>
                    <input type="range" id="slider-${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${ctrl.default}" class="w-full">
                `;
                container.appendChild(div);
                const slider = div.querySelector(`#slider-${ctrl.id}`);
                const valEl = div.querySelector(`#val-${ctrl.id}`);
                slider.oninput = () => {
                    updateValueDisplay(ctrl, slider, valEl);
                    updateFinalPrompt();
                };
                updateValueDisplay(ctrl, slider, valEl);
            });
        }

        function updateValueDisplay(ctrl, slider, valEl) {
            let v = parseFloat(slider.value);
            let txt = v.toFixed(ctrl.step < 1 ? 1 : 0) + ctrl.unit;
            if ((ctrl.id === 'warmth' || ctrl.id === 'bass' || ctrl.id === 'air' || ctrl.id === 'normalize') && v > 0) txt = '+' + txt;
            valEl.textContent = txt;
        }

        function getSliderValue(id) {
            const el = document.getElementById(`slider-${id}`);
            return el ? parseFloat(el.value) : 0;
        }

        function updateFinalPrompt() {
            const ta = document.getElementById('postprompt-textarea');
            let p = `Take these tracks. Detect BPM and musical key. `;

            const w = getSliderValue('warmth');
            const b = getSliderValue('bass');
            const a = getSliderValue('air');
            const c = getSliderValue('compression');
            const n = getSliderValue('normalize');

            const sw = getSliderValue('swing');
            const sg = getSliderValue('swagger');
            const ti = getSliderValue('tightness');
            const dr = getSliderValue('drag');
            const qu = getSliderValue('quantize');
            const hu = getSliderValue('humanize');
            const po = getSliderValue('pocket');
            const sh = getSliderValue('shuffle');

            const s = getSliderValue('stems');
            const v = getSliderValue('vocal');
            const st = getSliderValue('stereo');
            const sat = getSliderValue('saturation');
            const g = getSliderValue('gift');

            if (Math.abs(w) > 0.3) p += `Apply ${w >= 0 ? '+' : ''}${w} dB analog warmth EQ with CD-style polish. `;
            if (Math.abs(b) > 0.3) p += `Boost bass by ${b >= 0 ? '+' : ''}${b} dB with tight low-end control. `;
            if (Math.abs(a) > 0.3) p += `Add gentle high-end air and sparkle. `;
            if (c > 1.2) p += `Apply musical compression at ${c.toFixed(1)}:1 ratio. `;
            if (Math.abs(n) > 0.05) p += `Normalize to ${n} dBTP. `;

            // Optimized Rhythmic
            if (sw > 1) p += sw >= 7 ? `Apply strong, musical swing with clear triplet-based groove. ` : `Add moderate swing and laid-back groove. `;
            if (sg > 1) p += `Add swagger, bounce and confident rhythmic attitude (intensity ${sg}/10). `;
            if (ti !== 5) p += ti > 5 ? `Make the rhythm tighter and more locked to the grid. ` : `Loosen timing with relaxed, human feel. `;
            if (dr > 1) p += `Push elements slightly behind the beat for drag/layback feel (intensity ${dr}/10). `;
            if (qu > 1) p += `Apply light quantization while preserving natural micro-timing (intensity ${qu}/10). `;
            if (hu > 1) p += `Add micro-timing humanization and organic timing variations (intensity ${hu}/10). `;
            if (po > 1) p += `Enhance pocket and overall groovy musical feel (intensity ${po}/10). `;
            if (sh > 1) p += `Apply subtle shuffle rhythm (intensity ${sh}/10). `;

            if (s > 1) p += `Prepare clean vocal/instrumental/drums stem splits using high-quality models (BS-RoFormer + HTDemucs ensemble in UVR5 recommended). `;
            if (v > 1) p += `Enhance vocal presence and clarity. `;
            if (st > 1) p += `Increase stereo width (intensity ${st}/10). `;
            if (sat > 1) p += `Add analog-style saturation and drive (intensity ${sat}/10). `;
            if (g > 1) p += `Create emotional ${g*8}–${g*12}s gift edits or intimate voice overlays. `;

            p += `Keep everything warm, personal, musical and ready for crate digging or live performance. Add rich metadata (BPM, key, energy, mood).`;
            ta.value = p.trim();
        }

        function resetAllSliders() {
            processingControls.forEach(ctrl => {
                const s = document.getElementById(`slider-${ctrl.id}`);
                if (s) { s.value = ctrl.default; updateValueDisplay(ctrl, s, document.getElementById('val-' + ctrl.id)); }
            });
            updateFinalPrompt();
        }

        
createSliderControls(); updateFinalPrompt();
document.getElementById("reset").onclick = resetAllSliders;
