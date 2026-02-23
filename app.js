import { soundDatabase } from './data.js';

// DOM Elements
const animalGrid = document.getElementById('animalGrid');
const resultsSection = document.getElementById('resultsSection');
const mainIcon = document.getElementById('mainIcon');
const mainName = document.getElementById('mainName');
const soundsGrid = document.getElementById('soundsGrid');
const headerIcon = document.getElementById('headerIcon');
const headerSubtitle = document.getElementById('headerSubtitle');
const navButtons = document.querySelectorAll('.nav-btn');

let currentCategory = 'animals';
let availableVoices = [];
let audioPlayer = new Audio(); // Global audio instance for mobile compatibility

function init() {
    setupNavigation();
    renderSelectionGrid();
    loadVoices();
    setupStartOverlay(); // 추가
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function setupStartOverlay() {
    const startBtn = document.getElementById('startBtn');
    const overlay = document.getElementById('startOverlay');
    
    startBtn.addEventListener('click', () => {
        // [강력한 잠금해제] 시작 버튼을 누르는 즉시 오디오 객체 활성화
        audioPlayer.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFRm10IBAAAAABAAEAgD5AAAB+AAABAAgAZGF0YQAAAAA=';
        audioPlayer.play().then(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }).catch(err => {
            console.warn("Audio start failed:", err);
            // 에러가 나더라도 오버레이는 닫음
            overlay.style.display = 'none';
        });
    });
}

function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
}

function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            const catInfo = soundDatabase[currentCategory];
            headerIcon.textContent = catInfo.icon;
            headerSubtitle.textContent = catInfo.subtitle;
            resultsSection.style.display = 'none';
            renderSelectionGrid();
            
            // Interaction to unlock audio on mobile
            audioPlayer.play().catch(() => {});
        });
    });
}

function renderSelectionGrid() {
    animalGrid.innerHTML = '';
    const currentData = soundDatabase[currentCategory].data;
    Object.values(currentData).forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.innerHTML = `<span class="emoji">${item.icon}</span><span class="name">${item.name}</span>`;
        btn.addEventListener('click', () => {
            // Unmute/Unlock synchronously for In-App Browsers (like KakaoTalk)
            audioPlayer.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFRm10IBAAAAABAAEAgD5AAAB+AAABAAgAZGF0YQAAAAA=';
            audioPlayer.play().catch(() => {});
            selectItem(item, btn);
        });
        animalGrid.appendChild(btn);
    });
}

function selectItem(item, clickedBtn) {
    resultsSection.style.display = 'block';
    document.querySelectorAll('.animal-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
    mainIcon.textContent = item.icon;
    mainName.textContent = item.name;
    renderSoundCards(item.sounds, item.params);
}

function renderSoundCards(sounds, params) {
    soundsGrid.innerHTML = '';
    sounds.forEach((soundItem, index) => {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.style.animation = `fadeInPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${index * 0.04}s`; 
        card.style.opacity = '0';
        const flagCodes = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
        const flagCode = flagCodes[soundItem.country] || 'un';
        card.innerHTML = `<div class="card-header"><img src="https://flagcdn.com/w40/${flagCode}.png" width="24" class="country-flag-img"><span class="country">${soundItem.country}</span></div><div class="card-body"><div class="sound-word">"${soundItem.sound}"</div><div class="pronunciation">[ ${soundItem.pron} ]</div></div>`;
        card.addEventListener('click', () => {
            // [Essential] Pre-arm the audio element synchronously within the user gesture
            audioPlayer.load();
            playSound(soundItem, params, card);
        });
        soundsGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.sound-word').forEach(el => fitText(el)); }, 100);
}

function playSound(soundItem, params, cardElement) {
    cardElement.style.transform = 'scale(0.95)';
    cardElement.classList.add('playing');
    setTimeout(() => cardElement.style.transform = '', 150);

    // Stop any existing speech
    window.speechSynthesis.cancel();
    
    const textToSpeak = soundItem.native;
    const country = soundItem.country;

    // Reset player for new sound
    audioPlayer.pause();
    audioPlayer.src = "";

    fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, country: country })
    })
    .then(response => response.json())
    .then(data => {
        if (data.audioContent) {
            audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
            audioPlayer.play().catch(e => {
                console.error('Audio playback failed:', e);
                fallbackSpeak(soundItem, params, cardElement);
            });
            audioPlayer.onended = () => cardElement.classList.remove('playing');
        } else {
            throw new Error(data.error || 'Failed to get audio');
        }
    })
    .catch(error => {
        console.error('TTS API Error, falling back to local speech:', error);
        fallbackSpeak(soundItem, params, cardElement);
    });
}

function fallbackSpeak(soundItem, params, cardElement) {
    const msg = new SpeechSynthesisUtterance();
    const langMap = { 'USA': 'en-US', 'Korea': 'ko-KR', 'Japan': 'ja-JP', 'Spain': 'es-ES', 'France': 'fr-FR', 'Germany': 'de-DE', 'Russia': 'ru-RU', 'Italy': 'it-IT', 'Brazil': 'pt-BR', 'China': 'zh-CN', 'India': 'hi-IN', 'Thailand': 'th-TH', 'Egypt': 'ar-EG', 'Kenya': 'sw-KE', 'Greece': 'el-GR' };
    msg.lang = langMap[soundItem.country] || 'en-US';
    msg.text = soundItem.fallback;
    msg.pitch = params.pitch;
    msg.rate = params.rate;
    window.speechSynthesis.speak(msg);
    cardElement.classList.remove('playing');
}


function fitText(el) {
    const parentWidth = el.parentElement.clientWidth - 60;
    let fontSize = 2.8;
    el.style.fontSize = fontSize + 'rem';
    while (el.scrollWidth > parentWidth && fontSize > 1.2) {
        fontSize -= 0.1;
        el.style.fontSize = fontSize.toFixed(1) + 'rem';
    }
}

document.addEventListener('DOMContentLoaded', init);
