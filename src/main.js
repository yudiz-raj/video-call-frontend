
import Phaser from 'phaser';
// import Preload from './scenes/Preload';
import Level from './scenes/Level';

class Boot extends Phaser.Scene {
  preload() {
    this.load.on(Phaser.Loader.Events.COMPLETE, () => this.scene.start("Level"));
  }
}

window.addEventListener('load', () => {
  const game = new Phaser.Game({
    title: 'Head Ball',
    // version: config.version,
    width: 1080,
    height: 1920,
    type: Phaser.AUTO,
    backgroundColor: '#333',
    parent: "game-division",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
      disableWebAudio: false,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: {
          y: 3,
        },
        debug: false,
      },
    },
    dom: {
      createContainer: true,
    },
    scene: [Boot, Level],
  });
});
