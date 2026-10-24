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
  let n = buffer_points(gl, vertices, a_Position)

  const modelMatrix = new Matrix4()
  modelMatrix.setRotate(25, 0, 0, 1)
  modelMatrix.scale(2, 0.5, 1)
  modelMatrix.translate(0.3, 0, 0)
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)



  gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
}