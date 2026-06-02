// script.js for Sound Matching Game

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
    const resetOptionsBtn = document.getElementById('reset-options-btn');
    
    // Overlays
    const nameOverlay = document.getElementById('name-overlay');
    const modeOverlay = document.getElementById('mode-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    
    // Mascot Elements
    const mascot = document.getElementById('mascot');
    const mascotBody = mascot.querySelector('.mascot-body');
    const bubbleInstruction = document.getElementById('bubble-instruction');
    
    // Containers
    const optionsContainer = document.getElementById('options-container');
    const dropTarget = document.getElementById('drop-target');
    
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
    let selectedMode = 'alif-harakath'; // 'alif-harakath', 'harakath-only', 'combined'
    let playerName = 'Player';
    
    // Timers & Intervals
    let targetSoundInterval = null;
    let gameTimerInterval = null;
    
    // Audio Elements
    const correctSound = new Audio('voice/correct.mp3');
    const wrongSound = new Audio('voice/failed.mp3');
    const targetAudio = new Audio();
    
    // Mode Data Definitions
    const letterData = [
        // Alif
        { char: 'ا', sound: "../baloon 1/voice/saying 'alif'.m4a", speak: 'أَلِف' },
        { char: 'اَ', sound: '../baloon 1/voice/sound of alif with fathah.m4a', speak: 'أَ' },
        { char: 'اِ', sound: '../baloon 1/voice/sound of alif with kasar.m4a', speak: 'إِ' },
        { char: 'اُ', sound: '../baloon 1/voice/sound of alif with Ḍammah.m4a', speak: 'أُ' },
        { char: 'اْ', sound: '../baloon 1/voice/sound of alif with sukoon.m4a', speak: 'أْ' },
        { char: 'اٌ', sound: '../baloon 1/voice/sound of alif with thanween dammah.m4a', speak: 'أٌ' },
        
        // Ba
        { char: 'ب', sound: "../baloon 1/voice/saying baa'a.m4a", speak: 'بَاء' },
        { char: 'بَ', sound: '../baloon 1/voice/sound of baa with fathah.m4a', speak: 'بَ' },
        { char: 'بِ', sound: '../baloon 1/voice/sound of baa with kasar.m4a', speak: 'بِ' },
        { char: 'بُ', sound: '../baloon 1/voice/sound of baa with dammah.m4a', speak: 'بُ' },
        { char: 'بْ', sound: '../baloon 1/voice/sound of baa with sukoon.m4a', speak: 'بْ' },
        { char: 'بٌ', sound: '../baloon 1/voice/sound of baa with thanween dammah.m4a', speak: 'بٌ' },

        // Tha / Taa
        { char: 'ت', sound: "../baloon 1/voice/saying thaa'a.m4a", speak: 'تَاء' },
        { char: 'تَ', sound: '../baloon 1/voice/sound of tha with fatah.m4a', speak: 'تَ' },
        { char: 'تِ', sound: '../baloon 1/voice/sound of tha with kasar.m4a', speak: 'تِ' },
        { char: 'تُ', sound: '../baloon 1/voice/sound of tha with dammah.m4a', speak: 'تُ' },
        { char: 'تٌ', sound: '../baloon 1/voice/sound of tha with thaween dammah.m4a', speak: 'تٌ' }
    ];

    const harakahData = [
        { char: '◌َ', sound: "../baloon 1/voice/saying 'fathah'.m4a", speak: 'فَتْحَة', class: 'harakah-top-adjust' },
        { char: '◌ِ', sound: "../baloon 1/voice/saying ' kasar'.m4a", speak: 'كَسْرَة', class: 'harakah-bottom-adjust' },
        { char: '◌ُ', sound: "../baloon 1/voice/saying 'Ḍammah'.m4a", speak: 'ضَمَّة', class: 'harakah-top-adjust' },
        { char: '◌ْ', sound: "../baloon 1/voice/sound of alif with sukoon.m4a", speak: 'سُكُون', class: 'harakah-top-adjust' }
    ];

    // Mascot Emoji Pool
    const mascotEmojis = ['🦁', '🐼', '🐸', '🦊', '🐨', '🐵', '🐰', '🐯', '🦉'];
    const positiveFeedback = [
        "Super! That's correct! 🎉",
        "Awesome job! You got it! 🌟",
        "Fantastic! Keep it up! 🏆",
        "Wow! You're so smart! ❤️",
        "Excellent match! Perfect! 🌈"
    ];
    
    const negativeFeedback = [
        "Oops! Try again! 🧐",
        "Not quite, listen again! 👂",
        "Almost! Try another one! 💪",
        "Listen to the sound carefully! 🔊"
    ];

    // TTS Fallback
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
        
        // Animate mascot speaking
        animateMascotTalk();
    }

    function animateMascotTalk() {
        mascotBody.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => {
            mascotBody.style.transform = 'scale(0.95) rotate(-5deg)';
            setTimeout(() => {
                mascotBody.style.transform = '';
            }, 200);
        }, 200);
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
            modeOverlay.classList.add('active');
        });
    });

    // Mode selection trigger
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMode = btn.dataset.mode;
        });
    });

    // Start Game trigger
    startBtn.addEventListener('click', () => {
        modeOverlay.classList.remove('active');
        startGame();
    });

    // Sound loop toggle
    soundLoopToggle.addEventListener('click', () => {
        isAutoSoundOn = !isAutoSoundOn;
        if (isAutoSoundOn) {
            soundLoopToggle.textContent = '🔁 Auto Sound: On';
            soundLoopToggle.classList.add('active');
            soundLoopToggle.style.background = '#ffa502';
            // Start interval if playing
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

    // Reset options manually
    resetOptionsBtn.addEventListener('click', resetOptions);

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
    document.getElementById('mode-main-menu-btn').addEventListener('click', returnToMainMenu);
    document.getElementById('main-menu-btn').addEventListener('click', returnToMainMenu);

    // Game Core Logic
    function startGame() {
        score = 0;
        wrongMatches = 0;
        streak = 0;
        maxStreak = 0;
        secondsElapsed = 0;
        targetPool = [];
        gameActive = true;
        
        updateScoreUI();
        updateTimerDisplay();
        
        gameScreen.style.display = 'flex';
        createClouds();
        setNewTarget();
        
        // Start game timer
        clearInterval(gameTimerInterval);
        gameTimerInterval = setInterval(() => {
            if (gameActive) {
                secondsElapsed++;
                updateTimerDisplay();
            }
        }, 1000);
        
        // Start sound loop if enabled
        clearInterval(targetSoundInterval);
        if (isAutoSoundOn) {
            targetSoundInterval = setInterval(playTargetSound, 3500);
        }
    }

    function updateScoreUI() {
        scoreEl.textContent = score;
        streakEl.textContent = `🔥 ${streak}`;
        
        // Update progress bar (cap at 150 points)
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
        let pool = [];
        
        if (selectedMode === 'alif-harakath') {
            pool = letterData.filter(item => item.char.startsWith('ا'));
        } else if (selectedMode === 'ba-harakath') {
            pool = letterData.filter(item => item.char.startsWith('ب'));
        } else if (selectedMode === 'taa-harakath') {
            pool = letterData.filter(item => item.char.startsWith('ت'));
        } else if (selectedMode === 'harakath-only') {
            pool = [...harakahData];
        } else {
            pool = [...letterData, ...harakahData];
        }

        // Shuffle pool if target pool is empty
        if (targetPool.length === 0) {
            targetPool = [...pool];
            // Shuffle
            for (let i = targetPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [targetPool[i], targetPool[j]] = [targetPool[j], targetPool[i]];
            }
        }

        currentTarget = targetPool.pop();
        
        // Select Options: we show the target + distractors
        // We want to show 5 options for alif-harakath or combined, and 4 options for harakath-only
        let maxOptions = selectedMode === 'harakath-only' ? 4 : 5;
        let selectedOptions = [currentTarget];
        
        // Find distractors
        let distractors = pool.filter(item => item.char !== currentTarget.char);
        // Shuffle distractors
        for (let i = distractors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
        }
        
        // Take distractors to fill options
        for (let i = 0; i < maxOptions - 1; i++) {
            if (distractors[i]) {
                selectedOptions.push(distractors[i]);
            }
        }
        
        // Shuffle final options display order
        for (let i = selectedOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedOptions[i], selectedOptions[j]] = [selectedOptions[j], selectedOptions[i]];
        }
        
        // Render Draggables
        renderDraggables(selectedOptions);
        
        // Say the sound immediately
        setTimeout(playTargetSound, 400);
        
        // Reset Mascot
        mascotBody.textContent = mascotEmojis[Math.floor(Math.random() * mascotEmojis.length)];
        bubbleInstruction.textContent = "Listen closely! Which one sounds like this? 👂";
     }

    // Reset options: pick a new target sound and new options
    function resetOptions() {
        if (!gameActive) return;
        
        setNewTarget();
        
        // Mascot reacts
        bubbleInstruction.textContent = "Here is a new sound and options! 🌟";
        mascotBody.textContent = '🐼';
    }

    // Custom Draggables Render & Pointer Events Engine
    function renderDraggables(options) {
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const el = document.createElement('div');
            el.className = 'draggable-letter';
            if (option.class) el.classList.add(option.class);
            el.textContent = option.char;
            el.dataset.char = option.char;
            
            // Pointer Down Event (Initiates drag)
            el.addEventListener('pointerdown', onPointerDown);
            
            optionsContainer.appendChild(el);
        });
    }

    // Pointer Drag Variables
    let activeDragElement = null;
    let initialX = 0;
    let initialY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    
    function onPointerDown(e) {
        if (!gameActive || activeDragElement) return;
        
        activeDragElement = e.currentTarget;
        activeDragElement.classList.add('dragging');
        
        // Get initial positioning of the element
        const rect = activeDragElement.getBoundingClientRect();
        dragStartX = rect.left;
        dragStartY = rect.top;
        
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Capture pointer events to this element even if pointer moves outside
        activeDragElement.setPointerCapture(e.pointerId);
        
        // Attach move & up handlers directly to the dragging element
        activeDragElement.addEventListener('pointermove', onPointerMove);
        activeDragElement.addEventListener('pointerup', onPointerUp);
        activeDragElement.addEventListener('pointercancel', onPointerCancel);
        
        // Mascot reacts
        bubbleInstruction.textContent = "Drag it into the rectangle box below! 📥";
    }
    
    function onPointerMove(e) {
        if (!activeDragElement) return;
        
        const deltaX = e.clientX - initialX;
        const deltaY = e.clientY - initialY;
        
        // Apply transform to follow pointer
        activeDragElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Check collision/overlap with drop-target
        if (isOverlapping(activeDragElement, dropTarget)) {
            dropTarget.classList.add('hovered');
        } else {
            dropTarget.classList.remove('hovered');
        }
    }
    
    function onPointerUp(e) {
        if (!activeDragElement) return;
        
        const el = activeDragElement;
        
        // Release pointer capture
        el.releasePointerCapture(e.pointerId);
        
        // Remove event listeners
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerCancel);
        
        activeDragElement = null;
        el.classList.remove('dragging');
        
        const isHovering = dropTarget.classList.contains('hovered');
        dropTarget.classList.remove('hovered');
        
        if (isHovering) {
            // Check match
            const char = el.dataset.char;
            console.log(
                "MATCH CHECK - Dragged Char:", JSON.stringify(char), 
                "Code points:", [...char].map(c => "U+" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")),
                "Target Char:", JSON.stringify(currentTarget ? currentTarget.char : null),
                "Code points:", currentTarget ? [...currentTarget.char].map(c => "U+" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")) : null,
                "Match?:", char === currentTarget.char
            );
            if (char === currentTarget.char) {
                // Correct Drop!
                handleCorrectDrop(el);
            } else {
                // Wrong Drop!
                handleWrongDrop(el);
            }
        } else {
            // Snaps back
            snapBack(el);
        }
    }
    
    function onPointerCancel(e) {
        onPointerUp(e);
    }
    
    // Check overlap of two bounding boxes
    function isOverlapping(el1, el2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        
        return !(r1.right < r2.left || 
                 r1.left > r2.right || 
                 r1.bottom < r2.top || 
                 r1.top > r2.bottom);
    }
    
    // Return element to original place with animation
    function snapBack(el) {
        el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.transform = 'translate(0, 0)';
        
        // Clear transition after completion so dragging is instant again
        setTimeout(() => {
            el.style.transition = '';
        }, 400);
    }

    // Shake element animation (wrong answer)
    function shakeElement(el) {
        el.style.transition = 'transform 0.1s';
        
        // Shake sequence
        el.style.transform = 'translate(-15px, 0)';
        setTimeout(() => {
            el.style.transform = 'translate(15px, 0)';
            setTimeout(() => {
                el.style.transform = 'translate(-10px, 0)';
                setTimeout(() => {
                    el.style.transform = 'translate(10px, 0)';
                    setTimeout(() => {
                        snapBack(el);
                    }, 80);
                }, 80);
            }, 80);
        }, 80);
    }
    
    function handleCorrectDrop(el) {
        score += 10;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        
        // Streak bonus
        if (streak >= 3) {
            score += 2; // +2 bonus points!
        }
        
        updateScoreUI();
        
        // Play correct audio
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Correct audio error:", e));
        
        // Success animations
        dropTarget.classList.add('success-flash');
        setTimeout(() => dropTarget.classList.remove('success-flash'), 500);
        
        // Animate the correct letter flying into drop zone and shrinking/vanishing
        const targetRect = dropTarget.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const flyX = (targetRect.left + targetRect.width / 2) - (dragStartX + elRect.width / 2);
        const flyY = (targetRect.top + targetRect.height / 2) - (dragStartY + elRect.height / 2);
        
        el.style.transition = 'transform 0.4s ease-in, opacity 0.4s';
        el.style.transform = `translate(${flyX}px, ${flyY}px) scale(0.2)`;
        el.style.opacity = '0';
        
        // Create particle explosion inside drop target
        createParticles(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2, '#55efc4');
        
        // Mascot reacts positively
        bubbleInstruction.textContent = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
        mascotBody.textContent = '🥳';
        
        // Load next round after delay
        setTimeout(() => {
            if (score < 150) {
                setNewTarget();
            }
        }, 850);
    }
    
    function handleWrongDrop(el) {
        wrongMatches++;
        streak = 0;
        score = Math.max(0, score - 5);
        updateScoreUI();
        
        // Play wrong audio
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log("Wrong audio error:", e));
        
        // Fail flash target
        dropTarget.classList.add('fail-flash');
        setTimeout(() => dropTarget.classList.remove('fail-flash'), 500);
        
        // Mascot reacts negatively
        bubbleInstruction.textContent = negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)];
        mascotBody.textContent = '🤔';
        
        // Shake and snap back
        shakeElement(el);
    }

    function createParticles(x, y, color) {
        const colors = [color, '#ffeaa7', '#74b9ff', '#ff7675', '#a29bfe'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            gameScreen.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 6;
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

    // End & Stop Game
    function stopGame() {
        gameActive = false;
        
        // Clear all timers
        clearInterval(targetSoundInterval);
        clearInterval(gameTimerInterval);
        targetSoundInterval = null;
        gameTimerInterval = null;
        
        // Stop audio
        targetAudio.pause();
        targetAudio.currentTime = 0;
        
        // Fill final scores
        finalNameTitle.textContent = playerName;
        finalScoreEl.textContent = score;
        finalWrongEl.textContent = wrongMatches;
        finalStreakEl.textContent = `🔥 ${maxStreak}`;
        
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        finalTimeEl.textContent = `${m}:${s}`;
        
        // Trigger overlay
        gameScreen.style.display = 'none';
        gameOverOverlay.classList.add('active');
        
        // Create full confetti on scorecard
        createConfetti();
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

    // Share Scorecard via html2canvas
    async function shareResults() {
        const target = document.getElementById('share-content');
        const originalShadow = target.style.boxShadow;
        target.style.boxShadow = 'none'; // Clean capture
        
        // Hide control action buttons during capture
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
                const file = new File([blob], 'madrasa-matching-score.png', { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: 'My Sound Matching Game Score!',
                    text: `Look at my score in the Sound Matching Game! I reached 150 points in ${finalTimeEl.textContent} with a streak of ${maxStreak}!`
                });
            } else {
                // Fallback: Download
                const link = document.createElement('a');
                link.download = 'sound-matching-score.png';
                link.href = image;
                link.click();
                alert("Scorecard downloaded! Share it with your friends.");
            }
        } catch (err) {
            console.error('Sharing failed:', err);
            target.style.boxShadow = originalShadow;
            actions.style.visibility = 'visible';
            alert("Sharing failed. Try taking a screenshot manually!");
        }
    }
    
    shareBtn.addEventListener('click', shareResults);

    // Initial setups
    createClouds();
});
