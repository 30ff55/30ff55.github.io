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

    // VR setup
    const xrHelper = await scene.createDefaultXRExperienceAsync();

    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            motionController.onModelLoadedObservable.add(() => {
                // Import your blaster and set it as the rootMesh
                BABYLON.SceneLoader.ImportMesh("", "/assets/", "blaster.glb", scene, (meshes) => {
                    const customMesh = meshes[0];

                    // Set as rootMesh
                    motionController.rootMesh.dispose(); // remove old default
                    motionController.rootMesh = customMesh;

                    // Make sure it moves with the grip or pointer
                    customMesh.parent = controller.grip || controller.pointer;
                    customMesh.position = BABYLON.Vector3.Zero();
                    customMesh.rotation = BABYLON.Vector3.Zero();
                    customMesh.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2); // adjust size if needed
                });
            });
        });
    };

    // Existing controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);
    // Future controllers
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
