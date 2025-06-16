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
    let activeGameLoopId = null; 

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
            description: "Goed werk. Tijd voor een praktijktest. SILENT drones verstoppen zich achter rotsformaties. Je sonar detecteert per ping maar één object en wordt geblokkeerd door rotsen. Beweeg met de pijltjestoetsen, ping met de spatiebalk.",
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
                intermediateQuestion: "Bereken eerst de trillingstijd (T) in ms:",
                intermediateAnswer: 10,
                question: "Bereken nu de frequentie (f) van deze toon in Hertz (Hz):",
                answer: 100,
                hint: "Eén trilling (T) is 5 hokjes lang (10 hokjes / 2 trillingen). De tijd per hokje is 2 ms. Dus T = 5 * 2 = 10 ms. De frequentie f = 1 / T. Vergeet niet ms om te rekenen naar s (10 ms = 0,01 s)."
            }
        },
        // Training 2
        {
            title: "Trainingsmissie 2: Frequentie Matchen", type: 'minigame_only', init: initFrequencyMatchGame,
            description: "Agent, we onderscheppen gecodeerde SILENT-signalen. Voltooi 3 rondes door de signalen te matchen of te selecteren."
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
            title: "Trainingsmissie 3: Stealth Operatie", type: 'minigame_only', init: initStealthGame,
            description: "Infiltreer de SILENT-basis. Beweeg (pijltje rechts) alleen als het omgevingsgeluid hoog is om de wachten niet te alarmeren. Sta stil als het stil is, anders word je gedetecteerd!"
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
            description: "Je infiltreert een luidruchtig SILENT-evenement. Ontwijk schadelijke geluidsgolven (rood) met de pijltjestoetsen (omhoog/omlaag). Rode golven kosten een leven, groene golven geven een leven. Begin met 3 levens. Overleef zo lang mogelijk!"
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

    function animateText(element, text, callback) {
        let i = 0;
        element.textContent = "";
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                if (callback) callback();
            }
        }, 30);
    }
    
    function cleanupListeners() {
        if(window.activeGameListeners) {
            window.activeGameListeners.forEach(({target, type, handler}) => {
                target.removeEventListener(type, handler);
            });
        }
        window.activeGameListeners = [];
    }

    function loadLevel(levelData) {
        cleanupListeners();
        if (activeGameLoopId) {
            cancelAnimationFrame(activeGameLoopId);
            activeGameLoopId = null;
        }
        levelTitle.textContent = levelData.title;
        levelContent.innerHTML = '';
        nextButton.classList.add('hidden');
        
        completedTasks = 0;
        let questionCount = levelData.questions ? levelData.questions.length : 0;
        let minigameCount = levelData.minigame ? 1 : 0;
        if (levelData.type === 'minigame_only') {
            questionCount = 0;
            minigameCount = 1;
        }
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
        container.innerHTML = contentHTML;

        const interactionContainer = document.createElement('div');
        interactionContainer.className = "interaction-container";
        
        if(minigameData.intermediateQuestion) {
            const intermediateGroup = document.createElement('div');
            intermediateGroup.innerHTML = `<p><strong>${minigameData.intermediateQuestion}</strong></p>`;
            const intermediateInput = document.createElement('input');
            intermediateInput.type = 'text';
            intermediateInput.id = 'minigame-intermediate-input';
            intermediateInput.setAttribute('placeholder', 'Antwoord 1...');
            intermediateGroup.appendChild(intermediateInput);
            interactionContainer.appendChild(intermediateGroup);
        }

        if (minigameData.question) {
            const mainGroup = document.createElement('div');
            mainGroup.innerHTML = `<p><strong>${minigameData.question}</strong></p>`;
             const mainInput = document.createElement('input');
            mainInput.type = 'text';
            mainInput.id = 'minigame-input';
            mainInput.setAttribute('placeholder', minigameData.intermediateQuestion ? 'Antwoord 2...' : 'Jouw antwoord...');
            mainGroup.appendChild(mainInput);
            interactionContainer.appendChild(mainGroup);
        }
        
        container.appendChild(interactionContainer);


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
            container.querySelector('.interaction-container')?.remove(); // Verwijder de standaard input velden
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
             container.querySelector('.interaction-container')?.remove();
             const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
             minigameData.options.forEach(optionText => { const optionEl = document.createElement('div'); optionEl.className = 'option'; optionEl.textContent = optionText; optionEl.addEventListener('click', () => checkAnswer(optionEl, minigameData.answer, container)); optionsContainer.appendChild(optionEl); });
            container.appendChild(optionsContainer);
        } else {
            const button = document.createElement('button'); button.className = 'btn'; button.textContent = 'Controleer Antwoord'; button.addEventListener('click', () => checkAnalysisAnswer(container, minigameData)); container.appendChild(button);
        }
        
        if (typeof minigameData.init === 'function') { setTimeout(() => { const canvas = document.getElementById('minigame-canvas'); if(canvas) minigameData.init(canvas); }, 0); }
        return container;
    }
    
    function createStandaloneMinigameElement(levelData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        
        const gameWrapper = document.createElement('div');
        gameWrapper.style.display = 'flex';
        gameWrapper.style.gap = '20px';
        gameWrapper.style.alignItems = 'flex-start';

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.flexGrow = '1';
        canvasWrapper.innerHTML = `<p>${levelData.description}</p><canvas id="minigame-canvas" class="level-canvas" width="800" height="500"></canvas>`;
        
        const statsContainer = document.createElement('div');
        statsContainer.id = 'game-stats';
        statsContainer.style.display = 'flex';
        statsContainer.style.flexDirection = 'column'; 
        statsContainer.style.justifyContent = 'space-between';
        statsContainer.style.padding = '10px';
        statsContainer.style.background = 'rgba(0,0,0,0.3)';
        statsContainer.style.borderRadius = '5px';
        statsContainer.style.marginTop = '10px';
        statsContainer.innerHTML = `<span id="stat1"></span><span id="stat2"></span><span id="stat3" style="font-style: italic;"></span>`;
        
        canvasWrapper.appendChild(statsContainer);
        gameWrapper.appendChild(canvasWrapper);
        container.appendChild(gameWrapper);

        if(levelData.init === initFrequencyMatchGame) {
            const infoPanel = document.createElement('div');
            infoPanel.id = 'info-panel';
            infoPanel.style.width = '200px';
            infoPanel.style.flexShrink = '0';
            infoPanel.style.padding = '10px';
            infoPanel.style.border = '1px solid var(--accent-lime-green)';
            infoPanel.style.borderRadius = '8px';
            infoPanel.style.backgroundColor = 'rgba(0,20,0,0.5)';
            infoPanel.innerHTML = '<h4>SYSTEM INFO</h4><div id="info-panel-content"></div>';
            gameWrapper.appendChild(infoPanel);

            const controls = document.createElement('div');
            controls.id = 'freq-controls';
            controls.style.textAlign = 'center';
            controls.style.padding = '10px';
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

    function checkAnalysisAnswer(gameContainer, minigameData) {
        if (gameContainer.classList.contains('completed')) return;
        let allCorrect = true;

        const mainInput = gameContainer.querySelector('#minigame-input');
        const mainUserAnswer = normalizeAnswer(mainInput.value);
        const mainCorrectAnswer = normalizeAnswer(minigameData.answer);
        if(mainUserAnswer !== mainCorrectAnswer) allCorrect = false;

        if (minigameData.intermediateQuestion) {
            const intermediateInput = gameContainer.querySelector('#minigame-intermediate-input');
            const intermediateUserAnswer = normalizeAnswer(intermediateInput.value);
            const intermediateCorrectAnswer = normalizeAnswer(minigameData.intermediateAnswer);
            if(intermediateUserAnswer !== intermediateCorrectAnswer) {
                allCorrect = false;
                intermediateInput.style.borderColor = '#8b0000';
            } else {
                intermediateInput.style.borderColor = 'var(--primary-green)';
            }
        }
        
        mainInput.style.borderColor = (mainUserAnswer === mainCorrectAnswer) ? 'var(--primary-green)' : '#8b0000';

        if (allCorrect) { showFeedback('Uitstekend werk, Agent! +250 punten', 'correct'); updateScore(250); } 
        else { showFeedback(`Incorrect. Controleer je berekening.`, 'incorrect'); }
        
        mainInput.disabled = true;
        gameContainer.querySelector('#minigame-intermediate-input')?.setAttribute('disabled', true);
        taskCompleted(gameContainer, allCorrect);
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
    
    function checkLevelCompletion() { if (completedTasks >= levelTasks) nextButton.classList.remove('hidden'); }
    function nextLevel() { currentLevelIndex++; if (currentLevelIndex < levels.length) loadLevel(levels[currentLevelIndex]); else endGame(); }
    
    function showFeedback(message, type) {
        const popup = document.createElement('div');
        popup.className = `feedback-popup ${type}`;
        popup.textContent = message;
        gameContainer.appendChild(popup);
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if(gameContainer.contains(popup)) {
                    gameContainer.removeChild(popup);
                }
            }, 500);
        }, 2000);
    }

    function updateScore(points) { score += points; scoreDisplay.textContent = score; }
    
    function endGame() {
        cleanupListeners();
        if (activeGameLoopId) cancelAnimationFrame(activeGameLoopId);
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
    
    function restartGame() { currentLevelIndex = -1; showScreen('intro'); agentNameInput.style.display='none'; startButton.style.display='none'; animateText(introTextElement, storyIntro, () => { agentNameInput.style.display = 'block'; startButton.style.display = 'block'; }); }

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
        
        // Strategische plaatsing
        rocks.push({ x: width * 0.5 - 75, y: height * 0.4, width: 150, height: 60, found: false });
        rocks.push({ x: width * 0.1, y: height * 0.7, width: 100, height: 50, found: false });
        drones.push({ x: width * 0.5 - 30, y: height * 0.6, width: 60, height: 15, found: false }); // Achter de rots
        drones.push({ x: width * 0.15, y: height * 0.9, width: 60, height: 15, found: false }); // Achter een andere rots
        drones.push({ x: width * 0.8, y: height * 0.7, width: 60, height: 15, found: false }); // Vrijstaand

        let keys = {};
        const keydownHandler = (e) => keys[e.code] = true;
        const keyupHandler = (e) => { if (e.code === 'Space') firePing(); delete keys[e.code]; };
        
        window.activeGameListeners = [ {target: window, type: 'keydown', handler: keydownHandler}, {target: window, type: 'keyup', handler: keyupHandler} ];
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type, handler));

        function firePing() { if (pingsLeft > 0 && pings.length === 0) { pingsLeft--; pings.push({ x: ship.x + ship.width / 2, y: ship.y + ship.height, radius: 10, speed: 3, maxRadius: width, hit: false, alpha: 1 }); stat3.textContent = "Sonar ping verstuurd..."; } }
        function update() {
            if (keys['ArrowLeft'] && ship.x > 0) ship.x -= ship.speed; if (keys['ArrowRight'] && ship.x < width - ship.width) ship.x += ship.speed;
            pings.forEach((ping, p_index) => {
                if (ping.hit) {
                    ping.alpha -= 0.05; 
                    if (ping.alpha <= 0) pings.splice(p_index, 1);
                    return;
                }
                ping.radius += ping.speed;
                for (const rock of rocks) { if (!rock.found && checkCollision(ping, rock)) { rock.found = true; ping.hit = true; stat3.textContent = "Echo: Rotsformatie gedetecteerd."; return; }}
                for (const drone of drones) { if (!drone.found && checkCollision(ping, drone)) { drone.found = true; dronesFound++; ping.hit = true; stat3.textContent = "Echo: SILENT drone gelokaliseerd!"; return;}}
                if (ping.radius > ping.maxRadius) { if(!ping.hit) { stat3.textContent = "Echo: Geen objecten gedetecteerd."; } pings.splice(p_index, 1); }
            });
        }
        function checkCollision(ping, object) { let distX = Math.abs(ping.x - object.x - object.width / 2), distY = Math.abs(ping.y - object.y - object.height / 2); if (distX > (object.width / 2 + ping.radius)) { return false; } if (distY > (object.height / 2 + ping.radius)) { return false; } if (distX <= (object.width / 2)) { return true; } if (distY <= (object.height / 2)) { return true; } let dx = distX - object.width/2, dy = distY - object.height/2; return (dx*dx + dy*dy <= (ping.radius*ping.radius)); }
        function draw() {
            ctx.fillStyle = '#001f3f'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = '#E0E0E0'; ctx.fillRect(ship.x, ship.y, ship.width, ship.height); ctx.fillRect(ship.x + 20, ship.y - 10, 40, 10);
            pings.forEach(ping => { ctx.strokeStyle = `rgba(50, 205, 50, ${ping.alpha})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2); ctx.stroke(); });
            rocks.forEach(rock => { if (rock.found) { ctx.fillStyle = '#5D4037'; ctx.fillRect(rock.x, rock.y, rock.width, rock.height); } });
            drones.forEach(drone => { if (drone.found) { ctx.fillStyle = '#c0c0c0'; ctx.fillRect(drone.x, drone.y, drone.width, drone.height); } });
            stat1.textContent = `Pings Over: ${pingsLeft}`; stat2.textContent = `Drones Gevonden: ${dronesFound} / ${totalDrones}`;
        }
        
        function gameLoop() {
            update(); draw();
            if (dronesFound === totalDrones) { onComplete(dronesFound * 100 + pingsLeft * 50, `Alle drones gevonden! Missie geslaagd.`, 'correct'); return; }
            if (pingsLeft === 0 && pings.length === 0) { onComplete(dronesFound * 100, `Geen pings meer. ${dronesFound} van de ${totalDrones} gevonden.`, 'incorrect'); return; }
            activeGameLoopId = requestAnimationFrame(gameLoop);
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
        const canvas = document.createElement('canvas'); canvas.className = 'level-canvas'; canvas.width = 500; canvas.height = 300; parentElement.insertBefore(canvas, parentElement.firstChild);
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height, divSize = width / 10; let offset = 0;
        
        function drawWave(label, freq, amp, color) {
            ctx.beginPath(); 
            ctx.strokeStyle = color; ctx.lineWidth = 2; const centerY = height / 2, amplitude = amp;
            for(let x=0; x < width; x++) { const angle = ((x + offset*freq) / (50/freq)) * 2 * Math.PI; const y = centerY - Math.sin(angle) * amplitude; if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
            ctx.stroke(); 
            ctx.font = "20px Roboto Mono"; ctx.fillStyle = color; ctx.fillText(label, 10, centerY - amp - 10);
        }
        function animate() {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height, divSize);
            drawWave('P', 1, 60, '#32CD32'); 
            drawWave('Q', 2, 100, '#FFD700');
            offset++; 
            activeGameLoopId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    function initFrequencyMatchGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height, divSize = width/20;
        const infoPanelContent = document.getElementById('info-panel-content');
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        const controlsContainer = document.getElementById('freq-controls');

        let round = 1, totalRounds = 3, score = 0, currentRoundType, gameEnded = false, mousePos = {x:0, y:0};
        let targetWave = {}, playerWave = {}, clickWaves = [];
        
        const roundData = [
            { type: 'match', timebase: 10, targetFreqDivs: 4 }, // 1 / (4 * 10ms) = 25 Hz
            { type: 'match', timebase: 5, targetFreqDivs: 5 },  // 1 / (5 * 5ms) = 40 Hz
            { type: 'click', timebase: 2, targetFreqHz: 50 }    // T = 1/50 = 20ms. Tijd/div = 2ms => 10 divs
        ];
        
        function drawWave(wave, color, lineThickness) {
            ctx.strokeStyle = color; ctx.lineWidth = lineThickness; ctx.beginPath();
            const centerY = wave.y, amplitude = wave.amp, waveLength = divSize * wave.divs;
            for(let x=0; x < width; x++) { const angle = (x / waveLength) * 2 * Math.PI; const yPos = centerY - Math.sin(angle) * amplitude; if(x===0) ctx.moveTo(x, yPos); else ctx.lineTo(x, yPos); }
            ctx.stroke();
        }
        
        function setupRound() {
            cleanupListeners();
            if (round > totalRounds) return;
            controlsContainer.innerHTML = '';
            infoPanelContent.innerHTML = '';
            const data = roundData[round-1];
            currentRoundType = data.type;
            infoPanelContent.innerHTML = `<p>Timebase: <br><span style="color:var(--accent-lime-green);">${data.timebase} ms/div</span></p>`;

            if (currentRoundType === 'match') {
                targetWave = { divs: data.targetFreqDivs, y: height * 0.25, amp: 60 };
                playerWave = { divs: 10, y: height * 0.75, amp: 60 };
                controlsContainer.innerHTML = `<button id="freq-down-btn" class="btn">- Freq</button> <button id="freq-up-btn" class="btn">+ Freq</button> <button id="confirm-freq-btn" class="btn">Bevestig</button>`;
                document.getElementById('freq-down-btn').onclick = () => { if(playerWave.divs < 20) playerWave.divs++; };
                document.getElementById('freq-up-btn').onclick = () => { if(playerWave.divs > 1) playerWave.divs--; };
                document.getElementById('confirm-freq-btn').onclick = checkMatch;
            } else { 
                stat3.textContent = `Klik op de knop naast de ${data.targetFreqHz} Hz golf.`;
                controlsContainer.innerHTML = ''; 
                clickWaves = [
                    { divs: 20, y: height * 0.2, amp: 50, buttonY: height * 0.2},
                    { divs: 10, y: height * 0.5, amp: 50, buttonY: height * 0.5},
                    { divs: 5, y: height * 0.8, amp: 50, buttonY: height * 0.8}
                ];
                clickWaves.forEach((w) => {
                    w.isTarget = (Math.round(1 / (w.divs * data.timebase * 0.001)) === data.targetFreqHz);
                    const btn = document.createElement('button');
                    btn.textContent = 'Selecteer';
                    btn.className = 'btn';
                    btn.style.position = 'absolute';
                    const canvasRect = canvas.getBoundingClientRect();
                    const containerRect = gameContainer.getBoundingClientRect();
                    btn.style.left = `${canvasRect.right - containerRect.left + 10}px`; // Naast de canvas
                    btn.style.top = `${canvasRect.top - containerRect.top + w.buttonY - 15}px`;
                    btn.onclick = () => checkClick(w.isTarget);
                    levelContent.appendChild(btn); // Toevoegen aan levelContent voor correcte positionering
                });
            }
        }

        function nextRound() {
            round++;
            if (round > totalRounds) { if(!gameEnded) { gameEnded = true; onComplete(score, "Alle signalen verwerkt!", 'correct'); }} 
            else { showFeedback("Volgende ronde...", "correct"); setTimeout(setupRound, 1500); }
        }

        function checkMatch() { 
            const isCorrect = (playerWave.divs === targetWave.divs);
            if(isCorrect) { score += 100; showFeedback('Correct! +100 punten.', 'correct'); } else { showFeedback('Fout. Geen punten voor deze ronde.', 'incorrect'); }
            controlsContainer.innerHTML = '';
            setTimeout(nextRound, 1500);
        }
        function checkClick(isCorrect) { 
            cleanupListeners();
            levelContent.querySelectorAll('.btn').forEach(btn => btn.remove()); // Verwijder selectieknoppen
            if(isCorrect) { score += 150; showFeedback('Correct! +150 punten.', 'correct'); } else { showFeedback('Fout signaal geselecteerd.', 'incorrect'); }
            setTimeout(nextRound, 1500);
        }

        function gameLoop() {
            if (gameEnded) return;
            const data = roundData[round-1];
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height, divSize);
            
            if(currentRoundType === 'match') {
                drawWave(targetWave, 'var(--accent-lime-green)', 3); drawWave(playerWave, '#ff4d4d', 3);
                const playerFreq = Math.round(1 / (playerWave.divs * data.timebase * 0.001));
                stat2.textContent = `Jouw golf: ${playerFreq} Hz`; stat3.textContent = ``;
            } else {
                clickWaves.forEach(w => drawWave(w, 'var(--accent-lime-green)', 4));
                stat2.textContent = '';
            }
            stat1.textContent = `Ronde: ${round}/${totalRounds}`;
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        setupRound(); gameLoop();
    }
    
    function initStealthGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let gameEnded = false, score = 0, startTime = Date.now();

        let player = { x: 50, y: height/2, radius: 15, speed: 1.5 };
        let exit = { x: width - 50, y: height/2, radius: 20 };
        let guards = [
            { x: width * 0.3, y: height * 0.3, radius: 80, baseRadius: 80 },
            { x: width * 0.6, y: height * 0.7, radius: 100, baseRadius: 100 }
        ];
        
        let ambientNoise = 0;
        let noiseChangeTimer = 0;
        let isMoving = false;

        const keydownHandler = (e) => { if(e.code === 'ArrowRight') isMoving = true; };
        const keyupHandler = (e) => { if(e.code === 'ArrowRight') isMoving = false; };
        window.activeGameListeners.push(
            {target: window, type: 'keydown', handler: keydownHandler},
            {target: window, type: 'keyup', handler: keyupHandler}
        );
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type,handler));

        function update() {
            // Update ambient noise
            noiseChangeTimer--;
            if(noiseChangeTimer <= 0) {
                ambientNoise = Math.random();
                noiseChangeTimer = Math.random() * 120 + 60; // Change every 1-3 seconds
            }

            // Update guard detection radius based on noise
            guards.forEach(guard => {
                guard.radius = guard.baseRadius * (1.2 - ambientNoise); // Radius is groter als het stil is
            });

            // Move player
            if(isMoving) {
                player.x += player.speed;
            }

            // Check for detection
            let inDetectionZone = false;
            guards.forEach(guard => {
                const dist = Math.hypot(player.x - guard.x, player.y - guard.y);
                if (dist < guard.radius) {
                    inDetectionZone = true;
                }
            });

            if (isMoving && inDetectionZone && ambientNoise < 0.6) {
                gameEnded = true;
                onComplete(0, "Gedetecteerd! Missie gefaald.", 'incorrect');
            }

            // Check for win
            if (Math.hypot(player.x - exit.x, player.y - exit.y) < player.radius + exit.radius) {
                gameEnded = true;
                const timeTaken = (Date.now() - startTime) / 1000;
                score = Math.max(10, 300 - timeTaken * 5); // Score based on time
                onComplete(score, `Basis geïnfiltreerd! Tijd: ${timeTaken.toFixed(1)}s. Punten: ${score.toFixed(0)}`, 'correct');
            }
        }
        
        function draw() {
            ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, 0, width, height);
            
            // Draw detection zones
            guards.forEach(guard => {
                const gradient = ctx.createRadialGradient(guard.x, guard.y, 10, guard.x, guard.y, guard.radius);
                const color = (isMoving && guard.radius > guard.baseRadius) ? '255, 0, 0' : '255, 255, 0';
                gradient.addColorStop(0, `rgba(${color}, 0.3)`);
                gradient.addColorStop(1, `rgba(${color}, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(guard.x, guard.y, guard.radius, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(guard.x, guard.y, 10, 0, 2*Math.PI);
                ctx.fill();
            });

            // Draw player and exit
            ctx.fillStyle = 'blue'; ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, 2*Math.PI); ctx.fill();
            ctx.fillStyle = 'var(--accent-lime-green)'; ctx.beginPath(); ctx.arc(exit.x, exit.y, exit.radius, 0, 2*Math.PI); ctx.fill();
            
            // Draw noise meter
            const meterHeight = 200, meterWidth = 30;
            ctx.fillStyle = '#333'; ctx.fillRect(width-50, height - 50 - meterHeight, meterWidth, meterHeight);
            ctx.fillStyle = ambientNoise > 0.6 ? 'var(--accent-lime-green)' : 'yellow';
            ctx.fillRect(width-50, height - 50, meterWidth, -ambientNoise * meterHeight);
            ctx.strokeStyle = 'white'; ctx.strokeRect(width-50, height - 50 - meterHeight, meterWidth, meterHeight);

            stat1.textContent = 'Speler: Blauw';
            stat2.textContent = 'Doel: Groen';
            stat3.textContent = 'Omgevingsgeluid';
        }

        function gameLoop() {
            if(gameEnded) return;
            update();
            draw();
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }
    
    function initHearingProtectionGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let player = {x: 50, y: height/2, width: 20, height: 40, speed: 10};
        let objects = [], lives = 3, spawnTimer = 0, gameTime = 0, gameEnded = false, difficultyTimer = 0;
        
        let keys = {};
        const keydownHandler = (e) => keys[e.code] = true;
        const keyupHandler = (e) => delete keys[e.code];
        window.activeGameListeners.push({target: window, type: 'keydown', handler: keydownHandler}, {target: window, type: 'keyup', handler: keyupHandler});
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type, handler));

        function update() {
            if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed; 
            if(keys['ArrowDown'] && player.y < height - player.height) player.y += player.speed;
            
            spawnTimer++;
            difficultyTimer++;

            let spawnRate = 30 - Math.floor(difficultyTimer / 1200); // gets faster over time
            if(spawnTimer > Math.max(10, spawnRate)) { 
                spawnTimer = 0; 
                objects.push({ 
                    x: width, y: Math.random()*(height-30), 
                    width: 30, height: 30, 
                    speed: 5 + (difficultyTimer/600) + Math.random()*5, // gets faster
                    harmful: Math.random() < 0.833 // 5:1 ratio
                }); 
            }
            objects.forEach((obj, index) => {
                obj.x -= obj.speed; if(obj.x < -obj.width) objects.splice(index, 1);
                if(player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                    if(obj.harmful) { lives--; } else { lives = Math.min(5, lives + 1); }
                    objects.splice(index, 1);
                }
            });
            if(lives <= 0) gameEnded = true;
        }
        function draw() {
            ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'blue'; ctx.fillRect(player.x, player.y, player.width, player.height);
            objects.forEach(obj => { ctx.fillStyle = obj.harmful ? '#ff4d4d' : 'var(--accent-lime-green)'; ctx.fillRect(obj.x, obj.y, obj.width, obj.height); });
            stat1.textContent = `Levens: ${lives}`; 
            stat2.textContent = `Score: ${Math.floor(gameTime / 60)}`;
            stat3.textContent = '';
        }

        function gameLoop() {
            if(gameEnded) {
                onComplete(Math.floor(gameTime/60), `Missie voorbij! Je hebt ${Math.floor(gameTime/60)} seconden overleefd.`, 'correct');
                return;
            }
            gameTime++;
            update(); draw();
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }


    // --- Event Listeners --- //
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextLevel);
    restartButton.addEventListener('click', restartGame);

    // --- Initialisatie --- //
    agentNameInput.style.display = 'none';
    startButton.style.display = 'none';
    animateText(introTextElement, storyIntro, () => {
        agentNameInput.style.display = 'block';
        startButton.style.display = 'block';
    });
});
