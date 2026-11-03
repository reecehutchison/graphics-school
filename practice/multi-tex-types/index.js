function main() {
  const { gl } = setupWebGL()
  const tex = makeProgram(gl, VS_TEX, FS_TEX)      // image

  const shape = makeShape(gl, tex, [
    0.2, 0.2, 2.0, 2.0,
    0.2, -0.2, 2.0, 0.0,
    -0.2, -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0, 2.0
  ])

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

 

  // tex: put step 5 inside loadTextures instead (images take time to load)
  //   one object per image (image k = u_Sampler k), same image twice with different wraps is fine
  //   wrap (what happens past 0..1):  gl.CLAMP_TO_EDGE (stretch edge)  gl.REPEAT (tile)  gl.MIRRORED_REPEAT (tile flipped)
  //   filter (optional):              gl.LINEAR (smooth)  gl.NEAREST (pixelated)
  loadTextures(gl, [
    { src: "./puffer.jpg", wrap: gl.REPEAT },
    { src: "./puffer.jpg", wrap: gl.MIRRORED_REPEAT },
    { src: "./disk512.jpg", wrap: gl.REPEAT }
  ], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)     
    useShape(gl, shape)

    modelMatrix.setTranslate(0, 0.6, 0)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(shape.u_Sampler, 0)        
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    modelMatrix.setTranslate(0, 0.0, 0)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(shape.u_Sampler, 1)        
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)

    modelMatrix.setTranslate(0, -0.6, 0)
    gl.uniformMatrix4fv(shape.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(shape.u_Sampler, 2)        
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape.n)
  })

}
