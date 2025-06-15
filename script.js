// Wacht tot de volledige HTML is geladen
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elementen --- //
    const gameContainer = document.getElementById('game-container');
    const scoreDisplay = document.getElementById('score');
    const agentNameDisplay = document.getElementById('agent-name-display');
    const screens = {
        intro: document.getElementById('intro-screen'),
        level: document.getElementById('level-screen'),
        end: document.getElementById('end-screen'),
    };
    const introTextElement = document.getElementById('intro-text');
    const agentNameInput = document.getElementById('agent-name-input');
    const startButton = document.getElementById('start-button');
    const levelTitle = document.getElementById('level-title');
    const levelContent = document.getElementById('level-content');
    const feedbackElement = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const finalAgentName = document.getElementById('final-agent-name');
    const finalScoreDisplay = document.getElementById('final-score');
    const highscoreList = document.getElementById('highscore-list');
    const restartButton = document.getElementById('restart-button');

    // --- Game State --- //
    let currentLevelIndex = -1;
    let score = 0;
    let agentName = "Nieuweling";
    let levelTasks = 0;
    let completedTasks = 0;
    let animationFrameId; // Voor het stoppen van de game loop

    // --- Verhaal & Level Data --- //
    const storyIntro = "Agent, welkom bij de Dalton Divisie. De kwaadaardige organisatie 'SILENT' dreigt al het geluid uit de wereld te stelen met hun 'Mute'-technologie. Jouw missie, mocht je die accepteren, is om hun operaties te saboteren. Agent Echo zal je begeleiden. Veel succes.";

    const levels = [
        // LEVEL 1: Theorie
        {
            title: "Missie 1: De Tussenstof",
            type: 'theory',
            questions: [
                 {
                    question: "Je zwemt onderwater en hoort de stem van een dolfijn diep in de zee. Door welke tussenstof verplaatst het geluid van de dolfijn zich naar jou toe?",
                    options: ["Lucht", "Aarde", "Water", "Vacuüm"],
                    answer: "Water"
                },
                {
                    question: "Een trainer roept de dolfijn met een fluitje vanaf de rand van het bassin. Door welke tussenstof(fen) verplaatst dit geluid zich om de dolfijn te bereiken?",
                    options: ["Alleen water", "Alleen lucht", "Eerst water, dan lucht", "Eerst lucht, dan water"],
                    answer: "Eerst lucht, dan water"
                }
            ]
        },
        // LEVEL 2: Speelbare Sonar Minigame
        {
            title: "Trainingsmissie: Sonar Operaties",
            type: 'minigame_only',
            init: initSonarGame,
            description: "Agent, SILENT heeft 3 onderzeeërs in dit gebied verstopt. Beweeg je schip met de pijltjestoetsen (links/rechts) en lanceer een sonar-ping met de spatiebalk. Vind alle onderzeeërs voordat je pings op zijn!",
        },
        // LEVEL 3: Frequentie
        {
            title: "Missie 3: Frequentie en Toonhoogte",
            type: 'theory_and_minigame',
            questions: [
                {
                    question: "Je analyseert een signaal. De tijdbasis van de oscilloscoop is ingesteld op 2 ms/div. Wat betekent 'div'?",
                    options: ["De totale tijd op het scherm", "De hoogte van de golf", "Eén horizontaal hokje op het scherm", "De frequentie"],
                    answer: "Eén horizontaal hokje op het scherm"
                }
            ],
            minigame: {
                title: "Minigame: Kraak de Code",
                init: initOscilloscopeMinigame,
                description: "Een geanimeerd oscilloscoopbeeld toont 2 trillingen over 8 horizontale hokjes. De tijdbasis is 2 ms/div. Hint: f = 1 / T. Bereken eerst de trillingstijd T voor één volledige golf.",
                question: "Bereken de frequentie (f) van deze toon in Hertz (Hz).",
                answer: "125"
            }
        }
    ];

    // --- Game Functies --- //

    function startGame() {
        agentName = agentNameInput.value || "Nieuweling";
        agentNameDisplay.textContent = agentName;
        score = 0;
        currentLevelIndex = 0;
        scoreDisplay.textContent = score;
        showScreen('level');
        loadLevel(levels[currentLevelIndex]);
    }
    
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    function animateText(element, text) {
        let i = 0;
        element.textContent = "";
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 30);
    }

    function loadLevel(levelData) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Stop vorige game loop
        }
        levelTitle.textContent = levelData.title;
        levelContent.innerHTML = '';
        nextButton.classList.add('hidden');
        feedbackElement.classList.remove('show');
        
        completedTasks = 0;
        levelTasks = (levelData.questions ? levelData.questions.length : 0) + (levelData.minigame ? 1 : 0);
        if (levelData.type === 'minigame_only') {
            levelTasks = 1;
        }

        if (levelData.type === 'theory' || levelData.type === 'theory_and_minigame') {
             levelData.questions.forEach((q) => {
                const questionEl = createQuestionElement(q);
                levelContent.appendChild(questionEl);
            });
        }
       
        if (levelData.type === 'theory_and_minigame' && levelData.minigame) {
            const minigameEl = createMinigameInputElement(levelData.minigame);
            levelContent.appendChild(minigameEl);
        }

        if (levelData.type === 'minigame_only') {
            const minigameEl = createStandaloneMinigameElement(levelData);
            levelContent.appendChild(minigameEl);
            // Roep de init functie aan, die de event listeners zal opzetten
            if (typeof levelData.init === 'function') {
                 setTimeout(() => {
                    const canvas = document.getElementById('minigame-canvas');
                    if (canvas) {
                        levelData.init(canvas, minigameFinished);
                    }
                }, 0);
            }
        }
    }

    function createQuestionElement(questionData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        container.innerHTML = `<p>${questionData.question}</p>`;

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        questionData.options.forEach(optionText => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.textContent = optionText;
            optionEl.addEventListener('click', () => checkAnswer(optionEl, questionData.answer, container));
            optionsContainer.appendChild(optionEl);
        });

        container.appendChild(optionsContainer);
        return container;
    }
    
    function createMinigameInputElement(minigameData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        
        let contentHTML = `
            <h3>${minigameData.title}</h3>
            <p>${minigameData.description}</p>
            <canvas id="minigame-canvas" class="level-canvas" width="500" height="300"></canvas>
            <p><strong>${minigameData.question}</strong></p>
        `;
        
        container.innerHTML = contentHTML;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'minigame-input';
        input.setAttribute('placeholder', 'Jouw antwoord...');
        container.appendChild(input);
        
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = 'Controleer Antwoord';
        button.addEventListener('click', () => checkMinigameAnswer(input, minigameData.answer, container));
        container.appendChild(button);
        
        if (typeof minigameData.init === 'function') {
            setTimeout(() => {
                const canvas = document.getElementById('minigame-canvas');
                if(canvas) minigameData.init(canvas);
            }, 0);
        }
        
        return container;
    }

    function createStandaloneMinigameElement(levelData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        container.innerHTML = `
            <p>${levelData.description}</p>
            <canvas id="minigame-canvas" class="level-canvas" width="800" height="500"></canvas>
            <div id="game-stats" style="text-align:center; font-size: 1.2em; margin-top: 10px;"></div>
        `;
        return container;
    }

    function taskCompleted(taskContainer, isCorrect) {
        if (taskContainer && taskContainer.classList.contains('completed')) return;
        
        if(taskContainer) taskContainer.classList.add('completed');
        
        if (isCorrect) completedTasks++;
        else completedTasks++; // Poging telt ook als voltooid
        
        checkLevelCompletion();
    }
    
    function checkAnswer(selectedOption, correctAnswer, questionContainer) {
        const options = questionContainer.querySelectorAll('.option');
        if (questionContainer.classList.contains('completed')) return;

        let isCorrect = false;
        options.forEach(opt => opt.style.pointerEvents = 'none');

        if (selectedOption.textContent === correctAnswer) {
            showFeedback('Correct! +100 punten', 'correct');
            updateScore(100);
            selectedOption.classList.add('correct');
            isCorrect = true;
        } else {
            showFeedback('Helaas, dat is niet correct.', 'incorrect');
            selectedOption.classList.add('wrong');
            options.forEach(opt => {
                if(opt.textContent === correctAnswer) opt.classList.add('correct');
            });
        }
        taskCompleted(questionContainer, isCorrect);
    }
    
    function checkMinigameAnswer(inputElement, correctAnswer, gameContainer) {
        if (gameContainer.classList.contains('completed')) return;
        
        let isCorrect = false;
        inputElement.disabled = true;
        
        if(inputElement.value.trim() === correctAnswer) {
            showFeedback('Uitstekend werk, Agent! +250 punten', 'correct');
            updateScore(250);
            inputElement.style.borderColor = 'var(--primary-green)';
            isCorrect = true;
        } else {
            showFeedback(`Incorrect. Het juiste antwoord was ${correctAnswer}.`, 'incorrect');
            inputElement.style.borderColor = '#8b0000';
        }
        taskCompleted(gameContainer, isCorrect);
    }

    function minigameFinished(points, message, messageType) {
        showFeedback(message, messageType);
        updateScore(points);
        const container = levelContent.querySelector('.task-container');
        taskCompleted(container, true);
    }
    
    function checkLevelCompletion() {
        if (completedTasks >= levelTasks) {
            nextButton.classList.remove('hidden');
        }
    }

    function nextLevel() {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) {
            loadLevel(levels[currentLevelIndex]);
        } else {
            endGame();
        }
    }

    function showFeedback(message, type) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message ${type} show`;
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }
    
    function endGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        finalAgentName.textContent = agentName;
        finalScoreDisplay.textContent = score;
        saveAndShowHighscores();
        showScreen('end');
    }

    function saveAndShowHighscores() {
        const highscores = JSON.parse(localStorage.getItem('daltonHighscores')) || [];
        highscores.push({ name: agentName, score: score });
        highscores.sort((a, b) => b.score - a.score);
        const top5 = highscores.slice(0, 5);
        localStorage.setItem('daltonHighscores', JSON.stringify(top5));

        highscoreList.innerHTML = '';
        top5.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name} - ${entry.score} punten`;
            highscoreList.appendChild(li);
        });
    }
    
    function restartGame() {
        currentLevelIndex = -1;
        showScreen('intro');
        animateText(introTextElement, storyIntro);
     }

    // --- CANVAS MINIGAME FUNCTIES --- //
    
    function drawGrid(ctx, width, height, divSize) {
        ctx.strokeStyle = "rgba(50, 205, 50, 0.2)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += divSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += divSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    // Playable Sonar Minigame
    function initSonarGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const statsEl = document.getElementById('game-stats');

        let ship = { x: width / 2 - 40, y: 10, width: 80, height: 20, speed: 10 };
        let subs = [];
        let pings = [];
        let pingsLeft = 5;
        let subsFound = 0;
        const totalSubs = 3;

        // Create subs at random positions
        for (let i = 0; i < totalSubs; i++) {
            subs.push({
                x: Math.random() * (width - 60),
                y: height - 40 - (Math.random() * 80),
                width: 60,
                height: 15,
                found: false
            });
        }

        let keys = {};
        window.addEventListener('keydown', (e) => keys[e.code] = true);
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') firePing();
            delete keys[e.code];
        });

        function firePing() {
            if (pingsLeft > 0) {
                pingsLeft--;
                pings.push({ x: ship.x + ship.width / 2, y: ship.y + ship.height, radius: 10, speed: 3, maxRadius: width });
            }
        }

        function update() {
            // Move ship
            if (keys['ArrowLeft'] && ship.x > 0) ship.x -= ship.speed;
            if (keys['ArrowRight'] && ship.x < width - ship.width) ship.x += ship.speed;

            // Update pings and check for collision
            pings.forEach((ping, p_index) => {
                ping.radius += ping.speed;
                subs.forEach((sub) => {
                    if (!sub.found) {
                        // Collision check
                        let distX = Math.abs(ping.x - sub.x - sub.width / 2);
                        let distY = Math.abs(ping.y - sub.y - sub.height / 2);

                        if (distX > (sub.width / 2 + ping.radius)) return;
                        if (distY > (sub.height / 2 + ping.radius)) return;

                        if (distX <= (sub.width / 2) || distY <= (sub.height / 2)) {
                            sub.found = true;
                            subsFound++;
                        }
                    }
                });
                if (ping.radius > ping.maxRadius) pings.splice(p_index, 1);
            });
        }

        function draw() {
            // Draw sea
            ctx.fillStyle = '#001f3f';
            ctx.fillRect(0, 0, width, height);

            // Draw ship
            ctx.fillStyle = '#E0E0E0';
            ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
            ctx.fillRect(ship.x + 20, ship.y - 10, 40, 10);

            // Draw pings
            pings.forEach(ping => {
                ctx.strokeStyle = 'var(--accent-lime-green)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
                ctx.stroke();
            });

            // Draw subs (if found)
            subs.forEach(sub => {
                if (sub.found) {
                    ctx.fillStyle = '#c0c0c0';
                    ctx.fillRect(sub.x, sub.y, sub.width, sub.height);
                }
            });
            
            // Update stats
            statsEl.textContent = `Pings Over: ${pingsLeft} | Onderzeeërs Gevonden: ${subsFound} / ${totalSubs}`;
        }

        function gameLoop() {
            update();
            draw();

            if (subsFound === totalSubs) {
                const points = pingsLeft * 50 + 200; // Bonus for leftover pings
                onComplete(points, `Alle onderzeeërs gevonden! Missie geslaagd. +${points} punten.`, 'correct');
                return; // Stop loop
            }
            if (pingsLeft === 0 && pings.length === 0) {
                 onComplete(0, 'Geen pings meer over. Missie gefaald.', 'incorrect');
                 return; // Stop loop
            }
            
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        gameLoop();
    }
    
    function initOscilloscopeMinigame(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const divSize = width / 10;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        drawGrid(ctx, width, height, divSize);

        ctx.beginPath();
        ctx.strokeStyle = 'var(--accent-lime-green)';
        ctx.lineWidth = 2;
        const centerY = height / 2;
        const amplitude = height / 4;
        const waveLength = 4 * divSize;

        for (let x = 0; x < width; x++) {
            const angle = (x / waveLength) * 2 * Math.PI;
            const y = centerY - Math.sin(angle) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // --- Event Listeners --- //
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextLevel);
    restartButton.addEventListener('click', restartGame);

    // --- Initialisatie --- //
    animateText(introTextElement, storyIntro);
});
