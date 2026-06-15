// Wacht tot de volledige HTML is geladen
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elementen --- //
    const loaderScreen = document.getElementById('loader-screen');
    const classSelectionScreen = document.getElementById('class-selection-screen');
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
    const vmboButton = document.getElementById('class-vmbo-btn');
    const ghaButton = document.getElementById('class-gha-btn');
    const tlButton = document.getElementById('class-tl-btn'); 

    // --- Game State --- //
    let currentLevelIndex = -1;
    let score = 0;
    let agentName = "Nieuweling";
    let levelTasks = 0;
    let completedTasks = 0;
    let activeGameLoopId = null; 
    let playerClass = ''; // 'VMBO', 'GHA' or 'TL'
    let incorrectAnswersLog = [];
    
    // --- Verhaal --- //
    const storyIntro = "Agent, welkom bij de Dalton Divisie. De kwaadaardige organisatie 'SILENT' dreigt al het geluid uit de wereld te stelen met hun 'Mute'-technologie. Jouw missie, mocht je die accepteren, is om hun operaties te saboteren. Agent Echo zal je begeleiden. Veel succes.";

    // =========================================================================
    // <<< UITGEBREIDE VRAGENDATABASE >>>
    // =========================================================================
    
    // --- Missie 1 Vragen --- //
    const mission1_q1 = [
        { question: "Je zwemt onderwater en hoort de stem van een dolfijn diep in de zee. Door welke tussenstof verplaatst het geluid zich naar jou toe?", options: ["Lucht", "Aarde", "Water", "Vacuüm"], answer: "Water" },
        { question: "Een ruimtewandelaar slaat met een hamer tegen een satelliet. Waarom hoort zijn collega op een paar meter afstand niets?", options: ["Er is een vacuüm en geen tussenstof", "Het geluid is te zacht", "De helm blokkeert het geluid", "De hamer is van rubber"], answer: "Er is een vacuüm en geen tussenstof" },
        { question: "Je staat op een heuvel en hoort kerkklokken in de verte. Wat is de belangrijkste tussenstof voor dit geluid?", options: ["Lucht", "Water", "Aarde", "Metaal"], answer: "Lucht" },
        { question: "Een geoloog plaatst een seismograaf om trillingen te meten na een explosie kilometers verderop. Door welke tussenstof reist het signaal voornamelijk?", options: ["Aarde", "Lucht", "Water", "Kabels"], answer: "Aarde" },
    ];
    const mission1_q2 = [
        { question: "Een trainer roept de dolfijn met een fluitje vanaf de rand van het bassin. Door welke tussenstof(fen) verplaatst dit geluid zich om de dolfijn te bereiken?", options: ["Alleen water", "Alleen lucht", "Eerst water, dan lucht", "Eerst lucht, dan water"], answer: "Eerst lucht, dan water" },
        { question: "Je tikt op het raam van een groot aquarium. Een vis aan de andere kant van het aquarium schrikt. Wat is de reisweg van het geluid?", options: ["Alleen glas", "Alleen water", "Eerst water, dan glas", "Eerst glas, dan water"], answer: "Eerst glas, dan water" },
        { question: "Een vogel in een boom zingt. Je hoort hem terwijl je hoofd onder water is in het zwembad ernaast. Wat is de reisweg van het geluid?", options: ["Alleen lucht", "Alleen water", "Eerst water, dan lucht", "Eerst lucht, dan water"], answer: "Eerst lucht, dan water" },
        { question: "Je hoort je bovenbuurman lopen. Wat is de meest directe reisweg van dit contactgeluid?", options: ["Alleen vloer", "Alleen lucht", "Via de muren", "Eerst vloer, dan lucht"], answer: "Eerst vloer, dan lucht" },
    ];
    const mission1_minigame = [
        { title: "Analyse: Sonar Echo", description: "We hebben een SILENT-basis gedetecteerd op de zeebodem. De diepte is 2250 m en de geluidssnelheid in zeewater is 1500 m/s.", question: "Bereken de totale reistijd van ons sonarsignaal in seconden.", answer: 3, hint: "tijd = afstand / snelheid. Let op: het signaal moet heen én terug, dus de totale afstand is 2 x 2250 m." },
        { title: "Analyse: Sonar Echo", description: "We hebben een vijandelijke onderzeeër gespot op 3000 m diepte. De geluidssnelheid hier is 1500 m/s.", question: "Bereken de totale reistijd van de sonar ping in seconden.", answer: 4, hint: "tijd = afstand / snelheid. De totale afstand is heen en terug (2 x 3000 m)." },
        { title: "Analyse: Sonar Echo", description: "Een wrak ligt op de bodem van een ondiep meer, op 750 m diepte. Geluidssnelheid in dit water is 1500 m/s.", question: "Wat is de reistijd van ons signaal in seconden?", answer: 1, hint: "tijd = afstand / snelheid. Vergeet de terugreis niet mee te rekenen." },
        { title: "Analyse: Sonar Echo", description: "Onze sonar pingt een object op een diepte van 1500 m. De geluidssnelheid is 1500 m/s.", question: "Bereken de totale reistijd in seconden.", answer: 2, hint: "tijd = afstand / snelheid. De totale afstand is 2 x 1500 m." },
    ];

    // --- Missie 2 Vragen --- //
    const mission2_q1 = [
        { question: "De tijdbasis van de oscilloscoop is ingesteld op 2 ms/div. Wat betekent 'div'?", options: ["De totale tijd op het scherm", "De hoogte van de golf", "Eén horizontaal hokje op het scherm", "De frequentie"], answer: "Eén horizontaal hokje op het scherm" },
        { question: "Op een oscilloscoop meet je de amplitude van een geluidsgolf. In welke richting kijk je dan voornamelijk?", options: ["De verticale as (Y-as)", "De horizontale as (X-as)", "De diepte-as (Z-as)", "De ronde knoppen"], answer: "De verticale as (Y-as)" },
        { question: "Je wilt de trillingstijd (periode) van een golf meten op een oscilloscoop. Welke as gebruik je daarvoor?", options: ["De horizontale as (X-as)", "De verticale as (Y-as)", "De helderheid van de lijn", "De kleur van de golf"], answer: "De horizontale as (X-as)" },
        { question: "Het scherm heeft 10 hokjes (divs) in de breedte. De tijdbasis staat op 5 ms/div. Wat is de totale tijd die op het scherm wordt weergegeven?", options: ["5 ms", "10 ms", "50 ms", "2 ms"], answer: "50 ms" },
    ];
    const mission2_minigame = [
        { title: "Analyse: Kraak de Code", description: "Een geanimeerd oscilloscoopbeeld toont 2 trillingen over 10 horizontale hokjes. De tijdbasis is 2 ms/div.", init: initOscilloscopeMinigame, initOptions: { oscillations: 2, totalDivs: 10 }, intermediateQuestion: "Bereken eerst de trillingstijd (T) in ms:", intermediateAnswer: 10, question: "Bereken nu de frequentie (f) van deze toon in Hertz (Hz):", answer: 100, hint: "Eén trilling (T) is 5 hokjes lang (10 hokjes / 2 trillingen). T = 5 * 2 = 10 ms. f = 1 / T. Vergeet niet ms naar s om te rekenen (10 ms = 0,01 s)." },
        { title: "Analyse: Kraak de Code", description: "We zien 4 trillingen over 10 hokjes. De tijdbasis is 5 ms/div.", init: initOscilloscopeMinigame, initOptions: { oscillations: 4, totalDivs: 10 }, intermediateQuestion: "Bereken eerst de trillingstijd (T) in ms:", intermediateAnswer: 12.5, question: "Bereken nu de frequentie (f) in Hz:", answer: 80, hint: "Eén trilling (T) is 2.5 hokjes lang (10 / 4). T = 2.5 * 5 = 12.5 ms. f = 1 / T. Vergeet niet ms naar s om te rekenen (12.5 ms = 0,0125 s)." },
        { title: "Analyse: Kraak de Code", description: "Er zijn 2 trillingen over 8 hokjes. De tijdbasis is 1 ms/div.", init: initOscilloscopeMinigame, initOptions: { oscillations: 2, totalDivs: 8 }, intermediateQuestion: "Bereken eerst de trillingstijd (T) in ms:", intermediateAnswer: 4, question: "Bereken nu de frequentie (f) in Hz:", answer: 250, hint: "Eén trilling (T) is 4 hokjes lang (8 / 2). T = 4 * 1 = 4 ms. f = 1 / T. Vergeet niet ms naar s om te rekenen (4 ms = 0,004 s)." },
        { title: "Analyse: Kraak de Code", description: "Je ziet 1 trilling over 5 hokjes. De tijdbasis is 10 ms/div.", init: initOscilloscopeMinigame, initOptions: { oscillations: 1, totalDivs: 5 }, intermediateQuestion: "Bereken eerst de trillingstijd (T) in ms:", intermediateAnswer: 50, question: "Bereken nu de frequentie (f) in Hz:", answer: 20, hint: "Eén trilling (T) is 5 hokjes lang. T = 5 * 10 = 50 ms. f = 1 / T. Vergeet niet ms naar s om te rekenen (50 ms = 0,05 s)." },
    ];

    // --- Missie 3 Vragen --- //
    const mission3_q1 = [
        { question: "Welke golf in de animatie is het sterkst (heeft de grootste amplitude)?", options: ['P', 'Q'], answer: 'Q' },
        { question: "Welke golf in de animatie heeft de hoogste toon (de hoogste frequentie)?", options: ['P', 'Q'], answer: 'Q' },
        { question: "Welke golf in de animatie is het zachtst (heeft de kleinste amplitude)?", options: ['P', 'Q'], answer: 'P' },
        { question: "Welke golf in de animatie heeft de laagste toon (de laagste frequentie)?", options: ['P', 'Q'], answer: 'P' },
    ];
     const mission3_q2 = [
        { question: "Een gitarist maakt de snaar van zijn gitaar korter door zijn vinger op de hals te plaatsen. Wat gebeurt er met de toon?", options: ["De toon wordt hoger", "De toon wordt lager", "Het volume wordt harder", "De snaar breekt"], answer: "De toon wordt hoger" },
        { question: "Een bassist vervangt een dunne snaar door een veel dikkere snaar. Wat is het effect op de toonhoogte als hij de snaar aanslaat?", options: ["Het volume verandert niet", "De toon wordt hoger", "De toon wordt lager", "De snaar trilt niet meer"], answer: "De toon wordt lager" },
        { question: "Een violist draait aan de stemknop om de spanning van een snaar te verhogen. Wat voor effect heeft dit op het geluid?", options: ["De toon wordt lager", "Het volume wordt zachter", "Er verandert niets", "De toon wordt hoger"], answer: "De toon wordt hoger" },
        { question: "Twee identieke snaren worden even strak gespannen. Snaar A is van staal (zwaarder), snaar B is van nylon (lichter). Welke snaar produceert waarschijnlijk een hogere toon?", options: ["Snaar A", "Snaar B", "Ze produceren dezelfde toon", "Geen van beide produceert een toon"], answer: "Snaar B" },
    ];

    // GECORRIGEERDE OBJECT MET VMBO, GHA én TL varianten
    const mission3_minigame = {
        GHA: [
            { title: "Analyse: Sterkte Inschatten", description: "500 van onze supporters produceren 75 dB. Een vijandelijke menigte produceert 93 dB.", question: "Hoeveel supporters van SILENT juichen er?", options: ["4.000", "16.000", "32.000", "64.000"], answer: "32.000", hint: "Het verschil is 93 - 75 = 18 dB. Elke +3 dB is een verdubbeling. Hoe vaak past 3 in 18? (6 keer). Je moet het aantal supporters dus 6 keer verdubbelen." },
            { title: "Analyse: Sterkte Inschatten", description: "Een SILENT-basis wordt beschermd door 10 jammers die samen 100 dB aan ruis produceren. Een nabijgelegen Dalton-buitenpost produceert 112 dB.", question: "Wat is het jammer-equivalent van onze buitenpost?", options: ["80", "160", "320", "1000"], answer: "160", hint: "Verschil = 12 dB. Dat zijn 4 verdubbelingen (12/3=4). Start met 10 en verdubbel 4 keer." },
            { title: "Analyse: Sterkte Inschatten", description: "Eén SILENT-spion produceert 20 dB aan data-ruis. Hun hoofdkwartier produceert 62 dB.", question: "Hoeveel spionnen zijn daar actief (afgerond)?", options: ["1024", "4096", "16384", "8192"], answer: "16384", hint: "Verschil = 42 dB. Dat zijn 14 verdubbelingen (42/3=14). Je moet 1 veertien keer verdubbelen." },
            { title: "Analyse: Sterkte Inschatten", description: "40 SILENT-drones produceren 80 dB aan geluid. Een opstijgend vrachtvliegtuig van de vijand produceert 122 dB.", question: "Wat is de geluidssterkte-equivalent in drones?", options: ["655.360", "40.000", "128.000", "1.280.000"], answer: "655.360", hint: "Verschil = 42 dB. Dat zijn 14 verdubbelingen (42/3=14). Je moet 40 veertien keer verdubbelen (40 x 16384)." },
        ],
        VMBO: [
            { title: "Analyse: Meting controleren", description: "Een agent controleert of een scooter niet te veel lawaai maakt. Volgens de voorschriften moet de decibelmeter op 50 cm afstand van de knalpijp worden gehouden.", question: "De agent meet een te hoge waarde als de afstand groter / kleiner is dan 50 cm.", options: ["groter", "kleiner"], answer: "kleiner" },
            { title: "Analyse: Meting controleren", description: "Een agent controleert of een scooter niet te veel lawaai maakt. Volgens de voorschriften moet de decibelmeter op 50 cm afstand van de knalpijp worden gehouden.", question: "De agent meet een te lage waarde als de afstand groter / kleiner is dan 50 cm.", options: ["groter", "kleiner"], answer: "groter" },
            { title: "Analyse: Meting controleren", description: "Een agent controleert of een scooter niet te veel lawaai maakt. Volgens de voorschriften moet de decibelmeter op 50 cm afstand van de knalpijp worden gehouden.", question: "De scooterrijder kan ten onrechte een boete krijgen als de afstand groter / kleiner is dan 50 cm.", options: ["groter", "kleiner"], answer: "kleiner" },
            { title: "Analyse: Meting controleren", description: "Een agent controleert of een scooter niet te veel lawaai maakt. Volgens de voorschriften moet de decibelmeter op 50 cm afstand van de knalpijp worden gehouden.", question: "De scooter wordt onterecht goedgekeurd als de afstand groter / kleiner is dan 50 cm.", options: ["groter", "kleiner"], answer: "groter" },
        ],
        TL: [
            { title: "Analyse: Afstand & dB", description: "Op 5m is het niveau 120 dB. Verdubbeling van de afstand geeft -6 dB.", question: "Wat is het geluidsniveau op 40 meter?", options: ["114 dB", "108 dB", "102 dB", "96 dB"], answer: "102 dB", hint: "5->10 (1 verdubbeling), 10->20 (2), 20->40 (3). 120 - (3*6) = 102 dB." },
            { title: "Analyse: Intensiteit Percentage", description: "Een demper verlaagt het niveau van 104 naar 95 dB (-9 dB).", question: "Hoeveel procent van het geluid blijft er over?", options: ["50%", "25%", "12.5%", "6.25%"], answer: "12.5%", hint: "Elke -3 dB = helft van het geluid. -9 dB = 3 stappen. 100% -> 50% -> 25% -> 12.5%." },
            { title: "Analyse: Keer zo hard", description: "Vergelijk een bron van 83 dB met een bron van 68 dB. Elke +3 dB is een verdubbeling van de intensiteit.", question: "Hoeveel keer zo hard is de 83 dB bron?", options: ["5 keer", "15 keer", "32 keer", "64 keer"], answer: "32 keer", hint: "Verschil = 83 - 68 = 15 dB. 15 / 3 = 5 stappen van 3. 2^5 = 32." },
            { title: "Analyse: Afstand & dB Expert", description: "Op 10m is het niveau 100 dB. De afstand stijgt naar 80m.", question: "Wat is het nieuwe geluidsniveau in dB?", options: ["88 dB", "82 dB", "76 dB", "94 dB"], answer: "82 dB", hint: "10->20->40->80 = 3 verdubbelingen van de afstand. 100 - (3*6) = 82 dB." },
        ]
    };
    
    // --- Missie 4 Vragen --- //
    const mission4_q1 = [
        { question: "Selecteer twee manieren om de geluidshinder van verkeer bij de BRON aan te pakken.", type: 'multi_choice', options: ["Huizen extra goed isoleren", "Stiller asfalt aanleggen", "Een geluidswal plaatsen", "De maximumsnelheid verlagen"], answer: ["Stiller asfalt aanleggen", "De maximumsnelheid verlagen"] },
        { question: "Een lawaaiige generator van SILENT staat op een dak. Selecteer twee maatregelen die de GELUIDSOVERDRACHT verminderen.", type: 'multi_choice', options: ["De generator op rubberen tegels plaatsen", "Een geluidsdichte omkasting bouwen", "De generator zachter zetten", "De generator 's nachts uitzetten"], answer: ["De generator op rubberen tegels plaatsen", "Een geluidsdichte omkasting bouwen"] },
        { question: "Je wilt geluidsoverlast van een SILENT-basis naast je huis verminderen. Selecteer twee maatregelen die je bij de ONTVANGER kunt nemen.", type: 'multi_choice', options: ["De basis opblazen", "Dubbel glas plaatsen", "Oorkappen dragen", "Een geluidswal bouwen"], answer: ["Dubbel glas plaatsen", "Oorkappen dragen"] },
        { question: "Welke twee factoren bepalen voornamelijk hoe luid je een vijandelijk vliegtuig hoort overvliegen?", type: 'multi_choice', options: ["De kleur van het vliegtuig", "De afstand tot het vliegtuig", "Het type motor", "De snelheid van de wind"], answer: ["De afstand tot het vliegtuig", "Het type motor"] },
    ];
    const mission4_minigame = [
        { title: "Analyse: Geluidsmaatregelen", type: 'drag_drop', question: "Sleep de eigenschappen naar de juiste maatregel.", categories: ['Geluidsscherm', 'Geluidswal'], items: [{ text: "Bestaat uit aarde, vaak begroeid", answer: 'Geluidswal' }, { text: "Kaatst geluid terug", answer: 'Geluidsscherm' }, { text: "Absorbeert geluid beter", answer: 'Geluidswal' }, { text: "Heeft meer bouwruimte nodig", answer: 'Geluidswal' }] },
        { title: "Analyse: Materialen", type: 'drag_drop', question: "Koppel het materiaal aan de juiste eigenschap.", categories: ['Absorptie', 'Reflectie'], items: [{ text: "Speciaal schuimrubber", answer: 'Absorptie' }, { text: "Beton", answer: 'Reflectie' }, { text: "Hout", answer: 'Reflectie' }, { text: "Dikke laag aarde en gras", answer: 'Absorptie' }] },
        { title: "Analyse: Toepassing", type: 'drag_drop', question: "Koppel de toepassing aan de juiste maatregel.", categories: ['Geluidsscherm', 'Geluidswal'], items: [{ text: "Langs een spoorlijn in de stad", answer: 'Geluidsscherm' }, { text: "Langs een snelweg met veel ruimte", answer: 'Geluidswal' }, { text: "Natuurlijke, groene uitstraling", answer: 'Geluidswal' }, { text: "Hoge geluidsisolatie op klein oppervlak", answer: 'Geluidsscherm' }] },
        { title: "Analyse: Werkingsprincipe", type: 'drag_drop', question: "Koppel het werkingsprincipe aan de eigenschap.", categories: ['Absorptie', 'Reflectie'], items: [{ text: "Geluid wordt 'gevangen' en omgezet in warmte", answer: 'Absorptie' }, { text: "Geluid wordt een andere kant op gestuurd", answer: 'Reflectie' }, { text: "Creëert een 'geluidsschaduw'", answer: 'Reflectie' }, { text: "Werkt het beste met zachte, poreuze materialen", answer: 'Absorptie' }] },
    ];
    
    // --- Definitieve Level Structuur --- //
    const levels = [
        {
            title: "Missie 1: De Tussenstof & Sonar Basis",
            type: 'theory_and_minigame',
            questions: [mission1_q1, mission1_q2],
            minigame: mission1_minigame
        },
        {
            title: "Trainingsmissie 1: Echolocatie Navigatie", type: 'minigame_only', init: initSonarGame,
            description: "Je vaart in absolute duisternis. Gebruik de pijltjestoetsen om te navigeren. Druk op SPATIE voor een sonar-ping om de muren (groen) en vijandelijke mijnen (rood) tijdelijk zichtbaar te maken. Bereik de EXIT.",
        },
        {
            title: "Missie 2: Frequentie en Toonhoogte",
            type: 'theory_and_minigame',
            questions: [mission2_q1],
            minigame: mission2_minigame
        },
        {
            title: "Trainingsmissie 2: Signaal Decryptie", type: 'minigame_only', init: initFrequencyMatchGame,
            description: "Hack het vijandelijke signaal (ROOD) door jouw oscillator (GROEN) exact af te stemmen. Gebruik de sliders voor Frequentie en Amplitude. Hack 3 signalen om te winnen."
        },
        {
            title: "Missie 3: Geluidssterkte",
            type: 'theory_with_canvas',
            canvasPreamble: initAmplitudeComparison,
            questions: [mission3_q1, mission3_q2],
            minigame: mission3_minigame
        },
        {
            title: "Trainingsmissie 3: Decibel Stealth", type: 'minigame_only', init: initDecibelSneak,
            description: "Infiltreer de basis. Gebruik pijltjestoetsen. Jouw beweging produceert geluid (witte cirkel rondom jou). Beweeg langzaam of sta stil om geluid te dempen. Blijf met je geluid uit de buurt van de patrouillerende vijandelijke microfoons (rood)."
        },
        {
            title: "Missie 4: Geluidshinder Bestrijden",
            type: 'theory_and_minigame',
            questions: [mission4_q1],
            minigame: mission4_minigame
        },
        {
            title: "Trainingsmissie 4: Geluidsbarrière Defensie", type: 'minigame_only', init: initNoiseDefense,
            description: "Vijandelijke drones (links) vuren schadelijke geluidsgolven af op het doelwit (rechts). KLIK en SLEEP in het veld om geluidsschermen te tekenen. Schermen houden geluid tegen maar slijten! Je budget herstelt langzaam. Overleef 20 seconden."
        }
    ];
    
   // --- Game Functies --- //

    function getRandomVariant(variants, key) {
        const allIndices = Array.from(Array(variants.length).keys());
        let usedIndices = JSON.parse(localStorage.getItem(key)) || [];

        let availableIndices = allIndices.filter(index => !usedIndices.includes(index));

        if (availableIndices.length === 0) {
            usedIndices = [];
            localStorage.setItem(key, JSON.stringify(usedIndices));
            availableIndices = allIndices;
        }

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        usedIndices.push(randomIndex);
        localStorage.setItem(key, JSON.stringify(usedIndices));

        return variants[randomIndex];
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
        levelTasks = 0;
        
        if (levelData.canvasPreamble) {
            levelData.canvasPreamble(levelContent);
        }

        // 1. Laad theorievragen
        if (levelData.questions) {
             levelData.questions.forEach((questionGroup, index) => {
                const qKey = `m${currentLevelIndex}q${index}_${playerClass}`;
                const question = getRandomVariant(questionGroup, qKey);
                const questionEl = createQuestionElement(question);
                levelContent.appendChild(questionEl);
                levelTasks++;
            });
        }
        
        // 2. Laad theorie-minigame
        if (levelData.minigame) {
            let minigameGroup = levelData.minigame;
            // Gedifferentieerde logica voor missie 3
            if (currentLevelIndex === 4 && levelData.minigame[playerClass]) {
                 minigameGroup = levelData.minigame[playerClass];
            }
            const mgKey = `m${currentLevelIndex}mg_${playerClass}`;
            const minigame = getRandomVariant(minigameGroup, mgKey);
            const minigameEl = createMinigameInputElement(minigame);
            levelContent.appendChild(minigameEl);
            levelTasks++;
        }

        // 3. Laad de grote canvas minigame
        if (levelData.type === 'minigame_only') {
            const minigameEl = createStandaloneMinigameElement(levelData);
            levelContent.appendChild(minigameEl);
            if (typeof levelData.init === 'function') {
                 setTimeout(() => {
                    const canvas = document.getElementById('minigame-canvas');
                    if (canvas) levelData.init(canvas, minigameFinished);
                }, 0);
            }
            levelTasks = 1;
        }
    }

    function startGame() {
        incorrectAnswersLog = [];
        agentName = agentNameInput.value || "Nieuweling";
        agentNameDisplay.textContent = agentName;
        score = 0;
        currentLevelIndex = 0;
        scoreDisplay.textContent = score;
        showScreen('level');
        loadLevel(levels[currentLevelIndex]);
    }
    
    function showScreen(screenName) {
        loaderScreen.style.display = 'none';
        classSelectionScreen.style.display = 'none';
        gameContainer.style.display = 'none';

        if (screenName === 'classSelection') {
             classSelectionScreen.style.display = 'flex';
        } else if (screens[screenName]) {
             gameContainer.style.display = 'block';
             Object.values(screens).forEach(screen => screen.style.display = 'none');
             screens[screenName].style.display = 'flex';
        } else {
             classSelectionScreen.style.display = 'flex';
        }
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
                submitBtn.onclick = () => checkMultiChoiceAnswer(optionsContainer, questionData.answer, container, questionData);
                optionsContainer.appendChild(submitBtn);

            } else {
                 questionData.options.forEach(optionText => {
                    const optionEl = document.createElement('div');
                    optionEl.className = 'option';
                    optionEl.textContent = optionText;
                    optionEl.addEventListener('click', () => checkAnswer(optionEl, questionData.answer, container, questionData));
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

        let headerHTML = `<h3>${minigameData.title}</h3>`;
        if (minigameData.description) {
            headerHTML += `<p>${minigameData.description}</p>`;
        }
        if (minigameData.init && minigameData.type !== 'drag_drop') {
            headerHTML += `<canvas id="minigame-canvas" class="level-canvas" width="500" height="300"></canvas>`;
        }
        container.innerHTML = headerHTML;

        if (minigameData.type === 'drag_drop') {
            const questionP = document.createElement('p');
            questionP.innerHTML = `<strong>${minigameData.question}</strong>`;
            container.appendChild(questionP);

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
            
            const btn = document.createElement('button'); 
            btn.className = 'btn'; 
            btn.textContent = 'Controleer Plaatsing'; 
            btn.style.marginTop = '15px';
            btn.onclick = () => checkDragDropAnswer(ddContainer, container, minigameData); 
            container.appendChild(btn);
            
            setTimeout(() => {
                const draggables = container.querySelectorAll('.draggable'), zones = container.querySelectorAll('.drop-zone');
                draggables.forEach(draggable => { draggable.addEventListener('dragstart', () => draggable.classList.add('dragging')); draggable.addEventListener('dragend', () => draggable.classList.remove('dragging')); });
                zones.forEach(zone => { zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('hover'); }); zone.addEventListener('dragleave', () => zone.classList.remove('hover')); zone.addEventListener('drop', e => { e.preventDefault(); const draggable = document.querySelector('.dragging'); zone.appendChild(draggable); zone.classList.remove('hover'); }); });
            }, 0);
            return container;
        }
        
        if (minigameData.options) {
            const questionP = document.createElement('p');
            questionP.innerHTML = `<strong>${minigameData.question}</strong>`;
            container.appendChild(questionP);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            minigameData.options.forEach(optionText => { 
                const optionEl = document.createElement('div'); 
                optionEl.className = 'option'; 
                optionEl.textContent = optionText; 
                optionEl.addEventListener('click', () => checkAnswer(optionEl, minigameData.answer, container, minigameData)); 
                optionsContainer.appendChild(optionEl); 
            });
            container.appendChild(optionsContainer);
            return container;
        }

        if (minigameData.intermediateQuestion) {
            const iQuestionWrapper = document.createElement('div');
            iQuestionWrapper.style.marginTop = '15px';
            iQuestionWrapper.innerHTML = `<p><strong>${minigameData.intermediateQuestion}</strong></p>`;
            container.appendChild(iQuestionWrapper);

            const iAnswerWrapper = document.createElement('div');
            iAnswerWrapper.style.marginTop = '5px';
            const intermediateInput = document.createElement('input');
            intermediateInput.type = 'text';
            intermediateInput.id = 'minigame-intermediate-input';
            intermediateInput.setAttribute('placeholder', 'Antwoord 1...');
            iAnswerWrapper.appendChild(intermediateInput);
            container.appendChild(iAnswerWrapper);
        }
        
        if (minigameData.question) {
            const questionWrapper = document.createElement('div');
            questionWrapper.style.display = 'flex';
            questionWrapper.style.justifyContent = 'space-between';
            questionWrapper.style.alignItems = 'center';
            questionWrapper.style.gap = '15px';
            questionWrapper.style.marginTop = '15px';

            const questionP = document.createElement('p');
            questionP.innerHTML = `<strong>${minigameData.question}</strong>`;
            questionWrapper.appendChild(questionP);

            if (minigameData.hint) {
                const hintBtn = document.createElement('button');
                hintBtn.textContent = "Hint";
                hintBtn.title = `Hint (-100 punten)`;
                hintBtn.className = 'btn hint-btn';
                hintBtn.style.flexShrink = '0';
                hintBtn.onclick = () => {
                    updateScore(-100);
                    showFeedback(minigameData.hint, 'incorrect');
                    hintBtn.disabled = true;
                    hintBtn.style.opacity = '0.5';
                };
                questionWrapper.appendChild(hintBtn);
            }
            container.appendChild(questionWrapper);
        }

        const answerWrapper = document.createElement('div');
        answerWrapper.style.display = 'flex';
        answerWrapper.style.alignItems = 'center';
        answerWrapper.style.gap = '10px';
        answerWrapper.style.marginTop = '10px';

        const mainInput = document.createElement('input');
        mainInput.type = 'text';
        mainInput.id = 'minigame-input';
        mainInput.setAttribute('placeholder', 'Jouw antwoord...');
        mainInput.style.flexGrow = '1';
        answerWrapper.appendChild(mainInput);

        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = 'Check';
        button.addEventListener('click', () => checkAnalysisAnswer(container, minigameData));
        answerWrapper.appendChild(button);
        
        container.appendChild(answerWrapper);

        if (typeof minigameData.init === 'function') {
            setTimeout(() => { 
                const canvas = document.getElementById('minigame-canvas'); 
                if(canvas) minigameData.init(canvas, minigameData.initOptions); 
            }, 0); 
        }
        
        return container;
    }
    
    function createStandaloneMinigameElement(levelData) {
        const container = document.createElement('div'); 
        container.className = 'question-container task-container';
        
        container.innerHTML = `
            <p class="instruction-text">${levelData.description}</p>
            <div class="game-area-wrapper">
                <div id="canvas-container" style="position: relative; flex-shrink: 0;">
                    <canvas id="minigame-canvas" class="level-canvas" width="600" height="400" style="max-width: 100%; touch-action: none;"></canvas>
                </div>
                <div id="freq-controls" style="text-align: center; width: 100%; max-width: 600px;"></div>
                <div id="game-stats" style="width: 100%; max-width: 600px;">
                    <h4>STATUSRAPPORT</h4>
                    <div class="stat-grid">
                        <span id="stat1"></span>
                        <span id="stat2"></span>
                    </div>
                    <div id="stat3" class="stat-message"></div>
                </div>
            </div>`;
            
        return container;
    }

    // --- Controleer antwoord functies --- //

    function normalizeAnswer(input) {
        if (typeof input !== 'string') return input;
        return parseFloat(input.replace(',', '.').trim());
    }

    function checkAnswer(selectedOption, correctAnswer, questionContainer, questionData) {
        if (questionContainer.classList.contains('completed')) return;
        const options = questionContainer.querySelectorAll('.option');
        let isCorrect = selectedOption.textContent === correctAnswer;
        options.forEach(opt => { opt.style.pointerEvents = 'none'; if(opt.textContent === correctAnswer) opt.classList.add('correct'); else if(opt.classList.contains('selected')) opt.classList.add('wrong'); });
        if (isCorrect) { 
            showFeedback('Correct! +100 punten', 'correct'); 
            updateScore(100); 
        } else { 
            showFeedback('Helaas, dat is niet correct.', 'incorrect'); 
            incorrectAnswersLog.push({
                question: questionData.question,
                yourAnswer: selectedOption.textContent,
                correctAnswer: correctAnswer,
                explanation: `Het juiste antwoord was '${correctAnswer}'.`
            });
        }
        taskCompleted(questionContainer, true);
    }
    
    function checkMultiChoiceAnswer(optionsContainer, correctAnswers, taskContainer, questionData) {
        if (taskContainer.classList.contains('completed')) return;
        let correctSelections = 0, incorrectSelections = 0;
        const selectedOptions = [];
        optionsContainer.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            const isSelected = opt.classList.contains('selected');
            if (isSelected) selectedOptions.push(opt.textContent);
            const isCorrect = correctAnswers.includes(opt.textContent);
            if (isSelected && isCorrect) { opt.classList.add('correct'); correctSelections++; } 
            else if (isSelected && !isCorrect) { opt.classList.add('wrong'); incorrectSelections++; } 
            else if (!isSelected && isCorrect) { opt.classList.add('wrong'); }
        });
        const points = Math.max(0, (correctSelections * 75) - (incorrectSelections * 25));
        if (points > 0) { 
            showFeedback(`Gedeeltelijk correct! +${points} punten`, 'correct'); 
            updateScore(points); 
        } else { 
            showFeedback('Helaas, geen punten gescoord.', 'incorrect');
            incorrectAnswersLog.push({
                question: questionData.question,
                yourAnswer: selectedOptions.join(', ') || 'Geen',
                correctAnswer: correctAnswers.join(', '),
                explanation: 'Vergelijk de geselecteerde antwoorden met de juiste antwoorden.'
            });
        }
        taskCompleted(taskContainer, true);
    }

     function checkDragDropAnswer(ddContainer, taskContainer, minigameData) {
        if (taskContainer.classList.contains('completed')) return;
        let correctPlacements = 0;
        const zones = ddContainer.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            const category = zone.dataset.category;
            const items = zone.querySelectorAll('.draggable');
            items.forEach(item => { item.style.pointerEvents = 'none'; if (item.dataset.answer === category) { item.style.backgroundColor = 'var(--primary-green)'; correctPlacements++; } else { item.style.backgroundColor = '#8b0000'; } });
        });
        const points = correctPlacements * 50;
        if (points > 0) { 
            showFeedback(`Goed werk! ${correctPlacements} items correct geplaatst. +${points} punten`, 'correct'); 
            updateScore(points); 
        } else { 
            showFeedback('Geen items correct geplaatst.', 'incorrect'); 
            incorrectAnswersLog.push({
                question: minigameData.question,
                yourAnswer: "Incorrecte plaatsing",
                correctAnswer: "Zie de opgelichte items voor de juiste categorieën.",
                explanation: "Elk item heeft een specifieke categorie waar het thuishoort."
            });
        }
        taskCompleted(taskContainer, true);
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

        if (allCorrect) { 
            showFeedback('Uitstekend werk, Agent! +250 punten', 'correct'); 
            updateScore(250); 
        } else { 
            showFeedback(`Incorrect. Controleer je berekening.`, 'incorrect');
            const yourAnswerText = minigameData.intermediateQuestion ? `Tussenstap: ${gameContainer.querySelector('#minigame-intermediate-input').value}, Eindantwoord: ${mainInput.value}` : mainInput.value;
            const correctAnswerText = minigameData.intermediateQuestion ? `Tussenstap: ${minigameData.intermediateAnswer}, Eindantwoord: ${minigameData.answer}` : minigameData.answer;
            incorrectAnswersLog.push({
                question: minigameData.question,
                yourAnswer: yourAnswerText || 'Leeg',
                correctAnswer: correctAnswerText,
                explanation: minigameData.hint || 'Controleer de berekening en de gebruikte formules.'
            });
        }
        
        mainInput.disabled = true;
        gameContainer.querySelector('#minigame-intermediate-input')?.setAttribute('disabled', true);
        taskCompleted(gameContainer, true);
    }
    
    // --- Algemene Game Flow --- //
    
    function displayIncorrectAnswers() {
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = '';

        if (incorrectAnswersLog.length > 0) {
            let html = '<h3>Feedback op Foute Antwoorden</h3>';
            incorrectAnswersLog.forEach(item => {
                html += `
                    <div class="feedback-item">
                        <p><strong>Vraag:</strong> ${item.question}</p>
                        <p><strong>Jouw antwoord:</strong> ${item.yourAnswer}</p>
                        <p><strong>Correct antwoord:</strong> ${item.correctAnswer}</p>
                        ${item.explanation ? `<p class="explanation"><strong>Uitleg:</strong> ${item.explanation}</p>` : ''}
                    </div>
                `;
            });
            feedbackContainer.innerHTML = html;
        }
    }
    
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
        if (currentLevelIndex < levels.length) loadLevel(levels[currentLevelIndex]); 
        else endGame(); 
    }
    
    function showFeedback(message, type) {
        const popup = document.createElement('div');
        popup.className = `feedback-popup ${type}`;
        popup.textContent = message;
        gameContainer.appendChild(popup);
        
        // Screenshake bij fout
        if (type === 'incorrect') {
            gameContainer.classList.add('shake');
            setTimeout(() => gameContainer.classList.remove('shake'), 400);
        }

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
        saveAndShowHighscores();
        displayIncorrectAnswers();
        showScreen('end');
    }

    function saveAndShowHighscores() {
        const highscores = JSON.parse(localStorage.getItem('daltonHighscores')) || [];
        highscores.push({ name: agentName, score: score, class: playerClass });
        highscores.sort((a, b) => b.score - a.score); const top5 = highscores.slice(0, 5);
        localStorage.setItem('daltonHighscores', JSON.stringify(top5));
        highscoreList.innerHTML = ''; top5.forEach(entry => { const li = document.createElement('li'); li.textContent = `${entry.name} (${entry.class}) - ${entry.score} punten`; highscoreList.appendChild(li); });
    }
    
    function restartGame() {
        currentLevelIndex = -1;
        showScreen('classSelection');
    }

    // --- CANVAS MINIGAME FUNCTIES --- //
    
    function drawGrid(ctx, width, height, divSize) {
        ctx.strokeStyle = "rgba(57, 255, 20, 0.2)"; ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += divSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
        for (let y = 0; y <= height; y += divSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    }

    // 1. ECHOLOCATIE NAVIGATIE (Sonar Theme)
    function initSonarGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        let player = { x: 50, y: height - 50, radius: 10, vx: 0, vy: 0, speed: 0.5, maxSpeed: 3 };
        let exit = { x: width - 60, y: 20, width: 40, height: 40 };
        let pings = []; let keys = {}; let gameEnded = false; let score = 500;
        
        // Genereer muren
        const walls = [
            {x: 100, y: 0, w: 20, h: 300}, {x: 250, y: 100, w: 20, h: 300}, {x: 400, y: 0, w: 20, h: 250}, {x: 0, y: 0, w: width, h: 10}, {x: 0, y: height-10, w: width, h: 10}, {x: 0, y: 0, w: 10, h: height}, {x: width-10, y: 0, w: 10, h: height}
        ];
        // Genereer mijnen (Vijanden)
        const mines = [ {x: 180, y: 150, r: 15}, {x: 330, y: 250, r: 15}, {x: 480, y: 100, r: 15} ];

        const keydownHandler = (e) => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); };
        const keyupHandler = (e) => { if (e.code === 'Space') createPing(); delete keys[e.code]; };
        window.activeGameListeners = [ {target: window, type: 'keydown', handler: keydownHandler}, {target: window, type: 'keyup', handler: keyupHandler} ];
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type, handler));

        function createPing() {
            if (pings.length < 2) { pings.push({ x: player.x, y: player.y, radius: 0, speed: 6, max: 250, alpha: 1 }); score -= 10; }
        }

        function isColliding(nx, ny) {
            for(let w of walls) { if(nx+player.radius > w.x && nx-player.radius < w.x+w.w && ny+player.radius > w.y && ny-player.radius < w.y+w.h) return true; }
            for(let m of mines) { if(Math.hypot(nx - m.x, ny - m.y) < player.radius + m.r) { onComplete(0, "Mijn geraakt! Schip vernietigd.", "incorrect"); gameEnded = true; return true; } }
            return false;
        }

        function gameLoop() {
            if (gameEnded) return;
            
            // Movement Physics
            if (keys['ArrowUp']) player.vy -= player.speed; if (keys['ArrowDown']) player.vy += player.speed;
            if (keys['ArrowLeft']) player.vx -= player.speed; if (keys['ArrowRight']) player.vx += player.speed;
            player.vx *= 0.9; player.vy *= 0.9; // Frictie
            
            if(!isColliding(player.x + player.vx, player.y)) player.x += player.vx; else player.vx = 0;
            if(!isColliding(player.x, player.y + player.vy)) player.y += player.vy; else player.vy = 0;

            // Win Conditie
            if(player.x > exit.x && player.x < exit.x+exit.width && player.y > exit.y && player.y < exit.y+exit.height) {
                gameEnded = true; onComplete(Math.max(100, score), "Exit bereikt! Missie volbracht.", "correct");
            }

            // Draw: Pitch Black
            ctx.fillStyle = '#020502'; ctx.fillRect(0, 0, width, height);

            // Draw Exit
            ctx.fillStyle = 'rgba(57, 255, 20, 0.3)'; ctx.fillRect(exit.x, exit.y, exit.width, exit.height);

            // Update & Draw Pings (Masking effect)
            for (let i = pings.length - 1; i >= 0; i--) {
                let p = pings[i]; p.radius += p.speed; p.alpha = 1 - (p.radius / p.max);
                if (p.alpha <= 0) { pings.splice(i, 1); continue; }
                
                ctx.save();
                // Alleen tekenen binnen de ring
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.arc(p.x, p.y, Math.max(0, p.radius - 10), 0, Math.PI * 2, true);
                ctx.clip();

                // Draw walls and mines in the mask
                ctx.fillStyle = `rgba(57, 255, 20, ${p.alpha})`;
                for(let w of walls) ctx.fillRect(w.x, w.y, w.w, w.h);
                ctx.fillStyle = `rgba(255, 0, 0, ${p.alpha})`;
                for(let m of mines) { ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI*2); ctx.fill(); }
                ctx.restore();
                
                // Ring Outline
                ctx.strokeStyle = `rgba(57, 255, 20, ${p.alpha * 0.5})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
            }

            // Draw Player
            ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2); ctx.fill();

            stat1.textContent = `Score: ${score}`; stat2.textContent = 'Doel: Zoek de Exit'; stat3.textContent = 'Druk op SPATIE voor Sonar Ping';
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }
    
    // THEORIE MINIGAME: Oscilloscoop tekenen
    function initOscilloscopeMinigame(canvas, options = {}) {
        const { oscillations = 2, totalDivs = 10 } = options;
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const divSize = width / totalDivs;

        ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, width, height); 
        drawGrid(ctx, width, height, divSize); 
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#39FF14';
        
        ctx.beginPath(); 
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        const centerY = height / 2;
        const amplitude = height / 4;
        const waveLength = (width / totalDivs) * (totalDivs / oscillations);

        for (let x = 0; x < width; x++) {
            const angle = (x / waveLength) * 2 * Math.PI;
            const y = centerY - Math.sin(angle) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset
    }

    // THEORIE MINIGAME: P en Q golven animeren
    function initAmplitudeComparison(parentElement) {
        const canvas = document.createElement('canvas'); canvas.className = 'level-canvas'; canvas.width = 500; canvas.height = 300; parentElement.insertBefore(canvas, parentElement.firstChild);
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height, divSize = width / 10; let offset = 0;
        
        function drawWave(label, freq, amp, color) {
            ctx.shadowBlur = 10; ctx.shadowColor = color;
            ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 3; const centerY = height / 2, amplitude = amp;
            for(let x=0; x < width; x++) { const angle = ((x + offset*freq) / (50/freq)) * 2 * Math.PI; const y = centerY - Math.sin(angle) * amplitude; if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
            ctx.stroke(); 
            ctx.shadowBlur = 0;
            ctx.font = "bold 20px Roboto Mono"; ctx.fillStyle = color; ctx.fillText(label, 10, centerY - amp - 10);
        }
        function animate() {
            ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, width, height); drawGrid(ctx, width, height, divSize);
            drawWave('P', 1, 60, '#39FF14'); 
            drawWave('Q', 2, 100, '#FFD700');
            offset += 1.5; 
            activeGameLoopId = requestAnimationFrame(animate);
        }
        animate();
    }

    // 2. SIGNAAL DECRYPTIE (Frequency Slider Game)
    function initFrequencyMatchGame(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const controls = document.getElementById('freq-controls');
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2'), stat3 = document.getElementById('stat3');
        
        let targetFreq = 0; let targetAmp = 0; let round = 1; let gameEnded = false; let hackProgress = 0;
        
        // Bouw UI
        controls.innerHTML = `
            <div class="slider-group"><label>Frequentie (Hz)</label><input type="range" id="f-slider" min="1" max="15" step="0.5" value="1"></div>
            <div class="slider-group"><label>Amplitude (dB)</label><input type="range" id="a-slider" min="10" max="100" step="5" value="10"></div>
            <div class="progress-bar-container"><div id="decrypt-progress"></div></div>
        `;
        const fSlider = document.getElementById('f-slider'); const aSlider = document.getElementById('a-slider'); const progressBar = document.getElementById('decrypt-progress');
        
        function newRound() { targetFreq = 2 + Math.floor(Math.random() * 10); targetAmp = 20 + Math.floor(Math.random() * 70); hackProgress = 0; progressBar.style.width = '0%'; }
        newRound();

        let timeOffset = 0;

        function drawWave(freq, amp, color, glow) {
            ctx.shadowBlur = glow ? 15 : 0; ctx.shadowColor = color; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
            for(let x=0; x < width; x++) { const angle = (x * freq * 0.01) + timeOffset; const y = (height/2) - Math.sin(angle) * amp; if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
            ctx.stroke(); ctx.shadowBlur = 0;
        }

        function gameLoop() {
            if (gameEnded) return;
            ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, width, height);
            
            // Grid
            ctx.strokeStyle = "rgba(57, 255, 20, 0.1)"; ctx.lineWidth = 1;
            for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
            for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

            let pFreq = parseFloat(fSlider.value); let pAmp = parseFloat(aSlider.value);
            timeOffset += 0.05;

            drawWave(targetFreq, targetAmp, '#ff4d4d', false); // Vijand (Rood)
            drawWave(pFreq, pAmp, '#39FF14', true); // Speler (Groen)

            // Match Check
            if (Math.abs(pFreq - targetFreq) < 0.6 && Math.abs(pAmp - targetAmp) < 5) {
                hackProgress += 1.5; progressBar.style.width = `${hackProgress}%`;
                ctx.fillStyle = "rgba(57, 255, 20, 0.2)"; ctx.fillRect(0,0,width,height);
                if (hackProgress >= 100) {
                    round++;
                    if(round > 3) { gameEnded = true; onComplete(300, "Systeem Gehackt!", "correct"); }
                    else { newRound(); }
                }
            } else { if(hackProgress > 0) hackProgress -= 2; progressBar.style.width = `${Math.max(0, hackProgress)}%`; }

            stat1.textContent = `Signaal: ${round}/3`; stat2.textContent = `Jouw Freq: ${pFreq}Hz | Amp: ${pAmp}dB`; stat3.textContent = 'Match de rode golf met de groene golf.';
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }

    // 3. DECIBEL STEALTH (GECORRIGEERD MET MUREN EN PATROUILLERENDE BEWAKERS)
    function initDecibelSneak(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2');
        
        let player = {x: 30, y: height/2, vx: 0, vy: 0, speed: 0.8, baseNoise: 15, currentNoise: 0};
        let exit = {x: width - 50, y: height/2 - 25, w: 50, h: 50};
        
        // Fysieke muren toegevoegd om dekking te zoeken
        let walls = [
            {x: 100, y: 0, w: 40, h: 280},
            {x: 250, y: 120, w: 40, h: 280},
            {x: 400, y: 0, w: 40, h: 280}
        ];

        // Bewakers patrouilleren nu, en hebben een kleinere (eerlijke) range
        let guards = [
            {x: 120, y: 350, range: 60, vx: 2, vy: 0, bounds: {minX: 100, maxX: 200}},
            {x: 320, y: 50, range: 70, vx: 0, vy: 2, bounds: {minY: 50, maxY: 350}},
            {x: 480, y: 350, range: 60, vx: 0, vy: -2, bounds: {minY: 50, maxY: 350}}
        ];
        
        let keys = {}; let gameEnded = false;
        window.activeGameListeners = [ 
            {target: window, type: 'keydown', handler: e => keys[e.code] = true}, 
            {target: window, type: 'keyup', handler: e => delete keys[e.code]} 
        ];
        window.activeGameListeners.forEach(({target,type,handler}) => target.addEventListener(type,handler));

        function isWall(nx, ny) {
            for(let w of walls) {
                // Botsing met kleine marge voor de speler (radius 8)
                if(nx+8 > w.x && nx-8 < w.x+w.w && ny+8 > w.y && ny-8 < w.y+w.h) return true;
            }
            return false;
        }

        function gameLoop() {
            if (gameEnded) return;
            
            // Player Movement
            player.vx *= 0.8; player.vy *= 0.8; // Frictie
            if (keys['ArrowUp']) player.vy -= player.speed; if (keys['ArrowDown']) player.vy += player.speed;
            if (keys['ArrowLeft']) player.vx -= player.speed; if (keys['ArrowRight']) player.vx += player.speed;
            
            if(!isWall(player.x + player.vx, player.y)) player.x += player.vx; else player.vx = 0;
            if(!isWall(player.x, player.y + player.vy)) player.y += player.vy; else player.vy = 0;
            
            if(player.x < 10) player.x = 10; if(player.x > width-10) player.x = width-10;
            if(player.y < 10) player.y = 10; if(player.y > height-10) player.y = height-10;

            // Bereken decibel o.b.v. snelheid
            let velocity = Math.hypot(player.vx, player.vy);
            player.currentNoise = player.baseNoise + (velocity * 40); // Cirkel radius

            ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, width, height);

            // Draw Exit
            ctx.fillStyle = '#39FF14'; ctx.fillRect(exit.x, exit.y, exit.w, exit.h);

            // Draw Walls
            ctx.fillStyle = '#1E3A1E';
            ctx.strokeStyle = '#39FF14';
            walls.forEach(w => {
                ctx.fillRect(w.x, w.y, w.w, w.h);
                ctx.strokeRect(w.x, w.y, w.w, w.h);
            });

            // Draw Guards & Check Detection
            guards.forEach(g => {
                // Update Guard Positie
                g.x += g.vx; g.y += g.vy;
                if(g.vx !== 0 && (g.x < g.bounds.minX || g.x > g.bounds.maxX)) g.vx *= -1;
                if(g.vy !== 0 && (g.y < g.bounds.minY || g.y > g.bounds.maxY)) g.vy *= -1;

                // Draw Range
                ctx.beginPath(); ctx.arc(g.x, g.y, g.range, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; ctx.fill();
                ctx.strokeStyle = 'red'; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
                
                // Draw Guard Center
                ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(g.x, g.y, 8, 0, Math.PI*2); ctx.fill();

                // Detectie: Als afstand tussen speler en guard kleiner is dan (guardRange + playerNoise)
                let dist = Math.hypot(player.x - g.x, player.y - g.y);
                if (dist < g.range + player.currentNoise) {
                    gameEnded = true; onComplete(0, "Gedetecteerd door microfoons!", "incorrect");
                }
            });

            // Draw Player & Noise Circle
            ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(player.x, player.y, 8, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.beginPath(); ctx.arc(player.x, player.y, player.currentNoise, 0, Math.PI*2); ctx.stroke();

            if (player.x > exit.x && player.y > exit.y && player.y < exit.y+exit.h) { gameEnded = true; onComplete(200, "Stealth Infiltratie Geslaagd!", "correct"); }

            stat1.textContent = `Jouw dB: ${Math.round(player.currentNoise)}`; stat2.textContent = 'Sta stil om je dB te verlagen!';
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }

    // 4. GELUIDSBARRIÈRE DEFENSIE (DYNAMISCHE "TOWER DEFENSE")
    function initNoiseDefense(canvas, onComplete) {
        const ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
        const stat1 = document.getElementById('stat1'), stat2 = document.getElementById('stat2');
        
        let particles = []; let barriers = []; let isDrawing = false; let startX, startY;
        let houseHealth = 100; let budget = 300; let frameCount = 0; let gameEnded = false;

        // Bewegende vijanden in plaats van 1 stilstaande emitter
        let drones = [ {x: 30, y: 100, vy: 2}, {x: 30, y: 300, vy: -2.5}, {x: 30, y: 200, vy: 1.5} ];
        const house = {x: width-80, y: height/2 - 50, w: 80, h: 100};

        // Muis logica voor tekenen muur
        canvas.addEventListener('mousedown', e => { 
            if(budget <= 0) return; 
            const rect = canvas.getBoundingClientRect(); 
            // Correctie voor schaling/styling van canvas
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            isDrawing = true; 
            startX = (e.clientX - rect.left) * scaleX; 
            startY = (e.clientY - rect.top) * scaleY; 
        });
        
        canvas.addEventListener('mouseup', e => {
            if(!isDrawing) return; isDrawing = false;
            const rect = canvas.getBoundingClientRect(); 
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            let endX = (e.clientX - rect.left) * scaleX; 
            let endY = (e.clientY - rect.top) * scaleY;
            
            let len = Math.hypot(endX-startX, endY-startY);
            // Muur krijgt HP gebaseerd op zijn lengte, maar kost ook budget
            if (len > 10 && budget >= len) { 
                barriers.push({x1: startX, y1: startY, x2: endX, y2: endY, hp: len * 1.5, maxHp: len * 1.5}); 
                budget -= Math.round(len); 
            }
        });
        
        // Simpele wiskunde voor het berekenen van een lijn-cirkel (particle) intersectie
        function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
            let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
            let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
            return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
        }

        function gameLoop() {
            if (gameEnded) return; frameCount++;
            
            // Budget regen
            budget += 0.5;
            if(budget > 500) budget = 500;

            ctx.fillStyle = '#0a0f0d'; ctx.fillRect(0, 0, width, height);

            // Draw House
            ctx.fillStyle = '#39FF14'; ctx.fillRect(house.x, house.y, house.w, house.h);
            ctx.fillStyle = 'black'; ctx.font = '12px Arial'; ctx.fillText("DOELWIT", house.x + 10, house.y + house.h/2);

            // Update & Draw Drones
            drones.forEach(d => {
                d.y += d.vy;
                if(d.y < 20 || d.y > height-20) d.vy *= -1;
                
                ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(d.x, d.y, 15, 0, Math.PI*2); ctx.fill();
                
                // Spawn sound waves randomly
                if(Math.random() < 0.04) {
                    let angle = (Math.random() * Math.PI/2) - Math.PI/4; // Richting rechts
                    particles.push({ x: d.x+10, y: d.y, vx: Math.cos(angle)*6, vy: Math.sin(angle)*6, oldX: d.x+10, oldY: d.y });
                }
            });

            // Draw Barriers (kleur verandert naarmate ze slijten)
            ctx.lineWidth = 5; ctx.lineCap = 'round';
            barriers.forEach(b => { 
                // HP percentage (1.0 = full, 0.0 = broken)
                let healthRatio = b.hp / b.maxHp;
                // Groen naar Rood kleur verloop op basis van damage
                let r = Math.floor(255 * (1 - healthRatio));
                let g = Math.floor(255 * healthRatio);
                ctx.strokeStyle = `rgb(${r}, ${g}, 0)`; 
                
                ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); 
            });

            // Update Particles
            ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
            for(let i = particles.length-1; i >= 0; i--) {
                let p = particles[i]; p.oldX = p.x; p.oldY = p.y; p.x += p.vx; p.y += p.vy;
                
                // Collision with barriers
                let hitWall = false;
                for(let j = 0; j < barriers.length; j++) { 
                    let b = barriers[j];
                    if(lineIntersect(p.oldX, p.oldY, p.x, p.y, b.x1, b.y1, b.x2, b.y2)) { 
                        hitWall = true; 
                        b.hp -= 15; // Wall takes damage from sound
                        break; 
                    } 
                }
                
                if (hitWall || p.x < 0 || p.y < 0 || p.y > height) { particles.splice(i, 1); continue; }

                // Hit house?
                if (p.x > house.x && p.x < house.x+house.w && p.y > house.y && p.y < house.y+house.h) { houseHealth -= 2; particles.splice(i, 1); continue; }

                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
            }

            // Remove destroyed barriers
            barriers = barriers.filter(b => b.hp > 0);

            if (houseHealth <= 0) { gameEnded = true; onComplete(0, "Huis verwoest door geluidsoverlast!", "incorrect"); }
            if (frameCount > 1200) { gameEnded = true; onComplete(300, "Wijk succesvol beschermd!", "correct"); } // 20 seconden (60fps)

            stat1.textContent = `Huis Integriteit: ${Math.max(0, houseHealth)}%`; stat2.textContent = `Bouwbudget: €${Math.floor(budget)}`;
            activeGameLoopId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }

    function initializeApp() {
        function proceedToGame() {
            classSelectionScreen.style.display = 'none'; screens.intro.style.display = 'flex'; gameContainer.style.display = 'block';
            agentNameInput.style.display = 'none'; startButton.style.display = 'none';
            let i=0; introTextElement.textContent=""; let typing = setInterval(()=>{ if(i<storyIntro.length){introTextElement.textContent+=storyIntro.charAt(i); i++;}else{clearInterval(typing); agentNameInput.style.display='block'; startButton.style.display='block';}}, 20);
        }
        vmboButton.addEventListener('click', () => { playerClass = 'VMBO'; proceedToGame(); }); ghaButton.addEventListener('click', () => { playerClass = 'GHA'; proceedToGame(); });
        if (tlButton) tlButton.addEventListener('click', () => { playerClass = 'TL'; proceedToGame(); });
        setTimeout(() => { if (loaderScreen) loaderScreen.style.display = 'none'; if (classSelectionScreen) classSelectionScreen.style.display = 'flex'; }, 1000);
        startButton.addEventListener('click', startGame); nextButton.addEventListener('click', nextLevel); restartButton.addEventListener('click', restartGame);
    }
    initializeApp();
});
