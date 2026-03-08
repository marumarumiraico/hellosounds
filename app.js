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
    en: {
        title: ["H", "ello ", "S", "ounds"],
        subtitle: "Hear how the world speaks! ✨",
        selectItem: "Select an item:",
        animals: "🐾 Animals", objects: "🚗 Objects", humans: "👤 Humans", nature: "🌿 Nature", music: "🎵 Music", city: "🏙️ City",
        quizChallenge: "Ready for a Challenge?",
        quizDesc: "Test your ear in Quiz Mode!",
        footerNote: "Sound experience may vary depending on your device and browser settings.",
        copied: "Link copied to clipboard! 🚀",
        info1Title: "🌍 Why do sounds vary across countries?",
        info1Text: "Onomatopoeia—the formation of a word from a sound associated with what is named—is a fascinating intersection of linguistics, psychology, and culture. While a dog barks with the same acoustic frequency in New York as it does in Seoul, humans perceive and transcribe that sound through the unique 'phonetic filter' of their native language. For instance, English speakers focus on the deep breathy 'Woof', while Korean speakers emphasize the repetitive rhythm 'Mung-mung'. This platform helps you explore these unique cultural lenses, revealing how different societies interpret the natural world through their own speech patterns.",
        info2Title: "🧠 Educational Benefits & AI Technology",
        info2Text: "Hello Sounds leverages cutting-edge Google Neural2 and Wavenet AI technology to provide the most authentic auditory experience possible. Unlike traditional speech synthesis, our Neural2 voices utilize deep learning to produce speech that mimics human intonation and rhythm with nearly 99% accuracy. By engaging with these global sounds, learners can improve their 'phonetic sensitivity'—the ability to distinguish between subtle sound variations in foreign languages. Whether you are a student of linguistics, a traveler, or a curious educator, our interactive library serves as a powerful tool for building cross-cultural empathy and auditory memory.",
        info3Title: "👶 Fun for Kids, Helpful for Parents",
        info3Text: "Hello Sounds is designed to be a safe, joyful playground for young explorers. Mimicking animal and nature sounds is a key milestone in early childhood speech development. By listening to how sounds vary across cultures, children develop 'global curiosity' from an early age. Use our platform as a fun, interactive tool for supervised screen time, or turn it into a game with our Quiz Mode!",
        dirHeading: "Explore All Sounds"
    },
    ko: {
        title: ["헬", "로 ", "사", "운즈"],
        subtitle: "전 세계의 다양한 소리를 들어보세요! ✨",
        selectItem: "항목을 선택하세요:",
        animals: "🐾 동물", objects: "🚗 사물", humans: "👤 사람", nature: "🌿 자연", music: "🎵 음악", city: "🏙️ 도시",
        quizChallenge: "퀴즈에 도전해볼까요?",
        quizDesc: "퀴즈 모드에서 당신의 실력을 테스트해보세요!",
        footerNote: "사운드 재생 환경은 기기 및 브라우저 설정에 따라 다를 수 있습니다.",
        copied: "링크가 클립보드에 복사되었습니다! 🚀",
        info1Title: "🌍 왜 나라마다 소리가 다를까요?",
        info1Text: "의성어는 사물의 소리를 흉내 낸 말로, 언어와 인지 심리학, 그리고 문화가 만나는 흥미로운 지점입니다. 강아지는 뉴욕에서도 서울에서도 똑같은 물리적 주파수로 짖지만, 인간은 자신이 모국어로 익힌 '음운론적 필터'를 통해 그 소리를 해석하고 기록합니다. 예를 들어 영어권 사용자는 강아지의 깊은 숨소리에 집중해 '우프(Woof)'라고 하는 반면, 한국어 사용자는 반복되는 리듬감에 집중해 '멍멍'이라고 표현합니다. 이 서비스는 각 사회가 자연의 소리를 자신의 언어로 어떻게 해석하는지 탐구할 수 있는 독특한 기회를 제공합니다.",
        info2Title: "🧠 교육적 효과와 AI 기술력",
        info2Text: "헬로 사운즈는 최신 Google Neural2 및 Wavenet AI 기술을 사용하여 가장 실제에 가까운 현지 발음을 제공합니다. 일반적인 음성 합성 기술과 달리, 당사가 사용하는 Neural2 기술은 딥러닝을 통해 인간 특유의 억양과 리듬을 정교하게 재현합니다. 이러한 글로벌 사운드를 반복해서 들음으로써 사용자는 외국어의 미세한 소리 차이를 구별하는 '음운 인지 능력'을 향상시킬 수 있습니다. 언어학 학생부터 교육자, 여행가에 이르기까지 헬로 사운즈의 인터랙티브 라이브러리는 타 문화에 대한 공감과 청각적 기억력을 높이는 강력한 도구로 활용될 수 있습니다.",
        info3Title: "👶 아이들에게는 재미를, 부모님께는 도움을",
        info3Text: "헬로 사운즈는 어린 탐험가들을 위한 안전하고 즐거운 놀이터입니다. 동물이나 자연의 소리를 흉내 내는 것은 영유아기 언어 발달의 중요한 이정표입니다. 전 세계의 다양한 소리 표현을 경험하며 아이들은 어려서부터 세상을 향한 '글로벌 호기심'을 키울 수 있습니다. 교육용 인터랙티브 도구로 활용하거나, 퀴즈 모드를 통해 즐거운 게임처럼 즐겨보세요!",
        dirHeading: "모든 소리 탐색하기"
    },
    ja: {
        title: ["ハ", "ロー ", "サ", "ウンズ"],
        subtitle: "世界中の音を聞いてみよう！ ✨",
        selectItem: "アイテムを選択してください:",
        animals: "🐾 動物", objects: "🚗 物体", humans: "👤 人間", nature: "🌿 自然", music: "🎵 音楽", city: "🏙️ 都市",
        quizChallenge: "クイズに挑戦しませんか？",
        quizDesc: "クイズモードで耳の力をテストしましょう！",
        footerNote: "音声体験はデバイスやブラウザの設定によって異なる場合があります。",
        copied: "リンクをコピーしました！ 🚀",
        info1Title: "🌍 なぜ国によって音が違うのですか？",
        info1Text: "擬音語（オノマトペ）は、音を言葉で表現したもので、言語学、心理学、そして文化が交差する興味深い分野です。犬は世界中どこでも同じ物理的な周波数で鳴きますが、人間は自分の母国語の固有の『音韻フィルター』を通してその音を解釈し、書き取ります。例えば、英語圏では深みのある息遣いに注目して『Woof』と表現しますが、日本語では繰り返しのリズムを重視して『ワンワン』と表現します。本プラットフォームは、これらの文化的な視点を探求し、異なる社会が独自の言語パターンを通じて自然界をどのように解釈しているかを明らかにします。",
        info2Title: "🧠 ハローサウン즈の教育的メリットとAI技術",
        info2Text: "最新의 Google Neural2 및 Wavenet AI 기술을 사용하고, 가능한 한 정확한 네이티브 액센트를 제공합니다. 종래의 음성 합성과는 달리, Neural2 보이스는 딥 러닝을 활용하여, 인간의 억양이나 리듬을 거의 99%의 정밀도로 재현합니다. 이러한 세계의 소りを 접함으로써, 학습자는 외국어의 미묘한 소리의 차이를 식별하는 『음운 인식 능력』을 높일 수 있습니다. 언어학 학생, 여행자, 혹은 지적 호기심 왕성한 교육자에게, 이 라이브러리는 이문화에의 이해와 청각적 기억을 깊게 하는 강력한 툴이 됩니다.",
        info3Title: "👶 子供たちには楽しさを、保護者には助けを",
        info3Text: "ハローサウンズは, 小さな探検家のための安全で楽しい遊び場です。動物や自然の音を真似ることは, 幼児期の言語発達における重要な節目です。世界中の多様な音の表現を体験することで, 子供たちは幼い頃から世界への『グローバルな好奇心』を育むことができます。教育的なインタラクティブツールとして活用したり, クイズモードで楽しいゲームとして遊んでみてください！",
        dirHeading: "すべての音を探索する"
    },
    es: {
        title: ["H", "ello ", "S", "ounds"],
        subtitle: "¡Escucha cómo habla el mundo! ✨",
        selectItem: "Selecciona un artículo:",
        animals: "🐾 Animales", objects: "🚗 Objetos", humans: "👤 Humanos", nature: "🌿 Naturaleza", music: "🎵 Música", city: "🏙️ Ciudad",
        quizChallenge: "¿Listo para un desafío?",
        quizDesc: "¡Pon a prueba tu oído en el modo Quiz!",
        footerNote: "La experiencia de sonido puede variar según el dispositivo.",
        copied: "¡Enlace copiado! 🚀",
        info1Title: "🌍 ¿Por qué varían los sonidos entre países?",
        info1Text: "La onomatopeya, la formación de una palabra a partir de un sonido asociado, es una intersección fascinante entre lingüística, psicología y cultura. Aunque un perro ladra con la misma frecuencia acústica en Nueva York que en Seúl, los humanos perciben y transcriben ese sonido a través del 'filtro fonético' único de su lengua materna. Por ejemplo, los angloparlantes se centran en el sonido profundo 'Woof', mientras que los coreanos enfatizan el ritmo repetitivo 'Mung-mung'. Esta plataforma te ayuda a explorar estos lentes culturales únicos, revelando cómo diferentes sociedades interpretan el mundo natural a través de sus propios patrones de habla.",
        info2Title: "🧠 Beneficios Educativos y Tecnología de IA",
        info2Text: "Hello Sounds utiliza la tecnología de IA más avanzada de Google Neural2 y Wavenet para proporcionar la experiencia auditiva más auténtica posible. A diferencia de la síntesis de voz tradicional, nuestras voces Neural2 utilizan el aprendizaje profundo para producir un habla que imita la entonación y el ritmo humanos con una precisión cercana al 99%. Al interactuar con estos sonidos globales, los estudiantes pueden mejorar su 'sensibilidad fonética', la capacidad de distinguir variaciones sutiles de sonido en idiomas extranjeros. Ya seas estudiante de lingüística, viajero o un educador curioso, nuestra biblioteca interactiva sirve como una poderosa herramienta para fomentar la empatía intercultural y la memoria auditiva.",
        info3Title: "👶 Diversión para niños, ayuda para padres",
        info3Text: "¡Hello Sounds está diseñado para ser un patio de recreo seguro y alegre para los jóvenes exploradores! Imitar los sonidos de los animales y la naturaleza es un hito clave en el desarrollo del habla infantil. Al escuchar cómo varían los sonidos en las distintas culturas, los niños desarrollan una 'curiosidad global' desde una edad temprana. ¡Utiliza nuestra plataforma como una divertida herramienta educativa o conviértela en un juego con nuestro Modo Quiz!",
        dirHeading: "Explorar todos los sonidos"
    }
};

