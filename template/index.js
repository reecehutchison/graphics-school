function main() {
  // ------------------------------------------------------------------------------------------
  // 1. SHADERS: pick ONE pair
  //    VS_BASIC + FS_BASIC -> one solid color per draw (u_FragColor)
  //    VS_COLOR + FS_COLOR -> gradient, a color per point in the buffer (a_Color)
  // ------------------------------------------------------------------------------------------
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)

  // grab the extras your shaders have
  const u_FragColor = getUniform(gl, "u_FragColor")   // basic
  // const a_Color = getAttrib(gl, "a_Color")         // gradient

  // ------------------------------------------------------------------------------------------
  // 2. POINTS: put them in the buffer (once, NOT inside a loop)
  // ------------------------------------------------------------------------------------------
  const vertices = [
    0.0, 0.0
  ]
  const n = buffer_points(gl, vertices, a_Position)                              // basic: x, y
  // const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_Color, 3]]) // gradient: x, y, r, g, b
  // shapes: circlePoints(cx, cy, r, slices) gives you the vertices for a circle

  // ------------------------------------------------------------------------------------------
  // 3. BACKGROUND
  // ------------------------------------------------------------------------------------------
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // ------------------------------------------------------------------------------------------
  // 4. MATRIX: identity = no change, ALWAYS send one or nothing shows up
  // ------------------------------------------------------------------------------------------
  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  // ------------------------------------------------------------------------------------------
  // 5. COLOR (basic only, gradient colors are already in the buffer)
  // ------------------------------------------------------------------------------------------
  gl.uniform4fv(u_FragColor, GREEN)

  // ------------------------------------------------------------------------------------------
  // 6. DRAW: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN
  // ------------------------------------------------------------------------------------------
  gl.drawArrays(gl.POINTS, 0, n)

  // ------------------------------------------------------------------------------------------
  // ANIMATION: delete steps 3 to 6 above and use this instead
  // ------------------------------------------------------------------------------------------
  // let angle = 0                       // outside tick so it remembers between frames
  // function tick() {
  //   angle = (angle + 1) % 360         // bigger number = faster
  //   gl.clear(gl.COLOR_BUFFER_BIT)     // wipe the last frame
  //
  //   modelMatrix.setRotate(angle, 0, 0, 1)
  //   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  //   gl.uniform4fv(u_FragColor, GREEN)
  //   gl.drawArrays(gl.POINTS, 0, n)
  //
  //   requestAnimationFrame(tick)       // run again next frame
  // }
  // tick()
}
