import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Solar3DCanvas — Realistic Photorealistic 3D Dynamic Sun
 * - Procedural dynamic solar convection & granulation shader (turbulent bubbling plasma)
 * - True spherical solar flares & convective prominences (no planetary rings)
 * - Multi-stage volumetric coronal halo with Fresnel limb darkening
 * - Organic photon & solar wind field radiating spherically
 * - Responsive mouse parallax & click-to-dispatch telemetry
 */
export default function Solar3DCanvas({ activeRole = 'distributor', onRequestClick, onMaintainerClick }) {
  const mountRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, High-Precision WebGL Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // 2. Solar Illumination (Internal high-energy star core)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xff8811, 8, 120, 1.2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const sunCoreLight = new THREE.PointLight(0xffffff, 5, 40);
    sunCoreLight.position.set(0, 0, 0);
    scene.add(sunCoreLight);

    // 3. MASTER REALISTIC SUN GROUP
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-3.2, 1.2, -1.5);

    // Dynamic Solar Noise Shader (Simulates Photosphere Granulation & Magnetic Convection)
    const solarShader = {
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Subtle solar surface bubbling/pulsation
          float displacement = sin(position.x * 2.5 + uTime * 1.5) * 
                               cos(position.y * 2.5 + uTime * 1.5) * 
                               sin(position.z * 2.5 + uTime * 1.5) * 0.08;
                               
          vec3 newPos = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;

        // Simplex/Perlin-style 3D noise approximation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          // Solar limb darkening (Fresnel glow)
          float fresnel = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
          fresnel = pow(fresnel, 2.0);

          // Multi-octave turbulent plasma
          float t = uTime * 0.18;
          float n1 = snoise(vPosition * 0.7 + vec3(0.0, t, 0.0));
          float n2 = snoise(vPosition * 1.5 - vec3(t * 0.8, 0.0, t * 0.5));
          float n3 = snoise(vPosition * 3.2 + vec3(0.0, 0.0, t * 1.2));
          float noise = n1 * 0.55 + n2 * 0.3 + n3 * 0.15;

          // True Solar Color Ramp: Core White/Yellow -> Hot Orange -> Deep Crimson -> Dark Coronal Edge
          vec3 colorCore = vec3(1.0, 0.96, 0.75);      // Solar Core (#FFF5BF)
          vec3 colorGold = vec3(1.0, 0.65, 0.05);      // Chromosphere Gold (#FFA60D)
          vec3 colorFire = vec3(0.95, 0.28, 0.02);     // Convection Fire (#F24705)
          vec3 colorDark = vec3(0.65, 0.08, 0.0);      // Sunspot / Flare Rim (#A61400)

          vec3 baseColor = mix(colorFire, colorGold, clamp(noise + 0.4, 0.0, 1.0));
          baseColor = mix(baseColor, colorCore, clamp((noise - 0.25) * 1.8, 0.0, 1.0));
          
          // Edge limb glow & atmospheric corona radiation
          vec3 finalColor = mix(baseColor, colorDark, fresnel * 0.6);
          finalColor += colorGold * pow(fresnel, 3.0) * 1.8;
          finalColor += colorCore * 0.25;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    };

    const solarUniforms = {
      uTime: { value: 0.0 }
    };

    // A) The Photosphere Sphere
    const sunGeo = new THREE.SphereGeometry(4.6, 96, 96);
    const sunMat = new THREE.ShaderMaterial({
      vertexShader: solarShader.vertexShader,
      fragmentShader: solarShader.fragmentShader,
      uniforms: solarUniforms
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // B) Volumetric Multi-Stage Atmospheric Halo Coronas (True Spherical Glow, NO RINGS)
    const createCorona = (radius, color, opacity, power = 2.0) => {
      const geo = new THREE.SphereGeometry(radius, 48, 48);
      const mat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uPower;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), uPower);
            gl_FragColor = vec4(uColor, intensity * uOpacity);
          }
        `,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
          uPower: { value: power }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });
      return new THREE.Mesh(geo, mat);
    };

    // Inner fiery chromosphere corona
    const coronaInner = createCorona(4.9, 0xff7700, 0.95, 2.2);
    sunGroup.add(coronaInner);

    // Middle golden radiation halo
    const coronaMid = createCorona(5.8, 0xffaa00, 0.55, 2.0);
    sunGroup.add(coronaMid);

    // Outer deep space solar aura
    const coronaOuter = createCorona(7.5, 0xff3300, 0.28, 1.8);
    sunGroup.add(coronaOuter);

    // Soft celestial atmospheric diffusion
    const coronaUltra = createCorona(10.0, 0xff2200, 0.12, 1.5);
    sunGroup.add(coronaUltra);

    // C) Organic 3D Solar Prominence Loops (Plasma ejections protruding from the surface)
    const prominenceGroup = new THREE.Group();
    const promCount = 6;
    const promMeshes = [];

    for (let i = 0; i < promCount; i++) {
      // Half-arch torus loop rooted on the sun sphere
      const loopRadius = 0.9 + Math.random() * 0.7;
      const loopGeo = new THREE.TorusGeometry(loopRadius, 0.045, 12, 48, Math.PI);
      const loopMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffcc00 : 0xff4400,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const loop = new THREE.Mesh(loopGeo, loopMat);

      // Distribute radially on sun's spherical surface
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      const r = 4.45;
      loop.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      loop.lookAt(loop.position.clone().multiplyScalar(2));
      loop.rotation.z = Math.random() * Math.PI;

      prominenceGroup.add(loop);
      promMeshes.push({ mesh: loop, speed: (Math.random() - 0.5) * 0.015 });
    }
    sunGroup.add(prominenceGroup);

    scene.add(sunGroup);

    // 4. Photons & Radiating Solar Wind (True Spherical Outflow)
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Spawn on or just outside photosphere
      const r = 4.7 + Math.random() * 20.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const vx = Math.sin(phi) * Math.cos(theta);
      const vy = Math.cos(phi);
      const vz = Math.sin(phi) * Math.sin(theta);

      particlePos[idx] = sunGroup.position.x + r * vx;
      particlePos[idx + 1] = sunGroup.position.y + r * vy;
      particlePos[idx + 2] = sunGroup.position.z + r * vz;

      const speed = 0.03 + Math.random() * 0.05;
      particleVel[idx] = vx * speed;
      particleVel[idx + 1] = vy * speed;
      particleVel[idx + 2] = vz * speed;

      // Color gradation (White core -> Gold -> Reddish orange at edges)
      if (r < 8.0) {
        particleColors[idx] = 1.0;
        particleColors[idx + 1] = 0.9;
        particleColors[idx + 2] = 0.6;
      } else if (r < 15.0) {
        particleColors[idx] = 1.0;
        particleColors[idx + 1] = 0.55;
        particleColors[idx + 2] = 0.1;
      } else {
        particleColors[idx] = 0.9;
        particleColors[idx + 1] = 0.2;
        particleColors[idx + 2] = 0.05;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const solarWind = new THREE.Points(particleGeo, particleMat);
    scene.add(solarWind);

    // 5. Celestial Orbital Telemetry Beacons (Distributor, Maintainer, Requests)
    const beaconGroup = new THREE.Group();

    // A) Distributor Orbital Beacon
    const distGeo = new THREE.OctahedronGeometry(0.7, 0);
    const distMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      wireframe: true
    });
    const distBeacon = new THREE.Mesh(distGeo, distMat);
    distBeacon.userData = {
      type: 'distributor',
      title: 'Distributor Operations Hub',
      desc: 'Assigns tasks to maintainers from nearby resident requests'
    };
    beaconGroup.add(distBeacon);

    // B) Maintainer Field Units
    const techGeo = new THREE.TetrahedronGeometry(0.55, 0);
    const techMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.4,
      wireframe: true
    });

    const maintainers = [
      { name: 'Arun Kumar', orbitRadius: 9.8, speed: 0.5, yOffset: 1.8, targetTicket: 'FLT-2026-9041' },
      { name: 'Kavita Reddy', orbitRadius: 11.5, speed: 0.38, yOffset: -1.4, targetTicket: 'FLT-2026-8812' }
    ];

    const techMeshes = [];
    maintainers.forEach((m) => {
      const mesh = new THREE.Mesh(techGeo, techMat);
      mesh.userData = {
        type: 'maintainer',
        title: `Maintainer Unit: ${m.name}`,
        desc: `Assigned to ${m.targetTicket}`
      };
      beaconGroup.add(mesh);
      techMeshes.push({ mesh, ...m });
    });

    // C) Nearby Resident Problem Requests
    const reqGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const reqMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
      wireframe: true
    });

    const requests = [
      { ticket: 'FLT-2026-9041', title: 'Inverter Voltage Drop', orbitRadius: 8.5, speed: -0.45, yOffset: 2.2, severity: 'Critical' },
      { ticket: 'FLT-2026-8812', title: 'Panel Hotspot Degradation', orbitRadius: 10.6, speed: -0.32, yOffset: -2.0, severity: 'High' }
    ];

    const reqMeshes = [];
    requests.forEach((r) => {
      const mesh = new THREE.Mesh(reqGeo, reqMat);
      mesh.userData = {
        type: 'request',
        title: `Nearby Request: ${r.ticket}`,
        desc: `${r.title} (${r.severity})`
      };
      beaconGroup.add(mesh);
      reqMeshes.push({ mesh, ...r });
    });

    scene.add(beaconGroup);

    // 6. Interactive Raycasting & Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 2;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseX = x;
      mouseY = y;
      targetCameraX = x * 4.0;
      targetCameraY = 2 + y * 2.5;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const objects = [distBeacon, ...techMeshes.map(t => t.mesh), ...reqMeshes.map(r => r.mesh)];
      const intersects = raycaster.intersectObjects(objects, false);

      if (intersects.length > 0) {
        setHoveredNode(intersects[0].object.userData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const objects = [distBeacon, ...techMeshes.map(t => t.mesh), ...reqMeshes.map(r => r.mesh)];
      const intersects = raycaster.intersectObjects(objects, false);

      if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        if (data.type === 'request' && onRequestClick) {
          onRequestClick(data);
        } else if (data.type === 'maintainer' && onMaintainerClick) {
          onMaintainerClick(data);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 7. Dynamic Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update dynamic solar shader time uniform
      solarUniforms.uTime.value = elapsed;

      // Smooth camera dampening
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(-1.2, 0.8, 0);

      // Natural organic solar drift (subtle floating, no planar orbit rings)
      sunGroup.position.x = -3.2 + Math.sin(elapsed * 0.3) * 1.2 + mouseX * 1.2;
      sunGroup.position.y = 1.2 + Math.cos(elapsed * 0.25) * 0.8 + mouseY * 0.8;
      sunGroup.position.z = -1.5 + Math.sin(elapsed * 0.18) * 0.8;

      // Slow axial rotation of the sun
      sunMesh.rotation.y = elapsed * 0.04;

      // Breathing pulsations of coronal layers
      const breathe = Math.sin(elapsed * 1.8) * 0.03;
      coronaInner.scale.set(1.0 + breathe, 1.0 + breathe, 1.0 + breathe);
      coronaMid.scale.set(1.0 - breathe * 0.7, 1.0 - breathe * 0.7, 1.0 - breathe * 0.7);

      // Animate solar prominence loops
      promMeshes.forEach((p, idx) => {
        p.mesh.rotation.z += p.speed;
        p.mesh.scale.setScalar(1.0 + Math.sin(elapsed * 2.0 + idx) * 0.06);
      });

      // Orbit Distributor Beacon
      const distAngle = elapsed * 0.45;
      distBeacon.position.x = sunGroup.position.x + Math.cos(distAngle) * 7.5;
      distBeacon.position.z = sunGroup.position.z + Math.sin(distAngle) * 6.5;
      distBeacon.position.y = sunGroup.position.y + Math.sin(elapsed * 1.1) * 1.0;
      distBeacon.rotation.x = elapsed * 1.2;
      distBeacon.rotation.y = elapsed * 1.0;

      // Orbit Maintainer Units
      techMeshes.forEach((t) => {
        const angle = elapsed * t.speed;
        t.mesh.position.x = sunGroup.position.x + Math.cos(angle) * t.orbitRadius;
        t.mesh.position.z = sunGroup.position.z + Math.sin(angle) * t.orbitRadius;
        t.mesh.position.y = sunGroup.position.y + t.yOffset + Math.sin(elapsed * 1.4) * 0.5;
        t.mesh.rotation.y = elapsed * 1.6;
      });

      // Orbit Nearby Requests
      reqMeshes.forEach((r) => {
        const angle = elapsed * r.speed;
        r.mesh.position.x = sunGroup.position.x + Math.cos(angle) * r.orbitRadius;
        r.mesh.position.z = sunGroup.position.z + Math.sin(angle) * r.orbitRadius;
        r.mesh.position.y = sunGroup.position.y + r.yOffset + Math.cos(elapsed * 1.2) * 0.4;
        r.mesh.rotation.x = elapsed * 1.4;
      });

      // Stream Radiant Solar Wind Outward Spherically
      const positions = solarWind.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleVel[idx];
        positions[idx + 1] += particleVel[idx + 1];
        positions[idx + 2] += particleVel[idx + 2];

        // Recycle particle once it reaches outer space
        const dx = positions[idx] - sunGroup.position.x;
        const dy = positions[idx + 1] - sunGroup.position.y;
        const dz = positions[idx + 2] - sunGroup.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist > 28.0) {
          const r = 4.7 + Math.random() * 0.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[idx] = sunGroup.position.x + r * Math.sin(phi) * Math.cos(theta);
          positions[idx + 1] = sunGroup.position.y + r * Math.cos(phi);
          positions[idx + 2] = sunGroup.position.z + r * Math.sin(phi) * Math.sin(theta);
        }
      }
      solarWind.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating 3D Telemetry HUD on Hover */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          padding: '12px 18px',
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 0,
          fontFamily: 'var(--font-mono, monospace)',
          color: '#FFFFFF',
          pointerEvents: 'none',
          zIndex: 30,
          maxWidth: '360px'
        }}>
          <div style={{
            fontSize: '0.675rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: hoveredNode.type === 'distributor' ? '#60A5FA' : hoveredNode.type === 'maintainer' ? '#34D399' : '#FBBF24',
            marginBottom: '4px'
          }}>
            ORBITAL NODE • {hoveredNode.type.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '4px' }}>
            {hoveredNode.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>
            {hoveredNode.desc}
          </div>
        </div>
      )}
    </div>
  );
}
