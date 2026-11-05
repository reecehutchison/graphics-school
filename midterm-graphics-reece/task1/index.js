function main() {
  const { gl } = setupWebGL()
  const grad = makeProgram(gl, VS_COLOR, FS_COLOR) // gradient

  const shape = makeShape(gl, grad, [
    0.2, 0.2, ...RED,
    0.2, -0.2, ...BLUE,
    -0.2, -0.2, ...GREEN,
    -0.2, 0.2, ...YELLOW
  ])

  gl.clearColor(...BLACK, 1.0) // background set to black
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  const canvasWidth = 2
  const spacing = canvasWidth / 4
  const offset = 1.5

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      useShape(gl, shape)
      modelMatrix.setTranslate((i - offset) * spacing, (j - offset) * spacing, 0)
      gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
    }
  }
}
