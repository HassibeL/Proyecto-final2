import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Botones
const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')
const btn3 = document.getElementById('btn3')
const content1 = document.getElementById('content1');
const content3 = document.getElementById('content3');

const overlay = document.getElementById('Overlay');
const overlayHeader = document.getElementById('overlay-header');

function mostrarInstrucciones() {
  overlay.classList.remove('inactive');
  overlayHeader.classList.remove('inactive');
}

function ocultarInstrucciones() {
  overlay.classList.add('inactive');
  overlayHeader.classList.add('inactive');
}

function hideAllContent() {
    const sidebars = document.querySelectorAll('.sidebar');
    sidebars.forEach(panel => panel.classList.remove('visible'));
}

// Acción al dar clic en cada botón
btn1.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: -5, y: 5, z: 7, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    gsap.to(controls.target, {
        x: -5, y: 2, z: 0, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    hideAllContent();
    content1.classList.add('visible');
    ocultarInstrucciones();
});

btn2.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: 0, y: 5, z: 12, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    gsap.to(controls.target, {
        x: 0, y: 1, z: 0, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    hideAllContent();
    mostrarInstrucciones();
});

btn3.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: 5, y: 5, z: 7, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    gsap.to(controls.target, {
        x: 5, y: 2, z: 0, duration: 2, ease: 'power2.out',
        onUpdate: () => controls.update()
    });
    hideAllContent();
    content3.classList.add('visible');
    ocultarInstrucciones();
});

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
const mixers = [];

gltfLoader.load('/models/CuartoHass/milhass.glb', (gltf) => {
    const cuartoHass = new THREE.Group();
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.scale.set(2, 2, 2);
    cuartoHass.add(gltf.scene);
    cuartoHass.position.set(-5, 0, 0);
    scene.add(cuartoHass);

});

gltfLoader.load('/models/CuartoVal/val.glb', (gltf) => {
    const segundoModelo = gltf.scene;
    segundoModelo.position.set(5, 0, 0);
    segundoModelo.rotation.y = Math.PI * 1.5;
    segundoModelo.scale.set(2, 2, 2); // Escala aquí
    scene.add(segundoModelo);
});

gltfLoader.load('/animation/hassi.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-4, 0.6, 0);
    model.scale.set(2, 2, 2); // Escala aquí
    scene.add(model);
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = false;
            child.material.depthWrite = true;
            child.material.side = THREE.FrontSide;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
    mixers.push(mixer);
});

gltfLoader.load('/animation/valeriee.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(27, -0.2, 3.8);
     model.scale.set(2, 2, 2); // Escala aquí
    scene.add(model);
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.depthWrite = true;
            child.material.transparent = false;
            child.material.side = THREE.FrontSide;
            child.material.needsUpdate = true;
        }
    });
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
    mixers.push(mixer);
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xdffffff, 2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0x681335, 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.radius = 2
directionalLight.shadow.bias = -0.001
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.left = -10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.bottom = -10
directionalLight.position.set(0, 6, 7)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mostrarInstrucciones();
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 6, 12)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomAmount = 0.5;
    const direction = event.deltaY < 0 ? -1 : 1;
    gsap.to(camera.position, {
        z: camera.position.z + direction * zoomAmount,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => controls.update()
    });
}, { passive: false });

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 0)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    mixers.forEach(mixer => mixer.update(deltaTime));
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick()

// Popup bienvenida
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('welcomePopup').style.display = 'none';
});

// Música
const music = document.getElementById('cancion');
document.getElementById('playMusic').addEventListener('click', () => music.play());
document.getElementById('pauseMusic').addEventListener('click', () => music.pause());
document.getElementById('muteMusic').addEventListener('click', () => {
    music.muted = !music.muted;
});

// Atajos de teclado
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'p') music.play();
    else if (key === 's') music.pause();
    else if (key === 'm') music.muted = !music.muted;
});

// Crear geometría del suelo
const sueloGeometry = new THREE.PlaneGeometry(50, 50);
const sueloMaterial = new THREE.MeshStandardMaterial({ color: 0x3a4252, side: THREE.DoubleSide });
const suelo = new THREE.Mesh(sueloGeometry, sueloMaterial);

