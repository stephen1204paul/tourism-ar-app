declare module 'aframe' {
  const aframe: any;
  export default aframe;
}

declare module 'ar.js' {
  const arjs: any;
  export default arjs;
}

declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': any;
    'a-marker': any;
    'a-entity': any;
    'a-box': any;
    'a-sphere': any;
    'a-cylinder': any;
    'a-plane': any;
    'a-sky': any;
    'a-camera': any;
    'a-light': any;
    'a-text': any;
    'a-image': any;
    'a-video': any;
    'a-asset-item': any;
    'a-assets': any;
  }
}
