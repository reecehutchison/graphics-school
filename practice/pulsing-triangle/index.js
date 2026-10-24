function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
  const u_FragColor = getUniform(gl, "u_FragColor")   // basic

  const vertices = [
    0.0, 0.3,
    -0.3, -0.2,
    0.3, -0.2
  ]
  const n = buffer_points(gl, vertices, a_Position)                              
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  let color = 0.0
  let up = true
  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform4f(u_FragColor, color, 0.0, 0.0, 1.0)
    gl.drawArrays(gl.TRIANGLES, 0, n)
    
    if (color > 1) {
      up = false
    } 

    if (color < 0.0) {
      up = true
    }

    if (up) {
      color = (color + 0.01)
    } else {
      color = (color - 0.01)
    }

    requestAnimationFrame(tick)
  }
  tick()
}
