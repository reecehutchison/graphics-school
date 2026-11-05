function main() {
  const { gl } = setupWebGL()
  const tex = makeProgram(gl, VS_TEX, FS_TEX)

  const shape = makeShape(gl, tex, [
    0.2, 0.2, 1.0, 1.0,
    0.2, -0.2, 1.0, 0.0,
    -0.2, -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0, 1.0
  ])

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  loadTextures(gl, [
    { src: "./puffer.jpg", wrap: gl.CLAMP_TO_EDGE },
    { src: "./disk.jpg", wrap: gl.CLAMP_TO_EDGE},
    { src: "./rock.jpg", wrap: gl.CLAMP_TO_EDGE},
    { src: "./flower.jpg", wrap: gl.CLAMP_TO_EDGE}
  ], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)   
    tick()
  })

  let angle = 0
  let slide1 = 0
  let dir1 = false
  let slide2 = 0
  let dir2 = true

  const canvasWidth = 2
  const spacing = canvasWidth / 4
  const offset = 1.5

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    angle = (angle + 1) % 360
    
    if (slide1 > 0.0) dir1 = false
    if (slide1 < -0.5) dir1 = true
    if (dir1) slide1 = (slide1 + 0.001)
    else slide1 = (slide1 - 0.001)

    if (slide2 > 0.5) dir2 = false
    if (slide2 < -0.0) dir2 = true
    if (dir2) slide2 = (slide2 + 0.001)
    else slide2 = (slide2 - 0.001)

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        useShape(gl, shape)
        modelMatrix.setTranslate((i - offset) * spacing, (j - offset) * spacing, 0)
        gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)

        if (j == 0) {
          modelMatrix.rotate(angle, 0, 1, 0)
          gl.uniform1i(shape.u_Sampler, 0) 
          gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
        } 
        else if (j == 1) {
          modelMatrix.translate(0, slide2, 0)
          gl.uniform1i(shape.u_Sampler, 1)
          gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
        }
        else if (j == 2) {
          modelMatrix.translate(0, slide1, 0)
          gl.uniform1i(shape.u_Sampler, 2)
          gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
        }
        else {
          modelMatrix.rotate(angle, 1, 0, 0)
          gl.uniform1i(shape.u_Sampler, 3)
          gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
        }
      
        gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
      }
    }

    requestAnimationFrame(tick)
  }
}
