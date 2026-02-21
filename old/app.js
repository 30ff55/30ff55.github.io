const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);

    // --- Camera ---
    const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 5, -10),
        scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // --- Light ---
    const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    light.intensity = 0.7;

    // --- Environment ---
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

    // --- XR Setup ---
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });

    /**
     * Function to swap the default controller model for a custom blaster
     */
    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            
            motionController.onModelLoadedObservable.add(async () => {
                // 1. Brief wait to ensure the system is ready
                await wait(100);

                // 2. Hide the default controller model
                if (motionController.rootMesh) {
                    motionController.rootMesh.setEnabled(false);
                }

                try {
                    // 3. Load the custom blaster
                    // Note: Use BABYLON.SceneLoader and the 'scene' variable from the outer scope
                    const result = await BABYLON.SceneLoader.ImportMeshAsync(
                        "", 
                        "assets/", 
                        "blaster.glb", 
                        scene
                    );

                    // 4. Get the root of the imported model
                    const blasterRoot = result.meshes[0];

                    // 5. Parent it to the controller's "grip" (the physical hand position)
                    blasterRoot.parent = controller.grip || controller.pointer;

                    // 6. Reset transforms
                    blasterRoot.position = BABYLON.Vector3.Zero();
                    
                    // Crucial: GLBs often use Quaternions; we clear it to use standard Euler rotation
                    blasterRoot.rotationQuaternion = null; 
                    
                    // Rotate 180 degrees (Math.PI) if the gun points at the player
                    blasterRoot.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI, 0);
                    
                    // Adjust scale
                    blasterRoot.scaling.setAll(1);

                    console.log(`Blaster attached to ${controller.uniqueId}`);

                } catch (error) {
                    console.error("Failed to load blaster mesh:", error);
                }
            });
        });
    };

    // Handle controllers already connected
    xrHelper.input.controllers.forEach(replaceControllerMesh);

    // Handle controllers connected later
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
