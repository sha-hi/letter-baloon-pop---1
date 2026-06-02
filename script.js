const gameScreen = document.getElementById('game-screen');
const scoreEl = document.getElementById('score');
const wrongEl = document.getElementById('wrong-count');
const timerEl = document.getElementById('timer');
const targetLabel = document.getElementById('target-label');
const nameOverlay = document.getElementById('name-overlay');
const letterOverlay = document.getElementById('letter-overlay');
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');

const teacherBtn = document.getElementById('teacher-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const probSlider = document.getElementById('prob-slider');
const probVal = document.getElementById('prob-val');
const letterProbSlider = document.getElementById('letter-prob-slider');
const letterProbVal = document.getElementById('letter-prob-val');
const quickQBtn = document.getElementById('quick-q-btn');

const questionOverlay = document.getElementById('question-overlay');
const questionLetter = document.getElementById('question-letter');
const replayQBtn = document.getElementById('replay-q-btn');
const continueGameBtn = document.getElementById('continue-game-btn');

const finalScoreEl = document.getElementById('final-score');
const finalWrongEl = document.getElementById('final-wrong');
const finalTimeEl = document.getElementById('final-time');
const finalNameTitle = document.getElementById('final-name-title');
const timeTo100El = document.getElementById('time-to-100');
const timeTo200El = document.getElementById('time-to-200');
const milestone100Box = document.getElementById('milestone-100');
const milestone200Box = document.getElementById('milestone-200');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const replayBtn = document.getElementById('replay-sound');
const endBtn = document.getElementById('end-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const displayName = document.getElementById('display-name');
const welcomeMsg = document.getElementById('welcome-msg');

const correctSound = new Audio('voice/correct.mp3');
const wrongSound = new Audio('voice/failed.mp3');
const askingQuestionSound = new Audio('voice/asking question.m4a');

let score = 0;
let wrongHits = 0;
let gameActive = false;
let currentTarget = null;
let spawnInterval = null;
let targetSoundInterval = null;
let gameTimerInterval = null;
let popsTowardTarget = 0;
let playerName = "Player";
let secondsElapsed = 0;
let timeAt100 = null;
let timeAt200 = null;
let targetPool = [];
let popupProbability = 0.10;
let targetLetterProbability = 0.50;
let isPausedForQuestion = false;
let randomQuestionTimer = null;
let lastPopTime = 0;

const letterSets = {
    'alif': [
        { char: 'ا', sound: "voice/saying 'alif'.m4a", display: 'Alif', speak: 'أَلِف' },
        { char: 'َ', sound: "voice/saying 'fathah'.m4a", display: 'Fathah', speak: 'فَتْحَة' },
        { char: 'ِ', sound: "voice/saying ' kasar'.m4a", display: 'Kasrah', speak: 'كَسْرَة' },
        { char: 'ُ', sound: "voice/saying 'Ḍammah'.m4a", display: 'Dammah', speak: 'ضَمَّة' },
        { char: 'اَ', sound: 'voice/sound of alif with fathah.m4a', display: 'Alif Fathah', speak: 'أَ' },
        { char: 'اِ', sound: 'voice/sound of alif with kasar.m4a', display: 'Alif Kasrah', speak: 'إِ' },
        { char: 'اُ', sound: 'voice/sound of alif with Ḍammah.m4a', display: 'Alif Dammah', speak: 'أُ' },
        { char: 'اْ', sound: 'voice/sound of alif with sukoon.m4a', display: 'Alif Sukoon', speak: 'أْ' },
        { char: 'اٌ', sound: 'voice/sound of alif with thanween dammah.m4a', display: 'Alif Tanween Dammah', speak: 'أٌ' }
    ],
    'ba': [
        { char: 'ب', sound: "voice/saying baa'a.m4a", display: 'Ba', speak: 'بَاء' },
        { char: 'َ', sound: "voice/saying 'fathah'.m4a", display: 'Fathah', speak: 'فَتْحَة' },
        { char: 'ِ', sound: "voice/saying ' kasar'.m4a", display: 'Kasrah', speak: 'كَسْرَة' },
        { char: 'ُ', sound: "voice/saying 'Ḍammah'.m4a", display: 'Dammah', speak: 'ضَمَّة' },
        { char: 'بَ', sound: 'voice/sound of baa with fathah.m4a', display: 'Ba Fathah', speak: 'بَ' },
        { char: 'بِ', sound: 'voice/sound of baa with kasar.m4a', display: 'Ba Kasrah', speak: 'بِ' },
        { char: 'بُ', sound: 'voice/sound of baa with dammah.m4a', display: 'Ba Dammah', speak: 'بُ' },
        { char: 'بْ', sound: 'voice/sound of baa with sukoon.m4a', display: 'Ba Sukoon', speak: 'بْ' },
        { char: 'بٌ', sound: 'voice/sound of baa with thanween dammah.m4a', display: 'Ba Tanween Dammah', speak: 'بٌ' }
    ],
    'taa': [
        { char: 'ت', sound: "voice/saying thaa'a.m4a", display: 'Tha', speak: 'تَاء' },
        { char: 'َ', sound: "voice/saying 'fathah'.m4a", display: 'Fathah', speak: 'فَتْحَة' },
        { char: 'ِ', sound: "voice/saying ' kasar'.m4a", display: 'Kasrah', speak: 'كَسْرَة' },
        { char: 'ُ', sound: "voice/saying 'Ḍammah'.m4a", display: 'Dammah', speak: 'ضَمَّة' },
        { char: 'تَ', sound: 'voice/sound of tha with fatah.m4a', display: 'Tha Fathah', speak: 'تَ' },
        { char: 'تِ', sound: 'voice/sound of tha with kasar.m4a', display: 'Tha Kasrah', speak: 'تِ' },
        { char: 'تُ', sound: 'voice/sound of tha with dammah.m4a', display: 'Tha Dammah', speak: 'تُ' },
        { char: 'تٌ', sound: 'voice/sound of tha with thaween dammah.m4a', display: 'Tha Tanween Dammah', speak: 'تٌ' }
    ],
    'daal': [
        { char: 'د', sound: "", display: 'Daal', speak: 'دَال' },
        { char: 'َ', sound: "voice/saying 'fathah'.m4a", display: 'Fathah', speak: 'فَتْحَة' },
        { char: 'ِ', sound: "voice/saying ' kasar'.m4a", display: 'Kasrah', speak: 'كَسْرَة' },
        { char: 'ُ', sound: "voice/saying 'Ḍammah'.m4a", display: 'Dammah', speak: 'ضَمَّة' },
        { char: 'دَ', sound: "", display: 'Daal Fathah', speak: 'دَ' },
        { char: 'دِ', sound: "", display: 'Daal Kasrah', speak: 'دِ' },
        { char: 'دُ', sound: "", display: 'Daal Dammah', speak: 'دُ' }
    ]
};

let currentLetterKey = 'alif';
let letters = letterSets[currentLetterKey];

const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#3742fa', '#e84393', '#f9ca24', '#6c5ce7'];

const audioPlayer = new Audio();
function speakArabic(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.75;
        window.speechSynthesis.speak(utterance);
    }
}

function playTargetSound(target) {
    if (!target) return;
    if (target.sound) {
        audioPlayer.src = target.sound;
        audioPlayer.play().catch(e => {
            console.log("Audio play failed, using TTS:", e);
            speakArabic(target.speak || target.char);
        });
    } else {
        speakArabic(target.speak || target.char);
    }
}

// Name Handling (Clicking name opens letter selection overlay now)
const nameBtns = document.querySelectorAll('.name-btn:not(.letter-sel-btn):not(.settings-letter-btn)');
nameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playerName = btn.textContent;
        displayName.textContent = playerName;
        welcomeMsg.textContent = `Hello, ${playerName}!`;
        nameOverlay.classList.remove('active');
        letterOverlay.classList.add('active');
    });
});

