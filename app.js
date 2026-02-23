// Global variables
const animalGrid = document.getElementById('animalGrid');
const resultsSection = document.getElementById('resultsSection');
const selectorSection = document.getElementById('selectorSection');
const quizSection = document.getElementById('quizSection');
const mainHeader = document.getElementById('mainHeader');
const mainIcon = document.getElementById('mainIcon');
const mainName = document.getElementById('mainName');
const soundsGrid = document.getElementById('soundsGrid');
const headerIcon = document.getElementById('headerIcon');
const headerSubtitle = document.getElementById('headerSubtitle');
const navButtons = document.querySelectorAll('.category-btn'); 
const quizNavBtn = document.getElementById('quizNavBtn');

let currentCategory = 'animals';
let availableVoices = [];
let audioPlayer = new Audio();
let activeRequestID = 0;

// Quiz State
let quizAnswer = null;
let isQuizMode = false;

function init() {
    setupNavigation();
    renderSelectionGrid();
    loadVoices();
    setupTheme();
    setupQuiz();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function loadVoices() {
    if (window.speechSynthesis) availableVoices = window.speechSynthesis.getVoices();
}

function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (icon) icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        if (icon) icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

function stopAllSounds() {
    activeRequestID++;
    try {
        audioPlayer.pause();
        audioPlayer.src = "";
    } catch(e) {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
}

function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            exitQuiz();
            try { audioPlayer.play().catch(() => {}); } catch(e) {}
            stopAllSounds();
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            const catInfo = window.soundDatabase[currentCategory];
            if (catInfo) {
                headerIcon.textContent = catInfo.icon;
                headerSubtitle.textContent = catInfo.subtitle;
            }
            resultsSection.style.display = 'none';
            selectorSection.style.display = 'block';
            renderSelectionGrid();
        });
    });
}

function renderSelectionGrid() {
    animalGrid.innerHTML = '';
    const categoryData = window.soundDatabase[currentCategory];
    if (!categoryData) return;
    const currentData = categoryData.data;
    Object.values(currentData).forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.innerHTML = `<span class="emoji">${item.icon}</span><span class="name">${item.name}</span>`;
        btn.addEventListener('click', () => {
            try { audioPlayer.play().catch(() => {}); } catch(e) {}
            stopAllSounds();
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
    if (window.innerWidth < 600) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
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
            playSound(soundItem, params, card);
        });
        soundsGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.sound-word').forEach(el => fitText(el)); }, 100);
}

function playSound(soundItem, params, cardElement, isQuiz = false) {
    if (!isQuiz) stopAllSounds();
    const requestID = activeRequestID;
    if (cardElement) {
        cardElement.style.transform = 'scale(0.95)';
        cardElement.classList.add('playing');
        setTimeout(() => cardElement.style.transform = '', 150);
    }
    try {
        audioPlayer.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFRm10IBAAAAABAAEAgD5AAAB+AAABAAgAZGF0YQAAAAA=';
        audioPlayer.play().catch(() => {});
    } catch(e) {}
    fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: soundItem.native, country: soundItem.country })
    })
    .then(response => response.json())
    .then(data => {
        if (requestID !== activeRequestID) return;
        if (data.audioContent) {
            audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
            audioPlayer.play().catch(() => fallbackSpeak(soundItem, params, cardElement));
            audioPlayer.onended = () => { if (cardElement) cardElement.classList.remove('playing'); };
        } else { throw new Error(data.error); }
    })
    .catch(error => {
        if (requestID === activeRequestID) fallbackSpeak(soundItem, params, cardElement);
    });
}

