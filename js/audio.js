// ==========================================
// SONGUESS - AUDIO & SYNTHESIZER ENGINE
// ==========================================

class SoundSynth {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWin() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playError() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playGiveUpSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

const synth = new SoundSynth();

let isAudioPlaying = false;
let playbackRaf = null;
let playbackTimeout = null;

function getAudioPlayer() {
  return document.getElementById('game-audio');
}

function playCurrentSnippet() {
  if (!gameState.currentSong || !gameState.currentSong.previewUrl) return;

  synth.init();
  stopAudio();

  const maxAllowedDuration = DURATIONS[gameState.attemptsUsed] || 0.1;
  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-btn-icon');
  const durationLabel = document.getElementById('snippet-duration');
  const audio = getAudioPlayer();
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().then(() => {
    isAudioPlaying = true;
    if (playBtn) playBtn.classList.add('playing');
    if (playIcon) playIcon.className = 'fa-solid fa-pause';

    let startTime = performance.now();
    let audioStarted = false;

    function frame(now) {
      if (!isAudioPlaying) return;

      // Handle iOS Safari / mobile hardware latency before audio actually begins emitting sound
      if (!audioStarted) {
        if (audio.currentTime > 0) {
          audioStarted = true;
          startTime = now - (audio.currentTime * 1000);
        } else if (now - startTime > 300) {
          audioStarted = true;
          startTime = now;
        }
      }

      const elapsed = audioStarted ? Math.min((now - startTime) / 1000, maxAllowedDuration) : 0;
      
      updateCapsuleFill(elapsed, maxAllowedDuration, false);
      if (durationLabel) {
        durationLabel.textContent = elapsed.toFixed(1) + 's';
      }

      if (elapsed >= maxAllowedDuration || audio.ended) {
        // Lock visually to the exact target segment boundary before stopping
        updateCapsuleFill(maxAllowedDuration, maxAllowedDuration, false);
        if (durationLabel) {
          durationLabel.textContent = maxAllowedDuration.toFixed(1) + 's';
        }
        stopAudio();
        return;
      }

      playbackRaf = requestAnimationFrame(frame);
    }

    playbackRaf = requestAnimationFrame(frame);

  }).catch(e => {
    console.error("Audio playback error:", e);
    stopAudio();
  });
}

function playFullPreview() {
  if (!gameState.currentSong || !gameState.currentSong.previewUrl) return;

  synth.init();
  stopAudio();

  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-btn-icon');
  const durationLabel = document.getElementById('snippet-duration');
  const audio = getAudioPlayer();
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().then(() => {
    isAudioPlaying = true;
    if (playBtn) playBtn.classList.add('playing');
    if (playIcon) playIcon.className = 'fa-solid fa-pause';

    const totalDur = audio.duration || 30.0;
    let startTime = performance.now();
    let audioStarted = false;

    function frame(now) {
      if (!isAudioPlaying) return;

      if (!audioStarted) {
        if (audio.currentTime > 0) {
          audioStarted = true;
          startTime = now - (audio.currentTime * 1000);
        } else if (now - startTime > 300) {
          audioStarted = true;
          startTime = now;
        }
      }

      const elapsed = audioStarted ? Math.min((now - startTime) / 1000, totalDur) : 0;
      updateCapsuleFill(elapsed, totalDur, true);
      if (durationLabel) {
        durationLabel.textContent = elapsed.toFixed(1) + 's / ' + totalDur.toFixed(0) + 's';
      }

      if (elapsed >= totalDur || audio.ended) {
        stopAudio();
        return;
      }

      playbackRaf = requestAnimationFrame(frame);
    }

    playbackRaf = requestAnimationFrame(frame);

  }).catch(e => {
    console.error("Full audio playback error:", e);
    stopAudio();
  });
}

function stopAudio() {
  const audio = getAudioPlayer();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  isAudioPlaying = false;

  if (playbackTimeout) {
    clearTimeout(playbackTimeout);
    playbackTimeout = null;
  }
  if (playbackRaf) {
    cancelAnimationFrame(playbackRaf);
    playbackRaf = null;
  }

  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-btn-icon');
  if (playBtn) playBtn.classList.remove('playing');
  if (playIcon) playIcon.className = 'fa-solid fa-play';

  const durationLabel = document.getElementById('snippet-duration');
  const currentDuration = DURATIONS[gameState.attemptsUsed] || 0.1;
  if (durationLabel) {
    durationLabel.textContent = currentDuration.toFixed(1) + 's';
  }

  updateCapsuleFill(0, currentDuration, false);
}

function updateCapsuleFill(currentSeconds, totalAllowed, isFullPreview = false) {
  const fill = document.getElementById('capsule-progress');
  if (!fill) return;

  if (isFullPreview) {
    const fullScale = totalAllowed || 30.0;
    const progressPercent = Math.min((currentSeconds / fullScale) * 100, 100);
    fill.style.width = `${progressPercent}%`;
  } else {
    // Exact 10.0s timeline scale matching the sum of the 6 segment widths (100%)
    const maxGameSnippetScale = 10.0;
    const progressPercent = Math.min((currentSeconds / maxGameSnippetScale) * 100, 100);
    fill.style.width = `${progressPercent}%`;
  }
}
