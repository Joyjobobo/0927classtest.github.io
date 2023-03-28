

let camera, renderer, scene
let controls
let pointLight1, pointLight2, pointLight3
let pointLight4, pointLight5, pointLight6
let pointLight7
let ambientLight
let clock = new THREE.Clock()


let player, activeCamera
let speed = 3 //移动速度
let turnSpeed = 1
let move = {
  forward: 0,
  turn: 0
}

let colliders = [] //碰撞物
let debugMaterial = new THREE.MeshBasicMaterial({
  color:0xff0000,
  wireframe: true
})

let arrowHelper1, arrowHelper2
let joystick //移动设备控制器

function init() {
  createScene()
  createObjects()
  createColliders()
  createPlayer()
  createCamera()
  createLights()
  //createLightHelpers()
  //createControls()
  createEvents()
  createJoyStick()
  render()
}

function createJoyStick() {
  
  joystick = new JoyStick({
    onMove: function(forward, turn) {
      turn = -turn
      if(Math.abs(forward) < 0.3) forward = 0
      if(Math.abs(turn) < 0.1) turn = 0
      move.forward = forward
      move.turn = turn
    }
  })
}

function createEvents() {
  document.addEventListener('keydown', onKeyDown)
	document.addEventListener('keyup', onKeyUp)
}

function createColliders() {
  const loader = new THREE.GLTFLoader()
  loader.load(
    'model/collider.glb',
    gltf => {
      gltf.scene.traverse(child => {
        if(child.name.includes('collider')) {
          colliders.push(child)
        }
      })
      colliders.forEach(item=> {
        item.visible = false
        scene.add(item)
      })
    }
  )
  
}

function onKeyDown(event) {
  switch ( event.code ) {
    case 'ArrowUp':
    case 'KeyW':
      move.forward = 1
      break

    case 'ArrowLeft':
    case 'KeyA':
      move.turn = turnSpeed
      break

    case 'ArrowDown':
    case 'KeyS':
      move.forward = -1
      break

    case 'ArrowRight':
    case 'KeyD':
      move.turn = -turnSpeed
      break
    case 'Space':
      break
  }
}

function onKeyUp(event) {
  switch ( event.code ) {

    case 'ArrowUp':
    case 'KeyW':
      move.forward = 0
      break

    case 'ArrowLeft':
    case 'KeyA':
      move.turn = 0
      break

    case 'ArrowDown':
    case 'KeyS':
      move.forward = 0
      break

    case 'ArrowRight':
    case 'KeyD':
      move.turn = 0
      break

  }
}

function createPlayer() {
  const geometry = new THREE.BoxGeometry(1, 2, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  })
  player = new THREE.Mesh(geometry, material)
  player.name = 'player'
  geometry.translate(0, 1, 0)
  player.position.set(-5, 0, 5)
  //scene.add(player)
}

function createCamera() {
  const back = new THREE.Object3D()
  back.position.set(0, 2, 1)
  back.parent = player
  //player.add(back)
  activeCamera = back
}

function createScene() {
  renderer = new THREE.WebGLRenderer({
    antialias: false
  })
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  // renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 2, 16)

  scene = new THREE.Scene()
  
  const container = document.querySelector('#container')
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onResize)
}

function createLights() {
  ambientLight = new THREE.AmbientLight(0xe0ffff, 0.6)
  scene.add(ambientLight)

  pointLight1 = new THREE.PointLight(0xe0ffff, 0.1, 20) 
  pointLight1.position.set(-2, 3, 2)

  scene.add(pointLight1)
}

function createLightHelpers() {
  
  const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 1)
  scene.add(pointLightHelper1)

}

function createControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
}


function createObjects() {
  const loader = new THREE.GLTFLoader()
  loader.load(
    'model/shanghaiposition.glb',
    gltf => {
      gltf.scene.traverse(child => {
        switch(child.name) {
          case 'walls':
            initWalls(child)
            break
        }

      })
      scene.add(gltf.scene)
    }
  )
}


function initWalls(child) {
  child.material = new THREE.MeshStandardMaterial({
    color: 0xffffff
  })
  child.material.roughness = 0.5
  child.material.metalness = 0.6
}

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}
function addLight() {
  var light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(0, 10, 0);
}

function render() {
  const dt = clock.getDelta()
  update(dt)
  renderer.render(scene, camera)
  window.requestAnimationFrame(render)

}

function update(dt) {
  updatePlayer(dt)
  updateCamera(dt)
}

function updatePlayer(dt) {

  const pos = player.position.clone()
  pos.y += 2
  let dir = new THREE.Vector3()
  dir.x = 0;
  dir.y = 2;
  dir.z = 16;
 
  player.getWorldDirection(dir)
  dir.negate()

  if (move.forward < 0) dir.negate()
  let raycaster = new THREE.Raycaster(pos, dir)
  let blocked = false

  if(colliders.length > 0) {
    const intersect = raycaster.intersectObjects(colliders)
    if (intersect.length > 0) {
      if (intersect[0].distance < 1) {
        blocked = true
      }
    }
  }

  if(!blocked) {
    if(move.forward !== 0) { 
      if (move.forward > 0) {
        player.translateZ(-dt * speed)
      } else {
        player.translateZ(dt * speed * 0.5)
      }
    }
  }

  if(move.turn !== 0) {
    player.rotateY(move.turn * dt)
  }
}

function updateCamera(dt) {
  //更新摄像机
  camera.position.lerp(
    activeCamera.getWorldPosition(
      new THREE.Vector3()
    ), 
    0.08
  )
	const pos = player.position.clone()
  pos.y += 2 
	camera.lookAt(pos)
}

init()