// Letter Selection Setup
let selectedLetters = [];

// Toggle letter on button click
const letterBtns = document.querySelectorAll('.letter-sel-btn');
letterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.dataset.letter;
        toggleLetter(key);
    });
});

// All Letters select button
document.getElementById('all-letters-btn').addEventListener('click', () => {
    selectAllLetters();
});

// Clear selection button
document.getElementById('clear-letters-btn').addEventListener('click', () => {
    clearSelection();
});

// Confirm selection and start playing
document.getElementById('confirm-letters-btn').addEventListener('click', () => {
    if (selectedLetters.length === 0) return;
    letterOverlay.classList.remove('active');
    startOverlay.classList.add('active');
});

function toggleLetter(key) {
    const index = selectedLetters.indexOf(key);
    if (index > -1) {
        selectedLetters.splice(index, 1);
    } else {
        selectedLetters.push(key);
    }
    updateLetterUIAndPool();
}

function selectAllLetters() {
    selectedLetters = ['alif', 'ba', 'taa', 'daal'];
    updateLetterUIAndPool();
}

function clearSelection() {
    selectedLetters = [];
    updateLetterUIAndPool();
}

function updateLetterUIAndPool() {
    letters = [];
    const seenChars = new Set();
    
    selectedLetters.forEach(key => {
        const set = letterSets[key];
        set.forEach(item => {
            if (!seenChars.has(item.char)) {
                seenChars.add(item.char);
                letters.push(item);
            }
        });
    });

    if (letters.length === 0) {
        letters = [...letterSets['alif']];
    }
    
    // Enable/Disable the continue button based on selection
    const confirmBtn = document.getElementById('confirm-letters-btn');
    if (confirmBtn) {
        if (selectedLetters.length === 0) {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.pointerEvents = 'none';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.pointerEvents = 'auto';
        }
    }
    
    // Update main selection screen buttons
    document.querySelectorAll('.letter-sel-btn').forEach(btn => {
        const key = btn.dataset.letter;
        if (selectedLetters.includes(key)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update settings screen buttons
    document.querySelectorAll('.settings-letter-btn').forEach(btn => {
        const key = btn.dataset.letter;
        if (selectedLetters.includes(key)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update start screen instructions
    const displayNames = { 'alif': 'Alif', 'ba': 'Ba', 'taa': 'Tha', 'daal': 'Daal' };
    const p = document.getElementById('start-instructions-p');
    if (p) {
        if (selectedLetters.length === 4) {
            p.textContent = `Pop the balloons that match the sound! (Learning: All Letters)`;
        } else if (selectedLetters.length === 0) {
            p.textContent = `Pop the balloons that match the sound! (Learning: None)`;
        } else {
            const names = selectedLetters.map(k => displayNames[k]).join(', ');
            p.textContent = `Pop the balloons that match the sound! (Learning: ${names})`;
        }
    }

    // Refresh dynamic target pool if game is active
    if (gameActive) {
        targetPool = [];
        setNewTarget();
    }
}

// Game Logic
function startGame() {
    score = 0;
    wrongHits = 0;
    secondsElapsed = 0;
    popsTowardTarget = 0;
    timeAt100 = null;
    timeAt200 = null;
    targetPool = [];

    updateScore();
    updateWrong();
    updateTimerDisplay();
    lastPopTime = Date.now();

    gameActive = true;
    startOverlay.classList.remove('active');
    gameOverOverlay.classList.remove('active');

    createClouds();
    setNewTarget();

    spawnInterval = setInterval(spawnBalloon, 1100);
    targetSoundInterval = setInterval(() => {
        if (currentTarget && gameActive && !isPausedForQuestion) playTargetSound(currentTarget);
    }, 4000);

    gameTimerInterval = setInterval(() => {
        if (gameActive && !isPausedForQuestion) {
            secondsElapsed++;
            updateTimerDisplay();
        }
    }, 1000);

    randomQuestionTimer = setInterval(checkRandomQuestion, 5000);
}

function checkRandomQuestion() {
    if (!gameActive || isPausedForQuestion) return;
    if (Math.random() < popupProbability) {
        triggerQuestion();
    }
}

function triggerQuestion() {
    if (!gameActive || isPausedForQuestion || !currentTarget) return;
    pauseGame();
    
    questionLetter.textContent = currentTarget.char;
    questionLetter.className = 'balloon-text bounce-in';
    
    // Proper alignment for harakath
    questionLetter.classList.remove('harakah-top', 'harakah-bottom');
    if (['َ', 'ُ'].includes(currentTarget.char)) {
        questionLetter.classList.add('harakah-top');
    } else if (currentTarget.char === 'ِ') {
        questionLetter.classList.add('harakah-bottom');
    }
    
    questionOverlay.classList.add('active');
    
    // Visual feedback - simple confetti
    createConfetti();
    
    askingQuestionSound.currentTime = 0;
    askingQuestionSound.play().catch(e => console.log("Asking sound failed:", e));
}

function createConfetti() {
    const container = document.querySelector('.confetti-effect');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const c = document.createElement('div');
        c.style.position = 'absolute';
        c.style.width = '10px';
        c.style.height = '10px';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.left = '50%';
        c.style.top = '50%';
        c.style.borderRadius = '2px';
        container.appendChild(c);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 200;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        
        c.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'ease-out'
        }).onfinish = () => c.remove();
    }
}

function pauseGame() {
    if (!gameActive || isPausedForQuestion) return;
    isPausedForQuestion = true;
    clearInterval(spawnInterval);
    clearInterval(targetSoundInterval);
    clearInterval(gameTimerInterval);
    clearInterval(randomQuestionTimer);
    
    // Stop any currently playing target sounds
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    document.querySelectorAll('.balloon').forEach(b => {
        b.getAnimations().forEach(anim => anim.pause());
    });
}

function resumeGame() {
    if (!gameActive || !isPausedForQuestion) return;
    isPausedForQuestion = false;
    
    spawnInterval = setInterval(spawnBalloon, 1100);
    targetSoundInterval = setInterval(() => {
        if (currentTarget && gameActive && !isPausedForQuestion) playTargetSound(currentTarget);
    }, 2000);
    
    gameTimerInterval = setInterval(() => {
        if (gameActive && !isPausedForQuestion) {
            secondsElapsed++;
            updateTimerDisplay();
        }
    }, 1000);

    randomQuestionTimer = setInterval(checkRandomQuestion, 10000);

    document.querySelectorAll('.balloon').forEach(b => {
        const animations = b.getAnimations();
        if (animations.length > 0) {
            animations.forEach(anim => anim.play());
        } else {
            // Fallback for older browsers or if animations were lost
            // In our case, we just resumed the interval so new balloons will spawn.
        }
    });
}

function stopGame() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(spawnInterval);
    clearInterval(targetSoundInterval);
    clearInterval(gameTimerInterval);
    clearInterval(randomQuestionTimer);
    isPausedForQuestion = false;
    questionOverlay.classList.remove('active');
    settingsOverlay.classList.remove('active');

    // Stop any playing sound
    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    finalNameTitle.textContent = playerName;
    finalScoreEl.textContent = score;
    finalWrongEl.textContent = wrongHits;
    finalTimeEl.textContent = formatTime(secondsElapsed);

    if (timeAt100) {
        milestone100Box.style.display = 'block';
        timeTo100El.textContent = formatTime(timeAt100);
    } else {
        milestone100Box.style.display = 'none';
    }

    if (timeAt200) {
        milestone200Box.style.display = 'block';
        timeTo200El.textContent = formatTime(timeAt200);
    } else {
        milestone200Box.style.display = 'none';
    }

    gameOverOverlay.classList.add('active');
    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(b => b.remove());
}

function showMainMenu() {
    gameOverOverlay.classList.remove('active');
    startOverlay.classList.remove('active');
    nameOverlay.classList.add('active');

    // Reset stats display
    score = 0;
    wrongHits = 0;
    secondsElapsed = 0;
    updateScore();
    updateWrong();
    updateTimerDisplay();
}

function updateScore() {
    scoreEl.textContent = score;
    
    // Update progress bar (max 200)
    const progress = Math.min(100, (score / 200) * 100);
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (score >= 100 && timeAt100 === null) {
        timeAt100 = secondsElapsed;
    }
    if (score >= 200 && timeAt200 === null) {
        timeAt200 = secondsElapsed;
    }

    // Auto-end at 200
    if (score >= 200) {
        setTimeout(stopGame, 500); 
    }
}

function updateWrong() {
    wrongEl.textContent = wrongHits;
}

function updateTimerDisplay() {
    timerEl.textContent = formatTime(secondsElapsed);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function setNewTarget() {
    if (targetPool.length === 0) {
        // Refill pool and shuffle
        targetPool = [...letters];
        for (let i = targetPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [targetPool[i], targetPool[j]] = [targetPool[j], targetPool[i]];
        }
    }

    currentTarget = targetPool.pop();
    // targetLabel.textContent = currentTarget.char; // Hiding visual hint

    popsTowardTarget = 0;
    playTargetSound(currentTarget);
}

function spawnBalloon() {
    if (!gameActive) return;
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    // Use targetLetterProbability to decide if we spawn the target letter
    let letter;
    if (currentTarget && Math.random() < targetLetterProbability) {
        letter = currentTarget;
    } else {
        letter = letters[Math.floor(Math.random() * letters.length)];
    }
    
    balloon.dataset.letter = letter.char;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.random() * (gameScreen.clientWidth - 160);
    const duration = 6000 + Math.random() * 4000;
    balloon.style.left = `${randomX}px`;
    balloon.style.bottom = `-200px`;
    balloon.style.backgroundColor = randomColor;
    const text = document.createElement('span');
    text.className = 'balloon-text';
    if (['َ', 'ُ'].includes(letter.char)) {
        text.classList.add('harakah-top');
    } else if (letter.char === 'ِ') {
        text.classList.add('harakah-bottom');
    }
    text.textContent = letter.char;
    balloon.appendChild(text);
    gameScreen.appendChild(balloon);
    const animation = balloon.animate([{ bottom: '-200px' }, { bottom: '110%' }], { duration, easing: 'linear' });
    animation.onfinish = () => { if (balloon.parentElement) balloon.remove(); };
    balloon.addEventListener('pointerdown', (e) => { e.preventDefault(); popBalloon(balloon, letter); });
}

function popBalloon(balloon, letter) {
    if (!gameActive || balloon.classList.contains('popping')) return;
    if (letter.char === currentTarget.char) {
        // Calculate points based on speed
        const currentTime = Date.now();
        const timeDiff = (currentTime - lastPopTime) / 1000;
        lastPopTime = currentTime;

        let points = 3;
        if (timeDiff <= 1) points = 10;
        else if (timeDiff <= 2) points = 8;
        else if (timeDiff <= 3) points = 6;
        else if (timeDiff <= 5) points = 4;

        score += points;
        popsTowardTarget++;
        updateScore();

        // Play correct sound
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Correct sound failed:", e));

        const rect = balloon.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, balloon.style.backgroundColor);
        balloon.classList.add('popping');
        setTimeout(() => {
            if (balloon.parentElement) balloon.remove();
            if (popsTowardTarget >= 3) setNewTarget();
        }, 300);
    } else {
        wrongHits++;
        updateWrong();

        // Play wrong sound
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log("Wrong sound failed:", e));

        balloon.style.animation = 'shake 0.3s';
        score = Math.max(0, score - 5);
        updateScore();
        setTimeout(() => balloon.style.animation = '', 300);
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        gameScreen.appendChild(particle);
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        let op = 1;
        const move = setInterval(() => {
            particle.style.left = `${parseFloat(particle.style.left) + vx}px`;
            particle.style.top = `${parseFloat(particle.style.top) + vy}px`;
            op -= 0.05;
            particle.style.opacity = op;
            if (op <= 0) { clearInterval(move); particle.remove(); }
        }, 20);
    }
}

function createClouds() {
    const cloudContainer = document.querySelector('.clouds-container');
    cloudContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const width = 100 + Math.random() * 100;
        cloud.style.width = `${width}px`;
        cloud.style.height = `${width / 2}px`;
        cloud.style.top = `${Math.random() * 40}%`;
        cloud.style.left = `-200px`;
        cloud.style.animationDuration = `${20 + Math.random() * 30}s`;
        cloud.style.animationDelay = `${Math.random() * 20}s`;
        cloudContainer.appendChild(cloud);
    }
}

