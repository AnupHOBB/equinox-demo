import { ImportManager } from './core/ImportManager.js'

let colorContainer = document.getElementById('color-menu-container')
let sliderContainer = document.getElementById('slider-container')
let colorVisible = false
let sliderVisible = true
let sliderHTML = document.getElementById('slider-bar')
let lightSliderVal = sliderHTML.value
let roofSliderVal = sliderHTML.value
let showHotSpot = true

let navBarLight = document.getElementById('nav-bar-light')
navBarLight.addEventListener('click', (e)=>{
    if (!sliderVisible)
    {    
        document.body.appendChild(sliderContainer)
        sliderVisible = true
    }
    sliderHTML.value = lightSliderVal
    sliderHTML.className = 'slider-light'
    changeNavButtonClass('nav-bar-item-outer-selected', 'nav-bar-item-outer', 'nav-bar-item-outer', 'nav-bar-item-outer')
    if (colorVisible)
    {    
        document.body.removeChild(colorContainer)
        colorVisible = false
    }
})

let navBarRoof = document.getElementById('nav-bar-roof')
navBarRoof.addEventListener('click', (e)=>{
    if (!sliderVisible)
    {    
        document.body.appendChild(sliderContainer)
        sliderVisible = true
    }
    sliderHTML.value = roofSliderVal
    sliderHTML.className = 'slider-roof'
    changeNavButtonClass('nav-bar-item-outer', 'nav-bar-item-outer-selected', 'nav-bar-item-outer')
    if (colorVisible)
    {    
        document.body.removeChild(colorContainer)
        colorVisible = false
    }
})

let navBarColor = document.getElementById('nav-bar-color')
navBarColor.addEventListener('click', (e)=>{
    if (!colorVisible)
    {    
        document.body.appendChild(colorContainer)
        colorVisible = true
    }
    changeNavButtonClass('nav-bar-item-outer', 'nav-bar-item-outer', 'nav-bar-item-outer-selected')
    if (sliderVisible)
    {    
        document.body.removeChild(sliderContainer)
        sliderVisible = false
    }
})

let modelViewer = document.createElement('model-viewer')
modelViewer.style = 'width:0%; height:0%'
modelViewer.ar = true
modelViewer.arScale = 'fixed'
modelViewer.src = './assets/LouveredRoof.glb'
document.body.appendChild(modelViewer)

let arButton = document.getElementById('ar-button')
arButton.addEventListener('click', (e)=>modelViewer.activateAR()) 

let videoScreen = document.getElementById('video-screen')
let videoHTML = document.querySelector('video')
let crossIcon = document.getElementById('cross-icon')
crossIcon.addEventListener('click', (e)=>{
    document.body.removeChild(videoScreen)
    showHotSpot = true
})

function changeNavButtonClass(navBarLightClass, navBarRoofClass, navBarColorClass)
{
    navBarLight.className = navBarLightClass
    navBarRoof.className = navBarRoofClass
    navBarColor.className = navBarColorClass
}

function changeModelViewerColor(colorInHex)
{
    const materials = modelViewer.model.materials
    for (let material of materials)
        material.pbrMetallicRoughness.setBaseColorFactor(colorInHex)
}

function setupStartupUI()
{
    let loadingScreen = document.getElementById('loading-screen')
    document.body.removeChild(loadingScreen) 
    document.body.removeChild(colorContainer)
    document.body.removeChild(videoScreen)
    changeNavButtonClass('nav-bar-item-outer-selected', 'nav-bar-item-outer', 'nav-bar-item-outer')
}

