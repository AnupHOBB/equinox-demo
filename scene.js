import { MATHS } from './helpers/maths.js'
import { Hotspot } from './core/HotSpot.js'
import { SliderUI } from './ui/SliderUI.js'

window.onload = () =>
{
    let THREE
    let gltfActor 
    let sceneManager
    let cameraManager
    let directLight
    let floor
    let videoPlayer
    let MISC

    new SliderUI(document.getElementById('slider-light'), (v)=>directLight.orbit(v))
    new SliderUI(document.getElementById('slider-roof'), (v)=>gltfActor.updateAnimationFrame(-(v/180)))
    
    let loadingText = document.getElementById('loading-text')
    let loadingBar = document.getElementById('loading-bar')
    let dots = ''
    let dotCount = 1
    let status = 0    
    let modelStatus = 0
    let textureStatus = 0
    let jsFilesStatus = 0

    checkLoading()
    function checkLoading()
    {
        status = Math.round(((modelStatus + textureStatus + jsFilesStatus)/300) * 100)
        if (status > 99)
        { 
            loadingBar.style.width = '100%'
            loadingText.innerHTML = 'LOADING COMPLETE'
            setTimeout(onLoadingComplete, 500)
        }
        else
        {
            for(let i=0; i<dotCount; i++)
                dots += '.'
            dotCount++
            if (dotCount > 3)
                dotCount = 1
            dots += '&nbsp&nbsp&nbsp'
            loadingText.innerHTML = 'LOADING'+ dots +status+'%'
            dots = ''
            loadingBar.style.width = status + '%'
            setTimeout(checkLoading, 100)
        }
    }

    function onLoadingComplete()
    {
        let hotSpot1 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.55, 2.4, 0.01)))
        hotSpot1.setOnHold((e)=>videoPlayer.show(e.clientX, e.clientY))
        hotSpot1.setOnMove(()=>videoPlayer.hide())
        hotSpot1.setOnClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot1.worldPosition))
        let hotSpot2 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-0.85, 2.4, 0.01)))
        hotSpot2.setOnHold((e)=>videoPlayer.show(e.clientX, e.clientY))
        hotSpot2.setOnMove(()=>videoPlayer.hide())
        hotSpot2.setOnClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot2.worldPosition))
        let hotSpot3 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.25, 2.4, -3.4)))
        hotSpot3.setOnHold((e)=>videoPlayer.show(e.clientX, e.clientY))
        hotSpot3.setOnMove(()=>videoPlayer.hide())
        hotSpot3.setOnClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot3.worldPosition))
        gltfActor.addHotSpots(hotSpot1)
        gltfActor.addHotSpots(hotSpot2)
        gltfActor.addHotSpots(hotSpot3)
        let loadingScreen = document.getElementById('loading-screen')
        document.body.removeChild(loadingScreen) 
    }

    let colors = ['#ECF9FF', '#FFFBEB', '#FFE7CC', '#F8CBA6']
    let colorMenu = document.getElementById('color-menu')
    for(let i=0; i<colors.length; i++)
    {
        let colorItem = document.createElement('div')
        colorItem.id = 'color-item'+i
        colorItem.className = 'color-item'
        colorItem.style.backgroundColor = colors[i]
        colorItem.onclick = ()=>
        {
            let style = window.getComputedStyle(colorItem)
            let color = MISC.toColor(style.getPropertyValue('background-color'))
            gltfActor.applyColor(color)
        }  
        colorMenu.appendChild(colorItem)
    }

    importAll()
    function importAll()
    {
        import("three").then((THR)=>{
            THREE = THR
            const canvas = document.querySelector('canvas')
            const lookAtPosition = new THREE.Vector3(0, 0, -5)
            const axis = new THREE.Vector3(0, -1, 0)
            import("./core/SceneManager.js").then((M)=>{
                sceneManager = new M.SceneManager(canvas)
                jsFilesStatus += 12.5
                import("./helpers/misc.js").then((M)=>{
                    MISC = M.MISC
                    import("./core/Actor.js").then((M)=>{
                        gltfActor = new M.MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{modelStatus = Math.round((xhr.loaded/ xhr.total) * 100)})
                        gltfActor.applyColor(MISC.hexToColor(colors[0]))
                        gltfActor.setPosition(2, -2, -3)
                        sceneManager.register(gltfActor) 
                        floor = new M.FloorActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial(), true)
                        let texture = new THREE.TextureLoader().load('./assets/Colored_Paving_Bricks.png', ()=>{
                            textureStatus = 100 
                        })
                        texture.wrapS = THREE.RepeatWrapping
                        texture.wrapT = THREE.RepeatWrapping
                        texture.repeat = new THREE.Vector2(100, 200)
                        texture.anisotropy = 2
                        floor.applyTexture(texture)
                        floor.setPosition(0, -2, 0)
                        sceneManager.register(floor)
                        jsFilesStatus += 12.5
                    })
                    import("./ui/VideoPlayer.js").then((M)=>{
                        videoPlayer = new M.VideoPlayer('./assets/vid.mp4')
                        jsFilesStatus += 12.5
                    })
                    jsFilesStatus += 12.5
                })     
                import("./camera_managers/OrbitalCameraManager.js").then((M)=>{
                    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))
                    cameraManager = new M.OrbitalCameraManager('Camera', 90, axis, lookAtPosition)
                    sceneManager.register(cameraManager)
                    sceneManager.setActiveCamera('Camera')
                    jsFilesStatus += 12.5
                })
                import("./core/Light.js").then((M)=>{
                    directLight = new M.DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
                    sceneManager.register(directLight)
                    sceneManager.register(new M.AmbientLight('AmbientLight', 0xffffff, 0.8))
                    jsFilesStatus += 12.5
                })
                import("./core/InputManager.js").then((M)=>{
                    sceneManager.register(new M.InputManager('Input', canvas))
                    jsFilesStatus += 12.5
                })
                jsFilesStatus += 12.5
            })
        })
    }
}