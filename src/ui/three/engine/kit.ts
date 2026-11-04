import {
  CanvasTexture,
  Color,
  MeshPhysicalMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type ColorRepresentation,
  type Texture,
} from 'three';

/*
 * The palette. Hex here is sRGB, as in the stylesheet: three's colour
 * management converts it to linear light itself, so these are the same
 * colours as the blocks on the page.
 */
export const C = {
  birch: 0xe9d4b0,
  birchDark: 0xc9a77a,
  walnut: 0x6e4a2c,
  cream: 0xfbf6ec,
  der: 0x2f6fdb,
  die: 0xd9473b,
  das: 0x2e9b5a,
  verb: 0xf2b630,
  ink: 0x1e1b17,
  good: 0x2e9b5a,
  gold: 0xf5c04a,
  felt: 0x86ad78,
  roofRed: 0xc8432f,
  roofBlue: 0x3b6e9e,
  roofGreen: 0x2e7d57,
  roofBrown: 0x6b4a33,
  leaf: 0x3f8f4e,
  leafDark: 0x2f7442,
} as const;

export interface LacquerOptions {
  noGrain?: boolean;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  env?: number;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

/** The typeface of every German word in the app: Nunito, rounded, heavy. */
const LABEL_FONT = '"Nunito", "Onest", system-ui, sans-serif';
/** The lettering's canvas width: enough for a block about 250 CSS pixels wide on a two-pixel screen. */
const LABEL_W = 512;

function luminance(hex: number): number {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark ink on a pale block, white on a dark one. */
export function inkFor(hex: number): string {
  return luminance(hex) > 0.55 ? '#1E1B17' : '#FFFFFF';
}

/**
 * The textures and materials of one scene.
 *
 * One kit per scene, not one for the page: a texture belongs to the
 * renderer that uploaded it, and every scene is disposed whole when its
 * component goes. Everything the kit made is let go in `dispose`.
 */
export class Kit {
  private readonly cache = new Map<string, Texture>();
  private readonly labels = new Set<Texture>();
  private disposed = false;
  private repaintQueued = false;

  /** `repainted` is told, once a frame at most, that lettering was painted again. */
  constructor(readonly rand: () => number, private readonly repainted: () => void = () => {}) {}

  canvasTexture(key: string, w: number, h: number, paint: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: number): Texture {
    const held = this.cache.get(key);
    if (held) return held;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    if (g) paint(g, w, h);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    if (repeat) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.repeat.set(repeat, repeat);
    }
    this.cache.set(key, texture);
    return texture;
  }

  /** Wood grain: wavy dark streaks and a few knots, multiplied into the paint. */
  grain(): Texture {
    const rand = this.rand;
    return this.canvasTexture('grain', 512, 512, (g, W, H) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) {
        const y0 = rand() * H;
        const amp = 2 + rand() * 9;
        const freq = 0.006 + rand() * 0.02;
        g.strokeStyle = `rgba(105,66,32,${(0.035 + rand() * 0.075).toFixed(3)})`;
        g.lineWidth = 0.5 + rand() * 2.2;
        g.beginPath();
        for (let x = 0; x <= W; x += 4) g.lineTo(x, y0 + Math.sin(x * freq + i) * amp + Math.sin(x * freq * 3.1) * amp * 0.25);
        g.stroke();
      }
      for (let k = 0; k < 7; k++) {
        const cx = rand() * W;
        const cy = rand() * H;
        const r = 6 + rand() * 10;
        const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
        rg.addColorStop(0, 'rgba(95,58,28,0.22)');
        rg.addColorStop(1, 'rgba(95,58,28,0)');
        g.fillStyle = rg;
        g.beginPath();
        g.ellipse(cx, cy, r * 2.2, r, 0, 0, 7);
        g.fill();
      }
    }, 0.55);
  }

  private radial(key: string, inner: string, outer: string): Texture {
    return this.canvasTexture(key, 128, 128, (g, W) => {
      const rg = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
      rg.addColorStop(0, inner);
      rg.addColorStop(1, outer);
      g.fillStyle = rg;
      g.fillRect(0, 0, W, W);
    });
  }

  /** A soft white dot: glows, dust, sparkles. */
  glow(): Texture {
    return this.radial('glow', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  }

  /** A soft dark dot: the contact shadow under every piece. */
  blob(): Texture {
    return this.radial('blob', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0)');
  }

  /** Painted, lacquered toy wood. */
  lacquer(color: ColorRepresentation, o: LacquerOptions = {}): MeshPhysicalMaterial {
    const m = new MeshPhysicalMaterial({
      color,
      map: o.noGrain ? null : this.grain(),
      roughness: o.roughness ?? 0.42,
      metalness: o.metalness ?? 0,
      clearcoat: o.clearcoat ?? 0.75,
      clearcoatRoughness: 0.28,
      envMapIntensity: o.env ?? 0.7,
    });
    if (o.emissive !== undefined) {
      m.emissive = new Color(o.emissive);
      m.emissiveIntensity = o.emissiveIntensity ?? 0;
    }
    if (o.transparent) {
      m.transparent = true;
      m.opacity = o.opacity ?? 1;
    }
    return m;
  }

  /** Bare wood, oiled rather than lacquered. */
  raw(color: ColorRepresentation): MeshPhysicalMaterial {
    return this.lacquer(color, { clearcoat: 0.15, roughness: 0.62 });
  }

  /**
   * Painted lettering for a block face of `w` by `h`, with a soft
   * under-stroke so it reads as paint rather than a sticker. Drawn again
   * once the app's own typeface has loaded.
   */
  label(text: string, w: number, h: number, ink: string): CanvasTexture {
    const canvas = document.createElement('canvas');
    const W = LABEL_W;
    const H = Math.max(64, Math.round((LABEL_W * h) / w));
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    const paint = () => {
      if (!g || this.disposed || !this.labels.has(texture)) return;
      g.clearRect(0, 0, W, H);
      // Measured once and scaled: lettering is as wide as its size, so one
      // measurement says what size fits, without trying size after size.
      const largest = Math.round(H * 0.56);
      g.font = `800 ${largest}px ${LABEL_FONT}`;
      const wide = g.measureText(text).width;
      const size = wide > W * 0.84 ? Math.max(12, Math.floor((largest * W * 0.84) / wide)) : largest;
      g.font = `800 ${size}px ${LABEL_FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const light = ink === '#FFFFFF';
      g.fillStyle = light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.55)';
      g.fillText(text, W / 2 + 2, H / 2 + size * 0.04 + 3);
      g.fillStyle = ink;
      g.fillText(text, W / 2, H / 2 + size * 0.04);
      texture.needsUpdate = true;
    };
    this.labels.add(texture);
    paint();
    // Painted again once the typeface is in, unless it already was.
    const font = `800 48px ${LABEL_FONT}`;
    const fonts = typeof document === 'undefined' ? undefined : document.fonts;
    if (fonts?.load && !fonts.check?.(font)) {
      fonts.load(font).then(() => {
        paint();
        this.queueRepaint();
      }, () => undefined);
    }
    return texture;
  }

  private queueRepaint(): void {
    if (this.repaintQueued || this.disposed) return;
    this.repaintQueued = true;
    requestAnimationFrame(() => {
      this.repaintQueued = false;
      if (!this.disposed) this.repainted();
    });
  }

  /** Let a label go before its kit does, as when the slot is retyped. */
  dropLabel(texture: Texture): void {
    if (this.labels.delete(texture)) texture.dispose();
  }

  dispose(): void {
    this.disposed = true;
    for (const texture of this.cache.values()) texture.dispose();
    for (const texture of this.labels) texture.dispose();
    this.cache.clear();
    this.labels.clear();
  }
}
