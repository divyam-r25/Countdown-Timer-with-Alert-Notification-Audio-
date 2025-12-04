const setBtn   = document.querySelector('#btn-set');
const hourSel  = document.getElementById('set-h');
const minSel   = document.getElementById('set-m');
const secSel   = document.getElementById('set-s');
const timeCont = document.querySelector('.time-cont');
const clockCont = document.querySelector('.clock-cont');

const restartBtn = document.getElementById('restart');
const mainBtn    = document.querySelector('.time-control button');


for (let i = 0; i < 24; i++) {
  hourSel.innerHTML += `<option value="${i}">${String(i).padStart(2, '0')}</option>`;
}
for (let i = 0; i < 60; i++) {
  const opt = `<option value="${i}">${String(i).padStart(2, '0')}</option>`;
  minSel.innerHTML  += opt;
  secSel.innerHTML  += opt;
}


let totalSeconds = 0;          
let timerId = null;           
let isRunning = false;        


function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  return false;
}

function showTimeUpNotification() {
  if (Notification.permission === "granted") {
    new Notification("⏰ Timer Finished!", {
      body: "Your countdown has completed!",
      icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTIwIDIwTDMwIDMwTTMwIDIwTDIwIDMwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+",
      badge: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+",
      tag: "timer-complete",
      vibrate: [200, 100, 200],
      requireInteraction: true
    });
  }
}


function playTimeUpSound() {
  let audioCtx = window.audioContext;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    window.audioContext = audioCtx;
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const playTone = (frequency, duration, type = 'sine', delay = 0) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
    
    oscillator.start(audioCtx.currentTime + delay);
    oscillator.stop(audioCtx.currentTime + delay + duration);
  };

  const alarmSequence = () => {
    playTone(800, 0.4, 'square');    
    playTone(600, 0.3, 'sawtooth', 0.45);
    playTone(1000, 0.5, 'sine', 0.85);
    playTone(400, 0.6, 'triangle', 1.5);
  };
  
  alarmSequence();
  window.alarmInterval = setInterval(alarmSequence, 2000);
}

function stopAlarm() {
  if (window.alarmInterval) {
    clearInterval(window.alarmInterval);
    window.alarmInterval = null;
  }
  if (window.audioContext && window.audioContext.state !== 'closed') {
    window.audioContext.suspend();
  }
}


function createDisplay() {
  timeCont.innerHTML = ''; 
  if (totalSeconds <= 0) return;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  function addSection(id, value, label) {
    const sec = document.createElement('section');
    sec.className = 'number';
    const strongVal = document.createElement('strong');
    strongVal.id = id;
    strongVal.textContent = String(value).padStart(2, '0');
    const strongText = document.createElement('strong');
    strongText.className = 'text';
    strongText.textContent = label;
    sec.appendChild(strongVal);
    sec.appendChild(strongText);
    timeCont.appendChild(sec);
  }

  if (h > 0) addSection('hour', h, 'H');
  if (h > 0 || m > 0) addSection('minutes', m, 'MM');
  addSection('seconds', s, 'S');
}

function updateDisplay() {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hourEl = document.getElementById('hour');
  const minEl  = document.getElementById('minutes');
  const secEl  = document.getElementById('seconds');

  if (hourEl) hourEl.textContent = String(h).padStart(2, '0');
  if (minEl)  minEl.textContent  = String(m).padStart(2, '0');
  if (secEl)  secEl.textContent  = String(s).padStart(2, '0');
}


setBtn.addEventListener('click', () => {
  if (isRunning) return;
  const h = Number(hourSel.value);
  const m = Number(minSel.value);
  const s = Number(secSel.value);

  if (h === 0 && m === 0 && s === 0) {
    alert('Set time first!');
    return;
  }

  totalSeconds = h * 3600 + m * 60 + s;
  createDisplay();
});

mainBtn.id = 'btn-start';
mainBtn.textContent = 'Start';

mainBtn.addEventListener('click', () => {
  if (totalSeconds === 0) return;

  if (!isRunning) {

    clockCont.classList.add('running');
    clockCont.classList.remove('paused', 'completed');
    isRunning = true;
    mainBtn.id = 'btn-pause';
    mainBtn.textContent = 'Pause';

    if (!document.getElementById('seconds')) {
      createDisplay();
    }

    timerId = setInterval(() => {
      totalSeconds--;
      updateDisplay();

      if (totalSeconds <= 0) {
        clearInterval(timerId);
        isRunning = false;
        
        
        requestNotificationPermission();
        playTimeUpSound();
        showTimeUpNotification();
        
        clockCont.classList.remove('running', 'paused');
        clockCont.classList.add('completed');
        mainBtn.id = 'btn-start';
        mainBtn.textContent = 'Start';
      }
    }, 1000);
  } else {
 
    isRunning = false;
    clockCont.classList.remove('running');
    clockCont.classList.add('paused');
    mainBtn.id = 'btn-start';
    mainBtn.textContent = 'Start';
    clearInterval(timerId);
  }
});

restartBtn.addEventListener('click', () => {
  stopAlarm(); 
  clearInterval(timerId);
  isRunning = false;
  totalSeconds = 0;
  timeCont.innerHTML = '';
  clockCont.classList.remove('running', 'paused', 'completed');
  mainBtn.id = 'btn-start';
  mainBtn.textContent = 'Start';

  hourSel.value = '0';
  minSel.value  = '0';
  secSel.value  = '0';
});


window.addEventListener('load', () => {
  requestNotificationPermission();
});


if ('serviceWorker' in navigator && 'Notification' in window) {
  navigator.serviceWorker.ready.then(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'notification-click') {
        stopAlarm();
      }
    });
  });
}
