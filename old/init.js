import createScene from './app.js';

const BABYLON = window.BABYLON;
const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
window.engine = engine;
window.canvas = canvas;

const scene = createScene(engine, canvas);

const xrHelper = await scene.createDefaultXRExperienceAsync();

const button = document.getElementById("enterVRBtn")
button.addEventListener("click", () => {
    xrHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor")

    xrHelper.baseExperience.onStateChangedObservable.add((state) => {
        if (state === BABYLON.WebXRState.ENTERING_XR) {
            canvas.style.display = "block";
            // button.style.display = "none";
        } else if (state === BABYLON.WebXRState.EXITING_XR) {
            canvas.style.display = "none";
            // button.style.display = "block";
        }
    });
});

engine.runRenderLoop(()=>scene.render());
addEventListener('resize', ()=>engine.resize());
