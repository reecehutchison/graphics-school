function main() {
  const { gl } = setupWebGL()
  const tex = makeProgram(gl, VS_TEX, FS_TEX)      // image

  const shape = makeShape(gl, tex, [
    0.1, 0.1, 1.0, 1.0, 
    0.1, -0.1, 1.0, 0.0,
    -0.1, -0.1, 0.0, 0.0,
    -0.1, 0.1, 0.0, 1.0
  ])

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
 
  loadTextures(gl, [
    { src: "./dvd.jpg", wrap: gl.CLAMP_TO_EDGE },
  ], () => {
    tick()
  })

  let x = 0.5
  let y = 0
  let xDir = false
  let yDir = true

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)   

    if (x > 0.95) xDir = false
    else if (x < -0.95) xDir = true
    if (xDir) x += 0.006
    else x -= 0.006

    if (y > 0.95) yDir = false
    else if (y < -0.95) yDir = true
    if (yDir) y += 0.005
    else y -= 0.005

    useShape(gl, shape)
    modelMatrix.setTranslate(x, y, 0)
    modelMatrix.scale(2, 2, 1)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(shape.u_Sampler, 0)         
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    requestAnimationFrame(tick)
  }
}
