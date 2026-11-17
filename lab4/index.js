function main() {
  // 1. setup: canvas + gl + the 3D shaders
  const { gl } = setupWebGL()

  // 2. shapes onto the gpu ONCE: all fit in -1..1 around 0, 0, 0 (scale = radius / half the size)
  const box = makeShape(gl, cube())
  const ball = makeShape(gl, sphere(30))
  const tube = makeShape(gl, cylinder(30))

  // 3. camera: the keys change these, then draw() again
  //   yaw = which way the camera faces (0 = looking down -z, into the screen), at gets worked out from it
  const cam = { eye: [0, 2, 10], at: [0, 0, 0], yaw: 0, fov: 30, near: 1, far: 30 }

  // 4. background (sky) + depth test (closest thing wins, not last drawn)
  gl.clearColor(0.45, 0.95, 1.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  const model = new Matrix4()

  // 5. draw the whole scene, call again whenever something changes
  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    cam.at = [cam.eye[0] + Math.sin(cam.yaw), cam.eye[1] - 0.2, cam.eye[2] - Math.cos(cam.yaw)]
    const vp = viewProjMatrix(gl, cam)

    model.setTranslate(0, -1, 0).scale(10, 0.01, 10)
    drawPart(gl, box, vp, model, GREEN)

    model.setTranslate(-3, 0, 0).scale(0.7, 0.7, 0.7)
    drawPart(gl, box, vp, model, RED)

    model.setTranslate(-1, 0, 0).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, BLUE)

    model.setTranslate(1, 0, 0).scale(0.5, 1, 0.5)
    drawPart(gl, tube, vp, model, ORANGE)

    model.setTranslate(3, 0, 0).scale(0.6, 1, 0.6)
    drawPart(gl, pointy, vp, model, YELLOW)
  }

  // 6. keys: change the camera, then redraw
  //   w a s d = move (forward = the way the camera faces)   up / down = camera up / down   left / right = turn
  //   = / - = fov   n / m = near   f / g = far
  const STEP = 0.3
  const TURN = 0.05
  document.onkeydown = (ev) => {
    const key = ev.key.toLowerCase()
    const forward = [Math.sin(cam.yaw), -Math.cos(cam.yaw)]
    const right = [Math.cos(cam.yaw), Math.sin(cam.yaw)]

    if (key == "w") { cam.eye[0] += forward[0] * STEP; cam.eye[2] += forward[1] * STEP }
    if (key == "s") { cam.eye[0] -= forward[0] * STEP; cam.eye[2] -= forward[1] * STEP }
    if (key == "d") { cam.eye[0] += right[0] * STEP; cam.eye[2] += right[1] * STEP }
    if (key == "a") { cam.eye[0] -= right[0] * STEP; cam.eye[2] -= right[1] * STEP }
    if (key == "arrowup") { cam.eye[1] += STEP }
    if (key == "arrowdown") { cam.eye[1] -= STEP }
    if (key == "arrowleft") { cam.yaw -= TURN }
    if (key == "arrowright") { cam.yaw += TURN }

    if (key == "=") { cam.fov = Math.min(cam.fov + 1, 170) }
    if (key == "-") { cam.fov = Math.max(cam.fov - 1, 1) }
    if (key == "n") { cam.near = Math.max(cam.near - 0.5, 0.1) }
    if (key == "m") { cam.near += 0.5 }
    if (key == "f") { cam.far = Math.max(cam.far - 2, cam.near + 0.1) }
    if (key == "g") { cam.far += 2 }

    if (key.startsWith("arrow")) { ev.preventDefault() }
    draw()
  }

  draw()
}
