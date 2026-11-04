function main() {
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color

  const shape = makeShape(gl, basic, [
    -0.025, 0.05,
    -0.025, 0.5,
    0.025, 0.5,
    0.025, 0.05,
  ])

  const circle = makeShape(gl, basic, circlePoints(0.0, 0.0, 0.07, 200))

  const things = makeShape(gl, basic, circlePoints(0.0, 0.0, 0.5, 12))

  gl.clearColor(...GREY, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  let angle1 = 0
  let angle2 = 90
  let angle3 = 180
  function tick() {
    angle1 = (angle1 - 1) % 360
    angle2 = (angle2 - 0.5) % 360
    angle3 = (angle3 - 2) % 360
    gl.clear(gl.COLOR_BUFFER_BIT)

    useShape(gl, circle)
    modelMatrix.setIdentity()
    modelMatrix.setScale(10, 10, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, WHITE)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    for (let i = 0; i < 8; i++) {
      useShape(gl, things)
      modelMatrix.setScale(1 + (i * 0.02), 1 + (i * 0.02), 1)
      gl.uniformMatrix4fv(things.u_ModelMatrix, false, modelMatrix.elements)
      gl.uniform4fv(things.u_FragColor, BLACK)
      gl.drawArrays(gl.POINTS, 0, things.n)
    }

    useShape(gl, shape)
    modelMatrix.setRotate(angle1, 0, 0, 1)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(shape.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    modelMatrix.setRotate(angle2, 0, 0, 1)
    modelMatrix.scale(1.2, 0.6, 1)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(shape.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    useShape(gl, shape)
    modelMatrix.setRotate(angle3, 0, 0, 1)
    modelMatrix.scale(0.5, 1, 1)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(shape.u_FragColor, RED)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    useShape(gl, circle)
    modelMatrix.setIdentity()
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    useShape(gl, circle)
    modelMatrix.setScale(10, 10, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, BLACK)
    gl.drawArrays(gl.POINTS, 0, circle.n)
    requestAnimationFrame(tick)
    
  }
  tick()
}
