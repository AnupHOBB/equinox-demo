import * as THREE from 'three'
import { SceneManager } from './core/SceneManager.js'
import { FirstPersonCameraManager } from './camera_managers/FirstPersonCameraManager.js'
import { OrbitalCameraManager } from './camera_managers/OrbitalCameraManager.js'
import { DirectLight } from './core/Light.js'
import { AmbientLight } from './core/Light.js'
import { VideoPlayer } from './ui/VideoPlayer.js'
import { MATHS } from './helpers/maths.js'
import { GLTFActor, StaticActor } from './core/Actor.js'
import { SliderUI } from './ui/SliderUI.js'
import { InputManager } from './core/InputManager.js'

window.onload = () =>
{
    const DEBUG = true

    new SliderUI((v)=>directLight.orbit(v))
    const videoPlayer = new VideoPlayer('./assets/vid.mp4', 480, 270)

    const gltfActor = new GLTFActor('Roof', './assets/LouveredRoof.glb')
    gltfActor.setPosition(2, -2, -3)
    gltfActor.addHotSpots('assets/hotspot.png', new THREE.Vector3(-2.15, 2.6, 0.08), (e)=> {
        videoPlayer.setLocation(e.clientX, e.clientY)
        videoPlayer.show()
    }, ()=>videoPlayer.hide())
    if (DEBUG)
        gltfActor.applyTexture('./assets/fire.jpg')
        
    const canvas = document.querySelector('canvas')

    const sceneManager = new SceneManager(canvas)
    sceneManager.add(gltfActor)    

    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    const axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))
    const cameraManager = (DEBUG) ? new FirstPersonCameraManager('Camera', 90) : new OrbitalCameraManager('Camera', 90, axis, lookAtPosition)
    sceneManager.add(cameraManager)
    sceneManager.setActiveCamera('Camera')

    const directLight = new DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
    directLight.showGizmo(DEBUG)
    sceneManager.add(directLight)

    const floor = new StaticActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial({color: 0x44aa88}), true)
    floor.setPosition(0, -2, 0)
    sceneManager.add(floor)
    sceneManager.add(new AmbientLight('AmbientLight', 0xffffff, 0.8))
    sceneManager.add(new InputManager('Input', canvas))
}