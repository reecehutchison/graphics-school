function main() {
  // 1. setup + shaders: uncomment the ones you need (can use more than one at once)
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color
  const grad = makeProgram(gl, VS_COLOR, FS_COLOR) // gradient
  const tex = makeProgram(gl, VS_TEX, FS_TEX)      // image

  // 2. shapes: vertices + which shaders draw it (basic: x, y   grad: x, y, ...RED   tex: x, y, u, v)
  
  const circle_verts = []
  circle_verts.push(...circlePoints(0.0, 0.0, 0.1, 50))
  const solid_shape = makeShape(gl, basic, circle_verts)

  const gradient_circle_verts = []
  for (let i = 0; i < circle_verts.length; i += 2) {
    if (i == 0)
      gradient_circle_verts.push(circle_verts[i], circle_verts[i + 1], ...BLUE)
    else 
      gradient_circle_verts.push(circle_verts[i], circle_verts[i + 1], ...RED)
  }
  const grad_shape = makeShape(gl, grad, gradient_circle_verts)

  // u, v = where the point sits in the square around the circle (r = 0.1, so x / 0.2 + 0.5)
  const r = 0.1
  const texture_circle_verts = []
  for (let i = 0; i < circle_verts.length; i += 2) {
    const x = circle_verts[i]
    const y = circle_verts[i + 1]
    texture_circle_verts.push(x, y, x / (2 * r) + 0.5, y / (2 * r) + 0.5)
  }
  const tex_shape = makeShape(gl, tex, texture_circle_verts)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()


  // gl.uniform1i(shape.u_Sampler, 0)          // tex only: which image (0 = first in the list)

  
  loadTextures(gl, ["./puffer.jpg"], () => {
    tick()
  })

  const third_of_360 = 360 / 3

  let angle1 = 0 + (third_of_360 * 0)
  let angle2 = 0 + (third_of_360 * 1)
  let angle3 = 0 + (third_of_360 * 2)
  let angle4 = 122
  function tick() {
    angle1 = (angle1 - 0.2) % 360
    angle2 = (angle2 - 0.2) % 360
    angle3 = (angle3 - 0.2) % 360
    angle4 = (angle4 + 0.2) % 360

    gl.clear(gl.COLOR_BUFFER_BIT)
    
    // solid color
    useShape(gl, solid_shape)
    modelMatrix.setRotate(angle1, 0, 0, 1)
    modelMatrix.translate(0.5, 0.0, 0.0)
    gl.uniformMatrix4fv(solid_shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(solid_shape.u_FragColor, GREEN)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, solid_shape.n)

    useShape(gl, grad_shape)
    modelMatrix.setRotate(angle2, 0, 0, 1)
    modelMatrix.translate(0.5, 0.0, 0.0)
    gl.uniformMatrix4fv(grad_shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, grad_shape.n)

    useShape(gl, tex_shape)
    modelMatrix.setRotate(angle3, 0, 0, 1)
    modelMatrix.translate(0.5, 0.0, 0.0)
    modelMatrix.rotate(angle4, 0, 0, 1)
    gl.uniformMatrix4fv(tex_shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(tex_shape.u_Sampler, 0)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, tex_shape.n)

    requestAnimationFrame(tick)
  }
}
