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

    // Function to replace the controller mesh with a custom blaster
    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            // Import your blaster GLB
            BABYLON.SceneLoader.ImportMesh("", "/assets/", "blaster.glb", scene, (meshes) => {
                // Create a parent node for the imported mesh
                const customMeshRoot = new BABYLON.TransformNode("blasterRoot", scene);

                // Parent all loaded meshes to the root
                meshes.forEach((m) => m.parent = customMeshRoot);

                // Parent the custom mesh to the grip (or pointer if no grip)
                customMeshRoot.parent = controller.grip || controller.pointer;
                customMeshRoot.position.set(0, 0, 0);
                customMeshRoot.rotation.set(0, 0, 0);
                customMeshRoot.scaling.set(0.2, 0.2, 0.2); // adjust size if needed

                // Optionally hide the default controller mesh
                if (motionController.rootMesh) {
                    motionController.rootMesh.setEnabled(false);
                }
            });
        });
    };

    // Replace existing controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);
    // Replace any future controllers
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
