/**
 * Light Pillar effect (vanilla Three.js) - runs when page5 is open.
 * Settings: topColor="#29ff2c", bottomColor="#01370a", intensity=0.9, etc.
 */
(function () {
  var page5 = document.getElementById('page5');
  var container = document.getElementById('light-pillar-container');
  if (!page5 || !container) return;

  var scene, camera, renderer, material, mesh, geometry;
  var rafId = null;
  var time = 0;
  var mouse = { x: 0, y: 0 };

  var settings = {
    topColor: '#29ff2c',
    bottomColor: '#01370a',
    intensity: 0.9,
    rotationSpeed: 0.9,
    glowAmount: 0.002,
    pillarWidth: 7,
    pillarHeight: 0.4,
    noiseIntensity: 1,
    pillarRotation: 113,
    interactive: false,
    quality: 'high'
  };

  var qualitySettings = {
    low: { iterations: 24, waveIterations: 1, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.5 },
    medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.65, precision: 'mediump', stepMultiplier: 1.2 },
    high: {
      iterations: 80,
      waveIterations: 4,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      precision: 'highp',
      stepMultiplier: 1.0
    }
  };

  function parseColor(hex) {
    var c = new THREE.Color(hex);
    return new THREE.Vector3(c.r, c.g, c.b);
  }

  function createEffect() {
    if (typeof THREE === 'undefined') return;
    var w = container.clientWidth;
    var h = container.clientHeight;
    var q = qualitySettings[settings.quality] || qualitySettings.high;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: q.precision,
      stencil: false,
      depth: false
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(q.pixelRatio);
    container.appendChild(renderer.domElement);

    var pillarRotRad = (settings.pillarRotation * Math.PI) / 180;
    var waveSin = Math.sin(0.4);
    var waveCos = Math.cos(0.4);

    var vertexShader = [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = vec4(position, 1.0);',
      '}'
    ].join('\n');

    var fragmentShader = [
      'precision ' + q.precision + ' float;',
      'uniform float uTime;',
      'uniform vec2 uResolution;',
      'uniform vec2 uMouse;',
      'uniform vec3 uTopColor;',
      'uniform vec3 uBottomColor;',
      'uniform float uIntensity;',
      'uniform bool uInteractive;',
      'uniform float uGlowAmount;',
      'uniform float uPillarWidth;',
      'uniform float uPillarHeight;',
      'uniform float uNoiseIntensity;',
      'uniform float uRotCos;',
      'uniform float uRotSin;',
      'uniform float uPillarRotCos;',
      'uniform float uPillarRotSin;',
      'uniform float uWaveSin;',
      'uniform float uWaveCos;',
      'varying vec2 vUv;',
      'const float STEP_MULT = ' + q.stepMultiplier.toFixed(1) + ';',
      'const int MAX_ITER = ' + q.iterations + ';',
      'const int WAVE_ITER = ' + q.waveIterations + ';',
      'void main() {',
      '  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);',
      '  uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y, uPillarRotSin * uv.x + uPillarRotCos * uv.y);',
      '  vec3 ro = vec3(0.0, 0.0, -10.0);',
      '  vec3 rd = normalize(vec3(uv, 1.0));',
      '  float rotC = uRotCos;',
      '  float rotS = uRotSin;',
      '  if(uInteractive && (uMouse.x != 0.0 || uMouse.y != 0.0)) {',
      '    float a = uMouse.x * 6.283185;',
      '    rotC = cos(a);',
      '    rotS = sin(a);',
      '  }',
      '  vec3 col = vec3(0.0);',
      '  float t = 0.1;',
      '  for(int i = 0; i < MAX_ITER; i++) {',
      '    vec3 p = ro + rd * t;',
      '    p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);',
      '    vec3 q = p;',
      '    q.y = p.y * uPillarHeight + uTime;',
      '    float freq = 1.0;',
      '    float amp = 1.0;',
      '    for(int j = 0; j < WAVE_ITER; j++) {',
      '      q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z, uWaveSin * q.x + uWaveCos * q.z);',
      '      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;',
      '      freq *= 2.0;',
      '      amp *= 0.5;',
      '    }',
      '    float d = length(cos(q.xz)) - 0.2;',
      '    float bound = length(p.xz) - uPillarWidth;',
      '    float k = 4.0;',
      '    float h = max(k - abs(d - bound), 0.0);',
      '    d = max(d, bound) + h * h * 0.0625 / k;',
      '    d = abs(d) * 0.15 + 0.01;',
      '    float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);',
      '    col += mix(uBottomColor, uTopColor, grad) / d;',
      '    t += d * STEP_MULT;',
      '    if(t > 50.0) break;',
      '  }',
      '  float widthNorm = uPillarWidth / 3.0;',
      '  col = tanh(col * uGlowAmount / widthNorm);',
      '  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;',
      '  gl_FragColor = vec4(col * uIntensity, 1.0);',
      '}'
    ].join('\n');

    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTopColor: { value: parseColor(settings.topColor) },
        uBottomColor: { value: parseColor(settings.bottomColor) },
        uIntensity: { value: settings.intensity },
        uInteractive: { value: settings.interactive },
        uGlowAmount: { value: settings.glowAmount },
        uPillarWidth: { value: settings.pillarWidth },
        uPillarHeight: { value: settings.pillarHeight },
        uNoiseIntensity: { value: settings.noiseIntensity },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uPillarRotCos: { value: Math.cos(pillarRotRad) },
        uPillarRotSin: { value: Math.sin(pillarRotRad) },
        uWaveSin: { value: waveSin },
        uWaveCos: { value: waveCos }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    time = 0;
    animate();
  }

  function animate() {
    if (!scene || !camera || !renderer || !material) return;
    rafId = requestAnimationFrame(animate);
    time += 0.016 * settings.rotationSpeed;
    material.uniforms.uTime.value = time;
    material.uniforms.uRotCos.value = Math.cos(time * 0.3);
    material.uniforms.uRotSin.value = Math.sin(time * 0.3);
    renderer.render(scene, camera);
  }

  function dispose() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (material) material.dispose();
    if (geometry) geometry.dispose();
    scene = null;
    camera = null;
    renderer = null;
    material = null;
    mesh = null;
    geometry = null;
  }

  var resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      if (!renderer || !material || !container.parentNode) return;
      var w = container.clientWidth;
      var h = container.clientHeight;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
    }, 150);
  }

  function start() {
    if (!container || !page5.classList.contains('open')) return;
    if (typeof THREE === 'undefined') return;
    createEffect();
    window.addEventListener('resize', onResize);
  }

  function stop() {
    window.removeEventListener('resize', onResize);
    dispose();
  }

  var observer = new MutationObserver(function () {
    if (page5.classList.contains('open')) {
      start();
    } else {
      stop();
    }
  });
  observer.observe(page5, { attributes: true, attributeFilter: ['class'] });

  if (page5.classList.contains('open')) start();
})();
