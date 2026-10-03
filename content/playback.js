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

// Loop delay with a visible seconds countdown, still cut short by Stop
async function waitWithCountdown(ms, nextLabel) {
  const end = Date.now() + ms;
  const tick = () => setProgress(`${nextLabel} IN ${Math.ceil((end - Date.now()) / 1000)}s`);
  tick();
  const timer = setInterval(tick, 250);
  await sleep(ms);
  clearInterval(timer);
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
      await waitWithCountdown(loopDelay + jitter(), `LOOP ${loop + 1}/${loopCount}`);
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

    const stepText = `STEP ${i + 1}/${actions.length}`;
    setProgress(totalLoops > 1 ? `LOOP ${currentLoop}/${totalLoops} · ${stepText}` : stepText);

    await sleep(delay);
    if (!state.shouldStop) simulateClick(actions[i]);
  }
}

function simulateClick({ x, y }) {
  showClickFeedback(x, y, '#29ADFF', true);

  const element = document.elementFromPoint(x, y);
  if (!element) return;

  showTargetOutline(element);

  ['mousedown', 'mouseup', 'click'].forEach(type => {
    element.dispatchEvent(new MouseEvent(type, {
      bubbles: true, cancelable: true,
      clientX: x, clientY: y, view: window
    }));
  });
}
