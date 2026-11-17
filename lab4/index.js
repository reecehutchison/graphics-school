function main() {
  const { gl } = setupWebGL()

  const box = makeShape(gl, cube())
  const ball = makeShape(gl, sphere(30))
  const tube = makeShape(gl, cylinder(30))

  const cam = { eye: [0, 2, 10], at: [0, 0, 0], yaw: 0, fov: 60, near: 1, far: 100 }

  const LIGHTBLUE = [0.45, 0.95, 1.0, 1.0]
  const BROWN = [0.55, 0.35, 0.15, 1.0]

  gl.clearColor(...LIGHTBLUE)
  gl.enable(gl.DEPTH_TEST)

  const model = new Matrix4()
  let charX = 0
  let charZ = 0

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    cam.at = [cam.eye[0] + Math.sin(cam.yaw), cam.eye[1] - 0.2, cam.eye[2] - Math.cos(cam.yaw)]
    const vp = viewProjMatrix(gl, cam)

    model.setTranslate(0, -1, 0).scale(100, 0.01, 100)
    drawPart(gl, box, vp, model, GREEN)

    for (let i = 0; i < 50; i ++) {
      model.setTranslate(-10, -0.5, -100 + (i * 5)).scale(0.8, 0.8, 0.8)
      drawPart(gl, ball, vp, model, MAGENTA)
    }

    for (let i = 0; i < 50; i ++) {
      model.setTranslate(10, -0.5, -100 + (i * 5)).scale(0.8, 0.8, 0.8)
      drawPart(gl, ball, vp, model, MAGENTA)
    }

    model.setTranslate(charX, 1, charZ).scale(2.1, 2.1, 2.1)
    drawPart(gl, ball, vp, model, RED)

    model.setTranslate(charX, 1.0, charZ + 0.5).scale(1.8, 1.9, 1.8)
    drawPart(gl, ball, vp, model, BLUE)

    model.setTranslate(charX, 3.7, charZ + 0.7).scale(1.2, 1.2, 1.2)
    drawPart(gl, ball, vp, model, BLUE)

    model.setTranslate(charX, 2.7, charZ + 0.4).rotate(-55, 1, 0, 0).scale(2, 1.3, 0.5)
    drawPart(gl, ball, vp, model, WHITE)

    model.setTranslate(charX + 1.2, 1.2, charZ + 0.8).rotate(50, 0, 1, 0).scale(0.6, 1.3, 1.3)
    drawPart(gl, ball, vp, model, WHITE)

    model.setTranslate(charX - 1.2, 1.2, charZ + 0.8).rotate(-50, 0, 1, 0).scale(0.6, 1.3, 1.3)
    drawPart(gl, ball, vp, model, WHITE)

    model.setTranslate(charX + 1, -0.5, charZ + 1).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, ORANGE)

    model.setTranslate(charX - 1, -0.5, charZ + 1).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, ORANGE)

    model.setTranslate(charX - 2, 1.4, charZ + 0.4).rotate(45, 0, 1, 0).rotate(105, 0, 0, 1).scale(0.7, 1.5, 0.7)
    drawPart(gl, tube, vp, model, RED)

    model.setTranslate(charX + 2, 1.4, charZ + 0.4).rotate(-45, 0, 1, 0).rotate(-105, 0, 0, 1).scale(0.7, 1.5, 0.7)
    drawPart(gl, tube, vp, model, RED)

    model.setTranslate(charX + 3.4, 0.9, charZ + 1.8).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, WHITE)

    model.setTranslate(charX - 3.4, 0.9, charZ + 1.8).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, WHITE)

    model.setTranslate(charX - 3.6, 0.8, charZ + 2.0).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, ORANGE)

    model.setTranslate(charX + 3.6, 0.8, charZ + 2.0).scale(0.8, 0.8, 0.8)
    drawPart(gl, ball, vp, model, ORANGE)

    model.setTranslate(charX - 3.5, 1.3, charZ + 2.5).scale(0.3, 2, 0.3)
    drawPart(gl, tube, vp, model, BROWN)

    model.setTranslate(charX - 3.5, 3, charZ + 2.5).rotate(90, 1, 0, 0).scale(0.8, 1, 0.8)
    drawPart(gl, tube, vp, model, BROWN)

    model.setTranslate(charX - 3.5, 3, charZ + 3.6).rotate(90, 1, 0, 0).scale(0.8, 0.1, 0.8)
    drawPart(gl, tube, vp, model, WHITE)

    model.setTranslate(charX - 3.5, 3, charZ + 1.4).rotate(90, 1, 0, 0).scale(0.8, 0.1, 0.8)
    drawPart(gl, tube, vp, model, WHITE)

    model.setTranslate(charX - 3.5, 3, charZ + 3.8).rotate(90, 1, 0, 0).scale(0.8, 0.1, 0.8)
    drawPart(gl, tube, vp, model, RED)

    model.setTranslate(charX - 3.5, 3, charZ + 1.2).rotate(90, 1, 0, 0).scale(0.8, 0.1, 0.8)
    drawPart(gl, tube, vp, model, RED)
  }


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
