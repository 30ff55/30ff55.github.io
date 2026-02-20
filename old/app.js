export default async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Sphere & Ground
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    sphere.position.y = 1;
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    // --- VR Setup ---
    const xrHelper = await scene.createDefaultXRExperienceAsync();

    // Helper function to replace a controller mesh
    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {

            // Immediately hide the default mesh
            if (motionController.rootMesh) {
                motionController.rootMesh.setEnabled(false);
                motionController.rootMesh.isVisible = false;
            }

            // Import custom mesh and parent it to the grip or pointer
            const loadCustomMesh = () => {
                BABYLON.SceneLoader.ImportMesh(
                    "",                 // all meshes
                    "/assets/",         // folder path
                    "blaster.glb",      // file name
                    scene,
                    (meshes) => {
                        const customMesh = meshes[0];
                        customMesh.parent = controller.grip || controller.pointer;
                        customMesh.position = BABYLON.Vector3.Zero();
                        customMesh.rotation = BABYLON.Vector3.Zero();
                    }
                );
            };

            // If mesh already loaded, run immediately
            if (controller.onMeshLoadedObservable.hasObservers()) {
                loadCustomMesh();
            } else {
                controller.onMeshLoadedObservable.add(loadCustomMesh);
            }
        });
    };

    // Apply to existing controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);

    // Apply to future controllers
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
