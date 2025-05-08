import { Scene } from 'phaser';

export class GameComplete extends Scene {
    constructor() {
        super('GameComplete');
    }

    preload() {
        this.load.audio('recordSound', 'assets/game/sounds/record.mp3');
    }

    create() {
        this.add.image(512, 384, 'background');
        this.record_sound = this.sound.add('recordSound');
        this.record_sound.play();
        const newRecordText = this.add.text(512, -200, '¡Nuevo Récord!', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Obtener la nueva puntuación desde la escena del juego
        const newScore = this.scene.get('Game').data.get('score') || 0;
        const newScoreDisplay = this.add.text(512, 400, 'Nueva Puntuación: ' + newScore, {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
