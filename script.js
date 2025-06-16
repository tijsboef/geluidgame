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
                description: "We hebben een SILENT-basis gedetecteerd op de zeebodem. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s. Hint: tijd = afstand / snelheid. Denk eraan: het signaal gaat heen én terug!",
                question: "Bereken de totale reistijd van ons sonarsignaal in seconden.",
                answer: 3
            }
        },
        // Training 1
        {
            title: "Trainingsmissie 1: Actieve Sonar", type: 'minigame_only', init: initSonarGame,
            description: "Goed werk, agent. Nu je de theorie kent, is het tijd voor een praktijktest. SILENT drones verstoppen zich achter rotsformaties. Gebruik je sonar (spatiebalk) om de zeebodem in kaart te brengen en de 3 drones te vinden. Beweeg je schip met de pijltjestoetsen.",
        },
        // Missie 2
        {
            title: "Missie 2: Frequentie en Toonhoogte",
            type: 'theory_and_minigame',
            questions: [
                { question: "Je analyseert een signaal. De tijdbasis van de oscilloscoop is ingesteld op 2 ms/div. Wat betekent 'div'?", options: ["De totale tijd op het scherm", "De hoogte van de golf", "Eén horizontaal hokje op het scherm", "De frequentie"], answer: "Eén horizontaal hokje op het scherm" }
            ],
            minigame: {
                title: "Minigame: Kraak de Code", init: initOscilloscopeMinigame,
                description: "Een geanimeerd oscilloscoopbeeld toont 2 trillingen over 8 horizontale hokjes. De tijdbasis is 2 ms/div. Hint: f = 1 / T. Bereken eerst de trillingstijd T voor één volledige golf.",
                question: "Bereken de frequentie (f) van deze toon in Hertz (Hz).",
                answer: 125
            }
        },
        // Training 2
        {
            title: "Trainingsmissie 2: Frequentie Filteren", type: 'minigame_only', init: initFrequencyFilterGame,
            description: "Agent, SILENT zendt een stoorsignaal uit om onze communicatie te blokkeren. Het bestaat uit meerdere frequenties. Klik op de 'lawaaierige' golven om ze uit te filteren en het zuivere signaal over te houden voordat de tijd om is."
        },
        // Missie 3
        {
            title: "Missie 3: Geluidssterkte",
            type: 'theory_and_minigame',
             questions: [
                { question: "Twee tonen, P en Q, worden weergegeven op een oscilloscoop. Welk signaal is het sterkst (heeft de grootste amplitude)?", type: 'interactive_image', options: ['P', 'Q'], answer: 'Q', image: 'fig5' },
                 { question: "Welk van dezelfde twee signalen heeft de hoogste toon (de hoogste frequentie)?", type: 'interactive_image', options: ['P', 'Q'], answer: 'Q', image: 'fig5' }
            ],
            minigame: {
                title: "Analyse: Supporters Inschatten", init: null,
                description: "500 van onze supporters produceren 75 dB. Een vijandelijke menigte produceert 93 dB. Vuistregel: elke +3 dB is een verdubbeling van het aantal bronnen.",
                question: "Hoeveel supporters van SILENT juichen er?",
                options: ["4000", "16000", "32000", "64000"],
                answer: "32000"
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
            description: "Je infiltreert een luidruchtig SILENT-evenement. Grijp de juiste gehoorbescherming voordat je gehoor schade oploopt! Gebruik de pijltjestoetsen om te bewegen en de spatiebalk om te grijpen."
        }
    ];

    // --- Image Data (simuleert geladen afbeeldingen) --- //
    const imageSources = {
        fig5: "https://i.imgur.com/8F9aL8y.png" // Placeholder voor figuur 5
    };

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
        if (levelData.type === 'minigame_only') {
            minigameCount = 1;
            questionCount = 0;
        }
        levelTasks = questionCount + minigameCount;


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
            if (typeof levelData.init === 'function') {
                 setTimeout(() => {
                    const canvas = document.getElementById('minigame-canvas');
                    if (canvas) levelData.init(canvas, minigameFinished);
                }, 0);
            }
        }
    }
    
    // ... (rest van de functies: createQuestionElement, createMinigameInputElement, etc.)
    
    // --- Functies voor het maken van elementen --- //
    
    function createQuestionElement(questionData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        container.innerHTML = `<p>${questionData.question}</p>`;

        if (questionData.type === 'interactive_image' && imageSources[questionData.image]) {
            const img = document.createElement('img');
            img.src = imageSources[questionData.image];
            img.style.maxWidth = '100%';
            img.style.backgroundColor = 'white';
            img.style.padding = '10px';
            img.style.borderRadius = '5px';
            container.appendChild(img);
        }
        
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

        if (minigameData.type === 'drag_drop') {
            // Drag and drop logic
            const ddContainer = document.createElement('div');
            ddContainer.className = 'drag-drop-container';
            
            const itemsPool = document.createElement('div');
            itemsPool.className = 'items-pool';
            itemsPool.innerHTML = `<h4>Sleepbare Items:</h4>`;
            
            const dropZones = document.createElement('div');
            dropZones.className = 'drop-zones';

            minigameData.categories.forEach(cat => {
                const zone = document.createElement('div');
                zone.className = 'drop-zone';
                zone.dataset.category = cat;
                zone.innerHTML = `<h5>${cat}</h5>`;
                dropZones.appendChild(zone);
            });

            minigameData.items.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = 'draggable';
                el.textContent = item.text;
                el.draggable = true;
                el.id = `drag-${index}`;
                el.dataset.answer = item.answer;
                itemsPool.appendChild(el);
            });

            ddContainer.appendChild(itemsPool);
            ddContainer.appendChild(dropZones);
            container.appendChild(ddContainer);
            
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = 'Controleer Plaatsing';
            btn.onclick = () => checkDragDropAnswer(ddContainer, container);
            container.appendChild(btn);

            // Add drag and drop event listeners
            setTimeout(() => { // ensure elements are in DOM
                const draggables = container.querySelectorAll('.draggable');
                const zones = container.querySelectorAll('.drop-zone');
                
                draggables.forEach(draggable => {
                    draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
                    draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
                });

                zones.forEach(zone => {
                    zone.addEventListener('dragover', e => {
                        e.preventDefault();
                        zone.classList.add('hover');
                    });
                     zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
                    zone.addEventListener('drop', e => {
                        e.preventDefault();
                        const draggable = document.querySelector('.dragging');
                        zone.appendChild(draggable);
                        zone.classList.remove('hover');
                    });
                });
            }, 0);


        } else if (minigameData.options) { // Multiple choice minigame (Supporters)
             const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
             minigameData.options.forEach(optionText => {
                const optionEl = document.createElement('div');
                optionEl.className = 'option';
                optionEl.textContent = optionText;
                optionEl.addEventListener('click', () => checkAnswer(optionEl, minigameData.answer, container));
                optionsContainer.appendChild(optionEl);
            });
            container.appendChild(optionsContainer);

        } else { // Standaard invulvraag
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
        }
        
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
                <span id="stat1"></span>
                <span id="stat2"></span>
                <span id="stat3" style="font-style: italic;"></span>
            </div>
        `;
        return container;
    }

    // --- Controleer antwoord functies --- //

    function normalizeAnswer(input) {
        if (typeof input !== 'string') return input;
        return parseFloat(input.replace(',', '.'));
    }

    function checkAnswer(selectedOption, correctAnswer, questionContainer) {
        const options = questionContainer.querySelectorAll('.option');
        if (questionContainer.classList.contains('completed')) return;

        let isCorrect = false;
        options.forEach(opt => opt.style.pointerEvents = 'none');

        if (selectedOption.textContent === correctAnswer) {
            isCorrect = true;
            selectedOption.classList.add('correct');
        } else {
            selectedOption.classList.add('wrong');
            options.forEach(opt => {
                if(opt.textContent === correctAnswer) opt.classList.add('correct');
            });
        }
        
        if (isCorrect) {
            showFeedback('Correct! +100 punten', 'correct');
            updateScore(100);
        } else {
             showFeedback('Helaas, dat is niet correct.', 'incorrect');
        }
        taskCompleted(questionContainer, isCorrect);
    }
    
    function checkMultiChoiceAnswer(optionsContainer, correctAnswers, taskContainer) {
        if (taskContainer.classList.contains('completed')) return;

        const selectedOptions = optionsContainer.querySelectorAll('.option.selected');
        let correctSelections = 0;
        let incorrectSelections = 0;

        optionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            const isCorrect = correctAnswers.includes(opt.textContent);
            const isSelected = opt.classList.contains('selected');

            if (isSelected && isCorrect) {
                opt.classList.add('correct');
                correctSelections++;
            } else if (isSelected && !isCorrect) {
                opt.classList.add('wrong');
                incorrectSelections++;
            } else if (!isSelected && isCorrect) {
                opt.classList.add('wrong');
            }
        });

        const points = Math.max(0, (correctSelections * 75) - (incorrectSelections * 25));
        if (points > 0) {
            showFeedback(`Gedeeltelijk correct! +${points} punten`, 'correct');
            updateScore(points);
        } else {
            showFeedback('Helaas, geen punten gescoord.', 'incorrect');
        }
        taskCompleted(taskContainer, points > 0);
    }

     function checkDragDropAnswer(ddContainer, taskContainer) {
        if (taskContainer.classList.contains('completed')) return;

        let correctPlacements = 0;
        const zones = ddContainer.querySelectorAll('.drop-zone');
        
        zones.forEach(zone => {
            const category = zone.dataset.category;
            const items = zone.querySelectorAll('.draggable');
            items.forEach(item => {
                item.style.pointerEvents = 'none';
                if (item.dataset.answer === category) {
                    item.style.backgroundColor = 'var(--primary-green)';
                    correctPlacements++;
                } else {
                    item.style.backgroundColor = '#8b0000';
                }
            });
        });
        
        const points = correctPlacements * 50;
        if (points > 0) {
            showFeedback(`Goed werk! ${correctPlacements} items correct geplaatst. +${points} punten`, 'correct');
            updateScore(points);
        } else {
            showFeedback('Geen items correct geplaatst.', 'incorrect');
        }
        taskCompleted(taskContainer, points > 0);
    }

    function checkMinigameAnswer(inputElement, correctAnswer, gameContainer) {
        if (gameContainer.classList.contains('completed')) return;
        
        let isCorrect = false;
        inputElement.disabled = true;
        
        const userAnswerNorm = normalizeAnswer(inputElement.value);
        const correctAnswerNorm = normalizeAnswer(correctAnswer);

        if(userAnswerNorm === correctAnswerNorm) {
            isCorrect = true;
        } 
        
        if (isCorrect) {
            showFeedback('Uitstekend werk, Agent! +250 punten', 'correct');
            updateScore(250);
            inputElement.style.borderColor = 'var(--primary-green)';
        } else {
             showFeedback(`Incorrect. Het juiste antwoord was ${correctAnswer}.`, 'incorrect');
            inputElement.style.borderColor = '#8b0000';
        }
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
            pings.forEach(ping => { ctx.strokeStyle = 'var(--accent-lime-green)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2); ctx.stroke(); });
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
        const centerY = height / 2, amplitude = height / 4, waveLength = 4 * divSize;
        for (let x = 0; x < width; x++) { const angle = (x / waveLength) * 2 * Math.PI, y = centerY - Math.sin(angle) * amplitude; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
    }

    // --- Nieuwe Minigame Functies --- //

    function initFrequencyFilterGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let waves = [], timeLimit = 15, timeLeft = timeLimit, correctFilters = 0;

        // Create waves
        const waveParams = [
            { freq: 1, amp: 40, noisy: true, color: '#ff4d4d' }, { freq: 5, amp: 20, noisy: false, color: 'var(--accent-lime-green)'},
            { freq: 10, amp: 35, noisy: true, color: '#ff4d4d' }, { freq: 2, amp: 15, noisy: true, color: '#ff4d4d' }
        ];
        waveParams.forEach((p, i) => {
            waves.push({ ...p, x: 50, y: 80 + i * 110, width: width-100, height: 80, filtered: false });
        });

        function drawWave(wave) {
            ctx.strokeStyle = wave.filtered ? '#555' : wave.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            const centerY = wave.y + wave.height/2;
            for(let x=0; x < wave.width; x++) {
                const angle = (x / (wave.width/wave.freq)) * 2 * Math.PI;
                const yPos = centerY - Math.sin(angle) * wave.amp;
                if(x===0) ctx.moveTo(wave.x, yPos); else ctx.lineTo(wave.x+x, yPos);
            }
            ctx.stroke();
            if(wave.filtered) { ctx.font = "30px Roboto Mono"; ctx.fillStyle = "white"; ctx.fillText("GEFILTERD", wave.x + wave.width/2 - 80, wave.y + wave.height/2 + 10); }
        }

        function handleClick(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            waves.forEach(wave => {
                if(!wave.filtered && x > wave.x && x < wave.x+wave.width && y > wave.y && y < wave.y+wave.height) {
                    wave.filtered = true;
                    if(wave.noisy) correctFilters++;
                }
            });
        }
        canvas.addEventListener('click', handleClick);
        
        const timer = setInterval(() => { timeLeft--; if(timeLeft <= 0) gameLoop(); }, 1000);

        function gameLoop() {
            ctx.fillStyle = '#001f3f'; ctx.fillRect(0, 0, width, height);
            waves.forEach(drawWave);
            stat1.textContent = `Tijd Over: ${timeLeft}s`; stat2.textContent = `Correct Gefilterd: ${correctFilters}`; stat3.textContent = '';
            
            if(timeLeft <= 0) {
                clearInterval(timer);
                canvas.removeEventListener('click', handleClick);
                onComplete(correctFilters * 100, `Tijd is om! ${correctFilters} stoorsignalen gefilterd.`, 'correct');
            } else {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }
        gameLoop();
    }
    
    function initJammerGame(canvas, onComplete) { /* Placeholder */ onComplete(150, "Placeholder Jammer game voltooid.", "correct"); }
    function initHearingProtectionGame(canvas, onComplete) { /* Placeholder */ onComplete(150, "Placeholder Hearing game voltooid.", "correct"); }


    // --- Event Listeners --- //
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextLevel);
    restartButton.addEventListener('click', restartGame);

    // --- Initialisatie --- //
    animateText(introTextElement, storyIntro);
});
