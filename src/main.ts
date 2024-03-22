import './style.css'
import GUI from 'lil-gui'
import * as three from "three"
import textures from './assets/textures'
import loadTexture from './utils/textureLoader'
import { getViewportDimensions } from './utils/responsiveness'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

/**
 * Debug controls
 */
const gui = new GUI().open(false)

/**
 * Constants
 */
const properties = {
  doorLight: {
    intensity: 7,
    color: 0xff7d46
  }
}

/**
 * Textures
 */
// Door Texture
const doorTexture: Record<TextureKeys, three.Texture> = {
  alpha: loadTexture(textures.door.alpha),
  color: loadTexture(textures.door.color),
  height: loadTexture(textures.door.height),
  normal: loadTexture(textures.door.normal),
  roughness: loadTexture(textures.door.roughness),
  metalness: loadTexture(textures.door.metalness),
  ambientOcclusion: loadTexture(textures.door.ambientOcclusion)
}

// Bricks Texture
const bricksTexture: Record<SimpleTexture, three.Texture> = {
  color: loadTexture(textures.bricks.color),
  normal: loadTexture(textures.bricks.normal),
  roughness: loadTexture(textures.bricks.roughness),
  ambientOcclusion: loadTexture(textures.bricks.ambientOcclusion)
}

// Bricks Texture
const grassTexture: Record<SimpleTexture, three.Texture> = {
  color: loadTexture(textures.grass.color),
  normal: loadTexture(textures.grass.normal),
  roughness: loadTexture(textures.grass.roughness),
  ambientOcclusion: loadTexture(textures.grass.ambientOcclusion)
}

grassTexture.color.repeat.set(10, 10)
grassTexture.normal.repeat.set(10, 10)
grassTexture.roughness.repeat.set(10, 10)
grassTexture.ambientOcclusion.repeat.set(10, 10)

grassTexture.color.wrapS = three.RepeatWrapping
grassTexture.normal.wrapS = three.RepeatWrapping
grassTexture.roughness.wrapS = three.RepeatWrapping
grassTexture.ambientOcclusion.wrapS = three.RepeatWrapping

grassTexture.color.wrapT = three.RepeatWrapping
grassTexture.normal.wrapT = three.RepeatWrapping
grassTexture.roughness.wrapT = three.RepeatWrapping
grassTexture.ambientOcclusion.wrapT = three.RepeatWrapping

/**
 * Responsiveness
 */
let sizes = getViewportDimensions()
let aspect = sizes.width!/sizes.height!
window.addEventListener('resize', () => {
  sizes = getViewportDimensions()
  camera.aspect = aspect
  camera.updateMatrix()
  renderer.setSize(sizes.width!, sizes.height!)
})

/**
 * Scene
 */
const scene = new three.Scene()
// Fog
const fog = new three.Fog(0x262837, 1, 9)
scene.fog = fog

/**
 * Axes Helpers
 */
const axesHelper = new three.AxesHelper(1000)
scene.add(axesHelper)

const axesHelperControlsFolder = gui.addFolder("Axes Helper").open(false)
axesHelperControlsFolder.add(axesHelper, "visible").name("Visible")

/**
 * Canvas
 */
const canvas = window.document.createElement("canvas")
window.document.body.prepend(canvas)

/**
 * Objects
 */
// House
const house = new three.Object3D()
scene.add(house)

// Walls
const walls = new three.Mesh(
  new three.BoxGeometry(4, 4, 3, 100, 100),
  new three.MeshStandardMaterial({
    map: bricksTexture.color,
    aoMap: bricksTexture.ambientOcclusion,
    normalMap: bricksTexture.normal,
    roughnessMap: bricksTexture.roughness
  })
)

walls.position.set(0, 0, 1.501)
walls.material.side = three.DoubleSide
walls.castShadow = true
house.add(walls)

// Set uv2 for ambient occlusion map
walls.geometry.setAttribute(
  "uv2", 
  new three.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)

// Roof
const roof = new three.Mesh(
  new three.ConeGeometry(4, 2, 4),
  new three.MeshStandardMaterial({
    color: "rgb(182, 64, 38)",
    metalness: 0.2,
    roughness: 0.8
  })
)
roof.position.set(0, 0, 4)
roof.castShadow = true
roof.rotation.set(Math.PI/2, Math.PI/4, 0)
house.add(roof)