function init() {
    setupTheme();
    setupNavigation();
    setupHomeLogic();
    handleRouting();

    langCurrentBtn.onclick = (e) => {
        e.stopPropagation();
        langOptions.classList.toggle('show');
    };

    langOpts.forEach(opt => {
        opt.onclick = () => {
            const val = opt.dataset.value;
            const currentItem = resultsSection.style.display === 'block' ? mainName.textContent.toLowerCase() : null;
            
            localStorage.setItem('lang', val);
            updateLangUI(val);
            applyLanguage(val);
            langOptions.classList.remove('show');
            renderSelectionGrid();
            
            // SEO: Update URL when language changes
            updateUrl(val, currentCategory, findItemIDByName(currentItem));
        };
    });

    window.onclick = () => langOptions.classList.remove('show');
}

function findItemIDByName(name) {
    if (!name) return null;
    const catData = window.soundDatabase[currentCategory];
    if (!catData) return null;
    const found = Object.values(catData.data).find(item => item.name.toLowerCase() === name.toLowerCase());
    return found ? found.id : null;
}

function handleRouting() {
    const path = window.location.pathname.split('/').filter(p => p !== "");
    const urlParams = new URLSearchParams(window.location.search);
    
    let lang = localStorage.getItem('lang') || 'en';
    let cat = 'animals';
    let itemID = null;

    if (path.length > 0 && ['en', 'ko', 'ja', 'es'].includes(path[0])) {
        lang = path[0];
        if (path[1]) cat = path[1];
        if (path[2]) itemID = path[2];
    } else {
        if (urlParams.has('cat')) cat = urlParams.get('cat');
        if (urlParams.has('item')) itemID = urlParams.get('item');
    }

    localStorage.setItem('lang', lang);
    updateLangUI(lang);
    applyLanguage(lang);

    if (window.soundDatabase[cat]) {
        currentCategory = cat;
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
        renderSelectionGrid();
        
        const item = window.soundDatabase[cat].data[itemID];
        if (itemID && item) {
            selectItem(item, null, false);
        } else if (itemID) {
            showToast("Sound not found. Redirecting...");
            setTimeout(() => goHome(), 1500);
        }
    } else {
        renderSelectionGrid();
    }
}

