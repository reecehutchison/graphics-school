function main() {
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color

  // 2. shapes: vertices + which shaders draw it (basic: x, y   grad: x, y, ...RED   tex: x, y, u, v)
  const square = makeShape(gl, basic, [
    0.1, 0.1,
    0.1, -0.1,
    -0.2, -0.1,
    0.0, 0.13
  ])

  const triangle = makeShape(gl, basic, [
    0.0, 0.05,
    -0.3, 0.05,
    0.0, 0.13
  ])

  const rectangle = makeShape(gl, basic, [
    0.3, 0.05,
    0.3, -0.1,
    -0.3, -0.1,
    -0.3, 0.05
  ])

  const circle = makeShape(gl, basic, circlePoints(0.0, 0.0, 0.07, 50))

  const cross = makeShape(gl, basic, [
    0.0, 0.1,
    0.0, -0.1,
    0.1, 0.0,
    -0.1, 0.0
  ])

  const road = makeShape(gl, basic, [
    1.0, 0.0,
    1.0, -0.7,
    -1.0, -0.7,
    -1.0, 0.0
  ])

  const ground = makeShape(gl, basic, [
    1.0, 0.0,
    1.0, -1.0,
    -1.0, -1.0,
    -1.0, 0.0
  ])

  const line = makeShape(gl, basic, [
    -0.70, -0.3,
    -0.70, -0.25,
    -0.85, -0.25,
    -0.85, -0.3
  ])

  gl.clearColor(...CYAN, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  let angle = 0
  let x = 0

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    angle = (angle - 3) % 360 
    x = (x - 0.03) % 0.3

    modelMatrix.setIdentity()

    useShape(gl, ground)
    gl.uniformMatrix4fv(ground.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(ground.u_FragColor, GREEN)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, ground.n)

    useShape(gl, road)
    gl.uniformMatrix4fv(road.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(road.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, road.n)


    
    for (let i = 0; i < 10; i++) {
      useShape(gl, line)
      modelMatrix.setTranslate(0 + (i * 0.3), 0, 0)
      modelMatrix.translate(x, 0, 0)
      gl.uniformMatrix4fv(line.u_ModelMatrix, false, modelMatrix.elements)
      gl.uniform4fv(line.u_FragColor, YELLOW)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, line.n)
    }

    modelMatrix.setIdentity()

    useShape(gl, square)
    gl.uniformMatrix4fv(square.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(square.u_FragColor, BLUE)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, square.n)

    useShape(gl, triangle)
    gl.uniformMatrix4fv(triangle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(triangle.u_FragColor, RED)
    gl.drawArrays(gl.TRIANGLES, 0, triangle.n)

    useShape(gl, rectangle)
    gl.uniformMatrix4fv(rectangle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(rectangle.u_FragColor, RED)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, rectangle.n)

    useShape(gl, circle)
    modelMatrix.setTranslate(-0.2, -0.1, 0)
    modelMatrix.rotate(angle, 0, 0, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    useShape(gl, circle)
    modelMatrix.scale(0.8, 0.8, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, WHITE)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    useShape(gl, cross)
    modelMatrix.scale(0.7, 0.7, 1)
    gl.uniformMatrix4fv(cross.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(cross.u_FragColor, BLACK)
    gl.drawArrays(gl.LINES, 0, cross.n)

    useShape(gl, circle)
    modelMatrix.setTranslate(0.2, -0.1, 0)
    modelMatrix.rotate(angle, 0, 0, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, BLACK)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    useShape(gl, circle)
    modelMatrix.scale(0.8, 0.8, 1)
    gl.uniformMatrix4fv(circle.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(circle.u_FragColor, WHITE)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.n)

    useShape(gl, cross)
    modelMatrix.scale(0.7, 0.7, 1)
    gl.uniformMatrix4fv(cross.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(cross.u_FragColor, BLACK)
    gl.drawArrays(gl.LINES, 0, cross.n)

    requestAnimationFrame(tick)
  }
  tick()
}
