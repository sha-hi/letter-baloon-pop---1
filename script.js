const gameScreen = document.getElementById('game-screen');
const scoreEl = document.getElementById('score');
const wrongEl = document.getElementById('wrong-count');
const timerEl = document.getElementById('timer');
const targetLabel = document.getElementById('target-label');
const nameOverlay = document.getElementById('name-overlay');
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');

const finalScoreEl = document.getElementById('final-score');
const finalWrongEl = document.getElementById('final-wrong');
const finalTimeEl = document.getElementById('final-time');
const finalNameTitle = document.getElementById('final-name-title');
const timeTo200El = document.getElementById('time-to-200');
const milestoneBox = document.getElementById('milestone-box');

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
let timeAt200 = null;

const letters = [
    { char: 'ا', sound: 'voice/sound of alif.m4a', display: 'Alif' },
    { char: 'اَ', sound: "voice/saying'fathah'.m4a", display: 'Fathah' },
    { char: 'اَ', sound: 'voice/sound of alif with fathah.m4a', display: 'Alif Fathah' },
    { char: 'اِ', sound: "voice/saying ' kasr'.m4a", display: 'Kasrah' },
    { char: 'اِ', sound: 'voice/sound of alif with kasar.m4a', display: 'Alif Kasrah' }
];

const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#3742fa', '#e84393', '#f9ca24', '#6c5ce7'];

const audioPlayer = new Audio();
function playSound(src) {
    if (!src) return;
    audioPlayer.src = src;
    audioPlayer.play().catch(e => console.log("Audio play failed:", e));
}

// Name Handling
const nameBtns = document.querySelectorAll('.name-btn');
nameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playerName = btn.textContent;
        displayName.textContent = playerName;
        welcomeMsg.textContent = `Hello, ${playerName}!`;
        nameOverlay.classList.remove('active');
        startOverlay.classList.add('active');
    });
});

// Game Logic
function startGame() {
    score = 0;
    wrongHits = 0;
    secondsElapsed = 0;
    popsTowardTarget = 0;
    timeAt200 = null;
    
    updateScore();
    updateWrong();
    updateTimerDisplay();
    
    gameActive = true;
    startOverlay.classList.remove('active');
    gameOverOverlay.classList.remove('active');
    
    createClouds();
    setNewTarget();
    
    spawnInterval = setInterval(spawnBalloon, 1500);
    targetSoundInterval = setInterval(() => {
        if (currentTarget && gameActive) playSound(currentTarget.sound);
    }, 4000);
    
    gameTimerInterval = setInterval(() => {
        if (gameActive) {
            secondsElapsed++;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopGame() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(spawnInterval);
    clearInterval(targetSoundInterval);
    clearInterval(gameTimerInterval);
    
    // Stop any playing sound
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    finalNameTitle.textContent = playerName;
    finalScoreEl.textContent = score;
    finalWrongEl.textContent = wrongHits;
    finalTimeEl.textContent = formatTime(secondsElapsed);
    
    if (timeAt200) {
        milestoneBox.style.display = 'block';
        timeTo200El.textContent = formatTime(timeAt200);
    } else {
        milestoneBox.style.display = 'none';
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
    if (score >= 200 && timeAt200 === null) {
        timeAt200 = secondsElapsed;
    }
    
    // Auto-end at 300
    if (score >= 300) {
        setTimeout(stopGame, 500); // Small delay for the last pop animation
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
    const oldTarget = currentTarget;
    let nextTarget;
    do {
        nextTarget = letters[Math.floor(Math.random() * letters.length)];
    } while (nextTarget === oldTarget && letters.length > 1);
    
    currentTarget = nextTarget;
    targetLabel.textContent = currentTarget.char;
    popsTowardTarget = 0;
    playSound(currentTarget.sound);
}

function spawnBalloon() {
    if (!gameActive) return;
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    balloon.dataset.letter = letter.char;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.random() * (gameScreen.clientWidth - 160);
    const duration = 6000 + Math.random() * 4000;
    balloon.style.left = `${randomX}px`;
    balloon.style.bottom = `-200px`;
    balloon.style.backgroundColor = randomColor;
    const text = document.createElement('span');
    text.className = 'balloon-text';
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
        score += 10;
        popsTowardTarget++;
        updateScore();
        
        // Play correct sound
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Correct sound failed:", e));
        
        const rect = balloon.getBoundingClientRect();
        createParticles(rect.left + rect.width/2, rect.top + rect.height/2, balloon.style.backgroundColor);
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
        cloud.style.height = `${width/2}px`;
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

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', showMainMenu);
shareBtn.addEventListener('click', shareResults);
replayBtn.addEventListener('click', () => { if (currentTarget) playSound(currentTarget.sound); });

// End Game Button - Multi-event support
['click', 'pointerdown'].forEach(evt => {
    endBtn.addEventListener(evt, (e) => {
        e.preventDefault();
        stopGame();
    });
});

// Initial Load
createClouds();
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }`;
document.head.appendChild(shakeStyle);
