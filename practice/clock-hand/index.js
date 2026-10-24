function main() {
  let {
    gl,
    a_Position,
    u_ModelMatrix,
    u_FragColor
  } = setupWebGL(VS_BASIC, FS_BASIC)

  let vertices = [0.0, 0.0]
  let n = buffer_points(gl, vertices, a_Position)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0)

  let angle = 0
  function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    modelMatrix.setRotate(angle, 0, 0, 1)
    modelMatrix.translate(0.3, 0, 0)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

    gl.drawArrays(gl.POINTS, 0, n)
    
    angle = (angle - 1) % 360
    requestAnimationFrame(tick)
  }
  tick()
}