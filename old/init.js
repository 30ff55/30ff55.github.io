import createScene from './app.js';

const BABYLON = window.BABYLON;
const canvas = document.getElementById('renderCanvas');

engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
window.engine = engine;
window.canvas = canvas;

const scene = createScene();
engine.runRenderLoop(()=>scene.render());
addEventListener('resize', ()=>engine.resize());
