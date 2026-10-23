function main() {
  const {
    canvas, 
    gl, 
    a_Position,
    u_ModelMatrix,
    u_FragColor
  } = setupWebGL(VS_BASIC, FS_BASIC)

  myArr = [
    0.2, -0.2,
    -0.2, -0.2,
    0.2, 0.2,
    -0.2, 0.2,
    -0.2, -0.2
  ]

  vertCount = buffer_points(gl, myArr, a_Position)
  
  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertCount)
}