function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
  const u_FragColor = getUniform(gl, "u_FragColor")

  let vertices = [
    0.05, 0.05,
    0.05, -0.05,
    -0.05, -0.05,
    -0.05, 0.05
  ]
  let n = buffer_points(gl, vertices, a_Position)
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  
  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  
  let angle = 0
  let slide = 0
  let dir = false
  const colors = [RED, BLUE, YELLOW, GREEN]

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    if (slide > 0.05) dir = false
    if (slide < -0.05) dir = true
    if (dir) slide = (slide + 0.001)
    else slide = (slide - 0.001)
        
    angle = (angle + 1) % 360

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        
        modelMatrix.setTranslate((i * 0.2) - 0.3, (j * 0.2) - 0.3, 0)

        if (j == 0) modelMatrix.rotate(angle, 0, 1, 0)
        else if (j == 1) modelMatrix.translate(0, slide, 0)
        else if (j == 2) modelMatrix.translate(slide, 0, 0)
        else modelMatrix.rotate(angle, 1, 0, 0)
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
        gl.uniform4fv(u_FragColor, colors[j])
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
      }
    }

    requestAnimationFrame(tick)
  }
  tick()
}
