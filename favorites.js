let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let audioPlayer = new Audio();
let activeRequestID = 0;

const i18n = {
    en: { favTitle: "My Favorites", favSubtitle: "Your collection of favorite global sounds!", noFavs: "No favorites yet. Click ❤️ on any sound card!", copied: "Link copied!" },
    ko: { favTitle: "내 즐겨찾기", favSubtitle: "내가 찜한 전 세계 소리 모음!", noFavs: "아직 즐겨찾기가 없습니다. 소리 카드의 ❤️를 눌러보세요!", copied: "복사 완료!" },
    ja: { favTitle: "お気に入り", favSubtitle: "お気に入りの世界の音コレクション！", noFavs: "お気に入りはまだありません。❤️をタップして追加してください！", copied: "コピーしました！" },
    es: { favTitle: "Mis Favoritos", favSubtitle: "¡Tu colección de sonidos globales favoritos!", noFavs: "Aún no hay favoritos. ¡Haz clic en ❤️ en cualquier sonido!", copied: "¡Copiado!" }
};

function init() {
    setupTheme();
    setupLanguage();
    renderFavorites();
}

function setupLanguage() {
    const langSelector = document.getElementById('langSelector');
    const savedLang = localStorage.getItem('lang') || 'en';
    langSelector.value = savedLang;
    applyLanguage(savedLang);
    langSelector.addEventListener('change', (e) => {
        localStorage.setItem('lang', e.target.value);
        applyLanguage(e.target.value);
        renderFavorites();
    });
}

function applyLanguage(lang) {
    const t = i18n[lang] || i18n.en;
    document.getElementById('favTitle').textContent = t.favTitle;
    document.getElementById('favSubtitle').textContent = t.favSubtitle;
}

function renderFavorites() {
    const grid = document.getElementById('favGrid');
    const lang = localStorage.getItem('lang') || 'en';
    grid.innerHTML = '';

    if (favorites.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; font-weight: 700; opacity: 0.6;">${i18n[lang].noFavs}</p>`;
        return;
    }

    favorites.forEach((fav, index) => {
        const catData = window.soundDatabase[fav.cat];
        if (!catData) return;
        const itemData = catData.data[fav.id];
        const soundItem = itemData.sounds.find(s => s.country === fav.country);
        
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.style.animation = `fadeInPop 0.5s ease forwards ${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="card-header">
                <span style="font-size: 1.5rem;">${fav.itemEmoji}</span>
                <span class="country">${soundItem.country}</span>
                <div class="card-actions">
                    <button class="fav-btn active">❤️</button>
                </div>
            </div>
            <div class="card-body">
                <div class="sound-word">"${soundItem.sound}"</div>
                <div class="pronunciation">[ ${soundItem.pron} ]</div>
            </div>`;

        card.onclick = (e) => {
            if (e.target.closest('.fav-btn')) return;
            playSound(soundItem, itemData.params, card);
        };

        card.querySelector('.fav-btn').onclick = (e) => {
            e.stopPropagation();
            removeFavorite(fav.id, fav.country);
        };

        grid.appendChild(card);
    });
}

function removeFavorite(id, country) {
    favorites = favorites.filter(f => !(f.id === id && f.country === country));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

function playSound(soundItem, params, card) {
    activeRequestID++;
    const reqID = activeRequestID;
    card.classList.add('playing');
    fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: soundItem.native, country: soundItem.country })
    })
    .then(res => res.json())
    .then(data => {
        if (reqID !== activeRequestID) return;
        audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
        audioPlayer.play();
        audioPlayer.onended = () => card.classList.remove('playing');
    })
    .catch(() => card.classList.remove('playing'));
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('.theme-icon');
    icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    toggle.onclick = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        icon.textContent = next === 'dark' ? '☀️' : '🌙';
    };
}

document.addEventListener('DOMContentLoaded', init);
