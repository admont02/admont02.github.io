document.addEventListener('DOMContentLoaded', () => {
    
    // 1. EFECTO MAQUINA DE ESCRIBIR
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
    
    typingElement.textContent = "> ";
    setTimeout(typeEffect, 500);

    // 2. FONDO INTERACTIVO & MINIJUEGO (PARTÍCULAS + NAVES)
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particlesArray = [];
    let spaceshipsArray = [];
    let destroyedShips = 0;
    const totalShips = 5;
    const scoreVal = document.getElementById('score-val');
    let mouse = { x: null, y: null, radius: 100 };
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Clase Partícula (Fondo ambiental)
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.color = Math.random() > 0.5 ? '#00ffcc' : '#b052ff';
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 20; }
                if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 20; }
            }
            this.draw();
        }
    }

    // Clase Nave Enemiga (El Minijuego)
    class Spaceship {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 3; // Velocidad X
            this.vy = (Math.random() - 0.5) * 3; // Velocidad Y
            this.radius = 20; // Radio de hit
            this.color = '#ff0055';
            this.isDestroyed = false;
        }
        draw() {
            if(this.isDestroyed) return;

            // Calcular rotación según la dirección
            let angle = Math.atan2(this.vy, this.vx);
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            
            // Dibujar nave estilo vector/asteroids
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(15, 0);     // Morro
            ctx.lineTo(-10, -10);  // Ala izquierda
            ctx.lineTo(-5, 0);     // Parte trasera
            ctx.lineTo(-10, 10);   // Ala derecha
            ctx.closePath();
            ctx.stroke();

            // Dibujar un halo neón
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.stroke();
            
            ctx.restore();
        }
        update() {
            if(this.isDestroyed) return;

            this.x += this.vx;
            this.y += this.vy;

            // Rebotar en los bordes
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.vx = -this.vx;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.vy = -this.vy;

            this.draw();
            
        }
    }

    // Listener de clics ("Disparar")
    // Listener de clics ("Disparar") en toda la ventana
    window.addEventListener('click', (event) => {
        const clickX = event.clientX;
        const clickY = event.clientY;

        spaceshipsArray.forEach(ship => {
            if (!ship.isDestroyed) {
                // Comprobar colisión por distancia (círculo)
                const dist = Math.sqrt(Math.pow(clickX - ship.x, 2) + Math.pow(clickY - ship.y, 2));
                
                // Multiplicamos el radio por 3 para que la hitbox sea más generosa y fácil de acertar
                if (dist < ship.radius * 3) { 
                    ship.isDestroyed = true;
                    destroyedShips++;
                    scoreVal.innerText = destroyedShips;

                    // Si destruyes todas...
                    if (destroyedShips === totalShips) {
                        activarModoDios();
                        const hud = document.getElementById('game-hud');
                        hud.innerHTML = "¡SECTOR DESPEJADO!";
                        hud.style.color = '#ffea00';
                        hud.style.borderColor = '#ffea00';
                    }
                }
            }
        });
    });

    function init() {
        particlesArray = [];
        spaceshipsArray = [];
        
        let numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }

        for (let i = 0; i < totalShips; i++) {
            spaceshipsArray.push(new Spaceship());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        for (let i = 0; i < spaceshipsArray.length; i++) spaceshipsArray[i].update();
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();

    // 3. EASTER EGG CLÁSICO (Teclado) por si alguien hace la secuencia
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activarModoDios();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    let diosActivado = false;
    function activarModoDios() {
        if (diosActivado) return; // Evitar dispararlo varias veces
        diosActivado = true;

        const toast = document.getElementById('easter-egg-toast');
        toast.classList.add('show');
        
        // Cambiar paleta a colores más "agresivos/arcade"
        document.documentElement.style.setProperty('--primary', '#ffea00'); 
        document.documentElement.style.setProperty('--secondary', '#ff0055');
        
        // Hacer que las partículas restantes se vuelvan locas un rato
        particlesArray.forEach(p => p.density = p.density * 5);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
});