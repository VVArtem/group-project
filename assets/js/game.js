document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('mini-game');
    if (!container) return;


    const canvas = document.createElement('canvas');

    window.addEventListener('resize', () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        player.y = canvas.height - 120;
        if (player.x > canvas.width - player.width) {
            player.x = canvas.width - player.width;
        }
    });

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');


    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 120,
        width: 50,
        height: 70,
        dx: 0,
        baseSpeed: 6,
        currentSpeed: 6,
        state: 0,
        score: 0,


        currentFrame: 0,
        animationTimer: 0,
        animationSpeed: 10,
        isFacingRight: true,
        isMoving: false
    };




    const playerImages = {

        '2': {
            stand: createImage('assets/sprite/strong/sprite-stand.png', '💪'),
            frames: [
                createImage('assets/sprite/strong/strong1.png', '💪'),
                createImage('assets/sprite/strong/strong2.png', '💪'),
                createImage('assets/sprite/strong/strong3.png', '💪'),
                createImage('assets/sprite/strong/strong4.png', '💪')
            ]
        },

        '1': {
            stand: createImage('assets/sprite/stronger/sprite-stand.png', '🏋️'),
            frames: [
                createImage('assets/sprite/stronger/stronger1.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger2.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger3.png', '🏋️'),
                createImage('assets/sprite/stronger/stronger4.png', '🏋️')
            ]
        },

        '0': {
            stand: createImage('assets/sprite/normal/sprite-stand.png', '🧍'),
            frames: [
                createImage('assets/sprite/normal/norm1.png', '🧍'),
                createImage('assets/sprite/normal/norm2.png', '🧍'),
                createImage('assets/sprite/normal/norm3.png', '🧍'),
                createImage('assets/sprite/normal/norm4.png', '🧍')
            ]
        },

        '-1': {
            stand: createImage('assets/sprite/fatter/sprite-stand.png', '🍔'),
            frames: [
                createImage('assets/sprite/fatter/fatter1.png', '🍔'),
                createImage('assets/sprite/fatter/fatter2.png', '🍔'),
                createImage('assets/sprite/fatter/fatter3.png', '🍔'),
                createImage('assets/sprite/fatter/fatter4.png', '🍔')
            ]
        },

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


    function createImage(src, fallbackText) {
        const img = new Image();
        img.src = src;
        img.fallback = fallbackText;
        return img;
    }

    const bgImage = createImage('assets/sprite/background.png', '🌆');


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
    
    let isTouching = false;
    let targetX = 0; 
    
    function updateTargetX(clientX) {
        const rect = canvas.getBoundingClientRect();
        targetX = clientX - rect.left;
    }
    
    canvas.addEventListener('touchstart', (e) => {
        isTouching = true;
        updateTargetX(e.touches[0].clientX);
        if (e.cancelable) e.preventDefault(); 
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        updateTargetX(e.touches[0].clientX);
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => { isTouching = false; });

    
    canvas.addEventListener('mousedown', (e) => {
        isTouching = true;
        updateTargetX(e.clientX);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isTouching) updateTargetX(e.clientX);
    });
    canvas.addEventListener('mouseup', () => { isTouching = false; });
    canvas.addEventListener('mouseleave', () => { isTouching = false; });


    function updatePlayerState() {
        console.log()
        if (player.score >= 10) player.state = 2;
        else if (player.score >= 5) player.state = 1;
        else if (player.score <= -10) player.state = -2;
        else if (player.score <= -5) player.state = -1;
        else player.state = 0;

        const absState = Math.abs(player.state);
        if (absState === 0) {
            player.currentSpeed = player.baseSpeed;
            player.animationSpeed = 10;
        } else if (absState === 1) {
            player.currentSpeed = player.baseSpeed * 0.8;
            player.animationSpeed = 12;
        } else if (absState === 2) {
            player.currentSpeed = player.baseSpeed * 0.5;
            player.animationSpeed = 15;
        }
    }



    let gameOver = false;
    let gameResult = null;


    function update() {
        console.log(gameOver);
        if (gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textAlign = "center";
            if (gameResult === 'win') {
                ctx.fillStyle = "#4ade80";
                ctx.font = "bold 40px sans-serif";
                ctx.fillText("🏆 ПЕРЕМОГА!", canvas.width / 2, canvas.height / 2 - 20);

                ctx.fillStyle = "#ffffff";
                ctx.font = "18px sans-serif";
                ctx.fillText("Ви здобули знижку 67% на всі товари!", canvas.width / 2, canvas.height / 2 + 20);
            } else {
                ctx.fillStyle = "#f87171";
                ctx.font = "bold 40px sans-serif";
                ctx.fillText("💀 ВИ ПРОГРАЛИ!", canvas.width / 2, canvas.height / 2 - 20);


                ctx.fillStyle = "#60a5fa";
                ctx.font = "bold 20px sans-serif";
                ctx.fillText("👉 Натисни тут, щоб виправити ситуацію 👈", canvas.width / 2, canvas.height / 2 + 30);


                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 180, canvas.height / 2 + 38);
                ctx.lineTo(canvas.width / 2 + 180, canvas.height / 2 + 38);
                ctx.strokeStyle = "#60a5fa";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImage.complete && bgImage.naturalHeight !== 0) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#87CEEB";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }


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
            player.currentFrame = 0;
            player.animationTimer = 0;
        }


        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;


        const currentState = playerImages[player.state.toString()];
        let currentImgToDraw;

        if (player.isMoving && currentState.frames && currentState.frames.length > 0) {
            currentImgToDraw = currentState.frames[player.currentFrame];
        } else {
            currentImgToDraw = currentState.stand;
        }

        if (currentImgToDraw.complete && currentImgToDraw.naturalHeight !== 0) {
            ctx.save();
            if (!player.isFacingRight) {
                ctx.translate(player.x + player.width, player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(currentImgToDraw, 0, 0, player.width, player.height);
            } else {
                ctx.drawImage(currentImgToDraw, player.x, player.y, player.width, player.height);
            }
            ctx.restore();
        } else {
            ctx.font = "40px Arial";
            ctx.fillText(currentImgToDraw.fallback, player.x, player.y + 40);
        }


        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.y += item.speed;

            if (item.img.complete && item.img.naturalHeight !== 0) {
                ctx.drawImage(item.img, item.x, item.y, item.width, item.height);
            } else {
                ctx.font = "25px Arial";
                ctx.fillText(item.img.fallback, item.x, item.y + 20);
            }


            if (item.y + item.height > player.y &&
                item.x < player.x + player.width &&
                item.x + item.width > player.x) {

                if (item.type === 'sport') player.score += 1;
                if (item.type === 'fastfood') player.score -= 1;

                updatePlayerState();


                if (player.score >= 15) {
                    gameOver = true;
                    gameResult = 'win';
                    localStorage.setItem('fitlife_game_discount', 'true');
                } else if (player.score <= -15) {
                    gameOver = true;
                    gameResult = 'lose';
                    localStorage.removeItem('fitlife_game_discount');
                }

                items.splice(i, 1);
                i--;
                continue;
            }

            if (item.y > canvas.height) {
                items.splice(i, 1);
                i--;
            }
        }

        ctx.fillStyle = "#333";
        ctx.font = "16px sans-serif";
        ctx.fillText("Баланс: " + player.score + " (Стадія: " + player.state + ")", 10, 25);


        if (!gameOver) {
            requestAnimationFrame(update);
        }

        if (player.score >= 15) {
            update();
        }
    }


    canvas.addEventListener('click', () => {

        if (gameOver && gameResult === 'lose') {
            window.location.href = 'single.html?id=6841';
        }
    });


    canvas.addEventListener('mousemove', () => {
        if (gameOver && gameResult === 'lose') {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
    });

    update();
});