// Share Logic
async function shareResults() {
    const target = document.getElementById('share-content');
    const originalShadow = target.style.boxShadow;
    target.style.boxShadow = 'none'; // Clean up for screenshot

    try {
        const canvas = await html2canvas(target, {
            backgroundColor: '#ffffff',
            scale: 2, // Better quality
            logging: false
        });

        target.style.boxShadow = originalShadow;

        const image = canvas.toDataURL('image/png');

        // Use Web Share API if available
        if (navigator.share) {
            const blob = await (await fetch(image)).blob();
            const file = new File([blob], 'arabic-balloon-score.png', { type: 'image/png' });

            await navigator.share({
                files: [file],
                title: 'My Arabic Balloon Game Score!',
                text: `Look at my score in the Arabic Balloon Pop! I reached 200 in ${formatTime(timeAt200 || 0)}!`
            });
        } else {
            // Fallback: Download
            const link = document.createElement('a');
            link.download = 'my-arabic-game-score.png';
            link.href = image;
            link.click();
            alert("Score card downloaded! You can now share it with your friends.");
        }
    } catch (err) {
        console.error('Sharing failed:', err);
        alert("Oops! Sharing didn't work. Try taking a screenshot manually.");
    }
}

function returnToMainMenu() {
    window.location.href = '../index.html';
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', returnToMainMenu);
shareBtn.addEventListener('click', shareResults);
replayBtn.addEventListener('click', () => { if (currentTarget) playTargetSound(currentTarget); });

// Global and Overlay Main Menu Button Listeners
['global-main-menu-btn', 'settings-main-menu-btn', 'question-main-menu-btn', 'name-main-menu-btn', 'letter-main-menu-btn', 'start-main-menu-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            returnToMainMenu();
        });
    }
});

