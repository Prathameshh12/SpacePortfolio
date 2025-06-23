const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
  antialias: true,
  alpha: true, // make canvas background transparent
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 🌌 Background stars
const starCount = 5000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starPositions.push(x, y, z);
}

starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Planets
const textureLoader = new THREE.TextureLoader();
const planets = [];
const planetData = [
  {
    name: "About",
    texture: "assets/textures/earth1.jpg",
    x: 8,
    info: "I’m a Software Engineering student at UTS with a strong interest in software development and Cybersecurity. I enjoy turning ideas into practical, working solutions and continuously learning new skills along the way. Currently exploring Cybersecurity, iOS app development, AI integrations, UI Design.",
  },
  {
    name: "Projects",
    texture: "assets/textures/venus1.jpg",
    x: 12,
    info: [
      {
        title: "iOS App - Singular",
        github: "https://github.com/Prathameshh12/CodeBrewers",
        demo: "https://drive.google.com/file/d/1d0BK3cuB5GEeLcG8w2AI2DaGkm1h7zky/view",
      },
      {
        title: "iOS App - Colour Capture",
        github: "https://github.com/Prathameshh12/ColourPhoto",
        demo: "https://drive.google.com/file/d/1BryrOn350_DiE-hCiF7V_zimsKXzpRLq/view",
      },
      {
        title: "Portfolio Website",
        github: "https://github.com/Prathameshh12/Prathamesh_Portfolio",
        demo: "https://prathameshahire.netlify.app",
      },
    ],
  },

  {
    name: "Skills",
    texture: "assets/textures/mars1.jpg",
    x: 16,
    info: "Skills: Java, Python, Swift / SwiftUI, React, Tailwind CSS, UI/UX Design, Pentesting, Wireshark / Metasploit / Nmap, Git & GitHub, AWS & Google Cloud, Docker, Linux",
  },
  {
    name: "Contact",
    texture: "assets/textures/jupiter1.jpg",
    x: 20,
    info: "Let’s connect! Email: prathamesh.ahire1204@gmail.com",
  },
];

function createTextLabel(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.shadowColor = "#000";
  context.shadowBlur = 10;
  context.font = "bold 48px Segoe UI";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.strokeStyle = "black";
  context.lineWidth = 6;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  context.fillStyle = "white";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(10, 2.5, 1);
  return sprite;
}

planetData.forEach((data) => {
  const geo = new THREE.SphereGeometry(2.5, 128, 128); // higher segments = smoother planet
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(data.texture),
    roughness: 0.7,
    metalness: 0.2,
    emissive: new THREE.Color(0x111111), // subtle light
    emissiveIntensity: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.userData = {
    name: data.name,
    info: data.info,
    angle: Math.random() * Math.PI * 2,
    radius: data.x,
  };

  mesh.position.set(
    Math.cos(mesh.userData.angle) * mesh.userData.radius,
    0,
    Math.sin(mesh.userData.angle) * mesh.userData.radius
  );

  const label = createTextLabel(data.name);
  label.position.set(0, -3.5, 0);
  mesh.add(label);

  scene.add(mesh);
  planets.push(mesh);
});

// Lighting — realistic and smooth
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(50, 30, 30);
scene.add(directionalLight);

camera.position.set(0, 2, 30);

// Animate
function animate() {
  requestAnimationFrame(animate);
  planets.forEach((p) => {
    p.userData.angle += 0.001;
    p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
    p.rotation.y += 0.01;
  });
  renderer.render(scene, camera);
}
animate();

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;

    gsap.to(camera.position, {
      x: planet.position.x + 4,
      y: 2,
      z: planet.position.z + 4,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(planet.position),
    });

    document.getElementById("info-title").innerText = planet.userData.name;
    const infoTextEl = document.getElementById("info-text");
    const infoData = planet.userData.info;
      if (Array.isArray(infoData)) {
        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
          infoData.forEach(project => {
          html += `<div style="border-bottom: 1px solid #444; padding-bottom: 6px;">
          <div style="font-weight: bold; font-size: 16px;">${project.title}</div>`;
          if (project.github) {
            html += `<a href="${project.github}" target="_blank" style="color: #1e90ff; font-size: 14px; text-decoration: none;">GitHub</a>`;
          }
          if (project.demo) {
            html += ` | <a href="${project.demo}" target="_blank" style="color: #00ffd5; font-size: 14px; text-decoration: none;">Live Demo</a>`;
          }
          html += `</div>`;
        });
        html += "</div>";
        infoTextEl.innerHTML = html;
        } else {
        infoTextEl.innerText = infoData;
        }
    document.getElementById("info-panel").classList.remove("hidden");
    }
});

function closePanel() {
  document.getElementById("info-panel").classList.add("hidden");
  gsap.to(camera.position, {
    x: 0,
    y: 2,
    z: 30,
    duration: 1.2,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(new THREE.Vector3(0, 0, 0)),
  });
}