function fallbackSpeak(soundItem, params, cardElement) {
    if (!window.speechSynthesis) { if (cardElement) cardElement.classList.remove('playing'); return; }
    const msg = new SpeechSynthesisUtterance();
    const langMap = { 'USA': 'en-US', 'Korea': 'ko-KR', 'Japan': 'ja-JP', 'Spain': 'es-ES', 'France': 'fr-FR', 'Germany': 'de-DE', 'Russia': 'ru-RU', 'Italy': 'it-IT', 'Brazil': 'pt-BR', 'China': 'zh-CN', 'India': 'hi-IN', 'Thailand': 'th-TH', 'Egypt': 'ar-EG', 'Kenya': 'sw-KE', 'Greece': 'el-GR' };
    msg.lang = langMap[soundItem.country] || 'en-US';
    msg.text = soundItem.fallback;
    msg.pitch = params.pitch;
    msg.rate = params.rate;
    window.speechSynthesis.speak(msg);
    if (cardElement) cardElement.classList.remove('playing');
}

// --- Quiz Logic ---
function setupQuiz() {
    quizNavBtn.addEventListener('click', startQuiz);
    document.getElementById('exitQuizBtn').addEventListener('click', exitQuiz);
    document.getElementById('replayBtn').addEventListener('click', () => {
        if (quizAnswer) playSound(quizAnswer.sound, quizAnswer.params, null, true);
    });
}

function startQuiz() {
    isQuizMode = true;
    stopAllSounds();
    navButtons.forEach(b => b.classList.remove('active'));
    quizNavBtn.classList.add('active');
    
    selectorSection.style.display = 'none';
    resultsSection.style.display = 'none';
    mainHeader.style.display = 'none';
    quizSection.style.display = 'flex';
    
    generateQuestion();
}

function exitQuiz() {
    isQuizMode = false;
    quizSection.style.display = 'none';
    mainHeader.style.display = 'block';
    selectorSection.style.display = 'block';
    quizNavBtn.classList.remove('active');
    
    // Restore animals as default
    const aniBtn = Array.from(navButtons).find(b => b.dataset.cat === 'animals');
    if (aniBtn) aniBtn.click();
}

function generateQuestion() {
    const feedback = document.getElementById('quizFeedback');
    feedback.textContent = '';
    
    // 1. Pick a random category and item
    const categories = ['animals', 'objects', 'humans'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const items = Object.values(window.soundDatabase[cat].data);
    const item = items[Math.floor(Math.random() * items.length)];
    
    // 2. Pick a random country from sounds
    const correctSound = item.sounds[Math.floor(Math.random() * item.sounds.length)];
    quizAnswer = { sound: correctSound, params: item.params };
    
    document.getElementById('quizEmoji').textContent = item.icon;
    
    // 3. Create 4 options
    const countries = ['USA', 'Korea', 'Japan', 'Spain', 'France', 'Germany', 'Italy', 'Russia', 'Thailand', 'Egypt', 'Brazil', 'China', 'India', 'Kenya', 'Greece'];
    let options = [correctSound.country];
    while (options.length < 4) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        if (!options.includes(randomCountry)) options.push(randomCountry);
    }
    options.sort(() => Math.random() - 0.5);
    
    // 4. Render options
    const optionsGrid = document.getElementById('quizOptions');
    optionsGrid.innerHTML = '';
    const flagMap = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
    
    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<img src="https://flagcdn.com/w40/${flagMap[country]}.png" width="30"> <span>${country}</span>`;
        btn.onclick = () => checkAnswer(country, btn);
        optionsGrid.appendChild(btn);
    });
    
    // 5. Play sound
    playSound(correctSound, item.params, null, true);
}

function checkAnswer(selectedCountry, btn) {
    const feedback = document.getElementById('quizFeedback');
    const allBtns = document.querySelectorAll('.option-btn');
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    if (selectedCountry === quizAnswer.sound.country) {
        btn.classList.add('correct');
        feedback.textContent = "✨ Correct! Amazing! ✨";
        feedback.style.color = "#2ecc71";
        setTimeout(generateQuestion, 2000);
    } else {
        btn.classList.add('wrong');
        feedback.textContent = `❌ Oh no! It was ${quizAnswer.sound.country}.`;
        feedback.style.color = "#e74c3c";
        setTimeout(generateQuestion, 2500);
    }
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
