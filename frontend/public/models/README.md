# 3D Models

This directory contains 3D models in GLTF/GLB format for AR visualization.

## Model Format

All models should be in GLTF (.gltf) or GLB (.glb) format, which is the recommended format for web-based AR experiences.

## Model Optimization

For optimal performance, follow these guidelines:

1. **Polygon Count**: Keep models under 50,000 polygons for mobile devices
2. **Texture Resolution**: Use 2048x2048 or smaller textures
3. **Compression**: Use Draco compression for GLB files
4. **LOD**: Create Level of Detail (LOD) variants for different distances

## Tools for Creating/Converting Models

- **Blender** - Free 3D modeling software with GLTF export
- **Sketchfab** - Download free models (many support GLTF)
- **gltf-pipeline** - Command-line tool for optimizing GLTF files

## Sample Models

You can find free 3D models for landmarks at:
- [Sketchfab](https://sketchfab.com/)
- [Google Poly Archive](https://poly.pizza/)
- [Free3D](https://free3d.com/)

## Converting to GLB

To convert from other formats to GLB:

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Convert and optimize
gltf-pipeline -i model.gltf -o model.glb -d
```

## Using Models

Reference models in your AR components:

```tsx
<ARViewer
  modelUrl="/models/statue-of-liberty.glb"
  scale={1.0}
/>
```

## Model Attribution

Remember to provide proper attribution for models downloaded from third-party sources and respect their licenses.
