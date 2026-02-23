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

let currentCategory = 'animals';
let availableVoices = [];
let audioPlayer = new Audio();
let activeRequestID = 0;

function init() {
    setupNavigation();
    loadVoices();
    setupTheme();
    
    // URL 파라미터 확인 (공유 링크 대응)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const itemParam = urlParams.get('item');

    if (catParam && window.soundDatabase[catParam]) {
        currentCategory = catParam;
        // 메뉴 활성화 상태 변경
        navButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.cat === catParam);
        });
        const catInfo = window.soundDatabase[currentCategory];
        headerIcon.textContent = catInfo.icon;
        headerSubtitle.textContent = catInfo.subtitle;
        
        renderSelectionGrid();

        if (itemParam && window.soundDatabase[catParam].data[itemParam]) {
            const itemData = window.soundDatabase[catParam].data[itemParam];
            setTimeout(() => {
                const dummyBtn = document.createElement('button');
                selectItem(itemData, dummyBtn);
            }, 100);
        }
    } else {
        renderSelectionGrid();
    }

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
            
            // 주소창 업데이트 (공유용)
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
    clickedBtn.classList.add('active');
    mainIcon.textContent = item.icon;
    mainName.textContent = item.name;
    renderSoundCards(item, item.sounds, item.params);
    
    // 주소창 업데이트
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
        
        // 카드 클릭 시 재생 (공유 버튼 제외)
        card.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) return;
            playSound(soundItem, params, card);
        });

        // 공유 버튼 클릭
        card.querySelector('.share-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            shareSound(parentItem, soundItem);
        });

        soundsGrid.appendChild(card);
    });
    setTimeout(() => { document.querySelectorAll('.sound-word').forEach(el => fitText(el)); }, 100);
}

async function shareSound(item, sound) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?cat=${currentCategory}&item=${item.id}`;
    const shareText = `Check out how ${item.name} sounds in ${sound.country}! "${sound.sound}" 🌍✨`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Hello Sounds',
                text: shareText,
                url: shareUrl,
            });
        } catch (err) {
            console.log('Share failed:', err);
        }
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Link copied to clipboard! 🚀");
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
            audioPlayer.onended = () => {
                if (cardElement) cardElement.classList.remove('playing');
            };
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        if (requestID === activeRequestID) fallbackSpeak(soundItem, params, cardElement);
    });
}

function fallbackSpeak(soundItem, params, cardElement) {
    if (!window.speechSynthesis) {
        if (cardElement) cardElement.classList.remove('playing');
        return;
    }
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
