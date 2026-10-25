function main() {
  // 1. choose shaders: BASIC (one solid color), COLOR (gradient) or TEX (image)
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
  const u_FragColor = getUniform(gl, "u_FragColor")   // basic
  // const a_Color = getAttrib(gl, "a_Color")         // color
  // const a_TexCoord = getAttrib(gl, "a_TexCoord")   // tex
  // const u_Sampler = getUniform(gl, "u_Sampler")    // tex

  // 2. put vertices in the buffer (basic: x, y   color: x, y, r, g, b   tex: x, y, u, v)
  let vertices = [
    0.0, 0.0
  ]
  let n = buffer_points(gl, vertices, a_Position)                              // basic

  // Note: if you use '...RED' in your vertices, then make sure to change the 3 to 4!!!
  // const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_Color, 3]]) // color
  // const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_TexCoord, 2]]) // tex

  // 3. background
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4. matrix (always send one, identity = no change)
  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  // 5. color (basic only)
  gl.uniform4fv(u_FragColor, GREEN)

  // 6. draw
  gl.drawArrays(gl.POINTS, 0, n)

  // tex: delete 5 and 6, draw INSIDE loadTextures instead (images take time to load)
  // loadTextures(gl, ["./test.png"], () => {
  //   gl.clear(gl.COLOR_BUFFER_BIT)   // clear again in here or the background goes white
  //   gl.uniform1i(u_Sampler, 0)   // which image: 0 = first in the list
  //   gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
  // })

  // animation: delete 5 and 6, use this instead (tex: call tick() inside loadTextures)
  // let angle = 0
  // function tick() {
  //   angle = (angle + 1) % 360
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   modelMatrix.setRotate(angle, 0, 0, 1)
  //   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  //   gl.uniform4fv(u_FragColor, GREEN)
  //   gl.drawArrays(gl.POINTS, 0, n)
  //   requestAnimationFrame(tick)
  // }
  // tick()
}
