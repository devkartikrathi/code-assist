export const basePrompt = `<boltArtifact id="game-dev-starter" title="Game Project Starter">
  <boltAction type="file" filePath="index.html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Game Project</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module" src="src/main.js"></script>
</body>
</html>
  </boltAction>

  <boltAction type="file" filePath="package.json">
{
  "name": "game-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "vite"
  },
  "devDependencies": {
    "vite": "^5.4.2"
  },
  "dependencies": {
    "phaser": "^3.60.0"
  }
}
  </boltAction>

  <boltAction type="file" filePath="vite.config.js">
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    open: true
  }
});
  </boltAction>

  <boltAction type="file" filePath="src/main.js">
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  this.load.setBaseURL('https://labs.phaser.io');
  this.load.image('sky', 'assets/skies/space3.png');
}

function create() {
  this.add.image(400, 300, 'sky');
}

function update() {}

new Phaser.Game(config);
  </boltAction>
</boltArtifact>`;
