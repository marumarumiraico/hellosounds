(function () {
  var CONSENT_KEY = 'cookie_consent';
  var GA_ID = 'G-S90EWRKX20';
  var AD_PUB = 'ca-pub-6283135344795101';
  var consent = localStorage.getItem(CONSENT_KEY);

  if (consent === 'accepted') {
    loadTrackers();
    return;
  }

  if (consent !== 'rejected') {
    showBanner();
  }

  function loadTrackers() {
    // Google Analytics
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
    ga.onload = function () {
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_ID);
    };

    // Google AdSense
    var ad = document.createElement('script');
    ad.async = true;
    ad.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_PUB;
    ad.crossOrigin = 'anonymous';
    document.head.appendChild(ad);
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookieConsent';
    banner.innerHTML =
      '<div class="cc-text">' +
        '<strong>🍪 Cookie Notice</strong>' +
        '<span>We use cookies for analytics (Google Analytics) and advertising (Google AdSense) to improve your experience. ' +
        '<a href="/privacy.html" style="color:inherit;text-decoration:underline;">Privacy Policy</a></span>' +
      '</div>' +
      '<div class="cc-buttons">' +
        '<button class="cc-btn cc-reject" id="ccReject">Decline</button>' +
        '<button class="cc-btn cc-accept" id="ccAccept">Accept</button>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#cookieConsent{' +
        'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
        'background:var(--surface-white,#fff);color:var(--text-black,#2A2420);' +
        'border-top:3px solid var(--text-black,#2A2420);' +
        'padding:1.2rem 1.5rem;' +
        'display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;' +
        'font-family:"Fredoka",sans-serif;' +
        'box-shadow:0 -4px 20px rgba(0,0,0,0.1);' +
        'animation:ccSlideUp .4s cubic-bezier(.175,.885,.32,1.275);' +
      '}' +
      '@keyframes ccSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
      '.cc-text{display:flex;flex-direction:column;gap:0.3rem;max-width:600px;font-size:0.95rem;line-height:1.5}' +
      '.cc-text strong{font-size:1.1rem}' +
      '.cc-buttons{display:flex;gap:0.8rem;flex-shrink:0}' +
      '.cc-btn{' +
        'font-family:inherit;font-weight:700;font-size:1rem;' +
        'padding:0.7rem 1.5rem;border-radius:14px;cursor:pointer;' +
        'border:3px solid var(--text-black,#2A2420);' +
        'transition:all .2s cubic-bezier(.175,.885,.32,1.275);' +
      '}' +
      '.cc-accept{background:#B7FFB7;box-shadow:4px 4px 0 var(--text-black,#2A2420)}' +
      '.cc-accept:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--text-black,#2A2420)}' +
      '.cc-reject{background:var(--surface-white,#fff);box-shadow:4px 4px 0 var(--text-black,#2A2420)}' +
      '.cc-reject:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--text-black,#2A2420)}' +
      '@media(max-width:600px){' +
        '#cookieConsent{flex-direction:column;text-align:center;padding:1rem}' +
        '.cc-buttons{width:100%;justify-content:center}' +
      '}';

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('ccAccept').onclick = function () {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      loadTrackers();
    };

    document.getElementById('ccReject').onclick = function () {
      localStorage.setItem(CONSENT_KEY, 'rejected');
      banner.remove();
    };
  }
})();
