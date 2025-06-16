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
            description: "Infiltreer de SILENT-basis. Gebruik alle pijltjestoetsen. Beweeg alleen als het omgevingsgeluid hoog is om de patrouillerende wachten niet te alarmeren. Sta stil als het stil is, anders word je gedetecteerd!"
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
                question: "Sleep de eigenschappen naar de juiste plek.",
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
        
        let contentHTML = `<h3>${minigameData.title}</h3>`;
        // De omschrijving wordt nu ook getoond als die bestaat
        if(minigameData.description){
             contentHTML += `<p>${minigameData.description}</p>`;
        }
        
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
            
            // FIX: Voeg de vraag hier expliciet toe
            const questionParagraph = document.createElement('p');
            questionParagraph.innerHTML = `<strong>${minigameData.question}</strong>`;
            container.appendChild(questionParagraph);

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

        // Main wrapper voor de hele game-interface
        const gameInterfaceWrapper = document.createElement('div');

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = levelData.description;
        gameInterfaceWrapper.appendChild(descriptionElement);

        // Wrapper voor canvas en eventuele zijknoppen
        const gameAreaWrapper = document.createElement('div');
        gameAreaWrapper.className = 'game-area-wrapper';
        gameAreaWrapper.style.display = 'flex';
        gameAreaWrapper.style.alignItems = 'center'; // Center vertically
        gameAreaWrapper.style.gap = '10px';
        gameAreaWrapper.style.justifyContent = 'center';
        
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        canvasContainer.style.position = 'relative'; // Essentieel voor absolute positionering van de knoppen
        
        const canvas = document.createElement('canvas');
        canvas.id = 'minigame-canvas';
        canvas.className = 'level-canvas';
        canvas.width = 800;
        canvas.height = 500;
        canvas.style.maxWidth = '100%';
        canvasContainer.appendChild(canvas);

        // Voeg de canvas container toe aan de game area
        gameAreaWrapper.appendChild(canvasContainer);
        gameInterfaceWrapper.appendChild(gameAreaWrapper);
        
        // Bottom sectie voor stats en info
        const bottomSection = document.createElement('div');
        bottomSection.style.display = 'flex';
        bottomSection.style.justifyContent = 'space-between';
        bottomSection.style.alignItems = 'flex-start';
        bottomSection.style.marginTop = '15px';
        bottomSection.style.flexWrap = 'wrap';
        bottomSection.style.gap = '15px';


        const statsContainer = document.createElement('div');
        statsContainer.id = 'game-stats';
        statsContainer.style.padding = '10px';
        statsContainer.style.background = 'rgba(0,0,0,0.3)';
        statsContainer.style.borderRadius = '5px';
        statsContainer.innerHTML = `<span id="stat1"></span><span id="stat2"></span><span id="stat3" style="font-style: italic;"></span>`;
        bottomSection.appendChild(statsContainer);

        if(levelData.init === initFrequencyMatchGame) {
            const infoPanel = document.createElement('div');
            infoPanel.id = 'info-panel';
            infoPanel.style.minWidth = '180px';
            infoPanel.style.padding = '10px';
            infoPanel.style.border = '1px solid var(--accent-lime-green)';
            infoPanel.style.borderRadius = '8px';
            infoPanel.style.backgroundColor = 'rgba(0,20,0,0.5)';
            infoPanel.innerHTML = '<h4>SYSTEM INFO</h4><div id="info-panel-content"></div>';
            bottomSection.appendChild(infoPanel);
        }
        
        gameInterfaceWrapper.appendChild(bottomSection);

        // Controls gaan onderaan
        const controls = document.createElement('div');
        controls.id = 'freq-controls';
        controls.style.textAlign = 'center';
        controls.style.paddingTop = '10px';
        gameInterfaceWrapper.appendChild(controls);

        container.appendChild(gameInterfaceWrapper);
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
        let ship = { x: width / 2 - 40, y: 10, width: 80, height: 20, speed: 10 };
        let pings = [], keys = {};
        let drones = [], rocks = [];
        const totalDrones = 4;
        const numRocks = 6 + Math.floor(Math.random() * 3);
        let pingsLeft = 10;
        let dronesFound = 0;
        function checkOverlap(objA, objB) {
            return objA.x < objB.x + objB.width &&
                   objA.x + objA.width > objB.x &&
                   objA.y < objB.y + objB.height &&
                   objA.y + objA.height > objB.y;
        }
        for (let i = 0; i < numRocks; i++) {
            let rock, overlap;
            do {
                overlap = false;
                rock = {
                    x: Math.random() * (width - 150),
                    y: (height * 0.25) + (Math.random() * (height * 0.6)),
                    width: 80 + Math.random() * 70,
                    height: 40 + Math.random() * 20,
                    found: false
                };
                for (const existingRock of rocks) {
                    if (checkOverlap(rock, existingRock)) {
                        overlap = true;
                        break;
                    }
                }
            } while (overlap);
            rocks.push(rock);
        }
        let placedDrones = 0;
        for (const rock of rocks) {
            if (placedDrones < totalDrones - 1 && Math.random() > 0.4) {
                drones.push({
                    x: rock.x + rock.width / 2 - 30,
                    y: rock.y + rock.height + 5 + Math.random() * 10,
                    width: 60, height: 15, found: false
                });
                placedDrones++;
            }
        }
        while(placedDrones < totalDrones) {
             drones.push({
                x: Math.random() * (width - 60),
                y: (height * 0.3) + (Math.random() * (height * 0.65)),
                width: 60, height: 15, found: false
            });
            placedDrones++;
        }
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
                for (const rock of rocks) { 
                    if (!rock.found && checkCollision(ping, rock)) { 
                        rock.found = true; 
                        ping.hit = true;
                        stat3.textContent = "Echo: Rotsformatie gedetecteerd."; 
                        return;
                    }
                }
                for (const drone of drones) { 
                    if (!drone.found && checkCollision(ping, drone)) { 
                        drone.found = true; 
                        dronesFound++; 
                        ping.hit = true;
                        stat3.textContent = "Echo: SILENT drone gelokaliseerd!"; 
                        return;
                    }
                }
                if (ping.radius > ping.maxRadius) { 
                    if(!ping.hit) { stat3.textContent = "Echo: Geen objecten gedetecteerd."; } 
                    pings.splice(p_index, 1); 
                }
            });
        }
        function checkCollision(ping, object) { let distX = Math.abs(ping.x - object.x - object.width / 2), distY = Math.abs(ping.y - object.y - object.height / 2); if (distX > (object.width / 2 + ping.radius)) { return false; } if (distY > (object.height / 2 + ping.radius)) { return false; } if (distX <= (object.width / 2)) { return true; } if (distY <= (object.height / 2)) { return true; } let dx = distX - object.width/2, dy = distY - object.height/2; return (dx*dx + dy*dy <= (ping.radius*ping.radius)); }
        function draw() {
            ctx.fillStyle = '#001f3f'; ctx.fillRect(0, 0, width, height); 
            ctx.fillStyle = '#E0E0E0'; ctx.fillRect(ship.x, ship.y, ship.width, ship.height); ctx.fillRect(ship.x + 20, ship.y - 10, 40, 10);
            pings.forEach(ping => { ctx.strokeStyle = `rgba(50, 205, 50, ${ping.alpha})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2); ctx.stroke(); });
            rocks.forEach(rock => { if (rock.found) { ctx.fillStyle = '#5D4037'; ctx.fillRect(rock.x, rock.y, rock.width, rock.height); } });
            drones.forEach(drone => { if (drone.found) { ctx.fillStyle = '#c0c0c0'; ctx.fillRect(drone.x, drone.y, drone.width, drone.height); } });
            stat1.textContent = `Pings Over: ${pingsLeft}`; stat2.textContent = `Drones Gevonden: ${dronesFound} / ${totalDrones}`;
        }
        function gameLoop() {
            update(); draw();
            if (dronesFound === totalDrones) { onComplete(dronesFound * 100 + pingsLeft * 50, `Alle drones gevonden! Missie geslaagd.`, 'correct'); return; }
            if (pingsLeft === 0 && pings.length === 0 && dronesFound < totalDrones) { onComplete(dronesFound * 100, `Geen pings meer. ${dronesFound} van de ${totalDrones} gevonden.`, 'incorrect'); return; }
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
        const canvasContainer = document.getElementById('canvas-container');

        let round = 1, totalRounds = 3, score = 0, currentRoundType, gameEnded = false;
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
            // Verwijder oude knoppen
            if (canvasContainer) {
                canvasContainer.querySelectorAll('.select-wave-btn').forEach(btn => btn.remove());
            }

            if (round > totalRounds) return;
            
            controlsContainer.innerHTML = '';
            if (infoPanelContent) infoPanelContent.innerHTML = '';
            const data = roundData[round-1];
            currentRoundType = data.type;
            if (infoPanelContent) infoPanelContent.innerHTML = `<p>Timebase: <br><span style="color:var(--accent-lime-green);">${data.timebase} ms/div</span></p>`;

            if (currentRoundType === 'match') {
                targetWave = { divs: data.targetFreqDivs, y: height * 0.25, amp: 60 };
                playerWave = { divs: 10, y: height * 0.75, amp: 60 };
                controlsContainer.innerHTML = `<button id="freq-down-btn" class="btn">- Freq</button> <button id="freq-up-btn" class="btn">+ Freq</button> <button id="confirm-freq-btn" class="btn">Bevestig</button>`;
                document.getElementById('freq-down-btn').onclick = () => { if(playerWave.divs < 20) playerWave.divs++; };
                document.getElementById('freq-up-btn').onclick = () => { if(playerWave.divs > 1) playerWave.divs--; };
                document.getElementById('confirm-freq-btn').onclick = checkMatch;
            } else { // 'click' round
                stat3.textContent = `Klik op de pijl naast de ${data.targetFreqHz} Hz golf.`;
                controlsContainer.innerHTML = ''; 
                clickWaves = [
                    { divs: 20, y: height * 0.2, amp: 50, buttonY: height * 0.2},
                    { divs: 10, y: height * 0.5, amp: 50, buttonY: height * 0.5},
                    { divs: 5,  y: height * 0.8, amp: 50, buttonY: height * 0.8}
                ];
                
                clickWaves.forEach((w) => {
                    w.isTarget = (Math.round(1 / (w.divs * data.timebase * 0.001)) === data.targetFreqHz);
                    const btn = document.createElement('button');
                    btn.textContent = '→';
                    btn.className = 'btn select-wave-btn';
                    btn.style.fontSize = '1.5em';
                    btn.style.padding = '0px 10px';
                    btn.style.lineHeight = '1.2';
                    btn.style.position = 'absolute';
                    btn.style.left = '-50px';
                    btn.style.top = `${w.buttonY - 18}px`;
                    btn.onclick = () => checkClick(w.isTarget, btn);
                    if (canvasContainer) canvasContainer.appendChild(btn);
                });
            }
        }

        function nextRound() {
            round++;
            if (round > totalRounds) { 
                if(!gameEnded) { 
                    gameEnded = true; 
                    onComplete(score, "Alle signalen verwerkt!", 'correct'); 
                }
            } 
            else { 
                showFeedback("Volgende ronde...", "correct"); 
                setTimeout(setupRound, 1500); 
            }
        }

        function checkMatch() { 
            const isCorrect = (playerWave.divs === targetWave.divs);
            if(isCorrect) { score += 100; showFeedback('Correct! +100 punten.', 'correct'); } else { showFeedback('Fout. Geen punten voor deze ronde.', 'incorrect'); }
            controlsContainer.innerHTML = '';
            setTimeout(nextRound, 1500);
        }

        function checkClick(isCorrect, clickedButton) { 
            if (canvasContainer) {
                canvasContainer.querySelectorAll('.select-wave-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                });
            }
            
            if(isCorrect) { 
                score += 150; 
                showFeedback('Correct! +150 punten.', 'correct'); 
                clickedButton.style.backgroundColor = 'var(--primary-green)';
                clickedButton.style.opacity = 1;
            } else { 
                showFeedback('Fout signaal geselecteerd.', 'incorrect');
                clickedButton.style.backgroundColor = '#8b0000';
                clickedButton.style.opacity = 1;
            }
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
        let gameEnded = false, score = 0, startTime = Date.now(), animationFrame = 0;
        
        let lives = 3;
        let isInvincible = false;

        const TILE_SIZE = 40;
        const GRID_COLS = width / TILE_SIZE;
        const GRID_ROWS = height / TILE_SIZE;
        
        const mazeLayout = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 'P', 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'E', 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        let player = {};
        let exit = {};
        let startPos = {};
        
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (mazeLayout[row] && mazeLayout[row][col] === 'P') {
                    startPos = { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
                    player = { gridX: col, gridY: row, x: startPos.x, y: startPos.y, radius: TILE_SIZE / 2 - 4, speed: 2 };
                } else if (mazeLayout[row] && mazeLayout[row][col] === 'E') {
                    exit = { x: col * TILE_SIZE, y: row * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                }
            }
        }

        let guards = [
            { x: 3 * TILE_SIZE, y: 4 * TILE_SIZE, path: [{x:3, y:4}, {x:3, y:8}, {x:6, y:8}, {x:6, y:4}], currentPathIndex: 0, speed: 1, baseRadius: TILE_SIZE * 2, radius: TILE_SIZE * 2 },
            { x: 10 * TILE_SIZE, y: 1 * TILE_SIZE, path: [{x:10, y:1}, {x:17, y:1}, {x:17, y:4}, {x:10, y:4}], currentPathIndex: 0, speed: 1.2, baseRadius: TILE_SIZE * 2.5, radius: TILE_SIZE * 2.5 }
        ];

        let keys = {};
        let isMoving = false;
        let ambientNoise = 0;
        let noiseChangeTimer = 0;
        const NOISE_SAFETY_THRESHOLD = 0.7;

        const keydownHandler = (e) => {
             if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) keys[e.code] = true;
        };
        const keyupHandler = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) delete keys[e.code];
        };

        window.activeGameListeners.push(
            {target: window, type: 'keydown', handler: keydownHandler},
            {target: window, type: 'keyup', handler: keyupHandler}
        );
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type,handler));

        function isWall(gridX, gridY) {
            if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) return true;
            return mazeLayout[gridY][gridX] === 1;
        }

        function update() {
            let moveX = 0, moveY = 0;
            if (keys['ArrowLeft']) moveX = -player.speed;
            if (keys['ArrowRight']) moveX = player.speed;
            if (keys['ArrowUp']) moveY = -player.speed;
            if (keys['ArrowDown']) moveY = player.speed;
            isMoving = moveX !== 0 || moveY !== 0;

            const nextX = player.x + moveX;
            const nextY = player.y + moveY;
            const nextGridX = Math.floor(nextX / TILE_SIZE);
            const nextGridY = Math.floor(nextY / TILE_SIZE);

            if (!isWall(nextGridX, player.gridY)) { player.x = nextX; player.gridX = nextGridX; }
            if (!isWall(player.gridX, nextGridY)) { player.y = nextY; player.gridY = nextGridY; }

            noiseChangeTimer--;
            if(noiseChangeTimer <= 0) {
                 if (Math.random() < 0.45) {
                    ambientNoise = 0.7 + Math.random() * 0.3;
                } else {
                    ambientNoise = Math.random() * 0.7;
                }
                noiseChangeTimer = Math.random() * 90 + 30;
            }
            
            if (isInvincible) return;

            guards.forEach(guard => {
                let target = guard.path[guard.currentPathIndex];
                let targetX = target.x * TILE_SIZE;
                let targetY = target.y * TILE_SIZE;
                const dx = targetX - guard.x;
                const dy = targetY - guard.y;
                const dist = Math.hypot(dx, dy);

                if (dist < guard.speed) {
                    guard.currentPathIndex = (guard.currentPathIndex + 1) % guard.path.length;
                } else {
                    guard.x += (dx / dist) * guard.speed;
                    guard.y += (dy / dist) * guard.speed;
                }

                guard.radius = guard.baseRadius * (1.8 - ambientNoise * 1.5);

                const playerDist = Math.hypot(player.x - guard.x, player.y - guard.y);
                if (isMoving && playerDist < guard.radius && ambientNoise < NOISE_SAFETY_THRESHOLD) {
                    lives--;
                    if (lives <= 0) {
                        gameEnded = true;
                        onComplete(0, "Gedetecteerd! Missie gefaald.", 'incorrect');
                    } else {
                        player.x = startPos.x;
                        player.y = startPos.y;
                        player.gridX = Math.floor(startPos.x / TILE_SIZE);
                        player.gridY = Math.floor(startPos.y / TILE_SIZE);
                        isInvincible = true;
                        showFeedback(`Gedetecteerd! ${lives} poging(en) over.`, 'incorrect');
                        setTimeout(() => { isInvincible = false; }, 2000);
                    }
                }
            });

            if (player.gridX === Math.floor(exit.x / TILE_SIZE) && player.gridY === Math.floor(exit.y / TILE_SIZE)) {
                gameEnded = true;
                const timeTaken = (Date.now() - startTime) / 1000;
                score = Math.max(10, 500 - timeTaken * 5) + (lives * 50);
                onComplete(score, `Basis geïnfiltreerd! Tijd: ${timeTaken.toFixed(1)}s. Punten: ${score.toFixed(0)}`, 'correct');
            }
        }
        
        function draw() {
            animationFrame++;
            ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, 0, width, height);
            
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLS; col++) {
                    if (mazeLayout[row] && mazeLayout[row][col] === 1) {
                        ctx.fillStyle = '#006400';
                        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
            
            ctx.fillStyle = 'var(--accent-lime-green)'; ctx.fillRect(exit.x, exit.y, TILE_SIZE, TILE_SIZE);
            ctx.font = `bold ${16 + Math.sin(animationFrame * 0.1) * 2}px Roboto Mono`;
            ctx.fillStyle = "black"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText('EXIT', exit.x + TILE_SIZE / 2, exit.y + TILE_SIZE / 2);

            guards.forEach(guard => {
                const isDangerous = isMoving && ambientNoise < NOISE_SAFETY_THRESHOLD;
                const radiusColor = isDangerous ? '255, 0, 0' : '255, 255, 0';

                const gradient = ctx.createRadialGradient(guard.x, guard.y, 10, guard.x, guard.y, guard.radius);
                gradient.addColorStop(0, `rgba(${radiusColor}, 0.2)`);
                gradient.addColorStop(1, `rgba(${radiusColor}, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath(); ctx.arc(guard.x, guard.y, guard.radius, 0, 2 * Math.PI); ctx.fill();
                
                ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(guard.x, guard.y, TILE_SIZE/3, 0, 2 * Math.PI); ctx.fill();
            });

            ctx.globalAlpha = isInvincible ? 0.5 : 1.0;
            ctx.fillStyle = 'blue'; ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, 2*Math.PI); ctx.fill();
            ctx.globalAlpha = 1.0;
            
            const meterHeight = height * 0.4, meterWidth = 30;
            const meterX = width - 45; // Iets naar rechts verplaatst
            const meterY = height - meterHeight - 20; // Wat hoger geplaatst
            ctx.fillStyle = '#333'; ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
            ctx.strokeStyle = 'white'; ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

            const thresholdY = meterY + meterHeight * (1-NOISE_SAFETY_THRESHOLD);
            ctx.beginPath(); ctx.moveTo(meterX, thresholdY); ctx.lineTo(meterX + meterWidth, thresholdY); ctx.strokeStyle = 'red'; ctx.lineWidth=2; ctx.stroke();
            
            const noiseBarHeight = ambientNoise * meterHeight;
            ctx.fillStyle = ambientNoise > NOISE_SAFETY_THRESHOLD ? 'var(--accent-lime-green)' : 'yellow';
            ctx.fillRect(meterX, meterY + meterHeight - noiseBarHeight, meterWidth, noiseBarHeight);
            
            stat1.textContent = `Pogingen: ${lives}`;
            stat2.textContent = 'Doel: EXIT';
            stat3.textContent = 'Geluid (beweeg boven rode lijn)';
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
        let objects = [], lives = 3, spawnTimer = 0, gameTime = 0, gameEnded = false;
        
        let keys = {};
        const keydownHandler = (e) => keys[e.code] = true;
        const keyupHandler = (e) => delete keys[e.code];
        window.activeGameListeners.push({target: window, type: 'keydown', handler: keydownHandler}, {target: window, type: 'keyup', handler: keyupHandler});
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type, handler));

        function spawnObject(isHarmful, baseSpeed, speedVariation) {
            objects.push({
                x: width,
                y: Math.random() * (height - 30),
                width: 30,
                height: 30, // Wordt gebruikt voor bounding box van cirkel
                speed: baseSpeed + Math.random() * speedVariation,
                harmful: isHarmful
            });
        }

        function update() {
            if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed; 
            if(keys['ArrowDown'] && player.y < height - player.height) player.y += player.speed;
            
            spawnTimer++;

            let spawnRate = Math.max(10, 35 - (gameTime / 120));

            if(spawnTimer > spawnRate) { 
                spawnTimer = 0; 

                const baseSpeed = 5 + (gameTime / 600);
                const speedVariation = 2 + (gameTime / 1200);

                // Spawn een schadelijk object
                spawnObject(true, baseSpeed, speedVariation);

                if (gameTime > 600 && Math.random() < 0.40) {
                    spawnObject(true, baseSpeed, speedVariation);
                }

                // Kans op een nuttig object wordt groter over tijd
                const helpfulChance = Math.min(0.55, 0.15 + (gameTime / 4000));
                if (Math.random() < helpfulChance) {
                    spawnObject(false, baseSpeed * 0.9, speedVariation);
                }
            }
            
            objects.forEach((obj, index) => {
                obj.x -= obj.speed; 
                if(obj.x < -obj.width) {
                    objects.splice(index, 1);
                }
                // Simpele AABB collision check blijft effectief
                if(player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                    if(obj.harmful) { 
                        lives--; 
                    } else { 
                        lives = Math.min(5, lives + 1);
                    }
                    objects.splice(index, 1);
                }
            });

            if(lives <= 0) {
                gameEnded = true;
            }
        }

        function draw() {
            ctx.fillStyle = '#1E1E1E'; ctx.fillRect(0, 0, width, height); 
            ctx.fillStyle = 'blue'; ctx.fillRect(player.x, player.y, player.width, player.height);
            
            objects.forEach(obj => { 
                if (obj.harmful) {
                    ctx.fillStyle = '#ff4d4d'; // Rood
                    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                } else {
                    ctx.fillStyle = 'var(--accent-lime-green)'; // Groen
                    ctx.beginPath();
                    ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
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
            update(); 
            draw();
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
