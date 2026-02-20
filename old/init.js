const BABYLON = window.BABYLON;
const canvas = document.getElementById('renderCanvas');

const mod = await import(url);

let engine = null;
if (typeof mod.createEngine === 'function') {
  try { engine = await mod.createEngine(); } catch {}
}
if (!engine) {
  engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
}
window.engine = engine; window.canvas = canvas;

let createScene = mod.createScene || mod.default;
if (!createScene && mod.Playground?.CreateScene) createScene = (e,c)=>mod.Playground.CreateScene(e,c);
if (!createScene) throw new Error('No createScene() export found.');

const scene = await (createScene(engine, canvas) ?? createScene());
engine.runRenderLoop(()=>scene.render());
addEventListener('resize', ()=>engine.resize());

addEventListener('unload', ()=> URL.revokeObjectURL(url));