// Door
const door = new three.Mesh(
  new three.PlaneGeometry(2, 2, 100, 100),
  new three.MeshStandardMaterial({
    transparent: true, 
    map: doorTexture.color,
    alphaMap: doorTexture.alpha,
    aoMap: doorTexture.ambientOcclusion,
    displacementMap: doorTexture.height,
    displacementScale: 0.1,
    normalMap: doorTexture.normal,
    metalnessMap: doorTexture.metalness,
    roughnessMap: doorTexture.roughness
  })
)
// Set uv2 for ambient occlusion map
door.geometry.setAttribute(
  "uv2", 
  new three.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.set(0, -2.01, 0.9)
door.material.side = three.DoubleSide
door.rotateX(Math.PI/2)
house.add(door)

const bushesGeo = new three.SphereGeometry(1, 25,  25)
const bushesMat = new three.MeshStandardMaterial({
  color: 0x00c535,
  roughness: .5
})

const bush1 = new three.Mesh(bushesGeo, bushesMat)
const bush2 = new three.Mesh(bushesGeo, bushesMat)
const bush3 = new three.Mesh(bushesGeo, bushesMat)
house.add(bush1, bush2, bush3)

bush1.castShadow = true
bush1.scale.set(.5, .5, .5)
bush1.position.set(1.25, -2.5, .3)
bush2.castShadow = true
bush2.scale.set(.5, .5, .5)
bush2.position.set(-1.25, -2.5, .3)
bush3.castShadow = true
bush3.receiveShadow = true
bush3.scale.set(.25, .25, .25)
bush3.position.set(1.75, -2.75, .15)

// Graves
const graves = new three.Group()
scene.add(graves)
const gravesGeo = new three.BoxGeometry(.75, .25, 1)
const gravesMat = new three.MeshPhongMaterial()

for(let i = 0; i < 25; i++) {
  const angles = Math.random() * (Math.PI * 2)
  const radius = 4 + ( Math.random() * 8)
  const xPosition = Math.sin(angles) * radius
  const yPosition = Math.cos(angles) * radius
  const grave = new three.Mesh(gravesGeo, gravesMat)
  grave.castShadow = true
  grave.rotation.y = (Math.random() - 0.5) * 0.4
  grave.rotation.x = (Math.random () - 0.5) * 0.4
  grave.position.set(xPosition, yPosition, .4)
  graves.add(grave)
}

// Soil
const soil = new three.Mesh(
  new three.PlaneGeometry(25, 25, 100, 100),
  new three.MeshStandardMaterial({
    map: grassTexture.color,
    aoMap: grassTexture.ambientOcclusion,
    normalMap: grassTexture.normal,
    roughnessMap: grassTexture.roughness
  })
)
soil.material.side = three.DoubleSide
soil.receiveShadow = true
scene.add(soil)

soil.geometry.setAttribute(
  "uv2", 
  new three.Float32BufferAttribute(soil.geometry.attributes.uv.array, 2)
)

/**
 * Lights
 */

// Ambient lights
const ambientLight = new three.AmbientLight(0xb9d5ff, .1)
scene.add(ambientLight)

const ambientLightControlFolder = gui.addFolder("Ambient Light").open(false)
ambientLightControlFolder.add(ambientLight, "intensity", 0, 10, .1).name("Intensity")

// Moon lights
const moonLight = new three.DirectionalLight(0xb9d5ff, .3)
moonLight.castShadow = true
moonLight.position.set(-5, 3, 6)

moonLight.shadow.mapSize.width = 1024
moonLight.shadow.mapSize.height = 1024
moonLight.shadow.camera.top = 13
moonLight.shadow.camera.right = 13
moonLight.shadow.camera.bottom = -13
moonLight.shadow.camera.left = -13
moonLight.shadow.camera.near = -5
moonLight.shadow.camera.far = 20

scene.add(moonLight)

const moonLightHelper = new three.CameraHelper(moonLight.shadow.camera)
moonLightHelper.visible = false
scene.add(moonLightHelper)

const moonLightControlFolder = gui.addFolder("Moon Light").open(false)
const moonLightLightingControlFolder = moonLightControlFolder.addFolder("Lighting").open(false)
moonLightLightingControlFolder.add(moonLight, "intensity", 0, 10, .1).name("Intensity")
moonLightLightingControlFolder.add(moonLight, "castShadow").name("Cast Shadow")
moonLightLightingControlFolder.add(moonLightHelper, "visible").name("Helper")
const moonLightPositionControlFolder = moonLightControlFolder.addFolder("Position").open(false)
moonLightPositionControlFolder.add(moonLight.position, "x", -12.5, 12.5, .1).name("X axis")
moonLightPositionControlFolder.add(moonLight.position, "y", -12.5, 12.5, .1).name("Y axis")
moonLightPositionControlFolder.add(moonLight.position, "z", 0, 10, .1).name("z axis")

// Door Light
const doorLiht = new three.Object3D()
house.add(doorLiht)
const doorLightEmission = new three.PointLight(properties.doorLight.color, properties.doorLight.intensity, 7)
doorLightEmission.castShadow = true
doorLightEmission.position.set(0, -1.7, -.7)
const doorLightbulb = new three.Mesh(
  new three.SphereGeometry(.125),
  new three.MeshPhongMaterial({
    emissive:properties.doorLight.color,
    emissiveIntensity: properties.doorLight.intensity
  })
)
doorLightbulb.add(doorLightEmission)
doorLiht.add(doorLightbulb)
doorLiht.position.set(0, -2.0625, 3)

const doorLightHelper = new three.CameraHelper(doorLightEmission.shadow.camera)
doorLightHelper.visible = false
scene.add(doorLightHelper)

const doorLightEmmisionControlFolder = gui.addFolder("Door Light").open(false)
const doorLightEmmisionLightingControlFolder = doorLightEmmisionControlFolder.addFolder("Lighting").open(false)
doorLightEmmisionLightingControlFolder.add(properties.doorLight, "intensity", 0, 100, .1).name("Intensity").onChange(() => {
  doorLightEmission.intensity = properties.doorLight.intensity
  doorLightbulb.material.emissiveIntensity = properties.doorLight.intensity
})
doorLightEmmisionLightingControlFolder.addColor(properties.doorLight, "color").name("Color").onChange(() => {
  doorLightEmission.color = new three.Color(properties.doorLight.color)
  doorLightbulb.material.emissive = new three.Color(properties.doorLight.color)
})
doorLightEmmisionLightingControlFolder.add(doorLightEmission, "castShadow").name("Cast Shadow")
doorLightEmmisionLightingControlFolder.add(doorLightHelper, "visible").name("Helper")
const doorLightEmmisionPositionControlFolder = doorLightEmmisionControlFolder.addFolder("Position").open(false)
doorLightEmmisionPositionControlFolder.add(doorLightEmission.position, "x", -12.5, 12.5, .1).name("X axis")
doorLightEmmisionPositionControlFolder.add(doorLightEmission.position, "y", -12.5, 12.5, .1).name("Y axis")
doorLightEmmisionPositionControlFolder.add(doorLightEmission.position, "z", -10, 10, .1).name("z axis")

/**
 * Gosth
 */
const ghost1 = new three.PointLight (0xff00ff, 1, 3)
const ghost2 = new three.PointLight (0x00ffff, 3, 3)
const ghost3 = new three.PointLight (0xffff00, 5, 3)
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true
scene.add (ghost1, ghost2, ghost3)

/**
 * Camera
 */ 
const camera = new three.PerspectiveCamera(75, aspect)
camera.position.set(0, -6, 6)
scene.add(camera)

/**
 * Controls
 */
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.update()

/**
 * Clock
 */
const clock = new three.Clock()

/**
 * Render
 */
const renderer = new three.WebGLRenderer({
  canvas,
  antialias: true
})
renderer.setSize(sizes.width!, sizes.height!)
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2)
renderer.shadowMap.enabled = true
renderer.setClearColor(0x262837)

