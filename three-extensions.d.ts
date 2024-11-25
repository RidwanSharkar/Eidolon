   // src/three-extensions.d.ts

   declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, EventDispatcher, Vector3 } from 'three';

    class OrbitControls extends EventDispatcher {
      constructor(object: Camera, domElement: HTMLElement);

      enabled: boolean;
      target: Vector3;

      // Methods
      update(): boolean;
      dispose(): void;

    }

    export default OrbitControls;
  }