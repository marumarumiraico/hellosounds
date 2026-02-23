// Global variables
const animalGrid = document.getElementById('animalGrid');
const resultsSection = document.getElementById('resultsSection');
const selectorSection = document.getElementById('selectorSection');
const mainIcon = document.getElementById('mainIcon');
const mainName = document.getElementById('mainName');
const soundsGrid = document.getElementById('soundsGrid');
const headerIcon = document.getElementById('headerIcon');
const headerSubtitle = document.getElementById('headerSubtitle');
const navButtons = document.querySelectorAll('.category-btn'); 

// Custom Dropdown Elements
const langCurrentBtn = document.getElementById('langCurrentBtn');
const currentFlagImg = document.getElementById('currentFlagImg');
const langOptions = document.getElementById('langOptions');
const langOpts = document.querySelectorAll('.lang-opt');

let currentCategory = 'animals';
let audioPlayer = new Audio();
let activeRequestID = 0;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

const flagMap = { en: 'us', ko: 'kr', ja: 'jp', es: 'es' };

const i18n = {
    en: { title: ["H", "ello ", "S", "ounds"], subtitle: "Hear how the world speaks! ✨", selectItem: "Select an item:", animals: "🐾 Animals", objects: "🚗 Objects", humans: "👤 Humans", nature: "🌿 Nature", quizChallenge: "Ready for a Challenge?", quizDesc: "Test your ear in Quiz Mode!", footerNote: "Sound experience may vary depending on your device and browser settings.", copied: "Link copied to clipboard! 🚀", info1Title: "🌍 Why do sounds vary across countries?", info1Text: "Onomatopoeia is a fascinating intersection of linguistics and culture.", info2Title: "🧠 Educational Benefits", info2Text: "Our platform uses cutting-edge Google AI technology." },
    ko: { title: ["헬", "로 ", "사", "운즈"], subtitle: "전 세계의 다양한 소리를 들어보세요! ✨", selectItem: "항목을 선택하세요:", animals: "🐾 동물", objects: "🚗 사물", humans: "👤 사람", nature: "🌿 자연", quizChallenge: "퀴즈에 도전해볼까요?", quizDesc: "퀴즈 모드에서 당신의 실력을 테스트해보세요!", footerNote: "사운드 재생 환경은 기기 및 브라우저 설정에 따라 다를 수 있습니다.", copied: "링크가 클립보드에 복사되었습니다! 🚀", info1Title: "🌍 왜 나라마다 소리가 다를까요?", info1Text: "의성어는 언어와 문화가 만나는 흥미로운 지점입니다.", info2Title: "🧠 교육적 효과", info2Text: "본 서비스는 최신 Google AI 기술을 사용하여 최고의 품질을 제공합니다." },
    ja: { title: ["ハ", "ロー ", "サ", "ウンズ"], subtitle: "世界中の音を聞いてみよう！ ✨", selectItem: "アイテムを選択してください:", animals: "🐾 動物", objects: "🚗 物体", humans: "👤 人間", nature: "🌿 自然", quizChallenge: "クイズに挑戦しませんか？", quizDesc: "クイズモードで耳の力をテストしましょう！", footerNote: "音声体験はデバイスやブラウザの設定によって異なる場合があります.", copied: "リンクをコピーしました！ 🚀", info1Title: "🌍 なぜ国によって音が違うのですか？", info1Text: "擬音語は言語と文化が交差する興味深い分野です。", info2Title: "🧠 教育的メリット", info2Text: "最新のGoogle AI技術を使用しています。" },
    es: { title: ["H", "ello ", "S", "ounds"], subtitle: "¡Escucha cómo habla el mundo! ✨", selectItem: "Selecciona un artículo:", animals: "🐾 Animales", objects: "🚗 Objetos", humans: "👤 Humanos", nature: "🌿 Naturaleza", quizChallenge: "¿Listo para un desafío?", quizDesc: "¡Pon a prueba tu oído en el modo Quiz!", footerNote: "La experiencia de sonido puede variar según el dispositivo.", copied: "¡Enlace copiado! 🚀", info1Title: "🌍 ¿Por qué varían los sonidos?", info1Text: "La onomatopeya es una intersección fascinante de lingüística y cultura.", info2Title: "🧠 Beneficios Educativos", info2Text: "Nuestra plataforma utiliza tecnología de IA de Google." }
};

function init() {
    setupTheme();
    setupLanguage();
    setupNavigation();
    
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const itemParam = urlParams.get('item');

    if (catParam && window.soundDatabase[catParam]) {
        currentCategory = catParam;
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === catParam));
        renderSelectionGrid();
        if (itemParam && window.soundDatabase[catParam].data[itemParam]) {
            selectItem(window.soundDatabase[catParam].data[itemParam], null);
        }
    } else {
        renderSelectionGrid();
    }
}

function setupLanguage() {
    const savedLang = localStorage.getItem('lang') || (navigator.language.startsWith('ko') ? 'ko' : 'en');
    updateLangUI(savedLang);
    applyLanguage(savedLang);

    langCurrentBtn.onclick = (e) => {
        e.stopPropagation();
        langOptions.classList.toggle('show');
    };

    langOpts.forEach(opt => {
        opt.onclick = () => {
            const val = opt.dataset.value;
            localStorage.setItem('lang', val);
            updateLangUI(val);
            applyLanguage(val);
            langOptions.classList.remove('show');
            renderSelectionGrid();
        };
    });

    window.onclick = () => langOptions.classList.remove('show');
}

