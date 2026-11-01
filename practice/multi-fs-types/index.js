function main() {
  
  const { gl } = setupWebGL()
  const basic = makeProgram(gl, VS_BASIC, FS_BASIC)   // solid color
  const tex = makeProgram(gl, VS_TEX, FS_TEX)      // image

  const shape1 = makeShape(gl, basic, [
    0.2, 0.2,
    0.2, -0.2,
    -0.2, -0.2,
    -0.2, 0.2
  ])

  const shape2 = makeShape(gl, tex, [
    0.2, 0.2, 1.0, 1.0,
    0.2, -0.2, 1.0, 0.0,
    -0.2, -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0, 1.0
  ])



  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()

  
  loadTextures(gl, ["./puffer.jpg"], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)   

    // basic color
    useShape(gl, shape1)
    modelMatrix.setTranslate(-0.5, 0, 0)
    gl.uniformMatrix4fv(shape1.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform4fv(shape1.u_FragColor, GREEN)  
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape1.n)

    // textures
    useShape(gl, shape2)
    modelMatrix.setTranslate(0.5, 0, 0)
    gl.uniformMatrix4fv(shape2.u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(shape2.u_Sampler, 0)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, shape2.n)

      
  })
}
