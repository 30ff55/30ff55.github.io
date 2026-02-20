const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 5, -10),
        scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    // Sphere & Ground
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 2, segments: 32 },
        scene
    );
    sphere.position.y = 1;

    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 6, height: 6 },
        scene
    );

    // XR setup
    const xrHelper = await scene.createDefaultXRExperienceAsync();

    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {

            motionController.onModelLoadedObservable.add(async () => {

                // Wait 100ms
                await wait(100);

                // Hide default controller model
                motionController.rootMesh?.setEnabled(false);

                // Load custom blaster
                const result = await BABYLON.SceneLoader.ImportMeshAsync(
                    "",
                    "/assets/",
                    "blaster.glb",
                    scene
                );

                // Create root transform node
                const customRoot = new BABYLON.TransformNode("blasterRoot", scene);

                // Parent all meshes from GLB
                result.meshes.forEach(mesh => {
                    mesh.parent = customRoot;
                });

                // Attach to controller grip (preferred) or pointer
                customRoot.parent = controller.grip || controller.pointer;

                // Reset transforms
                customRoot.position = BABYLON.Vector3.Zero();
                customRoot.rotation = BABYLON.Vector3.Zero();

                // Scale down if needed
                customRoot.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
            });
        });
    };

    // Existing controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);

    // Future controllers
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
