function main() {
  // 1. setup + shaders: uncomment the ones you need (can use more than one at once)
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color
  // const grad = makeProgram(gl, VS_COLOR, FS_COLOR) // gradient
  // const tex = makeProgram(gl, VS_TEX, FS_TEX)      // image

  // 2. shapes: vertices + which shaders draw it (basic: x, y   grad: x, y, ...RED   tex: x, y, u, v)
  const shape = makeShape(gl, basic, [
    0.0, 0.0
  ])
  // grad with only r, g, b (no alpha)? makeShape(gl, grad, vertices, [2, 3])

  // 3. background
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 4. matrix (always send one, identity = no change)
  const modelMatrix = new Matrix4()

  // 5. draw: useShape FIRST, then matrix / color / image, then drawArrays (repeat for each shape)
  useShape(gl, shape)
  gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
  gl.uniform4fv(shape.u_FragColor, GREEN)      // basic only
  // gl.uniform1i(shape.u_Sampler, 0)          // tex only: which image (0 = first in the list)
  gl.drawArrays(gl.POINTS, 0, shape.n)

  // tex: put step 5 inside loadTextures instead (images take time to load)
  //   one object per image (image k = u_Sampler k), same image twice with different wraps is fine
  //   wrap (what happens past 0..1):  gl.CLAMP_TO_EDGE (stretch edge)  gl.REPEAT (tile)  gl.MIRRORED_REPEAT (tile flipped)
  //   filter (optional):              gl.LINEAR (smooth)  gl.NEAREST (pixelated)
  // loadTextures(gl, [
  //   { src: "./puffer.jpg", wrap: gl.CLAMP_TO_EDGE },
  // ], () => {
  //   gl.clear(gl.COLOR_BUFFER_BIT)   // clear again in here or the background goes white
  //   ...step 5...
  // })

  // animation: delete step 5, use this instead (tex: call tick() inside loadTextures)
  // let angle = 0
  // function tick() {
  //   angle = (angle + 1) % 360
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   useShape(gl, shape)
  //   modelMatrix.setRotate(angle, 0, 0, 1)
  //   gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
  //   gl.uniform4fv(shape.u_FragColor, GREEN)
  //   gl.drawArrays(gl.POINTS, 0, shape.n)
  //   requestAnimationFrame(tick)
  // }
  // tick()
}
