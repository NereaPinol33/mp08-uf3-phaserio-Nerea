import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Mostrar la imagen de fondo cargada en la escena Boot
        this.add.image(512, 384, 'background');

        // Barra de progreso
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // Actualizar la barra de progreso
        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('logo', '/menu/logo.png');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
