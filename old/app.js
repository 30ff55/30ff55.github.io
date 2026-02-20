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

    // Function to replace a controller model
    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {                                                            
            motionController.setEnabled(false);                                                                                              
            controller.onMeshLoadedObservable.add((mesh)=>{                           
                BABYLON.SceneLoader.ImportMesh(
                "",                 // all meshes
                "/assets/",         // folder path
                "blaster.glb",      // file name
                scene,
                (meshes) => {
                    const customMesh = meshes[0];
                    motionController.rootMesh = customMesh;
                }
            );
        });         
    };

    // Replace current controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);

    // Replace future controllers as they connect
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
};
