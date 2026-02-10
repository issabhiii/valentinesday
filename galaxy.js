/**
 * Galaxy background for Flower screen (page2) - vanilla Three.js port of React Bits Galaxy.
 */
(function () {
  var page2 = document.getElementById('page2');
  var container = document.getElementById('galaxy-container');
  if (!page2 || !container) return;

  var scene, camera, renderer, material, mesh, rafId;
  var mouseTarget = { x: 0.5, y: 0.5 };
  var mouseSmooth = { x: 0.5, y: 0.5 };
  var mouseActiveTarget = 0;
  var mouseActiveSmooth = 0;
  var time = 0;

  var settings = {
    density: 1.4,
    glowIntensity: 0.5,
    saturation: 0.6,
    hueShift: 200,
    twinkleIntensity: 0.2,
    rotationSpeed: 0,
    repulsionStrength: 1,
    autoCenterRepulsion: 0,
    starSpeed: 0.8,
    speed: 0.1,
    mouseRepulsion: true,
    mouseInteraction: true,
    transparent: true
  };

  var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'precision highp float;',
    'uniform float uTime;',
    'uniform vec3 uResolution;',
    'uniform vec2 uFocal;',
    'uniform vec2 uRotation;',
    'uniform float uStarSpeed;',
    'uniform float uDensity;',
    'uniform float uHueShift;',
    'uniform float uSpeed;',
    'uniform vec2 uMouse;',
    'uniform float uGlowIntensity;',
    'uniform float uSaturation;',
    'uniform bool uMouseRepulsion;',
    'uniform float uTwinkleIntensity;',
    'uniform float uRotationSpeed;',
    'uniform float uRepulsionStrength;',
    'uniform float uMouseActiveFactor;',
    'uniform float uAutoCenterRepulsion;',
    'uniform bool uTransparent;',
    'varying vec2 vUv;',
    '#define NUM_LAYER 4.0',
    '#define STAR_COLOR_CUTOFF 0.2',
    '#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)',
    '#define PERIOD 3.0',
    'float Hash21(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    'float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }',
    'float tris(float x) { float t = fract(x); return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0)); }',
    'float trisn(float x) { float t = fract(x); return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0; }',
    'vec3 hsv2rgb(vec3 c) {',
    '  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);',
    '  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
    '  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
    '}',
    'float Star(vec2 uv, float flare) {',
    '  float d = length(uv);',
    '  float m = (0.05 * uGlowIntensity) / d;',
    '  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));',
    '  m += rays * flare * uGlowIntensity;',
    '  uv *= MAT45;',
    '  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));',
    '  m += rays * 0.3 * flare * uGlowIntensity;',
    '  m *= smoothstep(1.0, 0.2, d);',
    '  return m;',
    '}',
    'vec3 StarLayer(vec2 uv) {',
    '  vec3 col = vec3(0.0);',
    '  vec2 gv = fract(uv) - 0.5;',
    '  vec2 id = floor(uv);',
    '  for (int y = -1; y <= 1; y++) {',
    '    for (int x = -1; x <= 1; x++) {',
    '      vec2 offset = vec2(float(x), float(y));',
    '      vec2 si = id + vec2(float(x), float(y));',
    '      float seed = Hash21(si);',
    '      float size = fract(seed * 345.32);',
    '      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));',
    '      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;',
    '      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;',
    '      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;',
    '      float grn = min(red, blu) * seed;',
    '      vec3 base = vec3(red, grn, blu);',
    '      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;',
    '      hue = fract(hue + uHueShift / 360.0);',
    '      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;',
    '      float val = max(max(base.r, base.g), base.b);',
    '      base = hsv2rgb(vec3(hue, sat, val));',
    '      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;',
    '      float star = Star(gv - offset - pad, flareSize);',
    '      vec3 color = base;',
    '      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;',
    '      twinkle = mix(1.0, twinkle, uTwinkleIntensity);',
    '      star *= twinkle;',
    '      col += star * size * color;',
    '    }',
    '  }',
    '  return col;',
    '}',
    'void main() {',
    '  vec2 focalPx = uFocal * uResolution.xy;',
    '  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;',
    '  vec2 mouseNorm = uMouse - vec2(0.5);',
    '  if (uAutoCenterRepulsion > 0.0) {',
    '    vec2 centerUV = vec2(0.0, 0.0);',
    '    float centerDist = length(uv - centerUV);',
    '    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));',
    '    uv += repulsion * 0.05;',
    '  } else if (uMouseRepulsion) {',
    '    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;',
    '    float mouseDist = length(uv - mousePosUV);',
    '    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));',
    '    uv += repulsion * 0.05 * uMouseActiveFactor;',
    '  } else {',
    '    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;',
    '    uv += mouseOffset;',
    '  }',
    '  float autoRotAngle = uTime * uRotationSpeed;',
    '  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));',
    '  uv = autoRot * uv;',
    '  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;',
    '  vec3 col = vec3(0.0);',
    '  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {',
    '    float depth = fract(i + uStarSpeed * uSpeed);',
    '    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);',
    '    float fade = depth * smoothstep(1.0, 0.9, depth);',
    '    col += StarLayer(uv * scale + i * 453.32) * fade;',
    '  }',
    '  if (uTransparent) {',
    '    float alpha = length(col);',
    '    alpha = smoothstep(0.0, 0.3, alpha);',
    '    alpha = min(alpha, 1.0);',
    '    gl_FragColor = vec4(col, alpha);',
    '  } else {',
    '    gl_FragColor = vec4(col, 1.0);',
    '  }',
    '}'
  ].join('\n');

  function init() {
    if (typeof THREE === 'undefined' || !page2.classList.contains('open')) return;
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector3(w, h, w / h) },
        uFocal: { value: new THREE.Vector2(0.5, 0.5) },
        uRotation: { value: new THREE.Vector2(1, 0) },
        uStarSpeed: { value: 0 },
        uDensity: { value: settings.density },
        uHueShift: { value: settings.hueShift },
        uSpeed: { value: settings.speed },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uGlowIntensity: { value: settings.glowIntensity },
        uSaturation: { value: settings.saturation },
        uMouseRepulsion: { value: settings.mouseRepulsion },
        uTwinkleIntensity: { value: settings.twinkleIntensity },
        uRotationSpeed: { value: settings.rotationSpeed },
        uRepulsionStrength: { value: settings.repulsionStrength },
        uMouseActiveFactor: { value: 0 },
        uAutoCenterRepulsion: { value: settings.autoCenterRepulsion },
        uTransparent: { value: settings.transparent }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    var geo = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    time = 0;
    mouseSmooth.x = mouseTarget.x = 0.5;
    mouseSmooth.y = mouseTarget.y = 0.5;
    mouseActiveSmooth = mouseActiveTarget = 0;

    if (settings.mouseInteraction) {
      page2.addEventListener('mousemove', onMouseMove, false);
      page2.addEventListener('mouseleave', onMouseLeave, false);
    }
    window.addEventListener('resize', onResize, false);
    animate();
  }

  function animate() {
    if (!renderer || !material || !scene || !camera) return;
    rafId = requestAnimationFrame(animate);
    time += 0.016;
    material.uniforms.uTime.value = time;
    material.uniforms.uStarSpeed.value = (time * settings.starSpeed) / 10;

    mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.05;
    mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.05;
    mouseActiveSmooth += (mouseActiveTarget - mouseActiveSmooth) * 0.05;
    material.uniforms.uMouse.value.set(mouseSmooth.x, mouseSmooth.y);
    material.uniforms.uMouseActiveFactor.value = mouseActiveSmooth;

    renderer.render(scene, camera);
  }

  function onMouseMove(e) {
    var rect = page2.getBoundingClientRect();
    mouseTarget.x = (e.clientX - rect.left) / rect.width;
    mouseTarget.y = 1 - (e.clientY - rect.top) / rect.height;
    mouseActiveTarget = 1;
  }

  function onMouseLeave() {
    mouseActiveTarget = 0;
  }

  function onResize() {
    if (!renderer || !container.parentNode) return;
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    material.uniforms.uResolution.value.set(w, h, w / h);
  }

  function dispose() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (settings.mouseInteraction) {
      page2.removeEventListener('mousemove', onMouseMove);
      page2.removeEventListener('mouseleave', onMouseLeave);
    }
    window.removeEventListener('resize', onResize);
    if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (material) material.dispose();
    if (mesh && mesh.geometry) mesh.geometry.dispose();
    scene = null;
    camera = null;
    renderer = null;
    material = null;
    mesh = null;
  }

  var observer = new MutationObserver(function () {
    if (page2.classList.contains('open')) {
      if (!container.querySelector('canvas')) init();
    } else {
      dispose();
    }
  });
  observer.observe(page2, { attributes: true, attributeFilter: ['class'] });

  if (page2.classList.contains('open')) init();
})();
