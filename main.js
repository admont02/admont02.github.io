document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. EFECTO MÁQUINA DE ESCRIBIR
    // ==========================================
    const textToType = "> Software Engineer & Game Developer_";
    const typingElement = document.getElementById('typing-name');
    let charIndex = 0;

    function typeEffect() {
        if (charIndex < textToType.length) {
            typingElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeEffect, 100);
        } else {
            setTimeout(() => {
                typingElement.textContent = "> ";
                charIndex = 2;
                typeEffect();
            }, 5000);
        }
    }
    
    if (typingElement) {
        typingElement.textContent = "> ";
        setTimeout(typeEffect, 500);
    }

    // ==========================================
    // 2. FUNCIÓN DE VICTORIA (Definida arriba para evitar errores)
    // ==========================================
    let victoriaActivada = false;
    function activarVictoria() {
        if (victoriaActivada) return; // Evitar que se ejecute varias veces
        victoriaActivada = true;

        const toast = document.getElementById('easter-egg-toast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }
    }

    // ==========================================
    // 3. CONFIGURACIÓN DE LOS CANVAS
    // ==========================================
    
    // Canvas de partículas (Fondo Global)
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
    
    function resizeBgCanvas() {
        if (bgCanvas) {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
    }
    resizeBgCanvas();

    // Canvas del Minijuego (Solo Hero)
    const hero = document.getElementById('hero');
    const gameCanvas = document.getElementById('game-canvas');
    const gameCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
    
    function resizeGameCanvas() {
        if (gameCanvas && hero) {
            gameCanvas.width = hero.clientWidth;
            gameCanvas.height = hero.clientHeight;
        }
    }
    resizeGameCanvas();

    // Variables del juego
    let particlesArray = [];
    let spaceshipsArray = [];
    let destroyedShips = 0;
    const totalShips = 5;
    const scoreVal = document.getElementById('score-val');
    let mouse = { x: null, y: null, radius: 120 }; // Hitbox de repulsión del ratón

    // ==========================================
    // 4. LISTENERS DE RATÓN Y VENTANA
    // ==========================================
    
    // Para las partículas globales (sigue al ratón en toda la web)
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Redimensionar al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
        resizeBgCanvas();
        resizeGameCanvas();
        initParticles(); // Reiniciamos partículas para cubrir nueva resolución
    });

    // ==========================================
    // 5. CLASES DE ENTIDADES (Partículas y Naves)
    // ==========================================

    class Particle {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.color = Math.random() > 0.5 ? '#00ffcc' : '#b052ff';
        }
        draw() {
            if (!bgCtx) return;
            bgCtx.fillStyle = this.color;
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            bgCtx.closePath();
            bgCtx.fill();
        }
        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (mouse.x !== null && distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 20; }
                if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 20; }
            }
            this.draw();
        }
    }

    class Spaceship {
        constructor() {
            this.x = Math.random() * gameCanvas.width;
            this.y = Math.random() * gameCanvas.height;
            this.vx = (Math.random() - 0.5) * 3; 
            this.vy = (Math.random() - 0.5) * 3; 
            this.radius = 20; 
            this.color = '#ff0055';
            this.isDestroyed = false;
        }
        draw() {
            if (this.isDestroyed || !gameCtx) return;
            
            let angle = Math.atan2(this.vy, this.vx);
            
            gameCtx.save();
            gameCtx.translate(this.x, this.y);
            gameCtx.rotate(angle);
            
            gameCtx.strokeStyle = this.color;
            gameCtx.lineWidth = 2;
            gameCtx.shadowBlur = 10;
            gameCtx.shadowColor = this.color;
            
            gameCtx.beginPath();
            gameCtx.moveTo(15, 0);     
            gameCtx.lineTo(-10, -10);  
            gameCtx.lineTo(-5, 0);     
            gameCtx.lineTo(-10, 10);   
            gameCtx.closePath();
            gameCtx.stroke();
            
            gameCtx.restore();
        }
        update() {
            if (this.isDestroyed) return;
            this.x += this.vx;
            this.y += this.vy;

            // Físicas corregidas para evitar bucles en los bordes
            if (this.x + this.radius > gameCanvas.width) {
                this.x = gameCanvas.width - this.radius;
                this.vx *= -1;
            } else if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -1;
            }

            if (this.y + this.radius > gameCanvas.height) {
                this.y = gameCanvas.height - this.radius;
                this.vy *= -1;
            } else if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -1;
            }

            this.draw();
        }
    }

    // ==========================================
    // 6. MECÁNICA DE DISPARO
    // ==========================================
    if (hero) {
        hero.addEventListener('click', (event) => {
            const rect = hero.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            spaceshipsArray.forEach(ship => {
                if (!ship.isDestroyed) {
                    const dist = Math.sqrt(Math.pow(clickX - ship.x, 2) + Math.pow(clickY - ship.y, 2));
                    
                    if (dist < ship.radius * 3) { // Hitbox amplia para ser justo
                        ship.isDestroyed = true;
                        destroyedShips++;
                        if (scoreVal) scoreVal.innerText = destroyedShips;

                        if (destroyedShips === totalShips) {
                            activarVictoria();
                            const hud = document.getElementById('game-hud');
                            if (hud) {
                                hud.innerHTML = "¡SECTOR DESPEJADO!";
                                hud.style.color = '#00ffcc';
                                hud.style.borderColor = '#00ffcc';
                                hud.style.background = 'rgba(0, 255, 204, 0.1)';
                            }
                        }
                    }
                }
            });
        });
    }

    // ==========================================
    // 7. BUCLE DE JUEGO (GAME LOOP)
    // ==========================================
    function initParticles() {
        particlesArray = [];
        if (!bgCanvas) return;
        let numberOfParticles = (bgCanvas.width * bgCanvas.height) / 8000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function init() {
        initParticles();
        spaceshipsArray = [];
        for (let i = 0; i < totalShips; i++) {
            spaceshipsArray.push(new Spaceship());
        }
    }

    function animate() {
        // Limpiar canvas en cada fotograma
        if (bgCtx && bgCanvas) bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        if (gameCtx && gameCanvas) gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Actualizar entidades
        for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        for (let i = 0; i < spaceshipsArray.length; i++) spaceshipsArray[i].update();
        
        requestAnimationFrame(animate);
    }
    
    // Iniciar todo
    init();
    animate();
});