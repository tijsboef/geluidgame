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
        // Missie 1
        {
            title: "Missie 1: De Tussenstof & Sonar Basis",
            type: 'theory_and_minigame',
            questions: [
                { question: "Je zwemt onderwater en hoort de stem van een dolfijn diep in de zee. Door welke tussenstof verplaatst het geluid zich naar jou toe?", options: ["Lucht", "Aarde", "Water", "Vacuüm"], answer: "Water" },
                { question: "Een trainer roept de dolfijn met een fluitje vanaf de rand van het bassin. Door welke tussenstof(fen) verplaatst dit geluid zich om de dolfijn te bereiken?", options: ["Alleen water", "Alleen lucht", "Eerst water, dan lucht", "Eerst lucht, dan water"], answer: "Eerst lucht, dan water" }
            ],
            minigame: {
                title: "Analyse: Sonar Echo", init: null,
                description: "We hebben een SILENT-basis gedetecteerd op de zeebodem. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s.",
                question: "Bereken de totale reistijd van ons sonarsignaal in seconden.",
                answer: 3,
                hint: "tijd = afstand / snelheid. Let op: het signaal moet heen én terug, dus de totale afstand is 2 x 2250 m."
            }
        },
        // Training 1
        {
            title: "Trainingsmissie 1: Actieve Sonar", type: 'minigame_only', init: initSonarGame,
            description: "Goed werk. Tijd voor een praktijktest. SILENT drones verstoppen zich achter rotsformaties. Let op: je sonar detecteert per ping maar één object. Gebruik de info van elke echo om de 3 drones te vinden. Beweeg met de pijltjestoetsen, ping met de spatiebalk.",
        },
        // Missie 2
        {
            title: "Missie 2: Frequentie en Toonhoogte",
            type: 'theory_and_minigame',
            questions: [
                { question: "Je analyseert een signaal. De tijdbasis van de oscilloscoop is ingesteld op 2 ms/div. Wat betekent 'div'?", options: ["De totale tijd op het scherm", "De hoogte van de golf", "Eén horizontaal hokje op het scherm", "De frequentie"], answer: "Eén horizontaal hokje op het scherm" }
            ],
            minigame: {
                title: "Analyse: Kraak de Code", init: initOscilloscopeMinigame,
                description: "Een geanimeerd oscilloscoopbeeld toont 2 trillingen over 10 horizontale hokjes. De tijdbasis is 2 ms/div.",
                question: "Bereken de frequentie (f) van deze toon in Hertz (Hz).",
                answer: 100,
                hint: "Eén trilling (T) is 5 hokjes lang (10 hokjes / 2 trillingen). De tijd per hokje is 2 ms. Dus T = 5 * 2 = 10 ms. De frequentie f = 1 / T. Vergeet niet ms om te rekenen naar s."
            }
        },
        // Training 2
        {
            title: "Trainingsmissie 2: Frequentie Matchen", type: 'minigame_only', init: initFrequencyMatchGame,
            description: "Agent, we onderscheppen een gecodeerd SILENT-signaal. Match de frequentie van jouw zender (de onderste golf) met het doel-signaal (de bovenste, groene golf). Gebruik de knoppen om je frequentie aan te passen. Voltooi 3 rondes."
        },
        // Missie 3
        {
            title: "Missie 3: Geluidssterkte",
            type: 'theory_with_canvas',
            canvasPreamble: initAmplitudeComparison,
            questions: [
                { question: "Welke golf in de animatie hierboven is het sterkst (heeft de grootste amplitude)?", options: ['P', 'Q'], answer: 'Q' },
                { question: "Welke golf in de animatie hierboven heeft de hoogste toon (de hoogste frequentie)?", options: ['P', 'Q'], answer: 'Q' }
            ],
            minigame: {
                title: "Analyse: Supporters Inschatten", init: null,
                description: "500 van onze supporters produceren 75 dB. Een vijandelijke menigte produceert 93 dB.",
                question: "Hoeveel supporters van SILENT juichen er?",
                options: ["4.000", "16.000", "32.000", "64.000"],
                answer: "32.000",
                hint: "Het verschil is 93 - 75 = 18 dB. Elke +3 dB is een verdubbeling. Hoe vaak past 3 in 18? Dat is 6 keer. Je moet het aantal supporters dus 6 keer verdubbelen."
            }
        },
        // Training 3
        {
            title: "Trainingsmissie 3: Stoorzenders Plaatsen", type: 'minigame_only', init: initJammerGame,
            description: "We moeten een belangrijke boodschap versturen, maar SILENT luistert mee. Sleep onze 3 stoorzenders naar strategische locaties op de kaart om het signaal bij de SILENT-basis te verzwakken tot onder de 20 dB."
        },
        // Missie 4
        {
            title: "Missie 4: Geluidshinder Bestrijden",
            type: 'theory_and_minigame',
            questions: [
                { question: "Selecteer twee manieren om de geluidshinder van verkeer bij de BRON aan te pakken.", type: 'multi_choice', options: ["Huizen extra goed isoleren", "Stiller asfalt aanleggen", "Een geluidswal plaatsen", "De maximumsnelheid verlagen"], answer: ["Stiller asfalt aanleggen", "De maximumsnelheid verlagen"] }
            ],
             minigame: {
                title: "Analyse: Geluidsmaatregelen", init: null, type: 'drag_drop',
                question: "Sleep de eigenschappen naar de juiste maatregel.",
                categories: ['Geluidsscherm', 'Geluidswal'],
                items: [
                    { text: "Bestaat uit aarde, vaak begroeid", answer: 'Geluidswal' },
                    { text: "Kaatst geluid terug", answer: 'Geluidsscherm' },
                    { text: "Absorbeert geluid beter", answer: 'Geluidswal' },
                    { text: "Heeft meer bouwruimte nodig", answer: 'Geluidswal' }
                ]
            }
        },
         // Training 4
        {
            title: "Trainingsmissie 4: Gehoorbescherming", type: 'minigame_only', init: initHearingProtectionGame,
            description: "Je infiltreert een luidruchtig SILENT-evenement. Gevaarlijke geluidsgolven (rood) komen op je af. Beweeg met de pijltjestoetsen om ze te ontwijken en verzamel gehoorbeschermers (groen) om je gehoorschade te herstellen."
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
            cancelAnimationFrame(animationFrameId);
        }
        levelTitle.textContent = levelData.title;
        levelContent.innerHTML = '';
        nextButton.classList.add('hidden');
        feedbackElement.classList.remove('show');
        
        completedTasks = 0;
        let questionCount = levelData.questions ? levelData.questions.length : 0;
        let minigameCount = levelData.minigame ? 1 : 0;
        if (levelData.type === 'minigame_only') minigameCount = 1;
        levelTasks = questionCount + minigameCount;
        
        if (levelData.canvasPreamble) {
            levelData.canvasPreamble(levelContent);
        }

        if (levelData.questions) {
             levelData.questions.forEach((q) => {
                const questionEl = createQuestionElement(q);
                levelContent.appendChild(questionEl);
            });
        }
       
        if (levelData.minigame) {
            const minigameEl = createMinigameInputElement(levelData.minigame);
            levelContent.appendChild(minigameEl);
        }

        if (levelData.type === 'minigame_only') {
            const minigameEl = createStandaloneMinigameElement(levelData);
            levelContent.appendChild(minigameEl);
            if (typeof levelData.init === 'function') {
                 setTimeout(() => {
                    const canvas = document.getElementById('minigame-canvas');
                    if (canvas) levelData.init(canvas, minigameFinished);
                }, 0);
            }
        }
    }
    
    // --- Functies voor het maken van elementen --- //
    
    function createQuestionElement(questionData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        container.innerHTML = `<p>${questionData.question}</p>`;
        
        if (questionData.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            if (questionData.type === 'multi_choice') {
                container.innerHTML += `<p><small>Selecteer alle juiste antwoorden en klik op 'Bevestig'.</small></p>`;
                questionData.options.forEach(optionText => {
                    const optionEl = document.createElement('div');
                    optionEl.className = 'option multi';
                    optionEl.textContent = optionText;
                    optionEl.addEventListener('click', () => optionEl.classList.toggle('selected'));
                    optionsContainer.appendChild(optionEl);
                });
                const submitBtn = document.createElement('button');
                submitBtn.textContent = 'Bevestig Selectie';
                submitBtn.className = 'btn';
                submitBtn.onclick = () => checkMultiChoiceAnswer(optionsContainer, questionData.answer, container);
                optionsContainer.appendChild(submitBtn);

            } else {
                 questionData.options.forEach(optionText => {
                    const optionEl = document.createElement('div');
                    optionEl.className = 'option';
                    optionEl.textContent = optionText;
                    optionEl.addEventListener('click', () => checkAnswer(optionEl, questionData.answer, container));
                    optionsContainer.appendChild(optionEl);
                });
            }
            container.appendChild(optionsContainer);
        }

        return container;
    }

     function createMinigameInputElement(minigameData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        
        let contentHTML = `<h3>${minigameData.title}</h3><p>${minigameData.description}</p>`;
        
        if(minigameData.init) {
             contentHTML += `<canvas id="minigame-canvas" class="level-canvas" width="500" height="300"></canvas>`;
        }
        
        if (minigameData.question) {
             contentHTML += `<p><strong>${minigameData.question}</strong></p>`;
        }
        
        container.innerHTML = contentHTML;

        // Hint Knop
        if (minigameData.hint) {
            const hintBtn = document.createElement('button');
            hintBtn.textContent = "Hint (-100 punten)";
            hintBtn.className = 'btn hint-btn';
            hintBtn.onclick = () => {
                updateScore(-100);
                showFeedback(minigameData.hint, 'incorrect');
                hintBtn.disabled = true;
                hintBtn.style.opacity = '0.5';
            };
            container.appendChild(hintBtn);
        }

        if (minigameData.type === 'drag_drop') {
            const ddContainer = document.createElement('div');
            ddContainer.className = 'drag-drop-container';
            const itemsPool = document.createElement('div');
            itemsPool.className = 'items-pool';
            itemsPool.innerHTML = `<h4>Sleepbare Items:</h4>`;
            const dropZones = document.createElement('div');
            dropZones.className = 'drop-zones';
            minigameData.categories.forEach(cat => { const zone = document.createElement('div'); zone.className = 'drop-zone'; zone.dataset.category = cat; zone.innerHTML = `<h5>${cat}</h5>`; dropZones.appendChild(zone); });
            minigameData.items.forEach((item, index) => { const el = document.createElement('div'); el.className = 'draggable'; el.textContent = item.text; el.draggable = true; el.id = `drag-${index}`; el.dataset.answer = item.answer; itemsPool.appendChild(el); });
            ddContainer.appendChild(itemsPool); ddContainer.appendChild(dropZones); container.appendChild(ddContainer);
            const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Controleer Plaatsing'; btn.onclick = () => checkDragDropAnswer(ddContainer, container); container.appendChild(btn);
            setTimeout(() => {
                const draggables = container.querySelectorAll('.draggable'), zones = container.querySelectorAll('.drop-zone');
                draggables.forEach(draggable => { draggable.addEventListener('dragstart', () => draggable.classList.add('dragging')); draggable.addEventListener('dragend', () => draggable.classList.remove('dragging')); });
                zones.forEach(zone => { zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('hover'); }); zone.addEventListener('dragleave', () => zone.classList.remove('hover')); zone.addEventListener('drop', e => { e.preventDefault(); const draggable = document.querySelector('.dragging'); zone.appendChild(draggable); zone.classList.remove('hover'); }); });
            }, 0);
        } else if (minigameData.options) {
             const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
             minigameData.options.forEach(optionText => { const optionEl = document.createElement('div'); optionEl.className = 'option'; optionEl.textContent = optionText; optionEl.addEventListener('click', () => checkAnswer(optionEl, minigameData.answer, container)); optionsContainer.appendChild(optionEl); });
            container.appendChild(optionsContainer);
        } else {
            const input = document.createElement('input'); input.type = 'text'; input.id = 'minigame-input'; input.setAttribute('placeholder', 'Jouw antwoord...'); container.appendChild(input);
            const button = document.createElement('button'); button.className = 'btn'; button.textContent = 'Controleer Antwoord'; button.addEventListener('click', () => checkMinigameAnswer(input, minigameData.answer, container)); container.appendChild(button);
        }
        
        if (typeof minigameData.init === 'function') { setTimeout(() => { const canvas = document.getElementById('minigame-canvas'); if(canvas) minigameData.init(canvas); }, 0); }
        return container;
    }
    
    function createStandaloneMinigameElement(levelData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        container.innerHTML = `<p>${levelData.description}</p><canvas id="minigame-canvas" class="level-canvas" width="800" height="500"></canvas>`;
        
        const statsContainer = document.createElement('div');
        statsContainer.id = 'game-stats';
        statsContainer.style.display = 'flex';
        statsContainer.style.justifyContent = 'space-between';
        statsContainer.style.padding = '10px';
        statsContainer.style.background = 'rgba(0,0,0,0.3)';
        statsContainer.style.borderRadius = '5px';
        statsContainer.style.marginTop = '10px';
        
        statsContainer.innerHTML = `<span id="stat1"></span><span id="stat2"></span><span id="stat3" style="font-style: italic;"></span>`;
        
        container.appendChild(statsContainer);

        // Voeg specifieke UI-elementen toe voor bepaalde games
        if(levelData.init === initFrequencyMatchGame) {
            const controls = document.createElement('div');
            controls.style.textAlign = 'center';
            controls.style.padding = '10px';
            controls.innerHTML = `
                <button id="freq-down-btn" class="btn">- Freq</button>
                <button id="freq-up-btn" class="btn">+ Freq</button>
            `;
            container.appendChild(controls);
        }

        return container;
    }

    // --- Controleer antwoord functies --- //

    function normalizeAnswer(input) {
        if (typeof input !== 'string') return input;
        return parseFloat(input.replace(',', '.').trim());
    }

    function checkAnswer(selectedOption, correctAnswer, questionContainer) {
        if (questionContainer.classList.contains('completed')) return;
        const options = questionContainer.querySelectorAll('.option');
        let isCorrect = selectedOption.textContent === correctAnswer;
        options.forEach(opt => { opt.style.pointerEvents = 'none'; if(opt.textContent === correctAnswer) opt.classList.add('correct'); else if(opt.classList.contains('selected')) opt.classList.add('wrong'); });
        if (isCorrect) { showFeedback('Correct! +100 punten', 'correct'); updateScore(100); } else { showFeedback('Helaas, dat is niet correct.', 'incorrect'); }
        taskCompleted(questionContainer, isCorrect);
    }
    
    function checkMultiChoiceAnswer(optionsContainer, correctAnswers, taskContainer) {
        if (taskContainer.classList.contains('completed')) return;
        let correctSelections = 0, incorrectSelections = 0;
        optionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            const isCorrect = correctAnswers.includes(opt.textContent), isSelected = opt.classList.contains('selected');
            if (isSelected && isCorrect) { opt.classList.add('correct'); correctSelections++; } 
            else if (isSelected && !isCorrect) { opt.classList.add('wrong'); incorrectSelections++; } 
            else if (!isSelected && isCorrect) { opt.classList.add('wrong'); }
        });
        const points = Math.max(0, (correctSelections * 75) - (incorrectSelections * 25));
        if (points > 0) { showFeedback(`Gedeeltelijk correct! +${points} punten`, 'correct'); updateScore(points); } 
        else { showFeedback('Helaas, geen punten gescoord.', 'incorrect'); }
        taskCompleted(taskContainer, points > 0);
    }

     function checkDragDropAnswer(ddContainer, taskContainer) {
        if (taskContainer.classList.contains('completed')) return;
        let correctPlacements = 0;
        const zones = ddContainer.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            const category = zone.dataset.category;
            const items = zone.querySelectorAll('.draggable');
            items.forEach(item => { item.style.pointerEvents = 'none'; if (item.dataset.answer === category) { item.style.backgroundColor = 'var(--primary-green)'; correctPlacements++; } else { item.style.backgroundColor = '#8b0000'; } });
        });
        const points = correctPlacements * 50;
        if (points > 0) { showFeedback(`Goed werk! ${correctPlacements} items correct geplaatst. +${points} punten`, 'correct'); updateScore(points); } 
        else { showFeedback('Geen items correct geplaatst.', 'incorrect'); }
        taskCompleted(taskContainer, points > 0);
    }

    function checkMinigameAnswer(inputElement, correctAnswer, gameContainer) {
        if (gameContainer.classList.contains('completed')) return;
        inputElement.disabled = true;
        const userAnswerNorm = normalizeAnswer(inputElement.value), correctAnswerNorm = normalizeAnswer(correctAnswer);
        const isCorrect = userAnswerNorm === correctAnswerNorm;
        if (isCorrect) { showFeedback('Uitstekend werk, Agent! +250 punten', 'correct'); updateScore(250); inputElement.style.borderColor = 'var(--primary-green)'; } 
        else { showFeedback(`Incorrect. Het juiste antwoord was ${correctAnswer}.`, 'incorrect'); inputElement.style.borderColor = '#8b0000'; }
        taskCompleted(gameContainer, isCorrect);
    }
    
    // --- Algemene Game Flow --- //
    
    function taskCompleted(taskContainer, isCorrect) {
        if (taskContainer && taskContainer.classList.contains('completed')) return;
        if(taskContainer) taskContainer.classList.add('completed');
        completedTasks++;
        checkLevelCompletion();
    }
    
    function minigameFinished(partialScore, message, messageType) {
        showFeedback(message, messageType);
        updateScore(partialScore);
        const container = levelContent.querySelector('.task-container');
        taskCompleted(container, true);
    }
    
    function checkLevelCompletion() {
        if (completedTasks >= levelTasks) nextButton.classList.remove('hidden');
    }

    function nextLevel() {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) loadLevel(levels[currentLevelIndex]);
        else endGame();
    }

    function showFeedback(message, type) { feedbackElement.textContent = message; feedbackElement.className = `feedback-message ${type} show`; }
    function updateScore(points) { score += points; scoreDisplay.textContent = score; }
    
    function endGame() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        finalAgentName.textContent = agentName; finalScoreDisplay.textContent = score;
        saveAndShowHighscores(); showScreen('end');
    }

    function saveAndShowHighscores() {
        const highscores = JSON.parse(localStorage.getItem('daltonHighscores')) || [];
        highscores.push({ name: agentName, score: score });
        highscores.sort((a, b) => b.score - a.score); const top5 = highscores.slice(0, 5);
        localStorage.setItem('daltonHighscores', JSON.stringify(top5));
        highscoreList.innerHTML = ''; top5.forEach(entry => { const li = document.createElement('li'); li.textContent = `${entry.name} - ${entry.score} punten`; highscoreList.appendChild(li); });
    }
    
    function restartGame() { currentLevelIndex = -1; showScreen('intro'); animateText(introTextElement, storyIntro); }

    // --- CANVAS MINIGAME FUNCTIES --- //
    
    function drawGrid(ctx, width, height, divSize) {
        ctx.strokeStyle = "rgba(50, 205, 50, 0.2)"; ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += divSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
        for (let y = 0; y <= height; y += divSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    }
    
    function initSonarGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let ship = { x: width / 2 - 40, y: 10, width: 80, height: 20, speed: 10 }, drones = [], rocks = [], pings = [], pingsLeft = 8, dronesFound = 0, totalDrones = 3;
        for(let i=0; i<5; i++) { rocks.push({ x: Math.random() * (width - 100), y: height - 150 - (Math.random() * 200), width: 80 + Math.random() * 50, height: 40 + Math.random() * 40, found: false }); }
        for (let i = 0; i < totalDrones; i++) { drones.push({ x: Math.random() * (width - 60), y: height - 80 - (Math.random() * 100), width: 60, height: 15, found: false });}
        let keys = {}, keydownHandler = (e) => keys[e.code] = true, keyupHandler = (e) => { if (e.code === 'Space') firePing(); delete keys[e.code]; };
        window.addEventListener('keydown', keydownHandler); window.addEventListener('keyup', keyupHandler);
        function firePing() { if (pingsLeft > 0 && pings.length === 0) { pingsLeft--; pings.push({ x: ship.x + ship.width / 2, y: ship.y + ship.height, radius: 10, speed: 3, maxRadius: width, hit: false }); stat3.textContent = "Sonar ping verstuurd..."; } }
        function update() {
            if (keys['ArrowLeft'] && ship.x > 0) ship.x -= ship.speed; if (keys['ArrowRight'] && ship.x < width - ship.width) ship.x += ship.speed;
            pings.forEach((ping, p_index) => {
                ping.radius += ping.speed;
                if (!ping.hit) {
                    for (const drone of drones) { if (!drone.found && checkCollision(ping, drone)) { drone.found = true; dronesFound++; ping.hit = true; stat3.textContent = "Echo: SILENT drone gelokaliseerd!"; break; }}
                    if (!ping.hit) { for (const rock of rocks) { if (!rock.found && checkCollision(ping, rock)) { rock.found = true; ping.hit = true; stat3.textContent = "Echo: Rotsformatie gedetecteerd."; break; }}}
                }
                if (ping.radius > ping.maxRadius) { if(!ping.hit) { stat3.textContent = "Echo: Geen objecten gedetecteerd."; } pings.splice(p_index, 1); }
            });
        }
        function checkCollision(ping, object) { let distX = Math.abs(ping.x - object.x - object.width / 2), distY = Math.abs(ping.y - object.y - object.height / 2); if (distX > (object.width / 2 + ping.radius)) { return false; } if (distY > (object.height / 2 + ping.radius)) { return false; } if (distX <= (object.width / 2)) { return true; } if (distY <= (object.height / 2)) { return true; } let dx = distX - object.width/2, dy = distY - object.height/2; return (dx*dx + dy*dy <= (ping.radius*ping.radius)); }
        function draw() {
            ctx.fillStyle = '#001f3f'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = '#E0E0E0'; ctx.fillRect(ship.x, ship.y, ship.width, ship.height); ctx.fillRect(ship.x + 20, ship.y - 10, 40, 10);
            pings.forEach(ping => { ctx.strokeStyle = 'var(--accent-lime-green)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2); ctx.stroke(); });
            rocks.forEach(rock => { if (rock.found) { ctx.fillStyle = '#5D4037'; ctx.fillRect(rock.x, rock.y, rock.width, rock.height); } });
            drones.forEach(drone => { if (drone.found) { ctx.fillStyle = '#c0c0c0'; ctx.fillRect(drone.x, drone.y, drone.width, drone.height); } });
            stat1.textContent = `Pings Over: ${pingsLeft}`; stat2.textContent = `Drones Gevonden: ${dronesFound} / ${totalDrones}`;
        }
        function cleanup() { window.removeEventListener('keydown', keydownHandler); window.removeEventListener('keyup', keyupHandler); cancelAnimationFrame(animationFrameId); }
        function gameLoop() {
            update(); draw();
            if (dronesFound === totalDrones) { cleanup(); onComplete(dronesFound * 100 + pingsLeft * 50, `Alle drones gevonden! Missie geslaagd.`, 'correct'); return; }
            if (pingsLeft === 0 && pings.length === 0) { cleanup(); onComplete(dronesFound * 100, `Geen pings meer. ${dronesFound} van de ${totalDrones} gevonden.`, 'incorrect'); return; }
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        stat3.textContent = "Wacht op commando..."; gameLoop();
    }
    
    function initOscilloscopeMinigame(canvas) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height, divSize = width / 10;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height, divSize); ctx.beginPath(); ctx.strokeStyle = 'var(--accent-lime-green)'; ctx.lineWidth = 2;
        const centerY = height / 2, amplitude = height / 4, waveLength = 5 * divSize;
        for (let x = 0; x < width; x++) { const angle = (x / waveLength) * 2 * Math.PI, y = centerY - Math.sin(angle) * amplitude; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
    }

    function initAmplitudeComparison(parentElement) {
        const canvas = document.createElement('canvas');
        canvas.className = 'level-canvas';
        canvas.width = 500; canvas.height = 300;
        parentElement.insertBefore(canvas, parentElement.firstChild);

        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        let offset = 0;

        function drawWave(label, yOffset, freq, amp, color) {
            ctx.beginPath();
            ctx.strokeStyle = color; ctx.lineWidth = 2;
            const centerY = yOffset, amplitude = amp;
            for(let x=0; x < width; x++) {
                const angle = ((x + offset*freq) / (50/freq)) * 2 * Math.PI;
                const y = centerY - Math.sin(angle) * amplitude;
                if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.font = "20px Roboto Mono"; ctx.fillStyle = "white"; ctx.fillText(label, 10, yOffset);
        }

        function animate() {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
            drawWave('P', height * 0.25, 1, 30, '#32CD32'); // Golf P: lage freq, lage amp
            drawWave('Q', height * 0.75, 2, 50, '#32CD32'); // Golf Q: hoge freq, hoge amp
            offset++;
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    function initFrequencyMatchGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        const freqUpBtn = document.getElementById('freq-up-btn'), freqDownBtn = document.getElementById('freq-down-btn');

        let round = 1, totalRounds = 3, score = 0;
        let targetWave = {}, playerWave = {};

        function setupRound() {
            targetWave = { freq: 2 + Math.floor(Math.random() * 5), amp: 40, y: height * 0.25 };
            playerWave = { freq: 1, amp: 40, y: height * 0.75 };
            stat3.textContent = `Match de frequentie voor ronde ${round}`;
        }
        
        function drawWave(wave, color) {
            ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
            const centerY = wave.y, amplitude = wave.amp;
            for(let x=0; x < width; x++) {
                const angle = (x / (100/wave.freq)) * 2 * Math.PI;
                const yPos = centerY - Math.sin(angle) * amplitude;
                if(x===0) ctx.moveTo(x, yPos); else ctx.lineTo(x, yPos);
            }
            ctx.stroke();
        }

        function checkMatch() {
            if(playerWave.freq === targetWave.freq) {
                score += 100;
                round++;
                if (round > totalRounds) {
                    onComplete(score, "Alle signalen gematched!", 'correct');
                } else {
                    stat3.textContent = 'Correct! Volgende ronde...';
                    setTimeout(setupRound, 1500);
                }
            }
        }
        
        const downHandler = () => { if(playerWave.freq > 1) playerWave.freq--; checkMatch(); };
        const upHandler = () => { if(playerWave.freq < 10) playerWave.freq++; checkMatch(); };
        freqDownBtn.onclick = downHandler;
        freqUpBtn.onclick = upHandler;

        function gameLoop() {
            ctx.fillStyle = '#001f3f'; ctx.fillRect(0, 0, width, height);
            drawWave(targetWave, 'var(--accent-lime-green)');
            drawWave(playerWave, '#ff4d4d');
            stat1.textContent = `Ronde: ${round}/${totalRounds}`;
            stat2.textContent = `Player Freq: ${playerWave.freq}`;
            if (round <= totalRounds) animationFrameId = requestAnimationFrame(gameLoop);
        }
        setupRound(); gameLoop();
    }
    
    function initJammerGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        
        let hq = {x: 50, y: height/2, radius: 20};
        let silentBase = {x: width - 50, y: height/2, radius: 20, signal: 100};
        let jammers = [ {x: 150, y: 100, radius: 15}, {x: 150, y: height/2}, {x: 150, y: height - 100}];
        let draggingJammer = null;

        function distance(p1, p2) { return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2)); }

        function calculateSignal() {
            let totalReduction = 0;
            jammers.forEach(jammer => {
                let distToBase = distance(jammer, silentBase);
                if (distToBase < 1) distToBase = 1;
                totalReduction += 15000 / distToBase;
            });
            silentBase.signal = Math.max(0, 100 - totalReduction);
        }

        function mousedown(e) {
            const rect = canvas.getBoundingClientRect(), mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
            jammers.forEach((jammer, i) => { if(distance({x:mouseX, y:mouseY}, jammer) < jammer.radius) draggingJammer = i; });
        }
        function mouseup() { draggingJammer = null; }
        function mousemove(e) {
            if(draggingJammer === null) return;
            const rect = canvas.getBoundingClientRect(), mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
            jammers[draggingJammer].x = mouseX; jammers[draggingJammer].y = mouseY;
            calculateSignal();
        }
        canvas.addEventListener('mousedown', mousedown); canvas.addEventListener('mouseup', mouseup); canvas.addEventListener('mousemove', mousemove);

        function gameLoop() {
            ctx.fillStyle = '#013220'; ctx.fillRect(0, 0, width, height); // Dark green map
            ctx.fillStyle = 'blue'; ctx.beginPath(); ctx.arc(hq.x, hq.y, hq.radius, 0, 2*Math.PI); ctx.fill();
            ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(silentBase.x, silentBase.y, silentBase.radius, 0, 2*Math.PI); ctx.fill();
            jammers.forEach(jammer => { ctx.fillStyle = 'yellow'; ctx.beginPath(); ctx.arc(jammer.x, jammer.y, jammer.radius, 0, 2*Math.PI); ctx.fill(); });
            
            stat1.textContent = "Dalton HQ"; stat2.textContent = "SILENT Base";
            stat3.textContent = `Signaalsterkte: ${silentBase.signal.toFixed(1)} dB`;
            if (silentBase.signal < 20) {
                 stat3.style.color = 'var(--accent-lime-green)';
            } else {
                 stat3.style.color = 'white';
            }

            if(draggingJammer === null && silentBase.signal < 20) {
                let score = Math.max(0, (20 - silentBase.signal) * 20);
                onComplete(score, `Missie geslaagd! Signaal verzwakt. +${score.toFixed(0)} punten`, 'correct');
                canvas.removeEventListener('mousedown', mousedown); canvas.removeEventListener('mouseup', mouseup); canvas.removeEventListener('mousemove', mousemove);
            } else {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }
        calculateSignal(); gameLoop();
    }
    
    function initHearingProtectionGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let player = {x: 50, y: height/2, width: 20, height: 40, speed: 10};
        let objects = [], damage = 0, maxDamage = 100, itemsCollected = 0, spawnTimer = 0;
        
        let keys = {}, keydownHandler = (e) => keys[e.code] = true, keyupHandler = (e) => delete keys[e.code];
        window.addEventListener('keydown', keydownHandler); window.addEventListener('keyup', keyupHandler);

        function update() {
            if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
            if(keys['ArrowDown'] && player.y < height - player.height) player.y += player.speed;

            spawnTimer++;
            if(spawnTimer > 40) { // Spawn new object
                spawnTimer = 0;
                let isHarmful = Math.random() > 0.4;
                objects.push({
                    x: width, y: Math.random() * (height - 30),
                    width: 30, height: 30, speed: 5 + Math.random() * 5,
                    harmful: isHarmful
                });
            }

            objects.forEach((obj, index) => {
                obj.x -= obj.speed;
                if(obj.x < -obj.width) objects.splice(index, 1);
                // Collision
                if(player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                    if(obj.harmful) damage += 25; else { damage = Math.max(0, damage - 20); itemsCollected++; }
                    objects.splice(index, 1);
                }
            });
        }
        function draw() {
            ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'blue'; ctx.fillRect(player.x, player.y, player.width, player.height);
            objects.forEach(obj => {
                ctx.fillStyle = obj.harmful ? '#ff4d4d' : 'var(--accent-lime-green)';
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            });
            stat1.textContent = `Gehoorschade: ${damage}%`;
            stat2.textContent = `Bescherming: ${itemsCollected}`;
            stat3.textContent = '';
            // Damage bar
            ctx.fillStyle = 'grey'; ctx.fillRect(width/2-100, 10, 200, 20);
            ctx.fillStyle = 'red'; ctx.fillRect(width/2-100, 10, damage*2, 20);
        }
        function cleanup() { window.removeEventListener('keydown', keydownHandler); window.removeEventListener('keyup', keyupHandler); cancelAnimationFrame(animationFrameId); }
        function gameLoop() {
            update(); draw();
            if(damage >= maxDamage) {
                cleanup();
                onComplete(itemsCollected * 25, 'Gehoorschade kritiek! Missie afgebroken.', 'incorrect');
            } else {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }
        gameLoop();
    }


    // --- Event Listeners --- //
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextLevel);
    restartButton.addEventListener('click', restartGame);

    // --- Initialisatie --- //
    animateText(introTextElement, storyIntro);
});
