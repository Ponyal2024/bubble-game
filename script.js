vafoe𓁺, [27.11.2025 9:55]
// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation(); // Спросить при закрытии
tg.BackButton.hide(); // Скрыть кнопку "Назад" на старте

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');

// Настройки игры
canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.75;

let score = 0;
let highScore = localStorage.getItem('bubbleBuddiesHighScore') || 0;
highScoreElement.textContent = Рекорд: ${highScore};

let gameRunning = false;
let animationId;

// Классы игры
class Player {
    constructor() {
        this.width = 80;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 8;
        this.color = '#FF6B8B';
    }

    draw() {
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

        // Щупальца (упрощенно)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + (this.width / 4) * i, this.y + this.height);
            ctx.lineTo(this.x + (this.width / 4) * i - 10, this.y + this.height + 15);
            ctx.stroke();
        }
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }
}

class Bubble {
    constructor(level = 1) {
        this.level = level;
        this.radius = this.getRadiusByLevel();
        this.colors = ['#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0'];
        this.color = this.colors[this.level - 1] || '#FFFFFF';
        this.creatures = ['🐠', '🦐', '🐡', '🐙', '🐬'];
        this.creature = this.creatures[this.level - 1] || '🌟';
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = -this.radius;
        this.speed = 1 + Math.random() * 1.5 + (this.level * 0.2);
        this.isMerging = false;
    }

    getRadiusByLevel() {
        const baseRadius = 20;
        return baseRadius + (this.level - 1) * 5;
    }

    draw() {
        // Пузырь
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

vafoe𓁺, [27.11.2025 9:55]
// Блик на пузыре
        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

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

    isCollidingWith(otherBubble) {
        const dx = this.x - otherBubble.x;
        const dy = this.y - otherBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + otherBubble.radius;
    }
}

// Игровые переменные
let player = new Player();
let bubbles = [];
let keys = {};
let lastSpawnTime = 0;
const spawnInterval = 1000; // 1 секунда

// Обработчики событий
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    player.x = touchX - player.width / 2;
    // Ограничиваем движение игрока в пределах canvas
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function startGame() {
    gameRunning = true;
    score = 0;
    scoreElement.textContent = Очки: ${score};
    bubbles = [];
    player = new Player();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bubbleBuddiesHighScore', highScore);
        highScoreElement.textContent = Рекорд: ${highScore};
    }
    gameOverScreen.classList.remove('hidden');
    tg.HapticFeedback.impactOccurred('heavy');
}

function spawnBubble() {
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnInterval) {
        bubbles.push(new Bubble());
        lastSpawnTime = currentTime;
    }
}

function update() {
    // Движение игрока
    if (keys['ArrowLeft'] || keys['a']) {
        player.move('left');
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.move('right');
    }

    // Спавн пузырей
    spawnBubble();

    // Обновление и проверка пузырей
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].update();

        // Проверка на выход за нижнюю границу (игрок поймал пузырь)
        if (bubbles[i].y - bubbles[i].radius > canvas.height) {
            score += bubbles[i].level * 10;
            scoreElement.textContent = Очки: ${score};
            tg.HapticFeedback.impactOccurred('light');
            bubbles.splice(i, 1);
            continue;
        }

        // Проверка на столкновение с игроком
        if (
            bubbles[i].x > player.x &&
            bubbles[i].x < player.x + player.width &&
            bubbles[i].y + bubbles[i].radius > player.y &&
            bubbles[i].y - bubbles[i].radius < player.y + player.height
        ) {
            score += bubbles[i].level * 10;
            scoreElement.textContent = Очки: ${score};
            tg.HapticFeedback.impactOccurred('light');
            bubbles.splice(i, 1);
            continue;
        }

        // Проверка на столкновение пузырей друг с другом

vafoe𓁺, [27.11.2025 9:55]
for (let j = i + 1; j < bubbles.length; j++) {
            if (bubbles[i].isCollidingWith(bubbles[j]) && bubbles[i].level === bubbles[j].level && !bubbles[i].isMerging && !bubbles[j].isMerging) {
                const newLevel = bubbles[i].level + 1;
                const newX = (bubbles[i].x + bubbles[j].x) / 2;
                const newY = (bubbles[i].y + bubbles[j].y) / 2;

                // Помечаем пузыри для удаления и создаем новый
                bubbles[i].isMerging = true;
                bubbles[j].isMerging = true;

                setTimeout(() => {
                    bubbles.push(new Bubble(newLevel));
                    bubbles[ bubbles.length - 1 ].x = newX;
                    bubbles[ bubbles.length - 1 ].y = newY;
                    tg.HapticFeedback.impactOccurred('medium');
                }, 50);

                // Удаляем старые пузыри
                setTimeout(() => {
                    const indexI = bubbles.findIndex(b => b === bubbles[i]);
                    const indexJ = bubbles.findIndex(b => b === bubbles[j]);
                    if (indexI > -1) bubbles.splice(indexI, 1);
                    if (indexJ > -1) bubbles.splice(indexJ > indexI ? indexJ - 1 : indexJ, 1);
                }, 100);

                break;
            }
        }

        // Проверка на проигрыш (пузырь достиг верха)
        if (bubbles[i].y - bubbles[i].radius < 0) {
            gameOver();
            return;
        }
    }
}

function draw() {
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем фон (дно океана)
    ctx.fillStyle = 'rgba(0, 20, 40, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем пузыри
    bubbles.forEach(bubble => bubble.draw());

    // Рисуем игрока
    player.draw();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Инициализация при загрузке
window.onload = () => {
    highScoreElement.textContent = Рекорд: ${highScore};
};