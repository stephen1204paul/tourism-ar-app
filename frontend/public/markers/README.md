# AR Markers

This directory contains AR marker pattern files used for AR.js marker-based tracking.

## Default Markers

AR.js comes with several built-in patterns that you can use:
- `hiro` - The default Hiro marker
- `kanji` - Kanji marker pattern

To use a built-in marker, use the format: `preset:hiro` or `preset:kanji`

## Custom Markers

To create custom marker patterns:

1. Visit the AR.js Marker Training tool: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
2. Upload your image or design
3. Download the generated `.patt` file
4. Place the `.patt` file in this directory
5. Print the marker image for physical tracking

## Using Markers

In your AR components, reference markers like this:

```tsx
<ARViewer
  markerUrl="/markers/your-marker.patt"
  modelUrl="/models/your-model.glb"
/>
```

## Tips for Good Markers

- Use high contrast images
- Avoid symmetrical designs
- Include unique features in all corners
- Test in various lighting conditions
