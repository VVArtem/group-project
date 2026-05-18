document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('mini-game');
    if (!container) return;

    // Створюємо Canvas
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Налаштування гравця
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 120,
        width: 50,
        height: 70,
        dx: 0,
        baseSpeed: 6,
        currentSpeed: 6,
        state: 0, // 0: Худий, 1: М'язи 1, 2: Бодібілдер, -1: Вага 1, -2: Повний
        score: 0,
        
        // Нові змінні для анімації
        currentFrame: 0,       // Поточний кадр анімації (0-3)
        animationTimer: 0,      // Лічильник для перемикання кадрів
        animationSpeed: 10,     // Частота перемикання (менше число - швидше)
        isFacingRight: true,    // В який бік дивиться гравець
        isMoving: false          // Чи рухається гравець зараз
    };

    // Шляхи до спрайтів гравця (оновлена структура)
    // Я припустив назви кадрів 1, 2, 3, 4 на основі твоєї структури.
    // Якщо файлу '...4.png' немає, анімація буде з 3-х кадрів.
    const playerImages = {
        // Макс м'язи
        '2': {
            stand: createImage('assets/sprite/strong/sprite-stand.png', '💪'),
            frames: [
                createImage('assets/sprite/strong/strong1.png', '💪'),
                createImage('assets/sprite/strong/strong2.png', '💪'),
                createImage('assets/sprite/strong/strong3.png', '💪'),
                createImage('assets/sprite/strong/strong4.png', '💪')
            ]
        },
        // М'язи 1
        '1': {
            stand: createImage('assets/sprite/stronger/sprite-stand.png', '🏋️'),
            frames: [
                createImage('assets/sprite/stronger/stronger1.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger2.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger3.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger4.png', '🏋️')
            ]
        },
        // Худий (Старт)
        '0': {
            stand: createImage('assets/sprite/normal/sprite-stand.png', '🧍'),
            frames: [
                createImage('assets/sprite/normal/norm1.png', '🧍'),
                createImage('assets/sprite/normal/norm2.png', '🧍'),
                createImage('assets/sprite/normal/norm3.png', '🧍'),
                createImage('assets/sprite/normal/norm4.png', '🧍') // Переконайся, що цей файл існує
            ]
        },
        // Вага 1
        '-1': {
            stand: createImage('assets/sprite/fatter/sprite-stand.png', '🍔'),
            frames: [
                createImage('assets/sprite/fatter/fatter1.png', '🍔'),
                createImage('assets/sprite/fatter/fatter2.png', '🍔'),
                createImage('assets/sprite/fatter/fatter3.png', '🍔'),
                createImage('assets/sprite/fatter/fatter4.png', '🍔') // Переконайся, що цей файл існує
            ]
        },
        // Повний
        '-2': {
            stand: createImage('assets/sprite/fat/sprite-stand.png', '🐋'),
            frames: [
                createImage('assets/sprite/fat/fat1.png', '🐋'),
                createImage('assets/sprite/fat/fat2.png', '🐋'),
                createImage('assets/sprite/fat/fat3.png', '🐋'),
                createImage('assets/sprite/fat/fat4.png', '🐋')
            ]
        }
    };

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const items = [];
    const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

    // Функція для створення зображень із фолбеком
    function createImage(src, fallbackText) {
        const img = new Image();
        img.src = src;
        img.fallback = fallbackText;
        return img;
    }

    const bgImage = createImage('assets/sprite/background.png', '🌆');

    // Спавн їжі (генерація випадкового предмета)
    function spawnFood() {
        const isSport = Math.random() > 0.5;
        const width = 30;
        let srcPath = '';
        let fallback = '';
        if (isSport) {
            srcPath = `assets/sprite/sports-nutrition/sports-nutrition${getRandomInt(1, 7)}.png`;
            fallback = '🥤';
        } else {
            srcPath = `assets/sprite/fastfood/fastfood${getRandomInt(1, 5)}.png`;
            fallback = '🍔';
        }

        const foodImg = createImage(srcPath, fallback);
        items.push({
            x: Math.random() * (canvas.width - width),
            y: -30,
            width: width,
            height: 30,
            type: isSport ? 'sport' : 'fastfood',
            speed: 2 + Math.random() * 2,
            img: foodImg
        });
        setTimeout(spawnFood, 800 + Math.random() * 1000);
    }
    spawnFood();

    // Керування
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = true;
            keys[e.key] = true;
        }
    });
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = false;
            keys[e.key] = false;
        }
    });

    // Логіка зміни стадій та швидкості
    function updatePlayerState() {
        if (player.score >= 10) player.state = 2;
        else if (player.score >= 5) player.state = 1;
        else if (player.score <= -10) player.state = -2;
        else if (player.score <= -5) player.state = -1;
        else player.state = 0;

        const absState = Math.abs(player.state);
        if (absState === 0) {
            player.currentSpeed = player.baseSpeed;
            player.animationSpeed = 10; // Звичайна швидкість
        } else if (absState === 1) {
            player.currentSpeed = player.baseSpeed * 0.8;
            player.animationSpeed = 12; // Сповільнена анімація
        } else if (absState === 2) {
            player.currentSpeed = player.baseSpeed * 0.5;
            player.animationSpeed = 15; // Повільна анімація
        }
    }

    // Головний ігровий цикл
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImage.complete && bgImage.naturalHeight !== 0) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Тимчасовий колір неба, поки картинка вантажиться
            ctx.fillStyle = "#87CEEB"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Рух гравця та анімація
        player.isMoving = false;
        if (keys.ArrowLeft || keys.a) {
            player.x -= player.currentSpeed;
            player.isFacingRight = false;
            player.isMoving = true;
        } else if (keys.ArrowRight || keys.d) {
            player.x += player.currentSpeed;
            player.isFacingRight = true;
            player.isMoving = true;
        }

        // Оновлення кадру анімації
        if (player.isMoving) {
            player.animationTimer++;
            if (player.animationTimer >= player.animationSpeed) {
                const currentWalkFrames = playerImages[player.state.toString()].frames;
                if (currentWalkFrames && currentWalkFrames.length > 0) {
                    player.currentFrame = (player.currentFrame + 1) % currentWalkFrames.length;
                }
                player.animationTimer = 0;
            }
        } else {
            // Коли гравець не рухається, скидаємо кадр на стійку
            player.currentFrame = 0;
            player.animationTimer = 0;
        }

        // Межі екрану для гравця
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

        // Малювання гравця
        const currentState = playerImages[player.state.toString()];
        let currentImgToDraw;

        // Вибираємо картинку: для руху чи для стійки
        if (player.isMoving && currentState.frames && currentState.frames.length > 0) {
            currentImgToDraw = currentState.frames[player.currentFrame];
        } else {
            currentImgToDraw = currentState.stand;
        }

        if (currentImgToDraw.complete && currentImgToDraw.naturalHeight !== 0) {
            ctx.save(); // Зберігаємо стан контексту

            if (!player.isFacingRight) {
                // Віддзеркалення по горизонталі для руху вліво
                ctx.translate(player.x + player.width, player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(currentImgToDraw, 0, 0, player.width, player.height);
            } else {
                // Звичайне малювання для руху вправо
                ctx.drawImage(currentImgToDraw, player.x, player.y, player.width, player.height);
            }

            ctx.restore(); // Відновлюємо стан контексту
        } else {
            // Фолбек
            ctx.font = "40px Arial";
            ctx.fillText(currentImgToDraw.fallback, player.x, player.y + 40);
        }

        // Рух та малювання предметів
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.y += item.speed;

            if (item.img.complete && item.img.naturalHeight !== 0) {
                ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
            } else {
                ctx.font = "25px Arial";
                ctx.fillText(item.img.fallback, item.x, item.y + 20);
            }

            // Перевірка колізії
            if (item.y + item.height > player.y &&
                item.x < player.x + player.width &&
                item.x + item.width > player.x) {
                
                if (item.type === 'sport') player.score += 1;
                if (item.type === 'fastfood') player.score -= 1;
                
                updatePlayerState();
                items.splice(i, 1);
                i--;
                continue;
            }

            // Видалення предметів, які впали
            if (item.y > canvas.height) {
                items.splice(i, 1);
                i--;
            }
        }

        // Відображення UI
        ctx.fillStyle = "#333";
        ctx.font = "16px sans-serif";
        ctx.fillText("Баланс: " + player.score + " (Стадія: " + player.state + ")", 10, 25);

        requestAnimationFrame(update);
    }

    // Запуск гри
    update();
});