// Global variables
const animalGrid = document.getElementById('animalGrid');
const resultsSection = document.getElementById('resultsSection');
const selectorSection = document.getElementById('selectorSection');
const mainHeader = document.getElementById('mainHeader');
const mainIcon = document.getElementById('mainIcon');
const mainName = document.getElementById('mainName');
const soundsGrid = document.getElementById('soundsGrid');
const headerIcon = document.getElementById('headerIcon');
const headerSubtitle = document.getElementById('headerSubtitle');
const navButtons = document.querySelectorAll('.category-btn'); 
const langSelector = document.getElementById('langSelector');

let currentCategory = 'animals';
let availableVoices = [];
let audioPlayer = new Audio();
let activeRequestID = 0;

// Localization Data
const i18n = {
    en: {
        title: "Hello Sounds",
        subtitle: "Hear how the world speaks! ✨",
        selectItem: "Select an item:",
        animals: "🐾 Animals",
        objects: "🚗 Objects",
        humans: "👤 Humans",
        nature: "🌿 Nature",
        quizChallenge: "Ready for a Challenge?",
        quizDesc: "Test your ear in Quiz Mode!",
        footerNote: "Sound experience may vary depending on your device and browser settings.",
        copied: "Link copied to clipboard! 🚀"
    },
    ko: {
        title: "헬로 사운즈",
        subtitle: "전 세계의 다양한 소리를 들어보세요! ✨",
        selectItem: "항목을 선택하세요:",
        animals: "🐾 동물",
        objects: "🚗 사물",
        humans: "👤 사람",
        nature: "🌿 자연",
        quizChallenge: "퀴즈에 도전해볼까요?",
        quizDesc: "퀴즈 모드에서 당신의 실력을 테스트해보세요!",
        footerNote: "사운드 재생 환경은 기기 및 브라우저 설정에 따라 다를 수 있습니다.",
        copied: "링크가 클립보드에 복사되었습니다! 🚀"
    },
    ja: {
        title: "ハローサウンズ",
        subtitle: "世界中の音を聞いてみよう！ ✨",
        selectItem: "アイテムを選択してください:",
        animals: "🐾 動物",
        objects: "🚗 物体",
        humans: "👤 人間",
        nature: "🌿 自然",
        quizChallenge: "クイズに挑戦しませんか？",
        quizDesc: "クイズモードで耳の力をテストしましょう！",
        footerNote: "音声体験はデバイスやブラウザの設定によって異なる場合があります。",
        copied: "リンクをクリップボードにコピーしました！ 🚀"
    },
    es: {
        title: "Hello Sounds",
        subtitle: "¡Escucha cómo habla el mundo! ✨",
        selectItem: "Selecciona un artículo:",
        animals: "🐾 Animales",
        objects: "🚗 Objetos",
        humans: "👤 Humanos",
        nature: "🌿 Naturaleza",
        quizChallenge: "¿Listo para un desafío?",
        quizDesc: "¡Pon a prueba tu oído en el modo Quiz!",
        footerNote: "La experiencia de sonido puede variar según el dispositivo y el navegador.",
        copied: "¡Enlace copiado al portapapeles! 🚀"
    }
};

function init() {
    setupNavigation();
    loadVoices();
    setupTheme();
    setupLanguage();
    
    // URL 파라미터 확인 (공유 링크 대응)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const itemParam = urlParams.get('item');

    if (catParam && window.soundDatabase[catParam]) {
        currentCategory = catParam;
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === catParam));
        renderSelectionGrid();
        if (itemParam && window.soundDatabase[catParam].data[itemParam]) {
            selectItem(window.soundDatabase[catParam].data[itemParam], { classList: { add: ()=>{} } });
        }
    } else {
        renderSelectionGrid();
    }

    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function setupLanguage() {
    const savedLang = localStorage.getItem('lang') || (navigator.language.startsWith('ko') ? 'ko' : 'en');
    langSelector.value = savedLang;
    applyLanguage(savedLang);

    langSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('lang', lang);
        applyLanguage(lang);
    });
}

function applyLanguage(lang) {
    const t = i18n[lang] || i18n.en;
    
    // Static UI Text
    document.querySelector('h1').innerHTML = `<span class="logo-h">H</span>ello <span class="logo-s">S</span>ounds`;
    if (lang === 'ko') document.querySelector('h1').innerHTML = `<span class="logo-h">헬</span>로 <span class="logo-s">사</span>운즈`;
    if (lang === 'ja') document.querySelector('h1').innerHTML = `<span class="logo-h">ハ</span>ロー <span class="logo-s">サ</span>ウンズ`;

    headerSubtitle.textContent = t.subtitle;
    document.querySelector('.selector-section h2').textContent = t.selectItem;
    document.querySelector('.quiz-cta-btn strong').textContent = t.quizChallenge;
    document.querySelector('.quiz-cta-btn span').textContent = t.quizDesc;
    document.querySelector('footer p').textContent = t.footerNote;

    // Nav Buttons
    navButtons.forEach(btn => {
        const cat = btn.dataset.cat;
        if (t[cat]) btn.textContent = t[cat];
    });

    // Update Category Info (if item selected)
    const catInfo = window.soundDatabase[currentCategory];
    if (catInfo) {
        headerIcon.textContent = catInfo.icon;
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
            try { audioPlayer.play().catch(() => {}); } catch(e) {}
            stopAllSounds();
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentCategory = btn.dataset.cat;
            resultsSection.style.display = 'none';
            selectorSection.style.display = 'block';
            renderSelectionGrid();
            
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?cat=${currentCategory}`;
            window.history.pushState({path:newUrl}, '', newUrl);
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
    if (clickedBtn && clickedBtn.classList) clickedBtn.classList.add('active');
    mainIcon.textContent = item.icon;
    mainName.textContent = item.name;
    renderSoundCards(item, item.sounds, item.params);
    
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?cat=${currentCategory}&item=${item.id}`;
    window.history.pushState({path:newUrl}, '', newUrl);

    if (window.innerWidth < 600) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderSoundCards(parentItem, sounds, params) {
    soundsGrid.innerHTML = '';
    sounds.forEach((soundItem, index) => {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.style.animation = `fadeInPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${index * 0.04}s`; 
        card.style.opacity = '0';
        const flagCodes = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
        const flagCode = flagCodes[soundItem.country] || 'un';
        
        card.innerHTML = `
            <div class="card-header">
                <img src="https://flagcdn.com/w40/${flagCode}.png" width="24" class="country-flag-img">
                <span class="country">${soundItem.country}</span>
                <button class="share-btn" title="Share this sound">🔗</button>
            </div>
            <div class="card-body">
                <div class="sound-word">"${soundItem.sound}"</div>
                <div class="pronunciation">[ ${soundItem.pron} ]</div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) return;
            playSound(soundItem, params, card);
        });

        card.querySelector('.share-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            shareSound(parentItem, soundItem);
        });

        soundsGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.sound-word').forEach(el => fitText(el)); }, 100);
}

async function shareSound(item, sound) {
    const lang = langSelector.value;
    const shareUrl = `${window.location.origin}${window.location.pathname}?cat=${currentCategory}&item=${item.id}`;
    const shareText = `Check out how ${item.name} sounds in ${sound.country}! "${sound.sound}" 🌍✨`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Hello Sounds',
                text: shareText,
                url: shareUrl,
            });
        } catch (err) {}
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast(i18n[lang].copied);
        });
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2500);
}

function playSound(soundItem, params, cardElement) {
    stopAllSounds();
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
    .catch(() => {
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
