import createScene from './app.js';

const BABYLON = window.BABYLON;
const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
window.engine = engine;
window.canvas = canvas;

const scene = createScene(engine, canvas);

const xrHelper = await scene.createDefaultXRExperienceAsync();

document.getElementById("enterVRBtn").addEventListener("click", () => {
    xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor");
});

engine.runRenderLoop(()=>scene.render());
addEventListener('resize', ()=>engine.resize());
