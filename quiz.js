// Quiz Logic
let score = 0;
let qCount = 1;
const maxQuestions = 10;
let currentAnswer = null;
let audioPlayer = new Audio();
let activeRequestID = 0;
let audioCtx = null; // Singleton AudioContext

const i18n = {
    en: {
        score: "Score", question: "Question",
        tapListen: "Tap to Listen", backHome: "🏠 Back to Home",
        animals: "Animals", objects: "Objects", humans: "Humans", nature: "Nature",
        categoryText: " Category",
        resultGreat: "🎉 Amazing!", resultGood: "👏 Well Done!", resultTry: "💪 Keep Going!",
        resultScore: "Your final score is ",
        playAgain: "🎮 Play Again"
    },
    ko: {
        score: "점수", question: "문제",
        tapListen: "클릭하여 듣기", backHome: "🏠 홈으로 돌아가기",
        animals: "동물", objects: "사물", humans: "사람", nature: "자연",
        categoryText: " 카테고리",
        resultGreat: "🎉 정말 대단해요!", resultGood: "👏 잘했어요!", resultTry: "💪 조금 더 힘내봐요!",
        resultScore: "최종 점수는 ",
        playAgain: "🎮 다시 하기"
    },
    ja: {
        score: "スコア", question: "問題",
        tapListen: "タップして聴く", backHome: "🏠 ホームに戻る",
        animals: "動物", objects: "物体", humans: "人間", nature: "自然",
        categoryText: " カテゴリー",
        resultGreat: "🎉 素晴らしい！", resultGood: "👏 よくできました！", resultTry: "💪 次も頑張りましょう！",
        resultScore: "最終スコアは ",
        playAgain: "🎮 もう 한 번"
    },
    es: {
        score: "Puntaje", question: "Pregunta",
        tapListen: "Toca para escuchar", backHome: "🏠 Volver al inicio",
        animals: "Animales", objects: "Objetos", humans: "Humanos", nature: "Naturaleza",
        categoryText: " Categoría",
        resultGreat: "🎉 ¡Increíble!", resultGood: "👏 ¡Muy bien!", resultTry: "💪 ¡Sigue así!",
        resultScore: "Tu puntaje final es ",
        playAgain: "🎮 Jugar de nuevo"
    }
};

function init() {
    setupTheme();
    const savedLang = localStorage.getItem('lang') || (navigator.language.startsWith('ko') ? 'ko' : 'en');
    applyLanguage(savedLang);
    resetGame();
    
    document.getElementById('mainPlayBtn').addEventListener('click', () => {
        if (currentAnswer) playSound(currentAnswer.sound, currentAnswer.params);
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('resultModal').style.display = 'none';
        resetGame();
    });
}

function resetGame() {
    score = 0;
    qCount = 1;
    document.getElementById('score').textContent = score;
    generateQuestion();
}

function applyLanguage(lang) {
    const t = i18n[lang] || i18n.en;
    document.getElementById('scoreLabel').textContent = t.score;
    document.getElementById('qCountLabel').textContent = t.question;
    document.getElementById('playLabel').textContent = t.tapListen;
    document.getElementById('backHomeLabel').textContent = t.backHome;
    document.getElementById('restartBtn').textContent = t.playAgain;
}