// Rotarlo para que esté horizontal y bajarlo en Y
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = 0.1; // Ajusta según dónde estén tus cuartos

// Añadir sombras si usas luces
suelo.receiveShadow = true;

// Agregar a la escena
scene.add(suelo);

let cartas = [];
let volando = false;
let holdingH = false;
let direccion = 1;
let currentDirection = 1;
let startTime = 0;
let scrollTimeout = null;

const textureLoader = new THREE.TextureLoader();
const imagePaths = [
    '/imagen/hyv1.jpg',
    '/imagen/hyv2.jpg',
    '/imagen/hyv3.jpg',
    '/imagen/hyv4.jpg',
    '/imagen/hyv5.jpg',
    '/imagen/hyv6.jpg',
    '/imagen/hyv7.jpg',
    '/imagen/hyv8.jpg',
    '/imagen/hyv9.jpg',
    '/imagen/hyv10.jpg',
    '/imagen/hyv11.jpg',
    '/imagen/hyv12.jpg',
    '/imagen/hyv13.jpg',
    '/imagen/hyv14.jpg',
    '/imagen/hyv15.jpg',
    '/imagen/hyv16.jpg',
    '/imagen/hyv17.jpg',
    '/imagen/hyv18.jpg',
    '/imagen/hyv19.jpg',

];

function crearCartas() {
    const cartaGeometry = new THREE.PlaneGeometry(.4, .6);
   for (let i = 0; i < 50; i++) {
        const textureIndex = i % imagePaths.length;
        const texture = textureLoader.load(imagePaths[textureIndex]);
        texture.minFilter = THREE.LinearFilter; // mejor filtrado para calidad

        const cartaMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        const carta = new THREE.Mesh(cartaGeometry, cartaMaterial);

        carta.userData = {
            delay: Math.random() * 1.5,
            flying: false,
            speed: 0.01 + Math.random() * 0.001,
            offsetZ: Math.random() * 0.5 - 0.25,
            progress: 0
        };

        carta.position.set(-5 + Math.random() * 1.5, 0.7, 2 + Math.random() * 0.3);
        scene.add(carta);
        cartas.push(carta);
    }
}

function animateCartas(time) {
    if (!volando) return;

    const elapsed = (time - startTime) / 1000;

    cartas.forEach((carta, i) => {
        const data = carta.userData;

        if (elapsed > data.delay) {
            data.flying = true;
        }

        if (data.flying && data.progress < 1) {
            data.progress += data.speed;

            // Interpolación entre origen y destino
            const startX = direccion === 1 ? -5 : 5;
            const endX = direccion === 1 ? 5 : -5;

            const t = Math.min(data.progress, 1);
            const x = THREE.MathUtils.lerp(startX, endX, t);

            // Movimiento en arco (parábola suave)
            const arcHeight = 3; // altura máxima
            const y = 0.7 + 4 * arcHeight * t * (1 - t); // forma de parábola
            const z = 2 + Math.sin(time / 400 + i) * 0.05;

            carta.position.set(x, y, z);

            // Rotación
            carta.rotation.x += 0.02;
            carta.rotation.y += 0.01;
        
        } 
    });
}

function animate(time) {
    requestAnimationFrame(animate);
    animateCartas(time);
    controls.update();
    renderer.render(scene, camera);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'h') holdingH = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'h') {
        holdingH = false;
        volando = false;
    }
});

window.addEventListener('wheel', (e) => {
    if (!holdingH) return;

    const newDirection = e.deltaY > 0 ? 1 : -1;

    if (newDirection !== currentDirection || !volando) {
        currentDirection = newDirection;
        direccion = newDirection;
        volando = true;
        startTime = performance.now();

        // Reinicia el vuelo de cada carta
        cartas.forEach(carta => {
            carta.userData.flying = false;
            carta.userData.delay = Math.random() * 1.5;
            carta.userData.progress = 0;

            // Reubica al punto de partida más juntos
            const zOffset = 2 + Math.random() * 0.3;
            const x = direccion === 1 ? -5 + Math.random() * 1.5 : 5 - Math.random() * 1.5;
            carta.position.set(x, 0.7, zOffset);
        });
    }
    // Detener después de un tiempo sin scroll
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        volando = false;
    }, 300);
});

// Ejecutar todo
crearCartas();
animate();


