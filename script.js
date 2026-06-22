/* ============================================================
   GABUNGAN: BOMB COUNTDOWN TIMER -> BIRTHDAY REVEAL
   ============================================================ */

// Target date: 23 Juni 2026, 00:00:00
const TARGET_DATE = new Date('2026-06-22T17:34:00').getTime();

/* ============================================================
   AUDIO CONTROLLER (Menggunakan MP3 dari folder asset)
   ============================================================ */

// 1. Audio Timer (Diputar berulang selama countdown)
const TimerAudio = new Audio("asset/Countdown Sound Effect.mp3");
TimerAudio.loop = true;
TimerAudio.volume = 0.8;

// 2. Audio Ledakan (Diputar sekali saat waktu habis)
const ExplosionAudio = new Audio("asset/Efek Bom Meledak -Meme.mp3");
ExplosionAudio.volume = 1.0;

// 3. Audio Ulang Tahun (Diputar berulang di halaman foto)
// Catatan: Pastikan spasi nama file ini sama persis dengan yang di komputermu
const BirthdayAudio = new Audio("asset/HAPPY BIRTHDAY  Sad Piano Version.mp3");
BirthdayAudio.loop = true;
BirthdayAudio.volume = 0.7;

/* ============================================================
   AUDIO MANAGER
   ============================================================ */
const BombAudio = (() => {
    let unlocked = false;

    function unlock() {
        if (unlocked) return;
        unlocked = true;
        // Pancing browser agar mengizinkan audio
        TimerAudio.play().catch(() => {});
        TimerAudio.pause();
    }

    function tryAutoStart() {
        const timerSection = document.getElementById('timer-section');
        if (timerSection && timerSection.classList.contains('is-active') && !hasExploded) {
            TimerAudio.play().then(() => {
                unlocked = true;
                hideSoundFallbackButton();
            }).catch(() => {
                showSoundFallbackButton();
            });
        }
    }

    function startSizzle() {
        if (hasExploded) return;
        TimerAudio.play().catch(() => {});
    }

    function stopSizzle() {
        TimerAudio.pause();
    }

    function playExplosion() {
        TimerAudio.pause();
        TimerAudio.currentTime = 0; // Reset timer sound
        ExplosionAudio.play().catch(() => {});
    }

    function showSoundFallbackButton() {
        const btn = document.getElementById('sound-fallback-btn');
        if (btn) btn.classList.add('show');
    }

    function hideSoundFallbackButton() {
        const btn = document.getElementById('sound-fallback-btn');
        if (btn) btn.classList.remove('show');
    }

    return {
        tryAutoStart,
        unlock,
        startSizzle,
        stopSizzle,
        playExplosion,
        showSoundFallbackButton,
        hideSoundFallbackButton,
        get isUnlocked() { return unlocked; }
    };
})();

// Interaksi manual jika browser blokir autoplay
window.__activateBombAudio = function () {
    BombAudio.unlock();
    const timerSection = document.getElementById('timer-section');
    if (timerSection && timerSection.classList.contains('is-active')) {
        BombAudio.startSizzle();
    }
    BombAudio.hideSoundFallbackButton();
};

window.addEventListener('load', () => {
    BombAudio.tryAutoStart();
    const unlockOnFirstInteraction = () => {
        if (!BombAudio.isUnlocked) {
            BombAudio.unlock();
            const timerSection = document.getElementById('timer-section');
            if (timerSection && timerSection.classList.contains('is-active')) {
                BombAudio.startSizzle();
            }
            BombAudio.hideSoundFallbackButton();
        }
        document.removeEventListener('touchstart', unlockOnFirstInteraction);
        document.removeEventListener('click', unlockOnFirstInteraction);
        document.removeEventListener('keydown', unlockOnFirstInteraction);
    };
    document.addEventListener('touchstart', unlockOnFirstInteraction, { once: true });
    document.addEventListener('click', unlockOnFirstInteraction, { once: true });
    document.addEventListener('keydown', unlockOnFirstInteraction, { once: true });

    setTimeout(() => {
        if (!BombAudio.isUnlocked && !hasExploded) {
            BombAudio.showSoundFallbackButton();
        }
    }, 1000);
});

/* ============================================================
   BAGIAN 1: COUNTDOWN TIMER
   ============================================================ */