const render = () => {
  const elapsedTime = clock.getElapsedTime()

  // Mouve ghosts
  const ghost1sangles = elapsedTime * .54
  ghost1.position.x = Math.abs(Math.cos(ghost1sangles) * (7 + Math.sin(elapsedTime * 0.32)))
  ghost1.position.y = Math.sin(ghost1sangles) * (3 + Math.sin(elapsedTime * 0.52))
  ghost1.position.z = Math.abs(Math.sin(ghost1sangles) * (6 + Math.sin(elapsedTime * 0.02)))
* 4
  const ghost2sangles = -elapsedTime * .32
  ghost2.position.x = Math.abs(Math.cos(ghost2sangles) * (8 + Math.sin(elapsedTime * 0.2)))
  ghost2.position.y = Math.sin(ghost2sangles) * (6 + Math.sin(elapsedTime * 0.3))
  ghost2.position.z = Math.abs(Math.sin(ghost1sangles) * (4 + Math.sin(elapsedTime * 0.02)))

  const ghost3sangles = elapsedTime * .04
  ghost3.position.x = Math.abs(Math.cos(ghost3sangles) * (7 + Math.sin(elapsedTime * 0.02)))
  ghost3.position.y = Math.sin(ghost3sangles) * (7 + Math.sin(elapsedTime * 0.72))
  ghost3.position.z = Math.abs(Math.sin(ghost3sangles) * (4 + Math.sin(elapsedTime * 0.52)))


  orbitControls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)