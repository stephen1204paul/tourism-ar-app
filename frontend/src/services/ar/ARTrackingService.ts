import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// AR.js THREEx namespace declaration
declare namespace THREEx {
  class ArToolkitSource {
    ready: boolean;
    domElement: HTMLVideoElement;
    constructor(parameters: {
      sourceType: string;
      sourceWidth?: number;
      sourceHeight?: number;
      displayWidth?: number;
      displayHeight?: number;
    });
    init(onReady: () => void, onError?: (error: Error) => void): void;
    onResizeElement(): void;
    copyElementSizeTo(element: HTMLElement): void;
  }

  class ArToolkitContext {
    arController: unknown;
    constructor(parameters: {
      cameraParametersUrl: string;
      detectionMode: string;
      maxDetectionRate?: number;
      canvasWidth?: number;
      canvasHeight?: number;
    });
    init(onCompleted: () => void): void;
    update(source: ArToolkitSource): void;
    getProjectionMatrix(): THREE.Matrix4;
  }

  class ArMarkerControls {
    constructor(
      context: ArToolkitContext,
      object3d: THREE.Object3D,
      parameters: {
        type: string;
        patternUrl?: string;
        barcodeValue?: number;
        size?: number;
        changeMatrixMode?: string;
      }
    );
    dispose(): void;
  }
}

export interface MarkerConfig {
  id: string;
  type: 'pattern' | 'barcode';
  patternUrl?: string;
  barcodeValue?: number;
  size?: number;
}

export interface ARModel {
  id: string;
  url: string;
  scale?: THREE.Vector3;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

export interface ARTrackingServiceConfig {
  container: HTMLElement;
  cameraParametersUrl?: string;
  detectionMode?: string;
  maxDetectionRate?: number;
  sourceType?: string;
}

interface MarkerData {
  markerRoot: THREE.Group;
  controls: THREEx.ArMarkerControls;
  models: Map<string, THREE.Object3D>;
}

export class ARTrackingService {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private arToolkitSource: THREEx.ArToolkitSource | null = null;
  private arToolkitContext: THREEx.ArToolkitContext | null = null;
  private markers: Map<string, MarkerData> = new Map();
  private gltfLoader: GLTFLoader;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private container: HTMLElement;
  private clock: THREE.Clock;
  private mixers: THREE.AnimationMixer[] = [];

  constructor(config: ARTrackingServiceConfig) {
    this.container = config.container;
    this.clock = new THREE.Clock();
    this.gltfLoader = new GLTFLoader();

    // Initialize Three.js scene
    this.scene = new THREE.Scene();

    // Initialize camera
    this.camera = new THREE.Camera();
    this.scene.add(this.camera);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color(0x000000), 0);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.left = '0px';
    this.container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLighting();

    // Initialize AR toolkit
    this.initializeARToolkit(config);

