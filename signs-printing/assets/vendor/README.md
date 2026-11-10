# Vendored libraries (served with the site, no CDN needed)

| File | Library | License |
| --- | --- | --- |
| `fabric-5.3.0.min.js` | fabric.js 5.3.0 (sign editor) | MIT, `LICENSE-fabric.txt` |
| `three-0.147.0.min.js`, `three-OrbitControls.js`, `three-RoomEnvironment.js` | three.js r147 (3D preview) | MIT, `LICENSE-three.txt` |

One local change: in `fabric-5.3.0.min.js`, `textBaseline="alphabetical"` was changed to
`"alphabetic"` (fabric 5.3 typo that fills the browser console with warnings).