const bombTimeText = document.getElementById('bomb-time-text');
const bombVisual = document.getElementById('bomb-visual');
const timerSection = document.getElementById('timer-section');
const birthdaySection = document.getElementById('birthday-section');

let prevTimeString = '';
let hasExploded = false;
let countdownIntervalId = null;

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatNumber(num) {
    return padZero(Math.max(0, num));
}

function updateCountdown() {
    if (hasExploded) return;

    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    if (distance < 0) {
        handleExplosion();
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const timeString = `${formatNumber(days)} ${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;

    if (timeString !== prevTimeString && bombTimeText) {
        bombTimeText.textContent = timeString;
        prevTimeString = timeString;
    }

    // Efek visual kedip merah saat detik-detik terakhir (jika dibutuhkan)
    if (bombVisual) {
        if (days === 0 && hours === 0 && minutes === 0) {
            bombVisual.classList.add('danger-zone');
        } else {
            bombVisual.classList.remove('danger-zone');
        }
    }
}

/* ============================================================
   LEDAKAN -> TRANSISI KE BIRTHDAY SECTION
   ============================================================ */

function handleExplosion() {
    if (hasExploded) return;
    hasExploded = true;

    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }

    if (bombTimeText) {
        bombTimeText.textContent = '00 00:00:00';
    }

    if (bombVisual) {
        bombVisual.classList.add('exploding');
    }

    // Mainkan suara ledakan MP3
    BombAudio.playExplosion();

    setTimeout(() => {
        switchToBirthdayScreen();
    }, 2200);
}

function switchToBirthdayScreen() {
    timerSection.classList.remove('is-active');
    birthdaySection.classList.add('is-active');

    const themeColorMeta = document.getElementById('theme-color-meta');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#000000');

    setTimeout(() => {
        startBirthdayFlow();
        // Mulai mainkan lagu Ulang Tahun MP3
        BirthdayAudio.play().catch(() => {
            console.log("Menunggu interaksi untuk lagu ulang tahun...");
            const playBday = () => {
                BirthdayAudio.play();
                document.removeEventListener('click', playBday);
            }
            document.addEventListener('click', playBday);
        });
    }, 600);
}

function initCountdown() {
    updateCountdown();
    countdownIntervalId = setInterval(updateCountdown, 100);
}

document.addEventListener('visibilitychange', () => {
    if (hasExploded) {
        if (document.hidden) {
            BirthdayAudio.pause();
        } else {
            if (birthdaySection && birthdaySection.classList.contains('is-active')) {
                BirthdayAudio.play().catch(()=>{});
            }
        }
        return;
    }
    
    if (document.hidden) {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        BombAudio.stopSizzle();
    } else {
        updateCountdown();
        if (!countdownIntervalId && !hasExploded) {
            countdownIntervalId = setInterval(updateCountdown, 100);
        }
        if (timerSection && timerSection.classList.contains('is-active')) {
            BombAudio.startSizzle();
        }
    }
});

initCountdown();

/* ============================================================
   BAGIAN 2: BIRTHDAY FLOW
   ============================================================ */

const dataFoto = [
    { src: "asset/2.jpeg", caption: "Happy Birthday Sayang 💕" },
    { src: "asset/3.jpeg", caption: "Setiap tawa bersamamu adalah momen berharga." },
    { src: "asset/WhatsApp Image 2026-06-22 at 14.54.33.jpeg", caption: "As long as you're smiling..." },
    { src: "asset/WhatsApp Image 2026-06-22 at 14.54.34.jpeg", caption: "I'm happy. Stay happy, my love. 💖" }
];

const textSequence = ["3", "2", "1", "HAPPY", "BIRTHDAY", "TO", "ANITA", "💖"];

const DeviceDetector = {
    isTouch: () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)),
    getScaleFactor: () => {
        const width = window.innerWidth;
        if (width < 480) return 0.85;
        if (width < 768) return 0.95;
        if (width < 1024) return 1;
        return 1.05;
    }
};

function updateScaleVariables() {
    document.documentElement.style.setProperty('--scale-factor', DeviceDetector.getScaleFactor());
}

const introText = document.getElementById('intro-text');
const envelopeCont = document.getElementById('envelope-container');
const galleryCont = document.getElementById('gallery-container');
const galImg = document.getElementById('gallery-image');
const galCap = document.getElementById('gallery-caption');
const modalCont = document.getElementById('modal-container');
const modalImg = document.getElementById('modal-image');
const matrixCanvas = document.getElementById('matrixCanvas');
const starsCanvas = document.getElementById('starsCanvas');

let currentPhotoIndex = 0;
let isHeartFormed = false;
let birthdayFlowStarted = false;

function fadeOut(element, callback) {
    element.style.opacity = "0";
    element.style.transform = "scale(0.9)";
    setTimeout(() => {
        element.style.display = "none";
        if (callback) callback();
    }, 600);
}

function fadeIn(element, displayType = "flex") {
    element.style.display = displayType;
    setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "scale(1)";
    }, 50);
}

function resizeCanvases() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
}

// --- MATRIX RAIN EFFECT ---
const ctx = matrixCanvas.getContext("2d");
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*".split("");
let fontSize = 16;
let drops = [];

function initMatrixDrops() {
    fontSize = Math.max(12, Math.min(16, window.innerWidth / 50));
    const columns = Math.ceil(matrixCanvas.width / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * 10;
    }
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.fillStyle = "#ff66b2";
    ctx.font = fontSize + "px Arial, sans-serif";

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

let matrixInterval = null;

function startMatrix() {
    if (matrixInterval) clearInterval(matrixInterval);
    resizeCanvases();
    initMatrixDrops();
    matrixInterval = setInterval(drawMatrix, 33);
}

// --- STARS BACKGROUND EFFECT ---
const ctxStars = starsCanvas.getContext('2d');
const stars = [];

function initStars() {
    stars.length = 0;
    const starCount = Math.min(150, Math.ceil(window.innerWidth / 20));
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random() * 0.5 + 0.3,
            twinkleSpeed: Math.random() * 0.05 + 0.02
        });
    }
}

let animationFrameId = null;

function drawStars() {
    ctxStars.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        ctxStars.beginPath();
        ctxStars.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctxStars.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctxStars.fill();

        s.alpha += (Math.random() - 0.5) * s.twinkleSpeed;
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));
    }

    animationFrameId = requestAnimationFrame(drawStars);
}

function stopStars() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

let seqIndex = 0;

function runSequence() {
    if (seqIndex < textSequence.length) {
        introText.style.opacity = "0";
        introText.style.transform = "scale(1.2)";

        setTimeout(() => {
            introText.innerText = textSequence[seqIndex];
            introText.style.transform = "scale(1)";
            introText.style.opacity = "1";
            seqIndex++;
            setTimeout(runSequence, 1000);
        }, 400);
    } else {
        transitionToEnvelope();
    }
}

function transitionToEnvelope() {
    fadeOut(introText, () => {
        matrixCanvas.style.opacity = "0";
        setTimeout(() => {
            if (matrixInterval) clearInterval(matrixInterval);
            matrixCanvas.style.display = "none";
        }, 1000);

        starsCanvas.style.display = "block";
        setTimeout(() => { starsCanvas.style.opacity = "1"; }, 50);

        resizeCanvases();
        initStars();
        drawStars();

        fadeIn(envelopeCont, "flex");
    });
}

function startBirthdayFlow() {
    if (birthdayFlowStarted) return;
    birthdayFlowStarted = true;

    startMatrix();
    runSequence();
}

/* ============================================================
   INTERAKSI KLIK & GALERI
   ============================================================ */

function fixGalleryLayout() {
    galleryCont.style.background = "transparent";
    galleryCont.style.backgroundColor = "transparent";
    galleryCont.style.border = "none";
    galleryCont.style.boxShadow = "none";
    galleryCont.style.padding = "0";

    galleryCont.style.display = "flex";
    galleryCont.style.flexDirection = "column"; 
    galleryCont.style.alignItems = "center";
    galleryCont.style.justifyContent = "center";
    galleryCont.style.gap = "20px"; 

    galImg.style.maxWidth = "90vw";
    galImg.style.maxHeight = "65vh"; 
    galImg.style.objectFit = "contain"; 
    galImg.style.border = "none";
    galImg.style.padding = "0";
    galImg.style.background = "transparent";
    galImg.style.boxShadow = "none";
    galImg.style.borderRadius = "12px"; 

    galCap.style.position = "static"; 
    galCap.style.transform = "none"; 
    galCap.style.margin = "0";
    galCap.style.padding = "0 15px";
    galCap.style.textAlign = "center";
    galCap.style.color = "#ffffff"; 
    galCap.style.background = "none";
    galCap.style.textShadow = "1px 1px 4px rgba(0, 0, 0, 0.8)"; 
}

function openEnvelope() {
    fadeOut(envelopeCont, () => {
        fixGalleryLayout();
        showPhoto(0);
        fadeIn(galleryCont, "flex");
    });
}

window.openEnvelope = openEnvelope;
window.nextPhoto = nextPhoto;

function showPhoto(index) {
    galImg.src = dataFoto[index].src;
    galCap.innerText = dataFoto[index].caption;
}

function nextPhoto() {
    if (isHeartFormed) return;

    galleryCont.style.transform = "scale(0.95)";
    setTimeout(() => {
        galleryCont.style.transform = "scale(1)";
    }, 200);

    currentPhotoIndex++;

    if (currentPhotoIndex < dataFoto.length) {
        galImg.style.opacity = "0";
        setTimeout(() => {
            showPhoto(currentPhotoIndex);
            galImg.style.opacity = "1";
        }, 200);
    } else {
        formHeartShape();
    }
}

/* ============================================================
   MODAL FUNCTIONALITY
   ============================================================ */

function openModal(imgSrc) {
    if (modalCont.parentNode !== document.body) {
        document.body.appendChild(modalCont);
    }
    modalImg.src = imgSrc;
    modalCont.classList.add('active');
    setTimeout(() => { modalCont.style.opacity = "1"; }, 10);
}

function closeModal() {
    modalCont.style.opacity = "0";
    setTimeout(() => { modalCont.classList.remove('active'); }, 400);
}

window.closeModal = closeModal;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCont.classList.contains('active')) {
        closeModal();
    }
});

/* ============================================================
   HEART FORMATION
   ============================================================ */

function formHeartShape() {
    isHeartFormed = true;

    fadeOut(galleryCont, () => {
        const totalPieces = Math.min(40, Math.max(20, Math.ceil(window.innerWidth / 25)));
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const heartScale = Math.min(window.innerWidth, window.innerHeight) / 45;

        for (let i = 0; i < totalPieces; i++) {
            let img = document.createElement('img');
            img.src = dataFoto[i % dataFoto.length].src;
            img.className = 'heart-piece';
            img.loading = 'lazy';
            img.decoding = 'async';

            img.addEventListener('click', function(e) {
                e.stopPropagation();
                openModal(this.src);
            });

            img.style.left = centerX + 'px';
            img.style.top = centerY + 'px';
            document.body.appendChild(img);

            let t = (i * (Math.PI * 2)) / totalPieces;
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            setTimeout(() => {
                img.style.opacity = "1";
                img.style.left = (centerX + (x * heartScale)) + 'px';
                img.style.top = (centerY + (y * heartScale)) + 'px';
            }, 80 * i);
        }
    });
}

/* ============================================================
   RESPONSIVE HANDLERS
   ============================================================ */

function handleResize() {
    resizeCanvases();
    updateScaleVariables();

    if (matrixInterval) initMatrixDrops();
    if (!starsCanvas.hidden) resizeCanvases();
    if (isHeartFormed) recalculateHeartPositions();
}

function handleOrientationChange() {
    setTimeout(handleResize, 300);
}

function recalculateHeartPositions() {
    const pieces = document.querySelectorAll('.heart-piece');
    if (pieces.length === 0) return;

    const totalPieces = pieces.length;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const heartScale = Math.min(window.innerWidth, window.innerHeight) / 45;

    pieces.forEach((img, i) => {
        let t = (i * (Math.PI * 2)) / totalPieces;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        img.style.left = (centerX + (x * heartScale)) + 'px';
        img.style.top = (centerY + (y * heartScale)) + 'px';
    });
}

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
});

window.addEventListener('orientationchange', handleOrientationChange);
updateScaleVariables();

/* ============================================================
   PERFORMANCE: PRELOAD IMAGES & AUDIO
   ============================================================ */

function preloadAssets() {
    dataFoto.forEach(p => {
        const img = new Image();
        img.src = p.src;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAssets);
} else {
    preloadAssets();
}