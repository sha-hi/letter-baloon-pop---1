// script.js for Falling Letters Game

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameScreen = document.getElementById('game-screen');
    const scoreEl = document.getElementById('score');
    const streakEl = document.getElementById('streak-count');
    const timerEl = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const displayName = document.getElementById('display-name');
    const welcomeMsg = document.getElementById('welcome-msg');
    
    // Buttons
    const soundLoopToggle = document.getElementById('sound-loop-toggle');
    const replaySoundBtn = document.getElementById('replay-sound-btn');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shareBtn = document.getElementById('share-btn');
    const endBtn = document.getElementById('end-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const probSlider = document.getElementById('prob-slider');
    const probVal = document.getElementById('prob-val');
    
    // Overlays
    const nameOverlay = document.getElementById('name-overlay');
    const groupOverlay = document.getElementById('group-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    
    // Game Area & Basket
    const fallingArea = document.getElementById('falling-area');
    const basket = document.getElementById('basket');
    const targetLetterDisplay = document.getElementById('target-letter-display');
    
    // Scoreboard elements
    const finalScoreEl = document.getElementById('final-score');
    const finalWrongEl = document.getElementById('final-wrong');
    const finalStreakEl = document.getElementById('final-streak');
    const finalTimeEl = document.getElementById('final-time');
    const finalNameTitle = document.getElementById('final-name-title');

    // Game State Variables
    let score = 0;
    let wrongMatches = 0;
    let streak = 0;
    let maxStreak = 0;
    let secondsElapsed = 0;
    let gameActive = false;
    let isAutoSoundOn = true;
    let currentTarget = null;
    let targetPool = [];
    let selectedGroup = 'alif'; // 'alif', 'ba', 'ta', 'daal'
    let playerName = 'Player';
    let targetLetterProbability = 0.35; // Default 35% probability
    
    // Physics & Falling letters pool
    let activeLetters = [];
    let spawnTimer = null;
    let physicsInterval = null;
    
    // Timers & Intervals
    let targetSoundInterval = null;
    let gameTimerInterval = null;
    
    // Audio Elements
    const correctSound = new Audio('voice/correct.mp3');
    const wrongSound = new Audio('voice/failed.mp3');
    const targetAudio = new Audio();
    
    // Group Data Definitions
    const letterGroups = {
        'alif': [
            { char: 'ا', sound: "../baloon 1/voice/saying 'alif'.m4a", speak: 'أَلِف' },
            { char: 'اَ', sound: '../baloon 1/voice/sound of alif with fathah.m4a', speak: 'أَ', class: 'harakah-top-adjust' },
            { char: 'اِ', sound: '../baloon 1/voice/sound of alif with kasar.m4a', speak: 'إِ', class: 'harakah-bottom-adjust' },
            { char: 'اُ', sound: '../baloon 1/voice/sound of alif with Ḍammah.m4a', speak: 'أُ', class: 'harakah-top-adjust' },
            { char: 'اْ', sound: '../baloon 1/voice/sound of alif with sukoon.m4a', speak: 'أْ', class: 'harakah-top-adjust' },
            { char: 'اٌ', sound: '../baloon 1/voice/sound of alif with thanween dammah.m4a', speak: 'أٌ', class: 'harakah-top-adjust' }
        ],
        'ba': [
            { char: 'ب', sound: "../baloon 1/voice/saying baa'a.m4a", speak: 'بَاء' },
            { char: 'بَ', sound: '../baloon 1/voice/sound of baa with fathah.m4a', speak: 'بَ', class: 'harakah-top-adjust' },
            { char: 'بِ', sound: '../baloon 1/voice/sound of baa with kasar.m4a', speak: 'بِ', class: 'harakah-bottom-adjust' },
            { char: 'بُ', sound: '../baloon 1/voice/sound of baa with dammah.m4a', speak: 'بُ', class: 'harakah-top-adjust' },
            { char: 'بْ', sound: '../baloon 1/voice/sound of baa with sukoon.m4a', speak: 'بْ', class: 'harakah-top-adjust' },
            { char: 'بٌ', sound: '../baloon 1/voice/sound of baa with thanween dammah.m4a', speak: 'بٌ', class: 'harakah-top-adjust' }
        ],
        'ta': [
            { char: 'ت', sound: "../baloon 1/voice/saying thaa'a.m4a", speak: 'تَاء' },
            { char: 'تَ', sound: '../baloon 1/voice/sound of tha with fatah.m4a', speak: 'تَ', class: 'harakah-top-adjust' },
            { char: 'تِ', sound: '../baloon 1/voice/sound of tha with kasar.m4a', speak: 'تِ', class: 'harakah-bottom-adjust' },
            { char: 'تُ', sound: '../baloon 1/voice/sound of tha with dammah.m4a', speak: 'تُ', class: 'harakah-top-adjust' },
            { char: 'تْ', sound: '', speak: 'تْ', class: 'harakah-top-adjust' },
            { char: 'تٌ', sound: '../baloon 1/voice/sound of tha with thaween dammah.m4a', speak: 'تٌ', class: 'harakah-top-adjust' }
        ],
        'daal': [
            { char: 'د', sound: "", speak: 'دَال' },
            { char: 'دَ', sound: '', speak: 'دَ', class: 'harakah-top-adjust' },
            { char: 'دِ', sound: '', speak: 'دِ', class: 'harakah-bottom-adjust' },
            { char: 'دُ', sound: '', speak: 'دُ', class: 'harakah-top-adjust' },
            { char: 'دْ', sound: '', speak: 'دْ', class: 'harakah-top-adjust' }
        ]
    };

    // Arabic TTS Fallback
    function speakArabic(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.65;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Play Target Sound
    function playTargetSound() {
        if (!currentTarget || !gameActive) return;
        
        // Stop any running speech synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        if (currentTarget.sound) {
            targetAudio.src = currentTarget.sound;
            targetAudio.currentTime = 0;
            targetAudio.play().catch(e => {
                console.log("Audio play failed, playing TTS:", e);
                speakArabic(currentTarget.speak || currentTarget.char);
            });
        } else {
            speakArabic(currentTarget.speak || currentTarget.char);
        }
    }

    // Setup background decoration clouds
    function createClouds() {
        const cloudContainer = document.querySelector('.clouds-container');
        cloudContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            const width = 100 + Math.random() * 100;
            cloud.style.width = `${width}px`;
            cloud.style.height = `${width / 2}px`;
            cloud.style.top = `${5 + Math.random() * 35}%`;
            cloud.style.left = `-220px`;
            cloud.style.animationDuration = `${25 + Math.random() * 25}s`;
            cloud.style.animationDelay = `${Math.random() * 20}s`;
            cloudContainer.appendChild(cloud);
        }
    }

    // Load saved name if any
    const savedName = localStorage.getItem('madrasa_player_name');
    if (savedName) {
        playerName = savedName;
        displayName.textContent = playerName;
        welcomeMsg.textContent = `Hello, ${playerName}!`;
    }

    // Name selection trigger
    const nameBtns = document.querySelectorAll('.name-btn');
    nameBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playerName = btn.textContent;
            displayName.textContent = playerName;
            welcomeMsg.textContent = `Hello, ${playerName}!`;
            localStorage.setItem('madrasa_player_name', playerName);
            nameOverlay.classList.remove('active');
            groupOverlay.classList.add('active');
        });
    });

    // Group selection trigger
    const groupBtns = document.querySelectorAll('.group-btn');
    groupBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            groupBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGroup = btn.dataset.group;
        });
    });

    // Start Game trigger
    startBtn.addEventListener('click', () => {
        groupOverlay.classList.remove('active');
        startGame();
    });

    // Sound loop toggle
    soundLoopToggle.addEventListener('click', () => {
        isAutoSoundOn = !isAutoSoundOn;
        if (isAutoSoundOn) {
            soundLoopToggle.textContent = '🔁 Auto Sound: On';
            soundLoopToggle.classList.add('active');
            soundLoopToggle.style.background = '#ffa502';
            if (gameActive && !targetSoundInterval) {
                targetSoundInterval = setInterval(playTargetSound, 3500);
            }
        } else {
            soundLoopToggle.textContent = '🔇 Auto Sound: Off';
            soundLoopToggle.classList.remove('active');
            soundLoopToggle.style.background = '#747d8c';
            clearInterval(targetSoundInterval);
            targetSoundInterval = null;
        }
    });

    // Replay sound manually
    replaySoundBtn.addEventListener('click', playTargetSound);

    // End game button
    endBtn.addEventListener('click', stopGame);

    // Restart game button
    restartBtn.addEventListener('click', () => {
        gameOverOverlay.classList.remove('active');
        startGame();
    });

    // Return to main menu
    function returnToMainMenu() {
        window.location.href = '../index.html';
    }
    
    document.getElementById('main-menu-btn-top').addEventListener('click', returnToMainMenu);
    document.getElementById('name-main-menu-btn').addEventListener('click', returnToMainMenu);
    document.getElementById('group-main-menu-btn').addEventListener('click', returnToMainMenu);
    document.getElementById('main-menu-btn').addEventListener('click', returnToMainMenu);

    // Basket Controls (Mouse / Touch move)
    let isPointerMovingBasket = false;
    
    gameScreen.addEventListener('pointerdown', (e) => {
        if (!gameActive) return;
        isPointerMovingBasket = true;
        moveBasketToPointer(e);
    });

    gameScreen.addEventListener('pointermove', (e) => {
        if (!gameActive || !isPointerMovingBasket) return;
        moveBasketToPointer(e);
    });

    window.addEventListener('pointerup', () => {
        isPointerMovingBasket = false;
    });

    function moveBasketToPointer(e) {
        const screenRect = gameScreen.getBoundingClientRect();
        let pointerX = e.clientX - screenRect.left;
        
        // Center the basket on the pointer coordinates
        const basketWidth = basket.offsetWidth;
        let leftVal = pointerX - basketWidth / 2;
        
        // Clamp bounds
        leftVal = Math.max(0, Math.min(leftVal, screenRect.width - basketWidth));
        basket.style.left = leftVal + 'px';
    }

    // Keyboard controls (Arrow keys)
    window.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        
        const screenWidth = gameScreen.clientWidth;
        const basketWidth = basket.offsetWidth;
        let currentLeft = basket.offsetLeft;
        const speed = 35; // Pixels to move per click
        
        if (e.key === 'ArrowLeft') {
            let leftVal = Math.max(0, currentLeft - speed);
            basket.style.left = leftVal + 'px';
        } else if (e.key === 'ArrowRight') {
            let leftVal = Math.min(screenWidth - basketWidth, currentLeft + speed);
            basket.style.left = leftVal + 'px';
        }
    });

    function pauseGame() {
        clearInterval(spawnTimer);
        clearInterval(physicsInterval);
        clearInterval(gameTimerInterval);
        clearInterval(targetSoundInterval);
        
        spawnTimer = null;
        physicsInterval = null;
        gameTimerInterval = null;
        targetSoundInterval = null;
    }

    function resumeGame() {
        if (!gameActive) return;
        
        if (!physicsInterval) {
            physicsInterval = setInterval(updatePhysics, 20);
        }
        if (!spawnTimer) {
            spawnTimer = setInterval(spawnLetterCloud, 2200);
        }
        if (!gameTimerInterval) {
            gameTimerInterval = setInterval(() => {
                if (gameActive) {
                    secondsElapsed++;
                    updateTimerDisplay();
                }
            }, 1000);
        }
        if (isAutoSoundOn && !targetSoundInterval) {
            targetSoundInterval = setInterval(playTargetSound, 3500);
        }
    }

    // Game Core Setup
    function startGame() {
        score = 0;
        wrongMatches = 0;
        streak = 0;
        maxStreak = 0;
        secondsElapsed = 0;
        targetPool = [];
        activeLetters.forEach(item => item.element.remove());
        activeLetters = [];
        gameActive = true;
        
        updateScoreUI();
        updateTimerDisplay();
        
        // Reset basket position to center
        basket.style.left = 'calc(50% - ' + (basket.offsetWidth / 2) + 'px)';
        
        gameScreen.style.display = 'flex';
        createClouds();
        setNewTarget();
        
        // Start timers
        clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(() => {
            if (gameActive) {
                secondsElapsed++;
                updateTimerDisplay();
            }
        }, 1000);
        
        // Start physics loop
        clearInterval(physicsInterval);
        physicsInterval = setInterval(updatePhysics, 20); // 50fps updating
        
        // Start spawn loop
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnLetterCloud, 2200); // Spawn cloud letter every 2.2 seconds
        
        // Start sound loop if enabled
        clearInterval(targetSoundInterval);
        if (isAutoSoundOn) {
            targetSoundInterval = setInterval(playTargetSound, 3500);
        }
    }

    function updateScoreUI() {
        scoreEl.textContent = score;
        streakEl.textContent = `🔥 ${streak}`;
        
        // Progress bar (cap at 150 points)
        const progress = Math.min(100, (score / 150) * 100);
        progressBar.style.width = `${progress}%`;
        
        if (score >= 150) {
            setTimeout(stopGame, 600);
        }
    }

    function updateTimerDisplay() {
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }

    function setNewTarget() {
        const pool = letterGroups[selectedGroup];

        // Shuffle target pool if empty
        if (targetPool.length === 0) {
            targetPool = [...pool];
            for (let i = targetPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [targetPool[i], targetPool[j]] = [targetPool[j], targetPool[i]];
            }
        }

        currentTarget = targetPool.pop();
        targetLetterDisplay.textContent = currentTarget.char;
        
        // Play target sound
        setTimeout(playTargetSound, 400);
    }

    // Physics Engine: updating falling positions and collisions
    function updatePhysics() {
        if (!gameActive) return;
        
        const areaHeight = fallingArea.offsetHeight;
        
        for (let i = activeLetters.length - 1; i >= 0; i--) {
            const letter = activeLetters[i];
            letter.y += letter.speed;
            letter.element.style.top = letter.y + 'px';
            
            // Check collision with the basket
            if (checkBasketCollision(letter)) {
                // Collided!
                handleBasketCollision(letter, i);
            } 
            // Check if it reached the bottom
            else if (letter.y > areaHeight - 20) {
                // Missed
                handleLetterMiss(letter, i);
            }
        }
    }

    // Collision Check between cloud item and basket
    function checkBasketCollision(letter) {
        const letterRect = letter.element.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();
        
        // Check if bottom coordinates of cloud hits the basket rim region
        const isVerticallyAligned = (letterRect.bottom >= basketRect.top + 5) && (letterRect.top <= basketRect.bottom - 40);
        
        // Check horizontal overlap with basket rims (with margin for landing *inside*)
        const isHorizontallyAligned = (letterRect.right >= basketRect.left + 20) && (letterRect.left <= basketRect.right - 20);
        
        return isVerticallyAligned && isHorizontallyAligned;
    }

    // Spawn falling cloud letters
    function spawnLetterCloud() {
        if (!gameActive) return;
        
        const pool = letterGroups[selectedGroup];
        
        // Configurable chance to spawn target letter
        let letterDataObj;
        if (Math.random() < targetLetterProbability) {
            letterDataObj = currentTarget;
        } else {
            const distractors = pool.filter(item => item.char !== currentTarget.char);
            letterDataObj = distractors[Math.floor(Math.random() * distractors.length)];
        }
        
        const element = document.createElement('div');
        element.className = 'falling-cloud';
        if (letterDataObj.class) element.classList.add(letterDataObj.class);
        
        const textSpan = document.createElement('span');
        textSpan.className = 'letter-text';
        textSpan.textContent = letterDataObj.char;
        
        element.appendChild(textSpan);
        fallingArea.appendChild(element);
        
        // Random horizontal positioning
        const maxLeft = fallingArea.clientWidth - 110;
        const randomLeft = 10 + Math.random() * maxLeft;
        element.style.left = randomLeft + 'px';
        element.style.top = '-80px';
        
        // Physics variables: spawn object
        const speed = 2.0 + Math.random() * 2.2; // random fall speeds
        
        activeLetters.push({
            element: element,
            char: letterDataObj.char,
            x: randomLeft,
            y: -80,
            speed: speed
        });
    }

    // Handle caught letter
    function handleBasketCollision(letter, index) {
        // Remove item from array and DOM
        activeLetters.splice(index, 1);
        letter.element.remove();
        
        if (letter.char === currentTarget.char) {
            // Correct Catch!
            score += 10;
            streak++;
            if (streak > maxStreak) maxStreak = streak;
            
            // Streak bonus
            if (streak >= 3) {
                score += 2;
            }
            
            updateScoreUI();
            
            // Success audio
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log(e));
            
            // Glow and bounce basket
            basket.classList.add('success-catch');
            setTimeout(() => basket.classList.remove('success-catch'), 300);
            
            // Particles inside basket coordinates
            const basketRect = basket.getBoundingClientRect();
            createParticles(basketRect.left + basketRect.width / 2, basketRect.top + 10, '#2ed573');
            
            // Reset target after a few catches
            // If they caught the target, select next target
            setNewTarget();
        } else {
            // Incorrect Catch!
            score = Math.max(0, score - 5);
            streak = 0;
            wrongMatches++;
            
            updateScoreUI();
            
            // Failure audio
            wrongSound.currentTime = 0;
            wrongSound.play().catch(e => console.log(e));
            
            // Shake and red glow basket
            basket.classList.add('wrong-catch');
            setTimeout(() => basket.classList.remove('wrong-catch'), 300);
        }
    }

    // Handle missed letter (reached bottom)
    function handleLetterMiss(letter, index) {
        activeLetters.splice(index, 1);
        letter.element.remove();
        
        // If they missed the target letter, we can reset streak (but no score penalty to keep it friendly)
        if (letter.char === currentTarget.char) {
            streak = 0;
            updateScoreUI();
        }
    }

    // Particles explosion
    function createParticles(x, y, color) {
        const colors = [color, '#ffeaa7', '#74b9ff', '#ff7675', '#a29bfe'];
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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
                if (op <= 0) {
                    clearInterval(move);
                    particle.remove();
                }
            }, 20);
        }
    }

    // End Game Summary Screen
    function stopGame() {
        gameActive = false;
        
        // Clear physics, spawn and sounds
        clearInterval(spawnTimer);
        clearInterval(physicsInterval);
        clearInterval(targetSoundInterval);
        clearInterval(gameTimerInterval);
        
        targetAudio.pause();
        targetAudio.currentTime = 0;
        
        // Fill results overlay
        finalNameTitle.textContent = playerName;
        finalScoreEl.textContent = score;
        finalWrongEl.textContent = wrongMatches;
        finalStreakEl.textContent = `🔥 ${maxStreak}`;
        
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        finalTimeEl.textContent = `${m}:${s}`;
        
        // Hide UI, show Overlays
        gameScreen.style.display = 'none';
        gameOverOverlay.classList.add('active');
        
        // Confetti scorecard
        createConfetti();
        
        // Clean active letters from DOM
        activeLetters.forEach(item => item.element.remove());
        activeLetters = [];
    }

    function createConfetti() {
        const container = document.querySelector('.confetti-effect');
        if (!container) return;
        container.innerHTML = '';
        const colorsList = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe'];
        
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.style.position = 'absolute';
            c.style.width = `${5 + Math.random() * 10}px`;
            c.style.height = `${5 + Math.random() * 10}px`;
            c.style.backgroundColor = colorsList[Math.floor(Math.random() * colorsList.length)];
            c.style.left = `${Math.random() * 100}%`;
            c.style.top = `-20px`;
            c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            container.appendChild(c);
            
            const duration = 1500 + Math.random() * 2000;
            const delay = Math.random() * 1000;
            
            c.animate([
                { top: '-20px', transform: 'rotate(0deg)' },
                { top: '100%', transform: `rotate(${Math.random() * 720}deg) translateX(${(-50 + Math.random() * 100)}px)` }
            ], {
                duration,
                delay,
                easing: 'ease-in-out',
                iterations: Infinity
            });
        }
    }

    // Share scoreboard scorecard
    async function shareResults() {
        const target = document.getElementById('share-content');
        const originalShadow = target.style.boxShadow;
        target.style.boxShadow = 'none';
        
        const actions = target.querySelector('.action-buttons');
        actions.style.visibility = 'hidden';

        try {
            const canvas = await html2canvas(target, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            target.style.boxShadow = originalShadow;
            actions.style.visibility = 'visible';

            const image = canvas.toDataURL('image/png');

            if (navigator.share) {
                const blob = await (await fetch(image)).blob();
                const file = new File([blob], 'falling-letters-score.png', { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: 'My Falling Letters Score!',
                    text: `Look at my score in the Falling Letters game! I reached 150 points in ${finalTimeEl.textContent} with a streak of ${maxStreak}!`
                });
            } else {
                const link = document.createElement('a');
                link.download = 'falling-letters-score.png';
                link.href = image;
                link.click();
                alert("Scorecard downloaded! Share it with your friends.");
            }
        } catch (err) {
            console.error('Sharing failed:', err);
            target.style.boxShadow = originalShadow;
            actions.style.visibility = 'visible';
            alert("Sharing failed. Take a screenshot manually!");
        }
    }
    
    shareBtn.addEventListener('click', shareResults);

    // Settings Overlay Event Listeners
    settingsBtn.addEventListener('click', () => {
        if (gameActive) {
            pauseGame();
        }
        settingsOverlay.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('active');
        if (gameActive) {
            resumeGame();
        }
    });

    probSlider.addEventListener('input', (e) => {
        const values = [10, 25, 35, 55, 75];
        const val = values[e.target.value];
        targetLetterProbability = val / 100;
        probVal.textContent = `${val}%`;
    });

    // Initial setup
    createClouds();
});
