// =============================================
// Bubble Buddies - Telegram Mini App Game
// =============================================

console.log('🚀 Игра загружается...');

// Безопасная инициализация Telegram Web App
let tg;
try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        console.log('✅ Telegram Web App обнаружен');
        tg.expand();
        tg.enableClosingConfirmation?.();
        tg.BackButton?.hide();
    } else {
        console.log('🌐 Работаем в браузере');
    }
} catch (error) {
    console.log('⚠️ Ошибка инициализации Telegram:', error);
}

// Получаем элементы DOM
const elements = {
    canvas: document.getElementById('gameCanvas'),
    startScreen: document.getElementById('startScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    startButton: document.getElementById('startButton'),
    restartButton: document.getElementById('restartButton'),
    scoreElement: document.getElementById('score'),
    highScoreElement: document.getElementById('highScore'),
    finalScoreElement: document.getElementById('finalScore')
};

// Проверяем что все элементы найдены
console.log('Поиск элементов:', {
    canvas: !!elements.canvas,
    startButton: !!elements.startButton,
    restartButton: !!elements.restartButton
});

const ctx = elements.canvas?.getContext('2d');

// Настройки игры
function setupCanvas() {
    if (!elements.canvas) return;
    
    const width = Math.min(window.innerWidth * 0.95, 400);
    const height = Math.min(window.innerHeight * 0.75, 600);
    
    elements.canvas.width = width;
    elements.canvas.height = height;
    
    console.log(🎯 Canvas настроен: ${width}x${height});
}

// Игровые переменные
let gameState = {
    score: 0,
    highScore: localStorage.getItem('bubbleBuddiesHighScore') || 0,
    gameRunning: false,
    animationId: null
};

// Класс игрока
class Player {
    constructor() {
        this.width = 80;
        this.height = 60;
        this.x = elements.canvas ? elements.canvas.width / 2 - this.width / 2 : 0;
        this.y = elements.canvas ? elements.canvas.height - this.height - 10 : 0;
        this.speed = 8;
        this.color = '#FF6B8B';
    }

    draw() {
        if (!ctx || !gameState.gameRunning) return;

        // Тело осьминога
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Глаза
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 15, this.y + this.height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 15, this.y + this.height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 15, this.y + this.height / 2 - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 15, this.y + this.height / 2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Улыбка
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2 + 10, 10, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
    }

    move(direction) {
        if (!elements.canvas) return;
        
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < elements.canvas.width - this.width) {
            this.x += this.speed;
        }
    }
}

// Класс пузыря
class Bubble {
    constructor(level = 1) {
        this.level = level;
        this.radius = 20 + (level - 1) * 5;
        this.colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'];
        this.color = this.colors[level - 1] || '#FFFFFF';

this.creatures = ['🐠', '🦐', '🐡', '🐙', '🐬'];
        this.creature = this.creatures[level - 1] || '🌟';
        this.x = elements.canvas ? Math.random() * (elements.canvas.width - this.radius * 2) + this.radius : 0;
        this.y = -this.radius;
        this.speed = 1 + Math.random() * 1.5 + (level * 0.2);
    }

    draw() {
        if (!ctx) return;

        // Пузырь
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Существо внутри пузыря
        ctx.font = ${this.radius}px Arial;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(this.creature, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }
}

// Игровые объекты
let player = new Player();
let bubbles = [];
let keys = {};

// ОБРАБОТЧИКИ СОБЫТИЙ - ИСПРАВЛЕННЫЕ
function initEventListeners() {
    console.log('🎮 Инициализация обработчиков...');
    
    // Обработчики кнопок
    if (elements.startButton) {
        elements.startButton.onclick = startGame;
        console.log('✅ Кнопка "Играть" настроена');
    } else {
        console.log('❌ Кнопка "Играть" не найдена');
    }
    
    if (elements.restartButton) {
        elements.restartButton.onclick = startGame;
        console.log('✅ Кнопка "Рестарт" настроена');
    }

    // Клавиатура
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Тач события
    if (elements.canvas) {
        elements.canvas.addEventListener('touchstart', handleTouch);
        elements.canvas.addEventListener('touchmove', handleTouch);
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (!elements.canvas) return;
    
    const touch = e.touches[0];
    const touchX = touch.clientX - elements.canvas.getBoundingClientRect().left;
    player.x = touchX - player.width / 2;
    
    // Ограничения
    if (player.x < 0) player.x = 0;
    if (player.x > elements.canvas.width - player.width) {
        player.x = elements.canvas.width - player.width;
    }
}

// ОСНОВНЫЕ ФУНКЦИИ ИГРЫ
function startGame() {
    console.log('🎲 Запуск игры!');
    
    gameState.gameRunning = true;
    gameState.score = 0;
    
    if (elements.scoreElement) {
        elements.scoreElement.textContent = Очки: ${gameState.score};
    }
    
    bubbles = [];
    player = new Player();
    
    // Прячем экраны
    if (elements.startScreen) elements.startScreen.classList.add('hidden');
    if (elements.gameOverScreen) elements.gameOverScreen.classList.add('hidden');
    
    // Запускаем игровой цикл
    gameLoop();
}

function gameOver() {
    console.log('💀 Конец игры');
    
    gameState.gameRunning = false;
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    
    // Обновляем рекорд
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('bubbleBuddiesHighScore', gameState.highScore);
        if (elements.highScoreElement) {
            elements.highScoreElement.textContent = Рекорд: ${gameState.highScore};
        }
    }
    
    // Показываем экран окончания
    if (elements.gameOverScreen) {
        elements.gameOverScreen.classList.remove('hidden');
    }
    if (elements.finalScoreElement) {
        elements.finalScoreElement.textContent = gameState.score;
    }
}

function spawnBubble() {
    if (!gameState.gameRunning) return;
    
    bubbles.push(new Bubble());
}

function update() {
    if (!gameState.gameRunning) return;

    // Движение игрока
    if (keys['ArrowLeft'] || keys['a']) {
        player.move('left');
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.move('right');
    }

    // Спавн пузырей (простой вариант)
    if (Math.random() < 0.02) {
        spawnBubble();
    }

// Обновление пузырей
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].update();

        // Проверка на столкновение с игроком
        if (
            bubbles[i].x > player.x &&
            bubbles[i].x < player.x + player.width &&
            bubbles[i].y + bubbles[i].radius > player.y &&
            bubbles[i].y - bubbles[i].radius < player.y + player.height
        ) {
            gameState.score += bubbles[i].level * 10;
            if (elements.scoreElement) {
                elements.scoreElement.textContent = Очки: ${gameState.score};
            }
            bubbles.splice(i, 1);
            continue;
        }

        // Проверка на выход за границы
        if (bubbles[i].y - bubbles[i].radius > elements.canvas.height) {
            bubbles.splice(i, 1);
            continue;
        }
    }
}

function draw() {
    if (!ctx  !elements.canvas  !gameState.gameRunning) return;

    // Очистка
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Фон
    ctx.fillStyle = 'rgba(0, 20, 40, 0.3)';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Пузыри
    bubbles.forEach(bubble => bubble.draw());

    // Игрок
    player.draw();
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    update();
    draw();
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
window.addEventListener('load', function() {
    console.log('📦 Страница полностью загружена');
    
    // Настраиваем canvas
    setupCanvas();
    
    // Инициализируем обработчики
    initEventListeners();
    
    // Показываем рекорд
    if (elements.highScoreElement) {
        elements.highScoreElement.textContent = Рекорд: ${gameState.highScore};
    }
    
    console.log('✅ Игра готова к запуску!');
});

// Обработчик изменения размера
window.addEventListener('resize', setupCanvas);