function generateQuestion() {
    if (qCount > maxQuestions) {
        showResults();
        return;
    }

    const optionsGrid = document.getElementById('optionsGrid');
    const categoryHint = document.getElementById('categoryHint');
    const targetEmoji = document.getElementById('targetEmoji');
    const qCountEl = document.getElementById('qCount');
    const progressBar = document.getElementById('progressBar');
    
    optionsGrid.innerHTML = '';
    qCountEl.textContent = qCount;
    progressBar.style.width = `${((qCount - 1) / maxQuestions) * 100}%`;

    const categories = ['animals', 'objects', 'humans', 'nature'];
    const catKey = categories[Math.floor(Math.random() * categories.length)];
    const category = window.soundDatabase[catKey];
    if (!category) {
        console.error("Database not loaded yet");
        return;
    }

    const savedLang = localStorage.getItem('lang') || 'en';
    const t = i18n[savedLang] || i18n.en;
    categoryHint.textContent = (t[catKey] || category.title) + t.categoryText;
    
    const items = Object.values(category.data);
    const item = items[Math.floor(Math.random() * items.length)];
    targetEmoji.textContent = item.icon;

    const correctSound = item.sounds[Math.floor(Math.random() * item.sounds.length)];
    currentAnswer = { sound: correctSound, params: item.params };

    const countries = ['USA', 'Korea', 'Japan', 'Spain', 'France', 'Germany', 'Italy', 'Russia', 'Thailand', 'Egypt', 'Brazil', 'China', 'India', 'Kenya', 'Greece'];
    let options = [correctSound.country];
    while (options.length < 4) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        if (!options.includes(randomCountry)) options.push(randomCountry);
    }
    options.sort(() => Math.random() - 0.5);

    const flagMap = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
    
    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<img src="https://flagcdn.com/w40/${flagMap[country]}.png" width="30" alt="flag"> <span>${country}</span>`;
        btn.onclick = () => checkAnswer(country, btn);
        optionsGrid.appendChild(btn);
    });

    setTimeout(() => playSound(correctSound, item.params), 500);
}

function showResults() {
    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultTitle');
    const text = document.getElementById('resultText');
    const savedLang = localStorage.getItem('lang') || 'en';
    const t = i18n[savedLang] || i18n.en;

    modal.style.display = 'flex';
    document.getElementById('progressBar').style.width = '100%';

    if (score >= 90) title.textContent = t.resultGreat;
    else if (score >= 60) title.textContent = t.resultGood;
    else title.textContent = t.resultTry;

    text.textContent = `${t.resultScore}${score}!`;
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function stopAllSounds() {
    activeRequestID++; // 이전 모든 TTS 요청 무시
    audioPlayer.pause();
    audioPlayer.src = "";
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function checkAnswer(selected, btn) {
    stopAllSounds(); // 정답 클릭 시 현재 나오던 문제 소리 즉시 중단
    
    const options = document.querySelectorAll('.quiz-option');
    const scoreEl = document.getElementById('score');
    const mainCard = document.querySelector('.quiz-main-card');
    
    options.forEach(b => b.style.pointerEvents = 'none');

    if (selected === currentAnswer.sound.country) {
        btn.classList.add('correct');
        mainCard.classList.add('pulse-success');
        playAudioTone(880, 0.3, 'sine');
        
        score += 10;
        scoreEl.textContent = score;
        scoreEl.style.transform = 'scale(1.5)';
        setTimeout(() => scoreEl.style.transform = 'scale(1)', 300);
    } else {
        btn.classList.add('wrong');
        mainCard.classList.add('shake-error');
        playAudioTone(110, 0.5, 'triangle');

        options.forEach(b => {
            if (b.textContent.trim() === currentAnswer.sound.country) {
                b.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        mainCard.classList.remove('pulse-success', 'shake-error');
        qCount++;
        generateQuestion();
    }, 2000);
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function stopAllSounds() {
    activeRequestID++; // 이전 모든 TTS 요청 무시
    audioPlayer.pause();
    audioPlayer.src = "";
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function checkAnswer(selected, btn) {
    stopAllSounds(); // 정답 클릭 시 현재 나오던 문제 소리 즉시 중단
    
    const options = document.querySelectorAll('.quiz-option');
    const scoreEl = document.getElementById('score');
    const mainCard = document.querySelector('.quiz-main-card');
    
    options.forEach(b => b.style.pointerEvents = 'none');

    if (selected === currentAnswer.sound.country) {
        btn.classList.add('correct');
        mainCard.classList.add('pulse-success');
        playAudioTone(880, 0.3, 'sine');
        
        score += 10;
        scoreEl.textContent = score;
        scoreEl.style.transform = 'scale(1.5)';
        setTimeout(() => scoreEl.style.transform = 'scale(1)', 300);
    } else {
        btn.classList.add('wrong');
        mainCard.classList.add('shake-error');
        playAudioTone(110, 0.5, 'triangle');

        options.forEach(b => {
            if (b.textContent.trim() === currentAnswer.sound.country) {
                b.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        mainCard.classList.remove('pulse-success', 'shake-error');
        qCount++;
        generateQuestion();
    }, 2000);
}

function playAudioTone(freq, duration, type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio synthesis failed:", e);
    }
}

function playSound(soundItem, params) {
    stopAllSounds();
    const requestID = activeRequestID;
    
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
            audioPlayer.play().catch(() => fallbackSpeak(soundItem, params));
        } else {
            fallbackSpeak(soundItem, params);
        }
    })
    .catch(() => {
        if (requestID === activeRequestID) fallbackSpeak(soundItem, params);
    });
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
