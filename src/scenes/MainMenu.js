import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Precargar los recursos del menú
        this.load.image('background', 'assets/menu/background.png');
        this.load.image('logo', 'assets/menu/logo.png');
        this.load.image('buttonElectro', 'assets/menu/buttons/button_electricidad.png'); // Botón para el mundo Electricidad
        this.load.image('buttonFabric', 'assets/menu/buttons/button_fabric.png');  // Botón para el mundo Fábrica
    }

    create() {
        // Fondo y logo
        this.add.image(512, 384, 'background');
        this.add.image(512, 300, 'logo');

        // Texto del menú
        const pressText = this.add.text(512, 200, '¡Elige tu Mundo!', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Botón para el mundo Electricidad
        const buttonElectro = this.add.image(300, 450, 'buttonElectro').setInteractive();
        buttonElectro.setScale(0.8); // Ajustar tamaño del botón
        buttonElectro.on('pointerdown', () => {
            this.scene.start('Game'); // Ir al mundo 1 (Electricidad)
        });

        // Botón para el mundo Fábrica
        const buttonFabric = this.add.image(700, 450, 'buttonFabric').setInteractive();
        buttonFabric.setScale(0.8); // Ajustar tamaño del botón
        buttonFabric.on('pointerdown', () => {
            this.scene.start('GameFabric'); // Ir al mundo 2 (Fábrica)
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

        // Animación de brillo para el texto
        this.tweens.add({
            targets: pressText,
            scale: 1.2, // Escalar hasta 120%
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