    // Setup resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Point light for additional depth
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);
  }

  private initializeARToolkit(config: ARTrackingServiceConfig): void {
    // Initialize AR toolkit source (webcam)
    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: config.sourceType || 'webcam',
      sourceWidth: 1280,
      sourceHeight: 960,
      displayWidth: 1280,
      displayHeight: 960,
    });

    this.arToolkitSource.init(() => {
      this.container.appendChild(this.arToolkitSource!.domElement);
      this.handleResize();
    }, (error: Error) => {
      console.error('AR Toolkit Source initialization error:', error);
    });

    // Initialize AR toolkit context
    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: config.cameraParametersUrl || 'data/camera_para.dat',
      detectionMode: config.detectionMode || 'mono',
      maxDetectionRate: config.maxDetectionRate || 30,
      canvasWidth: 1280,
      canvasHeight: 960,
    });

    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext!.getProjectionMatrix());
    });
  }

  public addMarker(markerConfig: MarkerConfig): THREE.Group {
    if (this.markers.has(markerConfig.id)) {
      console.warn(`Marker with id ${markerConfig.id} already exists`);
      return this.markers.get(markerConfig.id)!.markerRoot;
    }

    // Create marker root group
    const markerRoot = new THREE.Group();
    markerRoot.name = `marker-${markerConfig.id}`;
    this.scene.add(markerRoot);

    // Create AR marker controls
    const controls = new THREEx.ArMarkerControls(
      this.arToolkitContext!,
      markerRoot,
      {
        type: markerConfig.type,
        patternUrl: markerConfig.patternUrl,
        barcodeValue: markerConfig.barcodeValue,
        size: markerConfig.size || 1,
        changeMatrixMode: 'modelViewMatrix',
      }
    );

    // Store marker data
    this.markers.set(markerConfig.id, {
      markerRoot,
      controls,
      models: new Map(),
    });

    return markerRoot;
  }

  public async loadModel(
    markerId: string,
    modelConfig: ARModel
  ): Promise<THREE.Object3D | null> {
    const markerData = this.markers.get(markerId);
    if (!markerData) {
      console.error(`Marker with id ${markerId} not found`);
      return null;
    }

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelConfig.url,
        (gltf: GLTF) => {
          const model = gltf.scene;
          model.name = modelConfig.id;

          // Apply transforms
          if (modelConfig.scale) {
            model.scale.copy(modelConfig.scale);
          }
          if (modelConfig.position) {
            model.position.copy(modelConfig.position);
          }
          if (modelConfig.rotation) {
            model.rotation.copy(modelConfig.rotation);
          }

          // Setup animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
            this.mixers.push(mixer);
          }

          // Add model to marker
          markerData.markerRoot.add(model);
          markerData.models.set(modelConfig.id, model);

          resolve(model);
        },
        (progress) => {
          console.log(
            `Loading model ${modelConfig.id}: ${(progress.loaded / progress.total) * 100}%`
          );
        },
        (error) => {
          console.error(`Error loading model ${modelConfig.id}:`, error);
          reject(error);
        }
      );
    });
  }

  public addObjectToMarker(markerId: string, object: THREE.Object3D): boolean {
    const markerData = this.markers.get(markerId);
    if (!markerData) {
      console.error(`Marker with id ${markerId} not found`);
      return false;
    }

    markerData.markerRoot.add(object);
    markerData.models.set(object.name || object.uuid, object);
    return true;
  }

  public removeObjectFromMarker(markerId: string, objectId: string): boolean {
    const markerData = this.markers.get(markerId);
    if (!markerData) {
      return false;
    }

    const object = markerData.models.get(objectId);
    if (object) {
      markerData.markerRoot.remove(object);
      markerData.models.delete(objectId);
      this.disposeObject(object);
      return true;
    }
    return false;
  }

  public getMarkerRoot(markerId: string): THREE.Group | null {
    return this.markers.get(markerId)?.markerRoot || null;
  }

  public isMarkerVisible(markerId: string): boolean {
    const markerData = this.markers.get(markerId);
    if (!markerData) {
      return false;
    }
    return markerData.markerRoot.visible;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    this.clock.stop();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
    this.update();
    this.render();
  };

  private update(): void {
    const delta = this.clock.getDelta();

    // Update AR toolkit
    if (this.arToolkitSource && this.arToolkitSource.ready) {
      this.arToolkitContext?.update(this.arToolkitSource);
    }

    // Update animation mixers
    this.mixers.forEach((mixer) => {
      mixer.update(delta);
    });
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize = (): void => {
    if (this.arToolkitSource && this.arToolkitSource.ready) {
      this.arToolkitSource.onResizeElement();
      this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);

      if (this.arToolkitContext && this.arToolkitContext.arController !== null) {
        this.arToolkitSource.copyElementSizeTo(
          (this.arToolkitContext.arController as { canvas: HTMLCanvasElement }).canvas
        );
      }
    }

    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              this.disposeMaterial(material);
            });
          } else {
            this.disposeMaterial(child.material);
          }
        }
      }
    });
  }

  private disposeMaterial(material: THREE.Material): void {
    material.dispose();

    // Dispose textures
    const materialWithMaps = material as THREE.MeshStandardMaterial;
    if (materialWithMaps.map) materialWithMaps.map.dispose();
    if (materialWithMaps.normalMap) materialWithMaps.normalMap.dispose();
    if (materialWithMaps.roughnessMap) materialWithMaps.roughnessMap.dispose();
    if (materialWithMaps.metalnessMap) materialWithMaps.metalnessMap.dispose();
    if (materialWithMaps.aoMap) materialWithMaps.aoMap.dispose();
    if (materialWithMaps.emissiveMap) materialWithMaps.emissiveMap.dispose();
    if (materialWithMaps.envMap) materialWithMaps.envMap.dispose();
  }

  public dispose(): void {
    // Stop animation loop
    this.stop();

    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);

    // Dispose all markers and their models
    this.markers.forEach((markerData, markerId) => {
      markerData.models.forEach((model) => {
        this.disposeObject(model);
      });
      markerData.controls.dispose();
      this.scene.remove(markerData.markerRoot);
    });
    this.markers.clear();

    // Dispose mixers
    this.mixers.forEach((mixer) => {
      mixer.stopAllAction();
    });
    this.mixers = [];

    // Dispose renderer
    this.renderer.dispose();
    this.renderer.forceContextLoss();

    // Remove DOM elements
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.arToolkitSource && this.arToolkitSource.domElement.parentNode) {
      this.arToolkitSource.domElement.parentNode.removeChild(
        this.arToolkitSource.domElement
      );
    }

    // Clear references
    this.arToolkitSource = null;
    this.arToolkitContext = null;
  }
}

export default ARTrackingService;
