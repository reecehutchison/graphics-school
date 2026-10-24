function main() {
  let {
    gl,
    a_Position,
    u_ModelMatrix,
    u_FragColor
  } = setupWebGL(VS_BASIC, FS_BASIC)

  let vertices = [
    0.05, 0.05,
    0.05, -0.05,
    -0.05, -0.05,
    -0.05, 0.05
  ]

  const COLORS = [
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0]
  ]

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  let n = buffer_points(gl, vertices, a_Position)

  const modelMatrix = new Matrix4()

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const colorIndex = (i + j) % 3
      gl.uniform4f(u_FragColor, ...COLORS[colorIndex])
      
      modelMatrix.setTranslate((i - 1.5) * 0.3, (j - 1.5) * 0.3, 0)
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

      gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
    }
  }
  
  

}