function updateLangUI(lang) {
    currentFlagImg.src = `https://flagcdn.com/w40/${flagMap[lang]}.png`;
}

function applyLanguage(lang) {
    const t = i18n[lang] || i18n.en;
    const h1 = document.querySelector('h1');
    if(h1) h1.innerHTML = `<span class="logo-h">${t.title[0]}</span>${t.title[1]}<span class="logo-s">${t.title[2]}</span>${t.title[3]}`;
    if(headerSubtitle) headerSubtitle.textContent = t.subtitle;
    if(document.getElementById('quizTitleText')) document.getElementById('quizTitleText').textContent = t.quizChallenge;
    if(document.getElementById('quizDescText')) document.getElementById('quizDescText').textContent = t.quizDesc;
    if(document.getElementById('selectItemHeading')) document.getElementById('selectItemHeading').textContent = t.selectItem;
    if(document.getElementById('footerNoteText')) document.getElementById('footerNoteText').textContent = t.footerNote;

    const info1 = document.getElementById('infoCard1');
    if(info1) { info1.querySelector('h3').textContent = t.info1Title; info1.querySelector('p').textContent = t.info1Text; }
    const info2 = document.getElementById('infoCard2');
    if(info2) { info2.querySelector('h3').textContent = t.info2Title; info2.querySelector('p').textContent = t.info2Text; }

    navButtons.forEach(btn => {
        const cat = btn.dataset.cat;
        if (t[cat]) btn.textContent = t[cat];
    });
}

function setupTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const toggle = document.getElementById('themeToggle');
    if(!toggle) return;
    const icon = toggle.querySelector('.theme-icon');
    icon.textContent = saved === 'dark' ? '☀️' : '🌙';
    toggle.onclick = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        icon.textContent = next === 'dark' ? '☀️' : '🌙';
    };
}

function stopAllSounds() {
    activeRequestID++;
    try { audioPlayer.pause(); audioPlayer.src = ""; } catch(e) {}
}

function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            stopAllSounds();
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            selectorSection.style.display = 'block';
            resultsSection.style.display = 'none';
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
    Object.values(categoryData.data).forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.innerHTML = `<span class="emoji">${item.icon}</span><span class="name">${item.name}</span>`;
        btn.onclick = () => { stopAllSounds(); selectItem(item, btn); };
        animalGrid.appendChild(btn);
    });
}

function selectItem(item, clickedBtn) {
    resultsSection.style.display = 'block';
    document.querySelectorAll('.animal-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
    mainIcon.textContent = item.icon;
    mainName.textContent = item.name;
    renderSoundCards(item, item.sounds, item.params);
    window.history.pushState({}, '', `?cat=${currentCategory}&item=${item.id}`);
    if (window.innerWidth < 600) resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function renderSoundCards(parentItem, sounds, params) {
    soundsGrid.innerHTML = '';
    sounds.forEach((soundItem) => {
        const isFav = favorites.some(f => f.id === parentItem.id && f.country === soundItem.country);
        const card = document.createElement('div');
        card.className = 'sound-card';
        const flagCodes = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Greece': 'gr' };
        card.innerHTML = `
            <div class="card-header">
                <img src="https://flagcdn.com/w40/${flagCodes[soundItem.country] || 'un'}.png" width="24" class="country-flag-img">
                <span class="country">${soundItem.country}</span>
                <div class="card-actions">
                    <button class="fav-btn ${isFav ? 'active' : ''}">❤️</button>
                    <button class="share-btn">🔗</button>
                </div>
            </div>
            <div class="card-body">
                <div class="sound-word">"${soundItem.sound}"</div>
                <div class="pronunciation">[ ${soundItem.pron} ]</div>
            </div>`;
        card.onclick = (e) => {
            if (e.target.closest('.share-btn') || e.target.closest('.fav-btn')) return;
            playSound(soundItem, params, card);
        };
        card.querySelector('.share-btn').onclick = (e) => { e.stopPropagation(); shareSound(parentItem, soundItem); };
        card.querySelector('.fav-btn').onclick = (e) => { e.stopPropagation(); toggleFavorite(parentItem, soundItem, e.currentTarget); };
        soundsGrid.appendChild(card);
    });
}

function toggleFavorite(item, sound, btn) {
    const favIndex = favorites.findIndex(f => f.id === item.id && f.country === sound.country);
    if (favIndex > -1) { favorites.splice(favIndex, 1); btn.classList.remove('active'); }
    else { favorites.push({ cat: currentCategory, id: item.id, country: sound.country, itemEmoji: item.icon, itemName: item.name }); btn.classList.add('active'); }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function shareSound(item, sound) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?cat=${currentCategory}&item=${item.id}`;
    const shareText = `How ${item.name} sounds in ${sound.country}! "${sound.sound}" 🌍`;
    if (navigator.share) await navigator.share({ title: 'Hello Sounds', text: shareText, url: shareUrl });
    else { navigator.clipboard.writeText(shareUrl).then(() => alert("Link copied!")); }
}

function playSound(soundItem, params, card) {
    activeRequestID++;
    const reqID = activeRequestID;
    card.classList.add('playing');
    fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: soundItem.native, country: soundItem.country }) })
    .then(res => res.json())
    .then(data => {
        if (reqID !== activeRequestID) return;
        audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
        audioPlayer.play();
        audioPlayer.onended = () => card.classList.remove('playing');
    }).catch(() => card.classList.remove('playing'));
}

document.addEventListener('DOMContentLoaded', init);
