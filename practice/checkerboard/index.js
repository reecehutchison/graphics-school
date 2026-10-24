function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
  const u_FragColor = getUniform(gl, "u_FragColor")   

  let vertices = [
    0.1, 0.1,
    0.1, -0.1,
    -0.1, -0.1,
    -0.1, 0.1
  ]
  let n = buffer_points(gl, vertices, a_Position)
  
  
  gl.clearColor(0.8, 0.8, 0.8, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

 
  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  let count = 0
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      modelMatrix.setTranslate((i * 0.2) - 0.6, (j * 0.2) - 0.6, 0)
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
      if (count == 0) {
        gl.uniform4fv(u_FragColor, BLACK)
      } else {
        gl.uniform4fv(u_FragColor, WHITE)
      }
      gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
      count = (count + 1) % 2
    }
  }
  
  vertices = circlePoints(0.0, 0.0, 0.07, 50)
  n = buffer_points(gl, vertices, a_Position)

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (j == 0 || j == 1 || j == 5 || j == 6) {
        modelMatrix.setTranslate((i * 0.2) - 0.6, (j * 0.2) - 0.6, 0)
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
        if (j == 0 || j == 1) {
          gl.uniform4fv(u_FragColor, BLUE)
        }  else {
          gl.uniform4fv(u_FragColor, RED)
        }       
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
      }
    }
  }
}
