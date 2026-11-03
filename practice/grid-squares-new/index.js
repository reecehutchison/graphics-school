function main() {
  const { gl } = setupWebGL()
  
  const grad = makeProgram(gl, VS_COLOR, FS_COLOR) // gradient
  
  const shape = makeShape(gl, grad, [
    0.05, 0.05, ...GREEN,
    0.05, -0.05, ...RED,
    -0.05, -0.05, ...BLUE,
    -0.05, 0.05, ...YELLOW
  ])

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  let angle = 0
  let slide = 0
  let dir = false

  function tick() {
    angle = (angle + 1) % 360
    if (slide > 0.05) dir = false
    if (slide < -0.05) dir = true
    if (dir) slide = (slide + 0.001)
    else slide = (slide - 0.001)

    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        useShape(gl, shape)
        modelMatrix.setTranslate((i * 0.2) - 0.3, (j * 0.2) - 0.3, 0)

        if (j == 0) modelMatrix.rotate(angle, 0, 0, 1)
        if (j == 1) modelMatrix.rotate(angle, 1, 0, 0)
        if (j == 2) modelMatrix.rotate(angle, 0, 1, 0)
        if (j == 3) modelMatrix.translate(slide, 0, 0)

        gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
        gl.uniform4fv(shape.u_FragColor, GREEN)
        gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
      }
    }

    requestAnimationFrame(tick)
  }
  tick()
}
