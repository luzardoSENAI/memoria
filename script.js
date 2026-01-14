const allColors = [
    '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1', 
    '#33FFF6', '#FFB533', '#FFFFFF', '#F0E68C', '#FF4500', 
    '#ADFF2F', '#00CED1', '#E74C3C', '#9B59B6', '#16A085', 
    '#F39C12', '#7F8C8D', '#D35400'
];

let gameColors = [], flippedCards = [], matchedCount = 0;
let moves = 0, seconds = 0, timerInterval = null, gameStarted = false;
let currentConfig = { num: 16, title: 'MÉDIO' };

function playSound(type) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain); gain.connect(context.destination);
    
    if (type === 'flip') {
        osc.frequency.setValueAtTime(400, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        osc.start(); osc.stop(context.currentTime + 0.1);
    } else if (type === 'match') {
        osc.frequency.setValueAtTime(600, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        osc.start(); osc.stop(context.currentTime + 0.3);
    }
}

function startGame(num, title) {
    currentConfig = { num, title };
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('current-level-title').innerText = title;
    resetGame();
}

function createBoard() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    // Define Colunas Fixas para Uniformidade
    let cols;
    if (currentConfig.num === 8) cols = 4;      // 4x2
    else if (currentConfig.num === 16) cols = 4; // 4x4
    else if (currentConfig.num === 24) cols = 6; // 6x4
    else if (currentConfig.num === 36) cols = 6; // 6x6
    
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const pairsNeeded = currentConfig.num / 2;
    const selectedColors = allColors.slice(0, pairsNeeded);
    gameColors = [...selectedColors, ...selectedColors].sort(() => Math.random() - 0.5);

    gameColors.forEach(color => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.color = color;
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        if (!gameStarted) { gameStarted = true; startTimer(); }
        
        playSound('flip');
        card.classList.add('flipped');
        card.style.backgroundColor = card.dataset.color;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('moves').innerText = moves;
            checkMatch();
        }
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;
    if (c1.dataset.color === c2.dataset.color) {
        c1.classList.add('matched'); c2.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];
        playSound('match');
        if (matchedCount === gameColors.length) {
            clearInterval(timerInterval);
            setTimeout(() => alert(`🏆 Parabéns!\nNível: ${currentConfig.title}\nTempo: ${document.getElementById('timer').innerText}\nMovimentos: ${moves}`), 500);
        }
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped'); 
            c2.classList.remove('flipped');
            c1.style.backgroundColor = 'var(--bg-card)';
            c2.style.backgroundColor = 'var(--bg-card)';
            flippedCards = [];
        }, 700);
    }
}

function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        document.getElementById('timer').innerText = `${m}:${s}`;
    }, 1000);
}

function resetGame() {
    clearInterval(timerInterval);
    gameStarted = false; matchedCount = 0; moves = 0;
    flippedCards = [];
    document.getElementById('timer').innerText = "00:00";
    document.getElementById('moves').innerText = "0";
    createBoard();
}