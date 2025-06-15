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

    // --- Verhaal & Level Data --- //
    const storyIntro = "Agent, welkom bij de Dalton Divisie. De kwaadaardige organisatie 'SILENT' dreigt al het geluid uit de wereld te stelen met hun 'Mute'-technologie. Jouw missie, mocht je die accepteren, is om hun operaties te saboteren. Agent Echo zal je begeleiden. Veel succes.";

    const levels = [
        // LEVEL 1
        {
            title: "Missie 1: De Tussenstof",
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
                title: "Minigame: Sonar Ping",
                type: 'canvas_input',
                init: initSonarMinigame,
                description: "Vind de verborgen SILENT-onderzeeër. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s. Hint: tijd = afstand / snelheid. Denk eraan: het signaal gaat heen én terug!",
                question: "Bereken de totale reistijd van het sonarsignaal in seconden.",
                answer: "3"
            }
        },
        // LEVEL 2
        {
            title: "Missie 2: Frequentie en Toonhoogte",
            questions: [
                {
                    question: "Je analyseert een signaal. De tijdbasis van de oscilloscoop is ingesteld op 2 ms/div. Wat betekent 'div'?",
                    options: ["De totale tijd op het scherm", "De hoogte van de golf", "Eén horizontaal hokje op het scherm", "De frequentie"],
                    answer: "Eén horizontaal hokje op het scherm"
                }
            ],
            minigame: {
                title: "Minigame: Kraak de Code",
                type: 'canvas_input',
                init: initOscilloscopeMinigame,
                description: "Een geanimeerd oscilloscoopbeeld toont 2 trillingen over 8 horizontale hokjes. De tijdbasis is 2 ms/div. Hint: f = 1 / T. Bereken eerst de trillingstijd T voor één volledige golf.",
                question: "Bereken de frequentie (f) van deze toon in Hertz (Hz).",
                answer: "125"
            }
        }
        // LEVEL 3 - wordt later toegevoegd
        // LEVEL 4 - wordt later toegevoegd
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
        levelTitle.textContent = levelData.title;
        levelContent.innerHTML = '';
        nextButton.classList.add('hidden');
        feedbackElement.classList.remove('show');
        
        // Reset taak-tellers voor het nieuwe level
        completedTasks = 0;
        levelTasks = levelData.questions.length + (levelData.minigame ? 1 : 0);

        levelData.questions.forEach((q) => {
            const questionEl = createQuestionElement(q);
            levelContent.appendChild(questionEl);
        });
        
        if (levelData.minigame) {
            const minigameEl = createMinigameElement(levelData.minigame);
            levelContent.appendChild(minigameEl);
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
    
    function createMinigameElement(minigameData) {
        const container = document.createElement('div');
        container.className = 'question-container task-container';
        
        let contentHTML = `
            <h3>${minigameData.title}</h3>
            <p>${minigameData.description}</p>
        `;

        if (minigameData.type === 'canvas_input' || minigameData.type === 'input') {
             contentHTML += `<canvas id="minigame-canvas" class="level-canvas" width="500" height="300"></canvas>`;
        }
        
        contentHTML += `
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
        
        // Roep de initialisatie functie voor de canvas minigame aan
        if (typeof minigameData.init === 'function') {
            // Wacht even tot het element in de DOM is
            setTimeout(() => {
                const canvas = document.getElementById('minigame-canvas');
                if(canvas) {
                    minigameData.init(canvas);
                }
            }, 0);
        }
        
        return container;
    }

    function taskCompleted(taskContainer, isCorrect) {
        // Zorg ervoor dat een taak maar één keer als voltooid wordt gemarkeerd
        if (taskContainer.classList.contains('completed')) return;
        
        taskContainer.classList.add('completed');
        if (isCorrect) {
            completedTasks++;
        } else {
             // Zelfs als het fout is, telt het als 'poging gedaan' om het level te kunnen voltooien.
             // We willen niet dat de speler vast komt te zitten.
             completedTasks++;
        }

        checkLevelCompletion();
    }
    
    function checkAnswer(selectedOption, correctAnswer, questionContainer) {
        const options = questionContainer.querySelectorAll('.option');
        if (questionContainer.classList.contains('completed')) return; // Al beantwoord

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
        if (gameContainer.classList.contains('completed')) return; // Al beantwoord
        
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
    
    function initSonarMinigame(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Teken de scene
        ctx.fillStyle = '#001f3f'; // Donkerblauw water
        ctx.fillRect(0, 0, width, height);
        
        // Teken schip
        ctx.fillStyle = '#888';
        ctx.fillRect(width/2 - 50, 10, 100, 20);
        ctx.fillRect(width/2 - 20, 0, 40, 10);
        
        // Teken onderzeeër
        ctx.fillStyle = '#555';
        ctx.fillRect(width/2 + 80, height - 40, 80, 20);
    }
    
    function initOscilloscopeMinigame(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const divSize = width / 10; // 10 hokjes breed

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        drawGrid(ctx, width, height, divSize);

        // Teken de sinusgolf
        // 2 trillingen over 8 hokjes. Elke trilling is 4 hokjes breed.
        ctx.beginPath();
        ctx.strokeStyle = 'var(--accent-lime-green)';
        ctx.lineWidth = 2;
        const centerY = height / 2;
        const amplitude = height / 4;
        const waveLength = 4 * divSize; // 4 hokjes

        for (let x = 0; x < width; x++) {
            const angle = (x / waveLength) * 2 * Math.PI;
            const y = centerY - Math.sin(angle) * amplitude;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
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
