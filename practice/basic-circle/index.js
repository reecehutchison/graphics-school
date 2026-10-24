function main() {
  let {
    gl,
    a_Position,
    u_ModelMatrix,
    u_FragColor
  } = setupWebGL(VS_BASIC, FS_BASIC)

  let vertices = circlePoints(0.0, 0.0, 0.2, 50)
  let n = buffer_points(gl, vertices, a_Position)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0)

  gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
}