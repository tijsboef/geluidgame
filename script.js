// Wacht tot de volledige HTML is geladen
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elementen --- //
    // Hier slaan we referenties op naar alle HTML-elementen die we nodig hebben.
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
    // Hier houden we de status van het spel bij, zoals de score en de huidige level.
    let currentLevelIndex = -1; // Begint bij -1 voor de introductie
    let score = 0;
    let agentName = "Nieuweling";

    // --- Verhaal & Level Data --- //
    const storyIntro = "Agent, welkom bij de Dalton Divisie. De kwaadaardige organisatie 'SILENT' dreigt al het geluid uit de wereld te stelen met hun 'Mute'-technologie. Jouw missie, mocht je die accepteren, is om hun operaties te saboteren. Agent Echo zal je begeleiden. Veel succes.";

    const levels = [
        // LEVEL 1
        {
            title: "Missie 1: De Tussenstof",
            type: 'theory',
            questions: [
                 {
                    question: "Je hoort de stem van een dolfijn diep in de zee. Door welke tussenstof verplaatst het geluid van de dolfijn zich naar jou toe?",
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
                type: 'input',
                description: "Vind de verborgen SILENT-onderzeeër. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s. Hint: tijd = afstand / snelheid. Denk eraan: het signaal gaat heen én terug!",
                question: "Bereken de totale reistijd van het sonarsignaal in seconden.",
                answer: "3"
            }
        },
        // LEVEL 2 - wordt later toegevoegd
        // LEVEL 3 - wordt later toegevoegd
        // LEVEL 4 - wordt later toegevoegd
    ];

    // --- Game Functies --- //

    /**
     * Start het spel: initialiseert de game state en toont het eerste level.
     */
    function startGame() {
        agentName = agentNameInput.value || "Nieuweling";
        agentNameDisplay.textContent = agentName;
        score = 0;
        currentLevelIndex = 0;
        scoreDisplay.textContent = score;
        showScreen('level');
        loadLevel(levels[currentLevelIndex]);
    }
    
    /**
     * Toont een specifiek scherm (intro, level, end) en verbergt de andere.
     * @param {string} screenName - De naam van het scherm om te tonen.
     */
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    /**
     * Animate text character by character.
     * @param {HTMLElement} element - Het HTML element waar de tekst in moet.
     * @param {string} text - De tekst die geanimeerd moet worden.
     */
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
        }, 30); // Snelheid van typen in ms
    }


    /**
     * Laadt de content voor een specifiek level in het level-scherm.
     * @param {object} levelData - De data voor het te laden level.
     */
    function loadLevel(levelData) {
        levelTitle.textContent = levelData.title;
        levelContent.innerHTML = ''; // Maak het content gebied leeg
        nextButton.classList.add('hidden'); // Verberg de 'volgende' knop

        // Maak de theorievragen
        levelData.questions.forEach((q, index) => {
            const questionEl = createQuestionElement(q, index);
            levelContent.appendChild(questionEl);
        });
        
        // Maak de minigame
        if (levelData.minigame) {
            const minigameEl = createMinigameElement(levelData.minigame);
            levelContent.appendChild(minigameEl);
        }
    }

    /**
     * Creëert en retourneert een HTML-element voor een theorievraag.
     */
    function createQuestionElement(questionData, id) {
        const container = document.createElement('div');
        container.className = 'question-container';
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
    
    /**
     * Creëert en retourneert een HTML-element voor een minigame.
     */
    function createMinigameElement(minigameData) {
        const container = document.createElement('div');
        container.className = 'question-container';
        container.innerHTML = `
            <h3>${minigameData.title}</h3>
            <p>${minigameData.description}</p>
            <p><strong>${minigameData.question}</strong></p>
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'minigame-input';
        container.appendChild(input);
        
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = 'Controleer Antwoord';
        button.addEventListener('click', () => checkMinigameAnswer(input, minigameData.answer, container));
        container.appendChild(button);
        
        return container;
    }


    /**
     * Controleert het antwoord op een theorievraag.
     */
    function checkAnswer(selectedOption, correctAnswer, questionContainer) {
        // Voorkom dat er opnieuw geklikt kan worden
        const options = questionContainer.querySelectorAll('.option');
        options.forEach(opt => opt.style.pointerEvents = 'none');

        if (selectedOption.textContent === correctAnswer) {
            showFeedback('Correct! +100 punten', 'correct');
            updateScore(100);
            selectedOption.classList.add('correct');
        } else {
            showFeedback('Helaas, dat is niet correct.', 'incorrect');
            selectedOption.classList.add('wrong');
            // Markeer het juiste antwoord
            options.forEach(opt => {
                if(opt.textContent === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
        }
        checkLevelCompletion();
    }
    
    /**
     * Controleert het antwoord op een minigame.
     */
    function checkMinigameAnswer(inputElement, correctAnswer, gameContainer) {
        inputElement.disabled = true; // Voorkom aanpassingen
        
        if(inputElement.value.trim() === correctAnswer) {
            showFeedback('Uitstekend werk, Agent! +250 punten', 'correct');
            updateScore(250);
            inputElement.style.borderColor = 'var(--primary-green)';
        } else {
            showFeedback(`Incorrect. Het juiste antwoord was ${correctAnswer}.`, 'incorrect');
            inputElement.style.borderColor = '#8b0000';
        }
        checkLevelCompletion();
    }


    /**
     * Controleert of alle vragen/minigames in het huidige level beantwoord zijn.
     */
    function checkLevelCompletion() {
        // Simpele check: als alle vragen beantwoord zijn, toon 'volgende'.
        // Dit moet nog verfijnd worden. Nu tonen we hem na elk antwoord.
        nextButton.classList.remove('hidden');
    }

    /**
     * Gaat naar het volgende level of het eindscherm.
     */
    function nextLevel() {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) {
            loadLevel(levels[currentLevelIndex]);
            feedbackElement.classList.remove('show');
        } else {
            endGame();
        }
    }

    /**
     * Toont een feedbackbericht (correct/incorrect).
     */
    function showFeedback(message, type) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message ${type} show`;
    }

    /**
     * Werkt de score bij en toont deze op het scherm.
     */
    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }
    
    /**
     * Beëindigt het spel en toont het eindscherm met de score en highscores.
     */
    function endGame() {
        finalAgentName.textContent = agentName;
        finalScoreDisplay.textContent = score;
        saveAndShowHighscores();
        showScreen('end');
    }

    /**
     * Slaat de score op in localStorage en toont de top 5.
     */
    function saveAndShowHighscores() {
        const highscores = JSON.parse(localStorage.getItem('daltonHighscores')) || [];
        highscores.push({ name: agentName, score: score });
        highscores.sort((a, b) => b.score - a.score); // Sorteer van hoog naar laag
        const top5 = highscores.slice(0, 5);
        localStorage.setItem('daltonHighscores', JSON.stringify(top5));

        highscoreList.innerHTML = ''; // Maak de lijst leeg
        top5.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name} - ${entry.score} punten`;
            highscoreList.appendChild(li);
        });
    }
    
    /**
     * Herstart het spel vanaf de introductie.
     */
     function restartGame() {
        currentLevelIndex = -1;
        showScreen('intro');
        animateText(introTextElement, storyIntro);
     }


    // --- Event Listeners --- //
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextLevel);
    restartButton.addEventListener('click', restartGame);

    // --- Initialisatie --- //
    animateText(introTextElement, storyIntro); // Start de intro animatie
});
