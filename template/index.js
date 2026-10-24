function main() {
  // 1. choose shaders: BASIC (one solid color) or COLOR (gradient)
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
  const u_FragColor = getUniform(gl, "u_FragColor")   // basic
  // const a_Color = getAttrib(gl, "a_Color")         // color

  // 2. put vertices in the buffer (basic: x, y   color: x, y, r, g, b)
  const vertices = [
    0.0, 0.0
  ]
  const n = buffer_points(gl, vertices, a_Position)                              // basic
  // const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_Color, 3]]) // color

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

  // animation: delete 5 and 6, use this instead
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
