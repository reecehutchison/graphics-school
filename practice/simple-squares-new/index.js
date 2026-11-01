function main() {
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color
  
  const shape = makeShape(gl, basic, [
    0.1, 0.1,
    0.1, -0.1,
    -0.1, -0.1,
    -0.1, 0.1
  ])

  const colors = [RED, BLUE, GREEN, YELLOW]

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  useShape(gl, shape)

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      modelMatrix.setTranslate((i - 0.5) * 0.8, (j - 0.5) * 0.8, 0)
      modelMatrix.scale(2, 2, 1)
      gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
      gl.uniform4fv(shape.u_FragColor, RED)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
    }
  }
}