document.querySelectorAll('.settings-letter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.dataset.letter;
        toggleLetter(key);
    });
});

document.getElementById('settings-all-letters-btn').addEventListener('click', () => {
    selectAllLetters();
});

probSlider.addEventListener('input', (e) => {
    const values = [5, 10, 20, 30];
    const val = values[e.target.value];
    popupProbability = val / 100;
    probVal.textContent = `${val}%`;
});

letterProbSlider.addEventListener('input', (e) => {
    const values = [5, 10, 20, 30, 50];
    const val = values[e.target.value];
    targetLetterProbability = val / 100;
    letterProbVal.textContent = `${val}%`;
});

quickQBtn.addEventListener('click', triggerQuestion);

teacherBtn.addEventListener('click', () => {
    pauseGame();
    settingsOverlay.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
    if (selectedLetters.length === 0) {
        alert("Please select at least one letter!");
        return;
    }
    settingsOverlay.classList.remove('active');
    if (!questionOverlay.classList.contains('active') && gameActive) {
        resumeGame();
    }
});

continueGameBtn.addEventListener('click', () => {
    questionOverlay.classList.remove('active');
    score += 20;
    updateScore();
    correctSound.currentTime = 0;
    correctSound.play().catch(e => console.log(e));
    resumeGame();
});

replayQBtn.addEventListener('click', () => {
    askingQuestionSound.currentTime = 0;
    askingQuestionSound.play().catch(e => console.log(e));
});

// End Game Button - Multi-event support
['click', 'pointerdown'].forEach(evt => {
    endBtn.addEventListener(evt, (e) => {
        e.preventDefault();
        stopGame();
    });
});

// Initial Load
createClouds();
updateLetterUIAndPool();
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }`;
document.head.appendChild(shakeStyle);
