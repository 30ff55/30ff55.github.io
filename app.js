import * as BABYLON from "https://cdn.babylonjs.com/babylon.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

async function createScene() {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Sphere
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    sphere.position.y = 1;

    // Default environment
    scene.createDefaultEnvironment();

    // Enable WebXR immersive experience
    await scene.createDefaultXRExperienceAsync();

    return scene;
}

// Initialize scene and render loop
(async () => {
    const scene = await createScene();
    engine.runRenderLoop(() => scene.render());

    window.addEventListener("resize", () => engine.resize());
})();
