/**
 * Interactive Biodigestor & Pyrolysis Live Simulator Component
 * SVG Animated Bioreactor, Floating Biogas Bubbles, Sludge Waves, and Live Telemetry Ticker
 */

let tickerInterval = null;

export function renderBiodigestorSimulator() {
  return `
    <div class="bio-diagram-wrapper animate-fade-in">
      <div class="bio-diagram-header">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 0.08em;">
             &middot; Proceso Biológico Activo
          </span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 0.2rem;">
            Esquema Dinámico: Biodigestión Anaerobia &amp; Pirólisis Kon-Tiki
          </h3>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="led-badge" style="background: rgba(14,165,233,0.18); color: #38bdf8; border-color: rgba(14,165,233,0.4);">
            <span class="led-dot cyan"></span> Monitoreo
          </span>
        </div>
      </div>

      <!-- Animated SVG Bioreactor + Burner + Pyrolysis -->
      <div style="width: 100%; max-width: 900px; margin: 0 auto; overflow: hidden;">
        <svg viewBox="0 0 900 380" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Gradients -->
            <linearGradient id="sludgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3f2e18" stop-opacity="0.95" />
              <stop offset="60%" stop-color="#241a0e" stop-opacity="0.98" />
              <stop offset="100%" stop-color="#140e07" stop-opacity="1" />
            </linearGradient>

            <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
              <stop offset="70%" stop-color="#0284c7" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#0369a1" stop-opacity="0.05" />
            </linearGradient>

            <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#27272a" />
              <stop offset="50%" stop-color="#3f3f46" />
              <stop offset="100%" stop-color="#18181b" />
            </linearGradient>

            <radialGradient id="glowBioGas" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
            </radialGradient>

            <radialGradient id="pyroGlow" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stop-color="#f97316" stop-opacity="0.9" />
              <stop offset="60%" stop-color="#ea580c" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#c2410c" stop-opacity="0" />
            </radialGradient>

            <!-- Filters -->
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- 1. BIODIGESTOR SECTION -->
          <g transform="translate(40, 20)">
            <!-- Ground Base -->
            <rect x="0" y="310" width="460" height="24" rx="4" fill="#1c1917" stroke="#292524" />

            <!-- Vessel Outer Shell -->
            <path d="M 50 310 L 50 160 Q 50 80 230 80 Q 410 80 410 160 L 410 310 Z" fill="url(#vesselGrad)" stroke="#52525b" stroke-width="3" />

            <!-- Inflow Funnel (Fracción Blanda / Residuos) -->
            <path d="M 0 130 L 50 170 L 50 200 L 0 160 Z" fill="#22c55e" opacity="0.8" />
            <text x="10" y="118" fill="#86efac" font-size="12" font-weight="700">Entrada Blanda</text>

            <!-- Gas Dome Interior (Biogás Chamber) -->
            <path d="M 60 170 Q 230 90 400 170 L 400 300 L 60 300 Z" fill="url(#domeGrad)" />

            <!-- Sludge Level (Liquid Waste & Biol in anaerobic fermentation) -->
            <path class="sludge-wave" d="M 60 210 Q 140 200 230 215 Q 320 230 400 210 L 400 305 L 60 305 Z" fill="url(#sludgeGrad)" />

            <!-- Subsurface Biol Output Tube -->
            <path d="M 410 260 L 460 260 L 460 310" fill="none" stroke="#22c55e" stroke-width="8" stroke-linecap="round" />
            <text x="405" y="245" fill="#4ade80" font-size="11" font-weight="700">Salida Biol (L)</text>

            <!-- Floating Biogas Bubble Particles (CSS Keyframe Animated) -->
            <circle class="bubble-particle" cx="120" cy="220" r="5" fill="#38bdf8" opacity="0.8" filter="url(#softGlow)" />
            <circle class="bubble-particle bubble-particle-delay-1" cx="200" cy="235" r="7" fill="#7dd3fc" opacity="0.75" />
            <circle class="bubble-particle bubble-particle-delay-2" cx="260" cy="225" r="6" fill="#38bdf8" opacity="0.8" />
            <circle class="bubble-particle bubble-particle-delay-3" cx="330" cy="240" r="8" fill="#bae6fd" opacity="0.9" filter="url(#softGlow)" />
            <circle class="bubble-particle bubble-particle-delay-4" cx="170" cy="230" r="5" fill="#38bdf8" opacity="0.85" />

            <!-- Internal Bacteria Culture Label -->
            <text x="140" y="275" fill="#ca8a04" font-size="13" font-weight="600" opacity="0.85">Zona Metanogénica Activa (pH 7.8)</text>

            <!-- Gas Dome Accumulation Glow -->
            <ellipse cx="230" cy="140" rx="90" ry="30" fill="url(#glowBioGas)" opacity="0.6" />
            <text x="175" y="145" fill="#e0f2fe" font-size="14" font-weight="800" letter-spacing="1">BIOGÁS (CH₄)</text>

            <!-- Biogas Takeoff Pipe to Burner -->
            <path class="gas-pipe-flow" d="M 230 80 L 230 30 L 510 30 L 510 130" fill="none" stroke="#38bdf8" stroke-width="4" />
          </g>

          <!-- 2. BURNER & FLARE FLAME SECTION -->
          <g transform="translate(520, 140)">
            <!-- Valve and Manometer -->
            <circle cx="30" cy="20" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
            <line x1="30" y1="20" x2="38" y2="14" stroke="#38bdf8" stroke-width="2" />
            <text x="18" y="48" fill="#94a3b8" font-size="10">Válvula</text>

            <!-- Burner Nozzle -->
            <path d="M 20 80 L 40 80 L 35 100 L 25 100 Z" fill="#64748b" />
            
            <!-- Animated Flame -->
            <g class="flame-burner" transform="translate(30, 75)">
              <path d="M 0 0 C -12 -20 -15 -45 0 -65 C 15 -45 12 -20 0 0 Z" fill="#f59e0b" filter="url(#softGlow)" />
              <path d="M 0 -5 C -6 -18 -8 -35 0 -48 C 8 -35 6 -18 0 -5 Z" fill="#38bdf8" />
            </g>
            <text x="-5" y="125" fill="#fcd34d" font-size="12" font-weight="700">Llama Biogás</text>
          </g>

          <!-- 3. KON-TIKI PYROLYSIS CONE SECTION (Fracción Dura / Poda) -->
          <g transform="translate(640, 110)">
            <text x="35" y="-10" fill="#fdba74" font-size="14" font-weight="800">PIRÓLISIS KON-TIKI</text>
            <text x="45" y="8" fill="#94a3b8" font-size="11">Poda y ramas secas</text>

            <!-- Kon-Tiki Cone Kiln -->
            <polygon points="20,190 190,190 145,50 65,50" fill="#27272a" stroke="#71717a" stroke-width="3" />
            <polygon points="30,180 180,180 140,60 70,60" fill="#18181b" />

            <!-- Glowing Charcoal Bed / Embers -->
            <ellipse cx="105" cy="155" rx="55" ry="20" fill="url(#pyroGlow)" filter="url(#softGlow)" />
            <ellipse cx="105" cy="155" rx="35" ry="12" fill="#fef08a" opacity="0.8" />

            <!-- Rising Smoke Curtain / Combustion Cap -->
            <path d="M 75 55 Q 105 35 135 55" stroke="#f97316" stroke-width="4" fill="none" opacity="0.8" />
            
            <!-- Biochar Output Arrow -->
            <path d="M 105 195 L 105 220" stroke="#a1a1aa" stroke-width="3" marker-end="url(#arrow)" />
            <text x="60" y="235" fill="#e4e4e7" font-size="12" font-weight="700">✦ Biochar de Alta Porosidad</text>
          </g>
        </svg>
      </div>

      <!-- Real-Time Telemetry Gauges Ticker -->
      <div class="bio-telemetry-grid">
        <div class="telemetry-tile">
          <span class="telemetry-label">Presión Biogás</span>
          <div class="telemetry-value">
            <span id="telemetryPresion">21.8</span>
            <small style="font-size: 0.8rem; font-weight: 500; color: #94a3b8;">mbar</small>
          </div>
          <svg class="telemetry-sparkline" viewBox="0 0 100 24">
            <path d="M0,18 Q20,8 40,14 T80,10 T100,6" fill="none" stroke="#38bdf8" stroke-width="2" />
          </svg>
        </div>

        <div class="telemetry-tile">
          <span class="telemetry-label">Temperatura Reactor</span>
          <div class="telemetry-value">
            <span id="telemetryTemp">36.8</span>
            <small style="font-size: 0.8rem; font-weight: 500; color: #94a3b8;">&deg;C</small>
          </div>
          <svg class="telemetry-sparkline" viewBox="0 0 100 24">
            <path d="M0,12 Q25,16 50,11 T100,12" fill="none" stroke="#22c55e" stroke-width="2" />
          </svg>
        </div>

        <div class="telemetry-tile">
          <span class="telemetry-label">Concentración CH₄</span>
          <div class="telemetry-value">
            <span id="telemetryMetano">64.5</span>
            <small style="font-size: 0.8rem; font-weight: 500; color: #94a3b8;">%</small>
          </div>
          <svg class="telemetry-sparkline" viewBox="0 0 100 24">
            <path d="M0,16 Q30,6 60,12 T100,8" fill="none" stroke="#f59e0b" stroke-width="2" />
          </svg>
        </div>

        <div class="telemetry-tile">
          <span class="telemetry-label">pH Biol Líquido</span>
          <div class="telemetry-value">
            <span id="telemetryPh">7.82</span>
            <small style="font-size: 0.8rem; font-weight: 500; color: #4ade80;">(Óptimo)</small>
          </div>
          <svg class="telemetry-sparkline" viewBox="0 0 100 24">
            <path d="M0,10 Q25,10 50,11 T100,10" fill="none" stroke="#4ade80" stroke-width="2" />
          </svg>
        </div>
      </div>
    </div>
  `;
}

/**
 * Starts a live telemetry ticker with subtle realistic fluctuations
 */
export function startTelemetryTicker() {
  if (tickerInterval) {
    clearInterval(tickerInterval);
  }

  tickerInterval = setInterval(() => {
    const elPresion = document.getElementById('telemetryPresion');
    const elTemp = document.getElementById('telemetryTemp');
    const elMetano = document.getElementById('telemetryMetano');
    const elPh = document.getElementById('telemetryPh');

    if (elPresion) {
      const p = (21.5 + (Math.random() * 0.8 - 0.4)).toFixed(1);
      elPresion.textContent = p;
    }
    if (elTemp) {
      const t = (36.8 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      elTemp.textContent = t;
    }
    if (elMetano) {
      const m = (64.5 + (Math.random() * 0.6 - 0.3)).toFixed(1);
      elMetano.textContent = m;
    }
    if (elPh) {
      const ph = (7.80 + (Math.random() * 0.08 - 0.04)).toFixed(2);
      elPh.textContent = ph;
    }
  }, 2200);
}
