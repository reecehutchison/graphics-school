function main() {
  const { gl } = setupWebGL()
  const tex = makeProgram(gl, VS_TEX, FS_TEX)

  const shape = makeShape(gl, tex, [
    0.2, 0.2, 1.0, 1.0,
    0.2, -0.2, 1.0, 0.0,
    -0.2, -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0, 1.0
  ])

  gl.clearColor(...BLACK, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  loadTextures(gl, [
    { src: "./puffer.jpg", wrap: gl.CLAMP_TO_EDGE },
    { src: "./disk.jpg", wrap: gl.CLAMP_TO_EDGE},
    { src: "./rock.jpg", wrap: gl.CLAMP_TO_EDGE},
    { src: "./flower.jpg", wrap: gl.CLAMP_TO_EDGE}
  ], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)   

    const canvasWidth = 2
    const spacing = canvasWidth / 4
    const offset = 1.5

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        useShape(gl, shape)
        modelMatrix.setTranslate((i - offset) * spacing, (j - offset) * spacing, 0)
        gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)

        if (j == 0) gl.uniform1i(shape.u_Sampler, 0) 
        else if (j == 1) gl.uniform1i(shape.u_Sampler, 1) 
        else if (j == 2) gl.uniform1i(shape.u_Sampler, 2)
        else gl.uniform1i(shape.u_Sampler, 3)
      
        gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
      }
    }
  })
}
