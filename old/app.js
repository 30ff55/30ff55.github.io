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
     * Replace default controller model with left/right hand model
     */
    const replaceControllerMesh = (controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            motionController.onModelLoadedObservable.add(async () => {
                await wait(100);

                if (motionController.rootMesh) motionController.rootMesh.setEnabled(false);

                try {
                    const handModel = motionController.handness === "left"
                        ? "LeftHand.fbx"
                        : "RightHand.fbx";

                    const result = await BABYLON.SceneLoader.ImportMeshAsync(
                        "", 
                        "assets/", 
                        handModel, 
                        scene
                    );

                    const handRoot = result.meshes[0];
                    handRoot.parent = controller.grip || controller.pointer;
                    handRoot.position = BABYLON.Vector3.Zero();
                    handRoot.rotationQuaternion = null;
                    handRoot.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI, 0);
                    handRoot.scaling.setAll(1);

                    console.log(`${handModel} attached to ${motionController.handness} hand`);

                    // Store reference for animation
                    controller.handMesh = handRoot;

                    // Start animating fingers
                    animateHand(controller);

                } catch (err) {
                    console.error("Failed to load hand mesh:", err);
                }
            });
        });
    };

    /**
     * Animate hand based on trigger and grip values
     */
    const animateHand = (controller) => {
        if (!controller.handMesh || !controller.motionController) return;

        const motionController = controller.motionController;

        scene.onBeforeRenderObservable.add(() => {
            const trigger = motionController.getComponent("trigger");
            const squeeze = motionController.getComponent("squeeze");

            if (!trigger || !squeeze) return;

            const hand = controller.handMesh;

            // Animate index finger (trigger)
            const index = hand.getChildMeshes().find(m => m.name.toLowerCase().includes("index"));
            if (index) index.rotation.x = -trigger.value * Math.PI/2;

            // Animate middle, ring, pinky (squeeze)
            ["middle","ring","pinky"].forEach(name => {
                const f = hand.getChildMeshes().find(m => m.name.toLowerCase().includes(name));
                if (f) f.rotation.x = -squeeze.value * Math.PI/2;
            });

            // Animate thumb (squeeze)
            const thumb = hand.getChildMeshes().find(m => m.name.toLowerCase().includes("thumb"));
            if (thumb) thumb.rotation.x = -squeeze.value * Math.PI/4;
        });
    };

    // Handle already-connected controllers
    xrHelper.input.controllers.forEach(replaceControllerMesh);

    // Handle controllers connected later
    xrHelper.input.onControllerAddedObservable.add(replaceControllerMesh);

    return { scene, xrHelper };
}
