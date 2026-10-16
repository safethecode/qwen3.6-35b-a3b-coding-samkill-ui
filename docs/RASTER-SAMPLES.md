# Source image pixel samples

Use `scripts/raster-samples.mjs` when a reference analysis needs actual raster color evidence at declared locations. It reads8-bit noninterlaced RGB, opaque indexed or RGBA PNG bytes without editing or exporting the source image, records their SHA256 and dimensions, and returns the stored channels as RGBA. Indexed input maps through its validated RGB palette. RGB and opaque indexed input receive alpha255; RGBA retains its existing channels. Color profiles are not applied. It uses the PNG decoder already bundled with the pinned Playwright dependency after validating every chunk CRC and a bounded exact scanline length.

```json
[
  {"id":"whole-agreement-interior","x":80,"y":1550},
  {"id":"following-term-background","x":80,"y":1700}
]
```

Coordinates are integer `image-px` in the original PNG, with top-left `(0,0)`. Declare probes against the inspected source before reading their values. Example coordinates belong to that image only; they are not a component preset or CSS pixels.

```sh
node scripts/raster-samples.mjs reference.png probes.json pixel-evidence.json
```

The output must not already exist. Input images and previous receipts are preserved. The command rejects corrupt PNGs, oversized images, duplicate IDs, unsupported probe fields and out-of-bounds/fractional coordinates.16-bit, interlaced, grayscale and transparency-key (`tRNS`) encodings are explicitly unsupported; they are not silently converted. RGBA transparency is retained without compositing against an invented background.

Include the receipt and source image hash in the local model's bounded observation/handoff input. The existing component runner can deliver a selected receipt through its declared JSON `dataSources`; that delivery must be configured explicitly. Keep native reference pixels private when they are not distributable.

Each sample establishes the pixel at that location. It does not establish a whole region's uniformity, a DOM parent, native CSS, font identity or design-token origin. Use multiple predeclared locations, the actual image and geometry together when checking a surface hypothesis. Record unknowns and keep independent render/reference review after implementation.
