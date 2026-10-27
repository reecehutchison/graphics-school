function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_COLOR, FS_COLOR)
  const a_Color = getAttrib(gl, "a_Color")

  let sky_verts = [
    1.0, 1.0, ...BLUE,
    1.0, -1.0, ...ORANGE,
    -1.0, -1.0, ...ORANGE,
    -1.0, 1.0, ...PURPLE
  ]

  let sun_verts = circlePoints(0, 0, 0.5, 10)

  let verts = sky_verts

  for (let i = 0; i < sun_verts.length; i += 2) {
    if (i == 0) 
      verts.push(sun_verts[i], sun_verts[i + 1], ...WHITE)
    else
      verts.push(sun_verts[i], sun_verts[i + 1], ...YELLOW)
  }

  const n = buffer_interleaved(gl, verts, [[a_Position, 2], [a_Color, 4]]) // gradient

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  let angle = 0
  function tick() {
    angle = (angle + 0.2) % 360
    gl.clear(gl.COLOR_BUFFER_BIT)
    modelMatrix.setIdentity()
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    modelMatrix.setTranslate(0, -0.7, 0)  
    modelMatrix.rotate(angle, 0, 0, 1)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.drawArrays(gl.TRIANGLE_FAN, 4, n - 4)

    requestAnimationFrame(tick)
  }
  tick()
}
