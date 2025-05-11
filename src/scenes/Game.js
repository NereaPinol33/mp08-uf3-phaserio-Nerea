import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.record = 0;
    }

    preload() {
        console.log('Preload Game');
        this.load.image('map1_tiles', 'assets/game/maps/map1/map1_tiles.png');
        this.load.tilemapTiledJSON('map1', 'assets/game/maps/map1/map1.json');
        this.load.image('xp', 'assets/game/other/xp.png');
        this.load.image('bullet', 'assets/game/other/electroball.png');
        this.load.image('health', 'assets/game/other/life.png');
        this.load.image('powerup', 'assets/game/other/powerup.png');
        this.load.image('triple_shot', 'assets/game/other/powerup_2.png');
        this.load.image('360_shooting', 'assets/game/other/powerup_3.png'); 
        this.load.image('enemy', 'assets/game/characters/robot_tanque.png');
        this.load.image('enemy2', 'assets/game/characters/robot_humanoide.png');
        this.load.image('enemy3', 'assets/game/characters/robot_jefe.png');
        this.load.image('player', 'assets/game/characters/robot.png');
        this.load.audio('backgroundMusic', 'assets/music/game.mp3');
        this.load.audio('attackSound', 'assets/game/sounds/attack.mp3');
        this.load.audio('damageSound', 'assets/game/sounds/damage.mp3');
        this.load.image('upgrade_recovery', 'assets/game/other/cards/upgrade_recovery.png');
        this.load.image('upgrade_shot', 'assets/game/other/cards/upgrade_shot.png');
        this.load.image('upgrade_invulnerable', 'assets/game/other/cards/upgrade_invulnerable.png');
        this.load.image('upgrade_enemyweak', 'assets/game/other/cards/upgrade_enemyweak.png');
        this.load.audio('powerupSound', 'assets/game/sounds/powerup.mp3');
    }

    create() {
        // Variables del juego
        this.score = 0;
        this.livesCount = 3;
        this.enemySpawnInterval = 2000; // Intervalo inicial de aparición de enemigos
        this.lastEnemySpawnTime = 0;
        this.enemySpeed = 100; // Velocidad inicial de los enemigos
        this.isInvincible = false;
        this.isTripleShotActive = false;
        this.isShooting360Active = false;
        this.record = this.data.get('record') || 0;

        // Música de fondo
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        this.backgroundMusic.play();

        // Initialize sounds
        this.attackSound = this.sound.add('attackSound');
        this.damageSound = this.sound.add('damageSound');
        this.powerupSound = this.sound.add('powerupSound');

        // Configurar el mapa
        const map = this.make.tilemap({ key: 'map1' });
        map.addTilesetImage('map1_tiles', 'map1_tiles');
        const mapLayer = map.createLayer('map1', 'map1_tiles', 0, 0);

        // Configurar colisiones en el mapa
        mapLayer.setCollisionByProperty({ colide: true });

        // Configurar el jugador
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(0.5); // Ajustar el tamaño del jugador

        // Configurar colisiones entre el jugador y las paredes
        this.physics.add.collider(this.player, mapLayer);

        // Mostrar puntuación y vidas
        this.scoreText = this.add.text(16, 16, 'Puntuación: ' + this.score, { fontSize: '32px', fill: '#fff' });
        this.livesText = this.add.text(16, 50, 'Vidas: ' + this.livesCount, { fontSize: '32px', fill: '#fff' });

        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.shootBullet, this);

        // Grupos
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.healthItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.tripleShotPowerups = this.physics.add.group();
        this.shooting360Powerups = this.physics.add.group();
        this.xpItems = this.physics.add.group();

        // Nivel y experiencia del jugador
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;

        // Mostrar nivel
        this.levelText = this.add.text(16, 84, 'Nivel: ' + this.level, { fontSize: '32px', fill: '#fff' });

        // Configurar colisiones
        this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.player, this.enemies, this.enemyCollision, null, this);
        this.physics.add.overlap(this.player, this.healthItems, this.collectHealth, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.tripleShotPowerups, this.collectTripleShotPowerup, null, this);
        this.physics.add.overlap(this.player, this.shooting360Powerups, this.collectShooting360Powerup, null, this);
        this.physics.add.overlap(this.player, this.xpItems, this.collectXP, null, this);

        // Inicializar velocidad de las balas
        this.bulletSpeed = 150;
    }

    update(time, delta) {
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
        } else {
            this.player.setVelocityX(0);
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-250);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }

        // Enemy spawning
        if (time > this.lastEnemySpawnTime + this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawnTime = time;
            if (this.enemySpawnInterval > 500) { // Minimum spawn interval
                this.enemySpawnInterval -= 100; // Speed up enemy spawning
            }
            this.enemySpeed += 5; // Increase enemy speed (reduced from 10 to 5)
        }

        // Enemy movement
        this.enemies.getChildren().forEach(enemy => {
            const speed = enemy.getData('speed');
            this.physics.moveToObject(enemy, this.player, speed);
        });
    }

    shootBullet(pointer) {
        if (this.attackSound) {
            this.attackSound.play();
        }
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        this.physics.moveTo(bullet, pointer.x, pointer.y, this.bulletSpeed); // Usar this.bulletSpeed
        
        // Calcular el ángulo entre la bala y el puntero
        const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, pointer.x, pointer.y);
        bullet.rotation = Phaser.Math.RadToDeg(angle);

        // Añadir una animación de rotación a la bala
        this.tweens.add({
            targets: bullet,
            rotation: bullet.rotation + Phaser.Math.PI2,
            duration: 1000,
            ease: 'Linear',
            repeat: -1
        });
    }

    shoot360Bullet(pointer) {
        const bulletSpeed = 150; // Reducir la velocidad a la mitad (antes era 300)
        const numBullets = 36; // Número de balas en un círculo
        const angleIncrement = (2 * Math.PI) / numBullets;
    
        for (let i = 0; i < numBullets; i++) {
            const angle = i * angleIncrement;
            const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
            this.physics.moveTo(
                bullet,
                this.player.x + Math.cos(angle) * 100,
                this.player.y + Math.sin(angle) * 100,
                bulletSpeed
            );
        }
    }

    spawnEnemy() {
        const minDistance = 250; // Minimum distance from the player
        let x, y;
        const playerX = this.player.x;
        const playerY = this.player.y;
    
        // Ensure enemy spawns at least `minDistance` away from the player
        do {
            x = Phaser.Math.Between(0, this.game.config.width);
            y = Phaser.Math.Between(0, this.game.config.height);
        } while (Phaser.Math.Distance.Between(playerX, playerY, x, y) < minDistance);
    
        // Determine which enemies can spawn based on the level
        let enemyType;
        if (this.level <= 3) {
            enemyType = 1; // Only spawn enemy1 in levels 1, 2, and 3
        } else {
            enemyType = Phaser.Math.Between(1, 3); // Randomly spawn enemy1, enemy2, or enemy3 in higher levels
        }
    
        let enemy;
        if (enemyType === 1) {
            // Enemy 1 (default speed)
            enemy = this.enemies.create(x, y, 'enemy');
            enemy.setData('speed', this.enemySpeed); // Default speed
            enemy.setData('damage', 1); // Default damage
            enemy.setScale(0.1); // Default scale
        } else if (enemyType === 2) {
            // Enemy 2 (2% faster)
            enemy = this.enemies.create(x, y, 'enemy2');
            enemy.setData('speed', this.enemySpeed * 1.02); // 2% faster
            enemy.setData('damage', 1); // Default damage
            enemy.setScale(0.1);
        } else if (enemyType === 3) {
            // Enemy 3 (removes 2 lives)
            enemy = this.enemies.create(x, y, 'enemy3');
            enemy.setData('speed', this.enemySpeed); // Default speed
            enemy.setData('damage', 2); // Removes 2 lives
            enemy.setScale(0.1); // Default scale
        }
    
        enemy.setCollideWorldBounds(true);
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Puntuación: ' + this.score);
        this.data.set('score', this.score);

        // Random chance to drop XP
        const xp = this.xpItems.create(enemy.x, enemy.y, 'xp');
        xp.setScale(0.5); // Adjust scale
        xp.setCollideWorldBounds(true);

        // Random chance to drop other items
        const dropChance = Phaser.Math.Between(0, 500);
        if (dropChance < 10) { // Reduce the chance for health item drop to 10%
            const health = this.healthItems.create(enemy.x, enemy.y, 'health');
            health.setScale(0.5); // Adjust scale
            health.setCollideWorldBounds(true);
        } else if (dropChance < 20) { // Reduce the chance for invincibility power-up to 10%
            const powerup = this.powerups.create(enemy.x, enemy.y, 'powerup');
            powerup.setScale(0.5); // Adjust scale
            powerup.setCollideWorldBounds(true);
        } else if (dropChance < 30) { // Reduce the chance for triple-shot power-up to 10%
            const tripleShot = this.tripleShotPowerups.create(enemy.x, enemy.y, 'triple_shot');
            tripleShot.setScale(0.5); // Adjust scale
            tripleShot.setCollideWorldBounds(true);
        } else if (dropChance < 40) { // Reduce the chance for 360-degree shooting power-up to 10%
            const shooting360 = this.shooting360Powerups.create(enemy.x, enemy.y, '360_shooting');
            shooting360.setScale(0.5); // Adjust scale
            shooting360.setCollideWorldBounds(true);
        }
    }

    enemyCollision(player, enemy) {
        if (!this.isInvincible) {
            this.physics.pause();
            player.setTint(0xff0000);
            const damage = enemy.getData('damage'); // Get the damage value of the enemy
            this.livesCount -= damage; // Subtract the appropriate number of lives
            this.damageSound.play();
            this.livesText.setText('Vidas: ' + this.livesCount);
            this.data.set('lives', this.livesCount);
            enemy.destroy();
    
            if (this.livesCount <= 0) {
                this.backgroundMusic.stop();
                const currentRecord = this.data.get('record') || 0;
                if (this.score > currentRecord) {
                    this.data.set('record', this.score);
                }
                if (this.score > currentRecord) {
                    this.scene.start('GameComplete');
                } else {
                    this.scene.start('GameOver');
                }
            } else {
                this.time.delayedCall(1000, () => {
                    this.physics.resume();
                    player.clearTint();
                });
            }
        } else {
            enemy.destroy();
        }
    }
    

    collectHealth(player, health) {
        health.destroy();
        this.livesCount += 1;
        this.livesText.setText('Lives: ' + this.livesCount);
        this.data.set('lives', this.livesCount);
    }

    collectPowerup(player, powerup) {
        powerup.destroy();
        if (this.powerupSound) {
            this.powerupSound.play();
        }
        this.isInvincible = true;
        player.setTint(0x00ff00); // Change player color to indicate invincibility
        this.time.delayedCall(10000, () => {
            this.isInvincible = false;
            player.clearTint();
        });
    }

    collectTripleShotPowerup(player, tripleShotPowerup) {
        tripleShotPowerup.destroy();
        if (this.powerupSound) {
            this.powerupSound.play();
        }
        this.isTripleShotActive = true;
        player.setTint(0x0000ff); // Change player color to indicate triple shot power-up
        this.time.delayedCall(10000, () => {
            this.isTripleShotActive = false;
            player.clearTint();
        });
    }

    collectShooting360Powerup(player, shooting360) {
        shooting360.destroy();
        if (this.powerupSound) {
            this.powerupSound.play();
        }
        this.isShooting360Active = true;
        player.setTint(0xff00ff); // Change player color to indicate 360-degree shooting power-up
        this.time.delayedCall(10000, () => {
            this.isShooting360Active = false;
            player.clearTint();
        });
    }

    collectXP(player, xp) {
        xp.destroy();
        this.experience += 10; // Add XP
        if (this.experience >= 100) { // Level up every 100 XP
            this.levelUp();
        }
    }

    levelUp() {
        this.level += 1;
        this.experience = 0; // Reset experience
        this.experienceToNextLevel = 100; // XP needed for each level remains constant
        this.levelText.setText('Level: ' + this.level);
    
        // Oscurecer el fondo
        const overlay = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000, 0.5);
        overlay.setOrigin(0, 0);
    
        // Pausar el juego
        this.physics.pause();
    
        // Mostrar las tarjetas de elección
        this.showUpgradeChoices(overlay);
    
        // Si no se elige en 15 segundos, reanudar el juego automáticamente
        this.time.delayedCall(15000, () => {
            if (this.physics.world.isPaused) {
                overlay.destroy();
                this.physics.resume();
            }
        });
    }
    
    showUpgradeChoices(overlay) {
        // Lista de tarjetas disponibles
        const upgrades = ['upgrade_recovery', 'upgrade_shot', 'upgrade_invulnerable', 'upgrade_enemyweak'];
    
        // Elegir dos tarjetas aleatorias
        const choice1 = Phaser.Utils.Array.RemoveRandomElement(upgrades);
        const choice2 = Phaser.Utils.Array.RemoveRandomElement(upgrades);
    
        // Mostrar las tarjetas en pantalla
        const card1 = this.add.image(this.game.config.width / 3, this.game.config.height / 2, choice1).setInteractive();
        const card2 = this.add.image((this.game.config.width / 3) * 2, this.game.config.height / 2, choice2).setInteractive();
    
        card1.setScale(0.5);
        card2.setScale(0.5);
    
        // Manejar la selección de una tarjeta
        card1.on('pointerdown', () => {
            this.applyUpgrade(choice1);
            overlay.destroy();
            card1.destroy();
            card2.destroy();
            this.physics.resume(); // Reanudar el juego
        });
    
        card2.on('pointerdown', () => {
            this.applyUpgrade(choice2);
            overlay.destroy();
            card1.destroy();
            card2.destroy();
            this.physics.resume(); // Reanudar el juego
        });
    }
    
    applyUpgrade(upgrade) {
        switch (upgrade) {
            case 'upgrade_recovery':
                this.livesCount += 1; // Recuperar una vida
                this.livesText.setText('Lives: ' + this.livesCount);
                break;
            case 'upgrade_shot':
                this.bulletSpeed += 50; // Incrementar la velocidad de las balas acumulativamente
                break;
            case 'upgrade_invulnerable':
                this.isInvincible = true; // Activar invulnerabilidad
                this.time.delayedCall(10000, () => {
                    this.isInvincible = false;
                });
                break;
            case 'upgrade_enemyweak':
                this.enemySpeed -= 10; // Reducir la velocidad de los enemigos
                if (this.enemySpeed < 50) this.enemySpeed = 50; // Velocidad mínima
                break;
        }
    }

    loadSecondMap() {
        // Limpiar el mapa y los enemigos actuales
        this.enemies.clear(true, true);
        this.physics.world.colliders.destroy();
    
        // Configurar el segundo mapa
        const map = this.make.tilemap({ key: 'second_map' });
        const tileset = map.addTilesetImage('second_map_tileset', 'second_map_tileset');
        const fondo = map.createLayer('Tile Layer 1', tileset, 0, 0);
        fondo.setCollisionByProperty({ colision: true });
    
        // Actualizar colisiones
        this.physics.add.collider(this.player, fondo);
        this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.player, this.enemies, this.enemyCollision, null, this);
    
        // Actualizar enemigos para incluir `enemy3`
        this.spawnEnemy = () => {
            const minDistance = 250; // Minimum distance from the player
            let x, y;
            const playerX = this.player.x;
            const playerY = this.player.y;
    
            // Ensure enemy spawns at least `minDistance` away from the player
            do {
                x = Phaser.Math.Between(0, this.game.config.width);
                y = Phaser.Math.Between(0, this.game.config.height);
            } while (Phaser.Math.Distance.Between(playerX, playerY, x, y) < minDistance);
    
            // Spawn only `enemy3` in the second map
            const enemy = this.enemies.create(x, y, 'enemy3');
            enemy.setData('speed', this.enemySpeed); // Default speed
            enemy.setData('damage', 2); // Removes 2 lives
            enemy.setScale(3); // Default scale
            enemy.setCollideWorldBounds(true);
        };
    }
}
