function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_COLOR, FS_COLOR)
  const a_Color = getAttrib(gl, "a_Color")         // color

  const vertices = [
    0.0, 0.4, 1.0, 0.0, 0.0,
    -0.4, -0.2, 0.0, 1.0, 0.0,
    0.4, -0.2, 0.0, 0.0, 1.0
  ]

  const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_Color, 3]]) // color

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  gl.drawArrays(gl.TRIANGLES, 0, n)
}
