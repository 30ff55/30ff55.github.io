export default async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0,5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
    light.intensity = 0.7;

    // Sphere & Ground
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2, segments:32}, scene);
    sphere.position.y = 1;
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:6, height:6}, scene);

    // VR
    const xrHelper = await scene.createDefaultXRExperienceAsync();

    const replaceControllerMesh = (controller) => {

        controller.onMotionControllerInitObservable.add((motionController) => {
            motionController.onModelLoadedObservable.add(() => {

        // hide default mesh
                if (motionController.rootMesh) {
                    motionController.rootMesh.setEnabled(false);
                    motionController.rootMesh.isVisible = false;
                }

        // load custom mesh
                BABYLON.SceneLoader.ImportMesh("", "/assets/", "blaster.glb", scene, (meshes) => {
                    const customMesh = meshes[0];

            // attach to the controller's grip
                    customMesh.parent = controller.grip || controller.pointer;

            // optional: scale/rotate to match VR controller
                    customMesh.scaling = new BABYLON.Vector3(0.2,0.2,0.2);
                    customMesh.position = BABYLON.Vector3.Zero();
                    customMesh.rotation = BABYLON.Vector3.Zero();
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
