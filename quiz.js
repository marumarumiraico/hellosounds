// Quiz Logic
let score = 0;
let qCount = 1;
let currentAnswer = null;
let audioPlayer = new Audio();

function init() {
    setupTheme();
    generateQuestion();
    
    document.getElementById('mainPlayBtn').addEventListener('click', () => {
        if (currentAnswer) playSound(currentAnswer.sound, currentAnswer.params);
    });
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function generateQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    const categoryHint = document.getElementById('categoryHint');
    const targetEmoji = document.getElementById('targetEmoji');
    const qCountEl = document.getElementById('qCount');
    
    optionsGrid.innerHTML = '';
    qCountEl.textContent = qCount;

    // 1. Pick a random category
    const categories = ['animals', 'objects', 'humans'];
    const catKey = categories[Math.floor(Math.random() * categories.length)];
    const category = window.soundDatabase[catKey];
    categoryHint.textContent = `${category.title} Category`;
    
    // 2. Pick a random item
    const items = Object.values(category.data);
    const item = items[Math.floor(Math.random() * items.length)];
    targetEmoji.textContent = item.icon;

    // 3. Pick a random country sound
    const correctSound = item.sounds[Math.floor(Math.random() * item.sounds.length)];
    currentAnswer = { sound: correctSound, params: item.params };

    // 4. Generate 4 options
    const countries = ['USA', 'Korea', 'Japan', 'Spain', 'France', 'Germany', 'Italy', 'Russia', 'Thailand', 'Egypt', 'Brazil', 'China', 'India', 'Kenya', 'Greece'];
    let options = [correctSound.country];
    while (options.length < 4) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        if (!options.includes(randomCountry)) options.push(randomCountry);
    }
    options.sort(() => Math.random() - 0.5);

    // 5. Render options
    const flagMap = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
    
    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<img src="https://flagcdn.com/w40/${flagMap[country]}.png" width="30"> <span>${country}</span>`;
        btn.onclick = () => checkAnswer(country, btn);
        optionsGrid.appendChild(btn);
    });

    // 6. Play initial sound
    setTimeout(() => playSound(correctSound, item.params), 500);
}

function checkAnswer(selected, btn) {
    const options = document.querySelectorAll('.quiz-option');
    const scoreEl = document.getElementById('score');
    
    options.forEach(b => b.style.pointerEvents = 'none');

    if (selected === currentAnswer.sound.country) {
        btn.classList.add('correct');
        score += 10;
        scoreEl.textContent = score;
        scoreEl.style.transform = 'scale(1.5)';
        setTimeout(() => scoreEl.style.transform = 'scale(1)', 300);
    } else {
        btn.classList.add('wrong');
        // Show correct answer
        options.forEach(b => {
            if (b.textContent.trim() === currentAnswer.sound.country) {
                b.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        qCount++;
        generateQuestion();
    }, 2000);
}

function playSound(soundItem, params) {
    audioPlayer.pause();
    
    fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: soundItem.native, country: soundItem.country })
    })
    .then(response => response.json())
    .then(data => {
        if (data.audioContent) {
            audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
            audioPlayer.play().catch(() => fallbackSpeak(soundItem, params));
        } else {
            fallbackSpeak(soundItem, params);
        }
    })
    .catch(() => fallbackSpeak(soundItem, params));
}

function fallbackSpeak(soundItem, params) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance();
    const langMap = { 'USA': 'en-US', 'Korea': 'ko-KR', 'Japan': 'ja-JP', 'Spain': 'es-ES', 'France': 'fr-FR', 'Germany': 'de-DE', 'Russia': 'ru-RU', 'Italy': 'it-IT', 'Brazil': 'pt-BR', 'China': 'zh-CN', 'India': 'hi-IN', 'Thailand': 'th-TH', 'Egypt': 'ar-EG', 'Kenya': 'sw-KE', 'Greece': 'el-GR' };
    msg.lang = langMap[soundItem.country] || 'en-US';
    msg.text = soundItem.fallback;
    msg.pitch = params.pitch;
    msg.rate = params.rate;
    window.speechSynthesis.speak(msg);
}

document.addEventListener('DOMContentLoaded', init);
