/**
 * Pixel Snow background - vanilla Three.js port (React Bits style).
 * Used in two places:
 * - behind Infinite Menu (`#pixel-snow-bg` while `#pageInfiniteMenu.open`)
 * - dedicated Snow screen (`#pixel-snow-screen` while `#pageSnow.open`)
 */
(function () {
  if (typeof THREE === 'undefined') return;

  function mountPixelSnow(containerId, pageId) {
    var container = document.getElementById(containerId);
    var page = document.getElementById(pageId);
    if (!container || !page) return;

    var scene, camera, renderer, material, mesh, animId, startTime;
  var vertexShader = [
    'attribute vec3 position;',
    'void main() {',
    '  gl_Position = vec4(position, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'precision mediump float;',
    'uniform float uTime;',
    'uniform vec2 uResolution;',
    'uniform float uFlakeSize;',
    'uniform float uMinFlakeSize;',
    'uniform float uPixelResolution;',
    'uniform float uSpeed;',
    'uniform float uDepthFade;',
    'uniform float uFarPlane;',
    'uniform vec3 uColor;',
    'uniform float uBrightness;',
    'uniform float uGamma;',
    'uniform float uDensity;',
    'uniform float uVariant;',
    'uniform float uDirection;',
    '#define PI 3.14159265',
    '#define PI_OVER_6 0.5235988',
    '#define PI_OVER_3 1.0471976',
    '#define F0 2.3283064e-10',
    'const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);',
    'const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);',
    'const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);',
    'const vec2 b1d = vec2(0.574, 0.819);',
    'float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }',
    'vec3 hash3(vec3 p) {',
    '  return vec3(hash(p.x), hash(p.y + 1.1), hash(p.z + 2.2));',
    '}',
    'float snowflakeDist(vec2 p) {',
    '  float r = length(p);',
    '  float a = atan(p.y, p.x);',
    '  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);',
    '  vec2 q = r * vec2(cos(a), sin(a));',
    '  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));',
    '  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);',
    '  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);',
    '  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);',
    '  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);',
    '  return min(dMain, min(dB1, dB2)) * 10.0;',
    '}',
    'void main() {',
    '  float invPixelRes = 1.0 / uPixelResolution;',
    '  float pixelSize = max(1.0, floor(0.5 + uResolution.x * invPixelRes));',
    '  float invPixelSize = 1.0 / pixelSize;',
    '  vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);',
    '  vec2 res = uResolution * invPixelSize;',
    '  float invResX = 1.0 / res.x;',
    '  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));',
    '  ray = ray.x * camI + ray.y * camJ + ray.z * camK;',
    '  float timeSpeed = uTime * uSpeed;',
    '  float windX = cos(uDirection) * 0.4;',
    '  float windY = sin(uDirection) * 0.4;',
    '  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;',
    '  vec3 pos = camPos;',
    '  vec3 absRay = max(abs(ray), vec3(0.001));',
    '  vec3 strides = 1.0 / absRay;',
    '  vec3 raySign = step(ray, vec3(0.0));',
    '  vec3 phase = fract(pos) * strides;',
    '  phase = mix(strides - phase, phase, raySign);',
    '  float rayDotCamK = dot(ray, camK);',
    '  float invRayDotCamK = 1.0 / rayDotCamK;',
    '  float invDepthFade = 1.0 / uDepthFade;',
    '  float halfInvResX = 0.5 * invResX;',
    '  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);',
    '  float t = 0.0;',
    '  for (int i = 0; i < 128; i++) {',
    '    if (t >= uFarPlane) break;',
    '    vec3 fpos = floor(pos);',
    '    float cellHash = hash3(fpos).x;',
    '    if (cellHash < uDensity) {',
    '      vec3 h = hash3(fpos);',
    '      vec3 sinArg1 = fpos.yzx * 0.073;',
    '      vec3 sinArg2 = fpos.zxy * 0.27;',
    '      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);',
    '      flakePos = flakePos * 0.8 + 0.1 + fpos;',
    '      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;',
    '      if (toIntersection > 0.0) {',
    '        vec3 testPos = pos + ray * toIntersection - flakePos;',
    '        float testX = dot(testPos, camI);',
    '        float testY = dot(testPos, camJ);',
    '        vec2 testUV = abs(vec2(testX, testY));',
    '        float depth = dot(flakePos - camPos, camK);',
    '        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);',
    '        float dist;',
    '        if (uVariant < 0.5) dist = max(testUV.x, testUV.y);',
    '        else if (uVariant < 1.5) dist = length(testUV);',
    '        else dist = snowflakeDist(vec2(testX, testY) / flakeSize) * flakeSize;',
    '        if (dist < flakeSize) {',
    '          float flakeSizeRatio = uFlakeSize / flakeSize;',
    '          float intensity = exp2(-(t + toIntersection) * invDepthFade) * min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;',
    '          gl_FragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), 1.0);',
    '          return;',
    '        }',
    '      }',
    '    }',
    '    float nextStep = min(min(phase.x, phase.y), phase.z);',
    '    vec3 sel = step(phase, vec3(nextStep));',
    '    phase = phase - nextStep + strides * sel;',
    '    t += nextStep;',
    '    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);',
    '  }',
    '  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);',
    '}'
  ].join('\n');

  function parseColor(hex) {
    var n = parseInt(hex.slice(1), 16);
    return new THREE.Vector3(
      ((n >> 16) & 255) / 255,
      ((n >> 8) & 255) / 255,
      (n & 255) / 255
    );
  }

  function init() {
    var w = container.offsetWidth || 0;
    var h = container.offsetHeight || 0;
    if (w <= 0 || h <= 0) {
      var par = container.parentElement;
      if (par && par.classList && par.classList.contains('screen-snow')) {
        w = window.innerWidth;
        h = window.innerHeight;
      }
    }
    w = Math.max(w, 1);
    h = Math.max(h, 1);
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    if (renderer.domElement) {
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
    }
    container.appendChild(renderer.domElement);

    var colorVec = parseColor('#ffffff');
    material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        uFlakeSize: { value: 0.018 },
        uMinFlakeSize: { value: 1.25 },
        uPixelResolution: { value: 500 },
        uSpeed: { value: 1.6 },
        uDepthFade: { value: 10.5 },
        uFarPlane: { value: 31 },
        uColor: { value: colorVec },
        uBrightness: { value: 1.6 },
        uGamma: { value: 0.4545 },
        uDensity: { value: 0.55 },
        uVariant: { value: 0.0 },
        uDirection: { value: (130 * Math.PI) / 180 }
      }
    });
    var geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    startTime = performance.now();
  }

  function resize() {
    if (!renderer || !container) return;
    var w = container.offsetWidth || 0;
    var h = container.offsetHeight || 0;
    if (w <= 0 || h <= 0) {
      var par = container.parentElement;
      if (par && par.classList && par.classList.contains('screen-snow')) {
        w = window.innerWidth;
        h = window.innerHeight;
      }
    }
    w = Math.max(w, 1);
    h = Math.max(h, 1);
    renderer.setSize(w, h);
    if (material && material.uniforms && material.uniforms.uResolution)
      material.uniforms.uResolution.value.set(w, h);
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!material || !material.uniforms) return;
    material.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
    renderer.render(scene, camera);
  }

  function start() {
    if (!container || !page.classList.contains('open')) return;
    if (!scene) init();
    resize();
    if (!animId) animate();
    // Container may be 0x0 when screen just opened; resize again after layout
    requestAnimationFrame(function () {
      if (page.classList.contains('open') && renderer) {
        resize();
      }
    });
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function teardown() {
    stop();
    if (renderer && container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
      renderer.dispose();
      if (material) material.dispose();
    }
    scene = null;
    camera = null;
    renderer = null;
    material = null;
    mesh = null;
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'class') {
        if (page.classList.contains('open')) start();
        else { stop(); }
      }
    });
  });
  observer.observe(page, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', function () {
    if (page.classList.contains('open') && renderer) resize();
  });

  if (page.classList.contains('open')) start();
  }

  mountPixelSnow('pixel-snow-bg', 'pageInfiniteMenu');
  mountPixelSnow('pixel-snow-screen', 'pageSnow');
})();