function updateUrl(lang, cat, itemID) {
    const newPath = `/${lang}/${cat}${itemID ? '/' + itemID : ''}`;
    window.history.pushState({ path: newPath }, '', newPath);
    updatePageMetadata(lang, cat, itemID);
}

function updatePageMetadata(lang, cat, itemID) {
    const t = i18n[lang] || i18n.en;
    const item = itemID ? window.soundDatabase[cat]?.data[itemID] : null;
    const canonicalUrl = `https://hello-sounds.com${window.location.pathname}`;
    
    if (item) {
        document.title = `${item.icon} ${item.name} Sound in ${lang.toUpperCase()} | Hello Sounds`;
        const desc = `Hear how ${item.name} sounds around the world. Native onomatopoeia for ${item.name} in ${lang.toUpperCase()} and 15+ countries with AI pronunciation.`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    } else {
        document.title = t.title.join("") + " - Global Onomatopoeia Library";
        const defaultDesc = "Explore how the world speaks! Discover 45+ sounds in 15+ languages including English, Korean, and Japanese with AI native pronunciations.";
        document.querySelector('meta[name="description"]')?.setAttribute('content', defaultDesc);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', defaultDesc);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    }
    
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', canonicalUrl);
}

function goHome() {
    stopAllSounds();
    currentCategory = 'animals';
    resultsSection.style.display = 'none';
    selectorSection.style.display = 'block';
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === 'animals'));
    renderSelectionGrid();
    
    const lang = localStorage.getItem('lang') || 'en';
    updateUrl(lang, 'animals', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupHomeLogic() {
    const homeBtn = document.getElementById('homeBtn');
    const mainHeader = document.getElementById('mainHeader');

    if (homeBtn) homeBtn.onclick = goHome;
    if (mainHeader) {
        mainHeader.style.cursor = 'pointer';
        mainHeader.onclick = goHome;
    }
}

function setupLanguage() {
    // Redundant now, logic moved to handleRouting and init
}

function updateLangUI(lang) {
    if (currentFlagImg) currentFlagImg.src = `https://flagcdn.com/w40/${flagMap[lang]}.png`;
    document.documentElement.lang = lang; 
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
    const info3 = document.getElementById('infoCard3');
    if(info3) { info3.querySelector('h3').textContent = t.info3Title; info3.querySelector('p').textContent = t.info3Text; }

    const dirHeading = document.getElementById('directoryHeading');
    if(dirHeading) dirHeading.textContent = t.dirHeading;
    if(document.getElementById('dirCat1')) document.getElementById('dirCat1').textContent = t.animals;
    if(document.getElementById('dirCat2')) document.getElementById('dirCat2').textContent = t.objects;
    if(document.getElementById('dirCat3')) document.getElementById('dirCat3').textContent = t.humans;
    if(document.getElementById('dirCat4')) document.getElementById('dirCat4').textContent = t.nature;
    if(document.getElementById('dirCat5')) document.getElementById('dirCat5').textContent = t.music;
    if(document.getElementById('dirCat6')) document.getElementById('dirCat6').textContent = t.city;

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
    if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
    toggle.onclick = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
    };
}

