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

  const uiDuration = DURATIONS[gameState.attemptsUsed] || 0.1;
  // Play 0.2s of audio for the first step (0.1s) for audio clarity, while keeping 0.1s displayed in the UI
  const actualAudioDuration = (uiDuration === 0.1) ? 0.2 : uiDuration;
  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-btn-icon');
  const durationLabel = document.getElementById('snippet-duration');
  const track = document.getElementById('capsule-track');
  const audio = getAudioPlayer();
  if (!audio) return;

  const fill = document.getElementById('capsule-progress');
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  }

  audio.currentTime = 0;
  audio.play().then(() => {
    isAudioPlaying = true;
    if (playBtn) playBtn.classList.add('playing');
    if (playIcon) playIcon.className = 'fa-solid fa-pause';
    if (track) track.classList.add('playing');

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

      const elapsed = audioStarted ? Math.min((now - startTime) / 1000, actualAudioDuration) : 0;
      
      // Scale visual capsule fill to the UI duration boundary (0.1s)
      const visualElapsed = (actualAudioDuration !== uiDuration)
        ? (elapsed / actualAudioDuration) * uiDuration
        : elapsed;

      updateCapsuleFill(visualElapsed, uiDuration, false);
      if (durationLabel) {
        durationLabel.textContent = (actualAudioDuration !== uiDuration)
          ? uiDuration.toFixed(1) + 's'
          : elapsed.toFixed(1) + 's';
      }

      if (elapsed >= actualAudioDuration || audio.ended) {
        // Lock visually to the exact target segment boundary before pausing
        updateCapsuleFill(uiDuration, uiDuration, false);
        if (durationLabel) {
          durationLabel.textContent = uiDuration.toFixed(1) + 's';
        }
        handleSnippetEnd(uiDuration);
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

function handleSnippetEnd(uiDuration) {
  const audio = getAudioPlayer();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  isAudioPlaying = false;

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

  // Visually lock at the exact divider boundary
  updateCapsuleFill(uiDuration, uiDuration, false);

  // Briefly hold at the boundary so the user sees completion, then glide back
  playbackTimeout = setTimeout(() => {
    if (!isAudioPlaying) {
      const track = document.getElementById('capsule-track');
      if (track) track.classList.remove('playing');

      const fill = document.getElementById('capsule-progress');
      if (fill) {
        fill.style.transition = 'width 0.25s ease-out';
        fill.style.width = '0%';
        playbackTimeout = setTimeout(() => {
          if (fill) fill.style.transition = 'none';
        }, 260);
      }
    }
  }, 200);
}

function playFullPreview() {
  if (!gameState.currentSong || !gameState.currentSong.previewUrl) return;

  synth.init();
  stopAudio();

  const playBtn = document.getElementById('btn-play');
  const playIcon = document.getElementById('play-btn-icon');
  const revealPlayBtn = document.getElementById('btn-reveal-play');
  const durationLabel = document.getElementById('snippet-duration');
  const track = document.getElementById('capsule-track');
  const audio = getAudioPlayer();
  if (!audio) return;

  const fill = document.getElementById('capsule-progress');
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  }

  audio.currentTime = 0;
  audio.play().then(() => {
    isAudioPlaying = true;
    if (playBtn) playBtn.classList.add('playing');
    if (playIcon) playIcon.className = 'fa-solid fa-pause';
    if (revealPlayBtn) revealPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    if (track) track.classList.add('playing');

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

  const revealPlayBtn = document.getElementById('btn-reveal-play');
  if (revealPlayBtn) revealPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

  const track = document.getElementById('capsule-track');
  if (track) track.classList.remove('playing');

  const durationLabel = document.getElementById('snippet-duration');
  if (durationLabel) {
    if (gameState && gameState.isFinished) {
      durationLabel.textContent = '30.0s';
    } else {
      const currentDuration = DURATIONS[gameState.attemptsUsed] || 0.1;
      durationLabel.textContent = currentDuration.toFixed(1) + 's';
    }
  }

  const fill = document.getElementById('capsule-progress');
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  }
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
