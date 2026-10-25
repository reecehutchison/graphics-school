function main() {
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_TEX, FS_TEX)
  const a_TexCoord = getAttrib(gl, "a_TexCoord")   // tex
  const u_Sampler = getUniform(gl, "u_Sampler")    // tex

  let vertices = [
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0,
    -0.5, -0.5, 0.0, 0.0,
    -0.5, 0.5, 0.0, 1.0
  ]

  const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_TexCoord, 2]]) 

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  
  loadTextures(gl, ["./puffer.jpg"], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)   
    gl.uniform1i(u_Sampler, 0) 
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
  })
}
