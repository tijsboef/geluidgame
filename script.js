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
        // LEVEL 1: Theorie en berekening
        {
            title: "Missie 1: De Tussenstof & Sonar Basis",
            type: 'theory_and_minigame',
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
            ],
            minigame: {
                title: "Analyse: Sonar Echo",
                init: null, // Geen canvas nodig voor deze
                description: "We hebben een SILENT-basis gedetecteerd op de zeebodem. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s. Hint: tijd = afstand / snelheid. Denk eraan: het signaal gaat heen én terug!",
                question: "Bereken de totale reistijd van ons sonarsignaal in seconden.",
                answer: "3"
            }
        },
        // LEVEL 2: Speelbare Sonar Minigame
        {
            title: "Trainingsmissie: Actieve Sonar",
            type: 'minigame_only',
            init: initSonarGame,
            description: "Goed werk, agent. Nu je de theorie kent, is het tijd voor een praktijktest. SILENT drones verstoppen zich achter rotsformaties. Gebruik je sonar (spatiebalk) om de zeebodem in kaart te brengen en de 3 drones te vinden. Beweeg je schip met de pijltjestoetsen.",
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
        `;
        
        if(minigameData.init) {
             contentHTML += `<canvas id="minigame-canvas" class="level-canvas" width="500" height="300"></canvas>`;
        }
       
        contentHTML += `<p><strong>${minigameData.question}</strong></p>`;
        
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
            <div id="game-stats" style="display: flex; justify-content: space-between; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px; margin-top: 10px;">
                <span id="ping-counter"></span>
                <span id="drone-counter"></span>
                <span id="echo-info" style="font-style: italic;"></span>
            </div>
        `;
        return container;
    }

    function taskCompleted(taskContainer, isCorrect) {
        if (taskContainer && taskContainer.classList.contains('completed')) return;
        
        if(taskContainer) taskContainer.classList.add('completed');
        
        if (isCorrect) completedTasks++;
        else completedTasks++;
        
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
        const pingCounterEl = document.getElementById('ping-counter');
        const droneCounterEl = document.getElementById('drone-counter');
        const echoInfoEl = document.getElementById('echo-info');

        let ship = { x: width / 2 - 40, y: 10, width: 80, height: 20, speed: 10 };
        let drones = [];
        let rocks = [];
        let pings = [];
        let pingsLeft = 8;
        let dronesFound = 0;
        const totalDrones = 3;

        // Create obstacles
        for(let i=0; i<5; i++) {
             rocks.push({
                x: Math.random() * (width - 100),
                y: height - 150 - (Math.random() * 200),
                width: 80 + Math.random() * 50,
                height: 40 + Math.random() * 40,
                found: false
            });
        }
        // Create drones, ensuring they don't overlap with rocks
        for (let i = 0; i < totalDrones; i++) {
            drones.push({
                x: Math.random() * (width - 60),
                y: height - 80 - (Math.random() * 100),
                width: 60,
                height: 15,
                found: false
            });
        }
        
        let keys = {};
        const keydownHandler = (e) => keys[e.code] = true;
        const keyupHandler = (e) => {
            if (e.code === 'Space') firePing();
            delete keys[e.code];
        };
        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);

        function firePing() {
            if (pingsLeft > 0 && pings.length === 0) { // Only one ping at a time
                pingsLeft--;
                let newPing = { 
                    x: ship.x + ship.width / 2, 
                    y: ship.y + ship.height, 
                    radius: 10, 
                    speed: 3, 
                    maxRadius: width,
                    hit: false
                };
                pings.push(newPing);
                echoInfoEl.textContent = "Sonar ping verstuurd...";
            }
        }

        function update() {
            if (keys['ArrowLeft'] && ship.x > 0) ship.x -= ship.speed;
            if (keys['ArrowRight'] && ship.x < width - ship.width) ship.x += ship.speed;

            pings.forEach((ping, p_index) => {
                ping.radius += ping.speed;
                
                // Check collision with drones
                drones.forEach((drone) => {
                    if (!drone.found && checkCollision(ping, drone)) {
                        drone.found = true;
                        dronesFound++;
                        ping.hit = true;
                        echoInfoEl.textContent = "Echo: SILENT drone gelokaliseerd!";
                    }
                });

                // Check collision with rocks
                rocks.forEach((rock) => {
                    if (!rock.found && checkCollision(ping, rock)) {
                        rock.found = true;
                        ping.hit = true;
                        echoInfoEl.textContent = "Echo: Rotsformatie gedetecteerd.";
                    }
                });

                if (ping.radius > ping.maxRadius) {
                    if(!ping.hit) {
                        echoInfoEl.textContent = "Echo: Geen objecten gedetecteerd.";
                    }
                    pings.splice(p_index, 1);
                }
            });
        }
        
        function checkCollision(ping, object) {
            let distX = Math.abs(ping.x - object.x - object.width / 2);
            let distY = Math.abs(ping.y - object.y - object.height / 2);

            if (distX > (object.width / 2 + ping.radius)) { return false; }
            if (distY > (object.height / 2 + ping.radius)) { return false; }

            if (distX <= (object.width / 2)) { return true; } 
            if (distY <= (object.height / 2)) { return true; }

            let dx = distX - object.width/2;
            let dy = distY - object.height/2;
            return (dx*dx + dy*dy <= (ping.radius*ping.radius));
        }

        function draw() {
            ctx.fillStyle = '#001f3f';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#E0E0E0';
            ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
            ctx.fillRect(ship.x + 20, ship.y - 10, 40, 10);

            pings.forEach(ping => {
                ctx.strokeStyle = 'var(--accent-lime-green)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
                ctx.stroke();
            });

            rocks.forEach(rock => {
                if (rock.found) {
                    ctx.fillStyle = '#5D4037'; // Dark brown
                    ctx.fillRect(rock.x, rock.y, rock.width, rock.height);
                }
            });

            drones.forEach(drone => {
                if (drone.found) {
                    ctx.fillStyle = '#c0c0c0'; // Silver
                    ctx.fillRect(drone.x, drone.y, drone.width, drone.height);
                }
            });
            
            pingCounterEl.textContent = `Pings Over: ${pingsLeft}`;
            droneCounterEl.textContent = `Drones Gevonden: ${dronesFound} / ${totalDrones}`;
        }

        function cleanup() {
            window.removeEventListener('keydown', keydownHandler);
            window.removeEventListener('keyup', keyupHandler);
            cancelAnimationFrame(animationFrameId);
        }

        function gameLoop() {
            update();
            draw();

            if (dronesFound === totalDrones) {
                const points = pingsLeft * 50 + 200;
                cleanup();
                onComplete(points, `Alle drones gevonden! Systeem gekalibreerd. +${points} punten.`, 'correct');
                return; 
            }
            if (pingsLeft === 0 && pings.length === 0) {
                 cleanup();
                 onComplete(0, 'Kalibratie gefaald. Geen pings meer over.', 'incorrect');
                 return;
            }
            
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        echoInfoEl.textContent = "Wacht op commando...";
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
