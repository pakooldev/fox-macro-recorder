// Fox Macro Recorder - Playback Functionality

// Waits are cut short by stopPlayback(), so Stop works during long loop delays too
let wakeSleeper = null;
function sleep(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    wakeSleeper = () => { clearTimeout(timer); resolve(); };
  });
}

function stopPlayback() {
  state.shouldStop = true;
  wakeSleeper?.();
}

// Extra random delay (ms) when Random Delay is on
function jitter() {
  const { randomDelayEnabled, randomDelayMin, randomDelayMax } = state.settings;
  if (!randomDelayEnabled) return 0;
  return randomDelayMin + Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1));
}

function setProgress(text) {
  const el = q('.fox-play-progress');
  if (el) el.textContent = text;
}

// Play/stop buttons all route here
function togglePlayback(id) {
  if (state.isPlaying) {
    stopPlayback();
  } else if (id) {
    playMacro(id);
  }
}

async function playMacro(id) {
  const macro = await getMacro(id);
  if (!macro || state.isPlaying) return;

  const loopCount = macro.loopCount || 1;
  const loopDelay = macro.loopDelay || 0;

  state.isPlaying = true;
  state.shouldStop = false;
  state.playingId = id;
  renderMode();

  for (let loop = 1; loop <= loopCount && !state.shouldStop; loop++) {
    await playActions(macro.actions, loop, loopCount);

    if (loop < loopCount && loopDelay > 0 && !state.shouldStop) {
      setProgress(`WAIT ${loop + 1}/${loopCount}`);
      await sleep(loopDelay + jitter());
    }
  }

  const stopped = state.shouldStop;
  state.isPlaying = false;
  state.shouldStop = false;
  state.playingId = null;
  renderMode();
  showToast(stopped ? 'Playback stopped' : 'Playback complete', stopped ? 'info' : 'success');
}

async function playActions(actions, currentLoop, totalLoops) {
  for (let i = 0; i < actions.length && !state.shouldStop; i++) {
    const delay = (i === 0 ? 500 : (actions[i].timestamp - actions[i - 1].timestamp) || 500) + jitter();

    setProgress(totalLoops > 1
      ? `${currentLoop}/${totalLoops} · ${i + 1}/${actions.length}`
      : `${i + 1}/${actions.length}`);

    await sleep(delay);
    if (!state.shouldStop) simulateClick(actions[i]);
  }
}

function simulateClick({ x, y }) {
  showClickFeedback(x, y, '#3B82F6', true);

  const element = document.elementFromPoint(x, y);
  if (!element) return;

  const { outline, transition } = element.style;
  element.style.transition = 'outline 0.2s';
  element.style.outline = '2px dashed #29ADFF';
  setTimeout(() => {
    element.style.outline = outline;
    element.style.transition = transition;
  }, 500);

  ['mousedown', 'mouseup', 'click'].forEach(type => {
    element.dispatchEvent(new MouseEvent(type, {
      bubbles: true, cancelable: true,
      clientX: x, clientY: y, view: window
    }));
  });
}