window.onload = () =>
{    
    let loadingText = document.getElementById('loading-text')
    let loadingBar = document.getElementById('loading-bar')
    let dots = ''
    let dotCount = 1
    let status = 0    
    let modelStatus = 0
    let textureStatus = 0
    let importStatus = 0
    let queryLoadStatus = true
    let colors = ['#ECF9FF', '#FFFBEB', '#FFE7CC', '#F8CBA6']

    checkLoading()
    function checkLoading()
    {
        if (queryLoadStatus)
        {
            status = Math.round(((modelStatus + textureStatus + importStatus)/300) * 100)
            for(let i=0; i<dotCount; i++)
                dots += '.'
            dotCount++
            if (dotCount > 3)
                dotCount = 1
            if (status > 99)
            { 
                loadingBar.style.width = '100%'
                loadingText.innerHTML = 'SETTING UP SCENE' + dots
            }
            else
            {
                dots += '&nbsp&nbsp&nbsp'
                loadingText.innerHTML = 'LOADING'+ dots +status+'%'
                loadingBar.style.width = status + '%'
            }
            dots = ''
            setTimeout(checkLoading, 100)
        }
    }
    
    let importmanager = new ImportManager()
    importmanager.add('THREE', 'three')
    importmanager.add('MATHS', '../helpers/maths.js')
    importmanager.add('HOTSPOT', '../core/HotSpot.js')
    importmanager.add('SLIDER', '../ui/SliderUI.js')
    importmanager.add('SCENE','../core/SceneManager.js')
    importmanager.add('MISC','../helpers/misc.js')
    importmanager.add('ACTOR','../core/Actor.js')
    importmanager.add('VIDEO','../ui/VideoPlayer.js')
    importmanager.add('ORBITCAM','../camera_managers/OrbitalCameraManager.js')
    importmanager.add('LIGHT','../core/Light.js')
    importmanager.add('INPUT','../core/InputManager.js')
    importmanager.execute((p, t) => { importStatus= Math.round((p/t) * 100) }, onImportComplete)

    function onImportComplete(importMap)
    {
        let SLIDER = importMap.get('SLIDER')
        new SLIDER.SliderUI(sliderHTML, (v)=>{
            if (sliderHTML.className == 'slider-light')
            {    
                lightSliderVal = sliderHTML.value
                directLight.orbit(v)
            }
            else if (sliderHTML.className == 'slider-roof')
            {
                roofSliderVal = sliderHTML.value    
                gltfActor.updateAnimationFrame(-(v/180))
            }
        })
        let THREE = importMap.get('THREE')
        const canvas = document.querySelector('canvas')
        const lookAtPosition = new THREE.Vector3(0, 0, -5)
        let SCENE = importMap.get('SCENE')
        let sceneManager = new SCENE.SceneManager(canvas)
        new THREE.TextureLoader().load('./assets/Colored_Paving_Bricks.png', (texture)=>{
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat = new THREE.Vector2(100, 200)
            texture.anisotropy = 2
            let floor = new ACTOR.ShapeActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial(), true)
            floor.applyTexture(texture)
            floor.setPosition(0, -2, 0)
            sceneManager.register(floor)
            textureStatus = 100
        })
        let MISC = importMap.get('MISC')
        if (!MISC.MISC.isHandHeldDevice())
            document.body.removeChild(arButton)
        let ACTOR = importMap.get('ACTOR')
        new THREE.TextureLoader().load('./assets/envmap.png', (texture)=>{
            let background = new ACTOR.ShapeActor('Background', new THREE.SphereGeometry(100, 256, 16),  new THREE.MeshBasicMaterial( { color: 0xffffff,  map: texture, side: THREE.BackSide }))
            background.setPosition(0, 0, -4.5)
            sceneManager.register(background)
        })
        let gltfActor = new ACTOR.MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{ 
            let loadStat = Math.round((xhr.loaded/ xhr.total) * 100) 
            if (loadStat < 100)
                modelStatus = loadStat
        }, ()=>{
            modelStatus = 100
            onLoadingComplete(sceneManager, cameraManager, gltfActor, importMap)
        })
        gltfActor.applyColor(MISC.MISC.hexToColor(colors[0]))
        modelViewer.color = colors[0]
        gltfActor.setPosition(2, -2, -3)
        sceneManager.register(gltfActor) 
        let ORBITCAM = importMap.get('ORBITCAM')
        let cameraManager = new ORBITCAM.OrbitalCameraManager('Camera', 90, lookAtPosition)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        let LIGHT = importMap.get('LIGHT')
        let directLight = new LIGHT.DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
        sceneManager.register(directLight)
        sceneManager.register(new LIGHT.AmbientLight('AmbientLight', 0xffffff, 0.8))
        let INPUT = importMap.get('INPUT')
        sceneManager.register(new INPUT.InputManager('Input', canvas))
    }

    function onLoadingComplete(sceneManager, cameraManager, gltfActor, importMap)
    {
        let HOTSPOT = importMap.get('HOTSPOT')
        let MATHS = importMap.get('MATHS')
        let THREE = importMap.get('THREE')
        let VIDEO = importMap.get('VIDEO')
        let MISC = importMap.get('MISC')
        let videoPlayer = new VIDEO.VideoPlayer('./assets/vid.mp4')
        let hotSpot1 = new HOTSPOT.Hotspot('assets/hotspot.png', MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.55, 2.4, 0.01)))
        hotSpot1.setRenderCondition(()=>{ return showHotSpot })
        hotSpot1.setOnClick((e)=>{   
            document.body.appendChild(videoScreen)
            videoHTML.play()
            showHotSpot = false 
        })
        hotSpot1.setOnMove(()=>videoPlayer.hide())
        hotSpot1.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot1.worldPosition))
        let hotSpot2 = new HOTSPOT.Hotspot('assets/hotspot.png', MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-0.85, 2.4, 0.01)))
        hotSpot2.setRenderCondition(()=>{ return showHotSpot })
        hotSpot2.setOnClick((e)=>{
            document.body.appendChild(videoScreen)
            videoHTML.play()
            showHotSpot = false
        })
        hotSpot2.setOnMove(()=>videoPlayer.hide())
        hotSpot2.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot2.worldPosition))
        let hotSpot3 = new HOTSPOT.Hotspot('assets/hotspot.png', MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.25, 2.4, -3.4)))
        hotSpot3.setRenderCondition(()=>{ return showHotSpot })
        hotSpot3.setOnClick((e)=>{
            document.body.appendChild(videoScreen)
            videoHTML.play()
            showHotSpot = false
        })
        hotSpot3.setOnMove(()=>videoPlayer.hide())
        hotSpot3.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot3.worldPosition))
        gltfActor.addHotSpots(hotSpot1)
        gltfActor.addHotSpots(hotSpot2)
        gltfActor.addHotSpots(hotSpot3)
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
                let color = MISC.MISC.toColor(style.getPropertyValue('background-color'))
                gltfActor.applyColor(color)
                changeModelViewerColor(colors[i])
            }  
            colorMenu.appendChild(colorItem)
        }
        queryLoadStatus = false
        setupStartupUI()
    }
}