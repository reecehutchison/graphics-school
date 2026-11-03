function main() {
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color

  const shape = makeShape(gl, basic, [
    0.2, 0.2,
    0.2, -0.2,
    -0.2, -0.2,
    -0.2, 0.2
  ])

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  useShape(gl, shape)
  
  let x = 0
  let y = 0
  let color = 0
  const colors = [RED, BLUE, GREEN, YELLOW]

  document.addEventListener('keydown', (event) => {
    if (event.key === "ArrowUp") y = Math.min(y + 0.1, 0.8)
    else if (event.key === "ArrowRight") x = Math.min(x + 0.1, 0.8)
    else if (event.key === "ArrowDown") y = Math.max(y - 0.1, -0.8)
    else if (event.key === "ArrowLeft") x = Math.max(x - 0.1, -0.8)
    else if(event.key === " ") color = (color + 1) % 4
  })

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    modelMatrix.setTranslate(x, y, 0)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(shape.u_FragColor, colors[color])
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
    requestAnimationFrame(tick)
  }

  tick()
}
