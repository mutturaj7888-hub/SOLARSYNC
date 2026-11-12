import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Solar3DCanvas — Glowing 3D Motion Moving Sun & Solar Corona Canvas
 * Replaces geometric box panels with a radiant, moving 3D Sun in Three.js:
 * - Glowing stellar core with dynamic pulsator & coronal flare shells
 * - Additive blended multi-layered atmospheric halos
 * - Orbital solar prominence plasma loops
 * - 1,800 radiant solar wind / photon particles streaming through space
 * - Continuous 3D orbital motion + mouse parallax tracking
 * - Celestial beacons for Distributor, Field Maintainers, and Nearby Requests
 */
export default function Solar3DCanvas({ activeRole = 'distributor', onRequestClick, onMaintainerClick }) {
  const mountRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.025);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Solar Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffa200, 5, 80, 1.2);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const sunCoreLight = new THREE.PointLight(0xffffff, 4, 30);
    sunCoreLight.position.set(0, 0, 0);
    scene.add(sunCoreLight);

    // 3. MASTER GLOWING 3D MOVING SUN GROUP
    const sunGroup = new THREE.Group();
    // Shift slightly to left/center so right-aligned ECHOID terminal has clean negative space
    sunGroup.position.set(-3.5, 1.5, -2);

    // A) Stellar Core Sphere (Glowing Solar Surface)
    const coreGeo = new THREE.SphereGeometry(4.5, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff4d00,
      emissiveIntensity: 1.8,
      roughness: 0.25,
      metalness: 0.1,
      wireframe: false
    });
    const sunCore = new THREE.Mesh(coreGeo, coreMat);
    sunGroup.add(sunCore);

    // Wireframe solar magnetic field ribs
    const fieldGeo = new THREE.SphereGeometry(4.52, 32, 32);
    const fieldMat = new THREE.MeshBasicMaterial({
      color: 0xffd000,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    sunGroup.add(fieldMesh);

    // B) Layered Volumetric Coronas (Additive Blending)
    // Corona 1: Inner Plasma Halo
    const corona1Geo = new THREE.SphereGeometry(4.9, 48, 48);
    const corona1Mat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const corona1 = new THREE.Mesh(corona1Geo, corona1Mat);
    sunGroup.add(corona1);

    // Corona 2: Outer Radiant Glow Atmosphere
    const corona2Geo = new THREE.SphereGeometry(5.8, 36, 36);
    const corona2Mat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const corona2 = new THREE.Mesh(corona2Geo, corona2Mat);
    sunGroup.add(corona2);

    // Corona 3: Deep Solar Horizon Halo
    const corona3Geo = new THREE.SphereGeometry(7.2, 32, 32);
    const corona3Mat = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const corona3 = new THREE.Mesh(corona3Geo, corona3Mat);
    sunGroup.add(corona3);

    // C) Solar Prominences & Coronal Magnetic Arcs (Plasma Loops)
    const arcGroup = new THREE.Group();
    const arcCount = 4;
    const arcMeshes = [];

    for (let i = 0; i < arcCount; i++) {
      const radius = 4.8 + i * 0.35;
      const arcGeo = new THREE.TorusGeometry(radius, 0.05, 16, 100, Math.PI * (0.8 + Math.random() * 0.4));
      const arcMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffcc00 : 0xff5500,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.rotation.x = Math.random() * Math.PI * 2;
      arc.rotation.y = Math.random() * Math.PI * 2;
      arcGroup.add(arc);
      arcMeshes.push(arc);
    }
    sunGroup.add(arcGroup);

    // D) Solar Flare Ring (Equatorial Equatorial Coronal Streamer)
    const ringGeo = new THREE.RingGeometry(5.2, 8.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    sunGroup.add(ringMesh);

    scene.add(sunGroup);

    // 4. 1,800+ Radiant Solar Wind / Photon Particles
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Spawn around sun and radiate outward
      const radius = 5.0 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePos[idx] = -3.5 + radius * Math.cos(phi) * Math.cos(theta);
      particlePos[idx + 1] = 1.5 + radius * Math.sin(phi);
      particlePos[idx + 2] = -2.0 + radius * Math.cos(phi) * Math.sin(theta);

      // Velocity radiating outward
      particleVel[idx] = (particlePos[idx] - (-3.5)) * 0.0018 + (Math.random() - 0.5) * 0.01;
      particleVel[idx + 1] = (particlePos[idx + 1] - 1.5) * 0.0018 + (Math.random() - 0.5) * 0.01;
      particleVel[idx + 2] = (particlePos[idx + 2] - (-2.0)) * 0.0018 + (Math.random() - 0.5) * 0.01;

      // Color gradation from solar gold to white
      if (Math.random() > 0.4) {
        particleColors[idx] = 1.0; // R
        particleColors[idx + 1] = 0.7 + Math.random() * 0.3; // G
        particleColors[idx + 2] = 0.1 + Math.random() * 0.2; // B
      } else {
        particleColors[idx] = 1.0;
        particleColors[idx + 1] = 0.95;
        particleColors[idx + 2] = 0.8;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const solarWind = new THREE.Points(particleGeo, particleMat);
    scene.add(solarWind);

    // 5. Celestial Orbital Telemetry Beacons
    const beaconGroup = new THREE.Group();

    // A) Distributor Orbital Beacon
    const distGeo = new THREE.OctahedronGeometry(0.75, 0);
    const distMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: true
    });
    const distBeacon = new THREE.Mesh(distGeo, distMat);
    distBeacon.userData = {
      type: 'distributor',
      title: 'Distributor Orbital Hub',
      desc: 'Assigns tasks to maintainers from nearby requests'
    };
    beaconGroup.add(distBeacon);

    // B) Maintainer Field Units
    const techGeo = new THREE.TetrahedronGeometry(0.55, 0);
    const techMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.2,
      wireframe: true
    });

    const maintainers = [
      { name: 'Arun Kumar', orbitRadius: 9.5, speed: 0.6, yOffset: 1.8, targetTicket: 'FLT-2026-9041' },
      { name: 'Kavita Reddy', orbitRadius: 11.2, speed: 0.45, yOffset: -1.2, targetTicket: 'FLT-2026-8812' }
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

    // C) Nearby Resident Requests
    const reqGeo = new THREE.IcosahedronGeometry(0.48, 0);
    const reqMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.4,
      wireframe: true
    });

    const requests = [
      { ticket: 'FLT-2026-9041', title: 'Inverter Voltage Drop', orbitRadius: 8.2, speed: -0.5, yOffset: 2.5, severity: 'Critical' },
      { ticket: 'FLT-2026-8812', title: 'Panel Hotspot', orbitRadius: 10.4, speed: -0.38, yOffset: -2.0, severity: 'High' }
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

    // 6. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 3;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseX = x;
      mouseY = y;
      targetCameraX = x * 4.5;
      targetCameraY = 3 + y * 3.0;

      // Raycasting on hover
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

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Continuous 3D Motion & Render Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera dampening
      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(-1.5, 1, 0);

      // CONTINUOUS 3D MOTION MOVING SUN
      // Lissajous 3D wave undulation
      sunGroup.position.x = -3.5 + Math.sin(elapsed * 0.35) * 1.8 + mouseX * 1.5;
      sunGroup.position.y = 1.5 + Math.cos(elapsed * 0.28) * 1.2 + mouseY * 1.2;
      sunGroup.position.z = -2.0 + Math.sin(elapsed * 0.2) * 1.5;

      // Sun rotation on multiple axes
      sunCore.rotation.y = elapsed * 0.08;
      fieldMesh.rotation.y = -elapsed * 0.12;
      fieldMesh.rotation.x = elapsed * 0.04;

      // Corona breathing (expansion / contraction pulsation)
      const pulse = 1.0 + Math.sin(elapsed * 1.5) * 0.04;
      corona1.scale.set(pulse, pulse, pulse);
      corona2.scale.set(1.0 + Math.cos(elapsed * 1.2) * 0.06, 1.0 + Math.cos(elapsed * 1.2) * 0.06, 1.0 + Math.cos(elapsed * 1.2) * 0.06);
      ringMesh.rotation.z = elapsed * 0.25;

      // Rotate plasma prominences
      arcMeshes.forEach((arc, i) => {
        arc.rotation.x += 0.004 * (i + 1);
        arc.rotation.y += 0.006 * (i + 1);
      });

      // Move Distributor Beacon in stable inner orbit
      const distAngle = elapsed * 0.5;
      distBeacon.position.x = sunGroup.position.x + Math.cos(distAngle) * 7.5;
      distBeacon.position.z = sunGroup.position.z + Math.sin(distAngle) * 6.5;
      distBeacon.position.y = sunGroup.position.y + Math.sin(elapsed * 1.2) * 1.2;
      distBeacon.rotation.x = elapsed * 1.5;
      distBeacon.rotation.y = elapsed * 1.2;

      // Orbit Maintainer Units
      techMeshes.forEach((t) => {
        const angle = elapsed * t.speed;
        t.mesh.position.x = sunGroup.position.x + Math.cos(angle) * t.orbitRadius;
        t.mesh.position.z = sunGroup.position.z + Math.sin(angle) * t.orbitRadius;
        t.mesh.position.y = sunGroup.position.y + t.yOffset + Math.sin(elapsed * 1.8) * 0.6;
        t.mesh.rotation.y = elapsed * 2.0;
      });

      // Orbit Nearby Requests
      reqMeshes.forEach((r) => {
        const angle = elapsed * r.speed;
        r.mesh.position.x = sunGroup.position.x + Math.cos(angle) * r.orbitRadius;
        r.mesh.position.z = sunGroup.position.z + Math.sin(angle) * r.orbitRadius;
        r.mesh.position.y = sunGroup.position.y + r.yOffset + Math.cos(elapsed * 1.5) * 0.5;
        r.mesh.rotation.x = elapsed * 1.8;
      });

      // Radiant Solar Wind Particles (stream outward from moving Sun)
      const positions = solarWind.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleVel[idx];
        positions[idx + 1] += particleVel[idx + 1];
        positions[idx + 2] += particleVel[idx + 2];

        // Reset if particle moves too far from sun
        const dx = positions[idx] - sunGroup.position.x;
        const dy = positions[idx + 1] - sunGroup.position.y;
        const dz = positions[idx + 2] - sunGroup.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist > 30) {
          const r = 4.6 + Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = (Math.random() - 0.5) * Math.PI;
          positions[idx] = sunGroup.position.x + r * Math.cos(phi) * Math.cos(theta);
          positions[idx + 1] = sunGroup.position.y + r * Math.sin(phi);
          positions[idx + 2] = sunGroup.position.z + r * Math.cos(phi) * Math.sin(theta);
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
          background: 'rgba(0, 0, 0, 0.9)',
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
            [ ORBITAL NODE: {hoveredNode.type.toUpperCase()} ]
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
