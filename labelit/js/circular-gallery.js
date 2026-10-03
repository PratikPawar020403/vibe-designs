/**
 * CircularGallery component from React Bits
 * Dependencies: OGL (ogl.mjs)
 */
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from './ogl.mjs';

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 22;
}

function createTextTexture(gl, text, font = '600 22px Inter, sans-serif', color = '#0A0A0A') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.4);

  // HiDPI 2x scale for sharp text rendering
  const dpr = 2;
  canvas.width = (textWidth + 40) * dpr;
  canvas.height = (textHeight + 20) * dpr;

  context.scale(dpr, dpr);
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, (textWidth + 40) / 2, (textHeight + 20) / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: textWidth + 40, height: textHeight + 20 };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#0A0A0A', font = '600 22px Inter, sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    if (!this.text || !this.text.trim()) return;
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.05) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightInPlane = 0.095;
    const textWidthInPlane = textHeightInPlane * aspect;
    this.mesh.scale.set(textWidthInPlane, textHeightInPlane, 1);
    this.mesh.position.y = -0.5 - (textHeightInPlane * 0.5) - 0.055;
    this.mesh.position.z = 0.02;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0.05,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.speed = 0;
    this.isBefore = false;
    this.isAfter = false;

    this.createShader();
    this.createMesh();
    if (this.text && this.text.trim()) {
      this.createTitle();
    }
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = Math.max(this.screen.height / 1500, 0.28);
    this.plane.scale.y = (this.viewport.height * (850 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (680 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2.2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class CircularGalleryApp {
  constructor(container, options = {}) {
    this.container = container;
    this.scrollSpeed = options.scrollSpeed || 2;
    this.scroll = {
      ease: options.scrollEase !== undefined ? options.scrollEase : 0.02,
      current: 0,
      target: 0,
      last: 0
    };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);

    const defaultItems = [
      { image: 'assets/bottles/bottle-alpine.jpg', text: 'The Alpine Cylinder' },
      { image: 'assets/bottles/bottle-sculptural.jpg', text: 'The Sculptural Prism' },
      { image: 'assets/bottles/bottle-flask.jpg', text: 'The Artisan Flask' },
      { image: 'assets/bottles/bottle-modular.jpg', text: 'The Modular Prismatic' }
    ];

    this.items = options.items && options.items.length ? options.items : defaultItems;
    this.bend = options.bend !== undefined ? options.bend : 3;
    this.textColor = options.textColor || '#0A0A0A';
    this.borderRadius = options.borderRadius !== undefined ? options.borderRadius : 0.05;
    this.font = options.font || '600 22px Inter, sans-serif';

    this.isDown = false;
    this.start = 0;
    this.isVisible = true;

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.initObserver();
    this.addEventListeners();
  }

  initObserver() {
    this.isIntersecting = false;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wasIntersecting = this.isIntersecting;
        this.isIntersecting = entry.isIntersecting;
        if (this.isIntersecting && !wasIntersecting) {
          if (!this.raf) {
            this.raf = window.requestAnimationFrame(this.update.bind(this));
          }
        }
      });
    }, { rootMargin: '120px 0px 120px 0px' });
    this.observer.observe(this.container);
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
    this.scene.position.y = 0;
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }

  createMedias() {
    this.mediasImages = this.items.concat(this.items).concat(this.items);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend: this.bend,
        textColor: this.textColor,
        borderRadius: this.borderRadius,
        font: this.font
      });
    });
  }

  next() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    this.scroll.target += width;
    this.onCheckDebounce();
  }

  prev() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    this.scroll.target -= width;
    this.onCheckDebounce();
  }

  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
    this.startX = this.start;
    this.hasMoved = false;
  }

  onTouchMove(e) {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    if (Math.abs(this.startX - x) > 6) {
      this.hasMoved = true;
    }
    this.scroll.target = (this.scroll.position || 0) + distance;
  }

  onTouchUp(e) {
    if (!this.isDown) return;
    this.isDown = false;
    if (!this.hasMoved && e) {
      const clientX = 'changedTouches' in e && e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX;
      if (typeof clientX === 'number') {
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const diff = clientX - centerX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) this.next();
          else this.prev();
        }
      }
    }
    this.onCheck();
  }

  onWheel(e) {
    // Only capture horizontal scrolling or when Shift key is pressed to rotate
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaX || e.deltaY;
      this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
      this.onCheckDebounce();
    }
  }

  onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this.prev();
    }
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth || window.innerWidth,
      height: this.container.clientHeight || 600
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    this.raf = null;
    if (!this.isIntersecting) return;

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;

    if (this.isIntersecting) {
      this.raf = window.requestAnimationFrame(this.update.bind(this));
    }
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);

    window.addEventListener('resize', this.boundOnResize);

    // Draggable on container, tracking on window
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: false });
    this.container.addEventListener('keydown', this.boundOnKeyDown);

    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    if (this.raf) window.cancelAnimationFrame(this.raf);
    if (this.observer) this.observer.disconnect();
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchend', this.boundOnTouchUp);

    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

// Global initialization function
window.initCircularGallery = function(containerId = 'circular-gallery', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const app = new CircularGalleryApp(container, {
    bend: options.bend !== undefined ? options.bend : 3,
    textColor: options.textColor || '#0A0A0A',
    borderRadius: options.borderRadius !== undefined ? options.borderRadius : 0.05,
    scrollEase: options.scrollEase !== undefined ? options.scrollEase : 0.02,
    font: options.font || '600 22px Inter, sans-serif',
    items: options.items
  });

  // Attach controls if available
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  if (prevBtn) prevBtn.addEventListener('click', () => app.prev());
  if (nextBtn) nextBtn.addEventListener('click', () => app.next());

  return app;
};

// Auto-initialize when DOM and fonts are ready for crisp canvas rendering
function startGallery() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      window.initCircularGallery();
    });
  } else {
    window.initCircularGallery();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGallery);
} else {
  startGallery();
}
