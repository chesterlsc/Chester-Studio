// Wires a map bundle into MapLibre: vector tiles via pmtiles://manila and
// SDF glyphs via mmap://glyphs/... — both read straight from the bundle file.
import { PMTiles, Protocol } from 'pmtiles';

let registered = false;
let pmProtocol = null;
let currentBundle = null;

const EMPTY_PBF = new Uint8Array(0);

export function registerBundle(maplibregl, bundle) {
  currentBundle = bundle;
  const tilesEntry = 'tiles.pmtiles';
  const source = {
    getKey: () => 'manila',
    async getBytes(offset, length) {
      const size = bundle.size(tilesEntry);
      const len = Math.max(0, Math.min(length, size - offset));
      const data = await bundle.read(tilesEntry, offset, len);
      // Hand back an exact-size ArrayBuffer.
      const buf = data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
        ? data.buffer
        : data.slice().buffer;
      return { data: buf };
    },
  };
  if (!registered) {
    pmProtocol = new Protocol({ metadata: true });
    maplibregl.addProtocol('pmtiles', pmProtocol.tile);
    maplibregl.addProtocol('mmap', async (params) => {
      // mmap://glyphs/{fontstack}/{range}.pbf
      const path = decodeURIComponent(params.url.replace(/^mmap:\/\//, ''));
      const b = currentBundle;
      if (b && b.has(path)) {
        const bytes = await b.readAll(path);
        return { data: bytes.slice().buffer };
      }
      // Unknown glyph range (e.g. CJK): empty PBF so labels still draw.
      return { data: EMPTY_PBF.buffer };
    });
    registered = true;
  }
  pmProtocol.tiles.delete('manila');
  pmProtocol.add(new PMTiles(source));

  return {
    sources: {
      osm: {
        type: 'vector',
        url: 'pmtiles://manila',
        attribution: bundle.manifest.attribution || '© OpenStreetMap contributors',
      },
    },
    glyphs: 'mmap://glyphs/{fontstack}/{range}.pbf',
  };
}