function stopAllSounds() {
    activeRequestID++;
    try { audioPlayer.pause(); audioPlayer.src = ""; } catch(e) {}
    document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
}

function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            stopAllSounds();
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            
            // Update Header Icon
            if (headerIcon && window.soundDatabase[currentCategory]) {
                headerIcon.textContent = window.soundDatabase[currentCategory].icon;
            }

            selectorSection.style.display = 'block';
            resultsSection.style.display = 'none';
            renderSelectionGrid();

            // Scroll to the very top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // SEO: Update URL to sub-directory style
            const lang = localStorage.getItem('lang') || 'en';
            updateUrl(lang, currentCategory, null);
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
        btn.setAttribute('aria-label', `Select ${item.name}`);
        btn.innerHTML = `<span class="emoji" aria-hidden="true">${item.icon}</span><span class="name">${item.name}</span>`;
        btn.onclick = () => { stopAllSounds(); selectItem(item, btn); };
        animalGrid.appendChild(btn);
    });
}

function selectItem(item, clickedBtn, pushState = true) {
    resultsSection.style.display = 'block';
    document.querySelectorAll('.animal-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
    mainIcon.textContent = item.icon;
    mainName.textContent = item.name;
    renderSoundCards(item, item.sounds, item.params);
    
    if (pushState) {
        const lang = localStorage.getItem('lang') || 'en';
        updateUrl(lang, currentCategory, item.id);
    }
    
    if (window.innerWidth < 600) resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function renderSoundCards(parentItem, sounds, params) {
    soundsGrid.innerHTML = '';
    sounds.forEach((soundItem) => {
        const isFav = favorites.some(f => f.id === parentItem.id && f.country === soundItem.country);
        const card = document.createElement('article');
        card.className = 'sound-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${parentItem.name} sound in ${soundItem.country}`);
        const flagCodes = { 'USA': 'us', 'Korea': 'kr', 'Japan': 'jp', 'Spain': 'es', 'Germany': 'de', 'Russia': 'ru', 'Thailand': 'th', 'Egypt': 'eg', 'Brazil': 'br', 'China': 'cn', 'India': 'in', 'Kenya': 'ke', 'Vietnam': 'vn', 'Turkey': 'tr', 'Indonesia': 'id' };
        card.innerHTML = `
            <div class="card-header">
                <img src="https://flagcdn.com/w40/${flagCodes[soundItem.country] || 'un'}.png" width="24" class="country-flag-img" alt="${soundItem.country} flag" loading="lazy">
                <span class="country">${soundItem.country}</span>
                <div class="card-actions">
                    <button class="fav-btn ${isFav ? 'active' : ''}" aria-label="Add ${parentItem.name} ${soundItem.country} to favorites">❤️</button>
                    <button class="share-btn" aria-label="Share ${parentItem.name} ${soundItem.country} sound">🔗</button>
                </div>
            </div>
            <div class="card-body">
                <div class="sound-word" aria-label="Sound written as: ${soundItem.sound}">"${soundItem.sound}"</div>
                <div class="pronunciation" aria-label="Pronunciation: ${soundItem.pron}">[ ${soundItem.pron} ]</div>
            </div>`;
        
        const playHandler = (e) => {
            if (e.target.closest('.share-btn') || e.target.closest('.fav-btn')) return;
            playSound(soundItem, params, card);
        };
        
        card.onclick = playHandler;
        card.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playHandler(e); } };
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
    if (navigator.share) {
        try { await navigator.share({ title: 'Hello Sounds', text: shareText, url: shareUrl }); }
        catch(e) {}
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            const lang = localStorage.getItem('lang') || 'en';
            showToast(i18n[lang]?.copied || i18n.en.copied);
        });
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function playSound(soundItem, params, card) {
    stopAllSounds(); // Clear previous animations and sounds
    activeRequestID++;
    const reqID = activeRequestID;
    card.classList.add('playing');
    
    fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: soundItem.ttsText || soundItem.native, country: soundItem.country }) })
    .then(res => {
        if (!res.ok) throw new Error("TTS API error");
        return res.json();
    })
    .then(data => {
        if (reqID !== activeRequestID) {
            card.classList.remove('playing');
            return;
        }
        if (data && data.audioContent) {
            audioPlayer.src = `data:audio/mp3;base64,${data.audioContent}`;
            audioPlayer.play().catch(() => {
                fallbackSpeak(soundItem, params, card);
            });
            audioPlayer.onended = () => card.classList.remove('playing');
        } else {
            throw new Error("No audio content");
        }
    }).catch((err) => {
        console.warn("TTS Fetch failed, using browser fallback:", err);
        if (reqID === activeRequestID) {
            fallbackSpeak(soundItem, params, card);
        } else {
            card.classList.remove('playing');
        }
    });
}

function fallbackSpeak(soundItem, params, card) {
    if (!window.speechSynthesis) {
        if (card) card.classList.remove('playing');
        return;
    }
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance();
    const langMap = { 'USA': 'en-US', 'Korea': 'ko-KR', 'Japan': 'ja-JP', 'Spain': 'es-ES', 'Germany': 'de-DE', 'Russia': 'ru-RU', 'Brazil': 'pt-BR', 'China': 'zh-CN', 'India': 'hi-IN', 'Thailand': 'th-TH', 'Egypt': 'ar-EG', 'Kenya': 'sw-KE', 'Vietnam': 'vi-VN', 'Turkey': 'tr-TR', 'Indonesia': 'id-ID' };
    msg.lang = langMap[soundItem.country] || 'en-US';
    msg.text = soundItem.fallback || soundItem.sound;
    msg.pitch = params.pitch || 1;
    msg.rate = params.rate || 1;

    if (card) {
        msg.onstart = () => card.classList.add('playing');
        msg.onend = () => card.classList.remove('playing');
        msg.onerror = () => card.classList.remove('playing');
    }

    window.speechSynthesis.speak(msg);
}

document.addEventListener('DOMContentLoaded', init);
