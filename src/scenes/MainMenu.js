import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Precargar los recursos del menú
        this.load.image('background', 'assets/menu/background.png');
        this.load.image('logo', 'assets/menu/logo.png');
    }

    create() {
        // Fondo y logo
        this.add.image(512, 384, 'background');
        this.add.image(512, 300, 'logo');

        // Crear un botón único con el texto "Jugar Ahora" con el estilo del texto eliminado
        const playButton = this.add.text(512, 450, 'Jugar Ahora', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        // Configurar el evento para iniciar el mapa al hacer clic
        playButton.on('pointerdown', () => {
            this.scene.start('Game'); // Ir al mapa del juego
        });

        // Mostrar el récord
        let record = this.scene.get('Game').data.get('record') || 0;
        this.add.text(512, 600, 'Puntuación Máxima: ' + record, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Animación de brillo para el botón
        this.tweens.add({
            targets: playButton,
            scale: 1.2, // Escalar hasta 120%
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
