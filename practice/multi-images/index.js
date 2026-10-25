function main() {
  // 1. choose shaders: basic = VS_BASIC/FS_BASIC (solid color), gradient = VS_COLOR/FS_COLOR, tex = VS_TEX/FS_TEX (image)
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_TEX, FS_TEX)
  const a_TexCoord = getAttrib(gl, "a_TexCoord")   // tex
  const u_Sampler = getUniform(gl, "u_Sampler")    // tex

  let vertices = [
    0.0, 0.15, 0.5, 1.0,
    -0.15, -0.15, 0.0, 0.0,
    0.15, -0.15, 1.0, 0.0
  ]
  
  const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_TexCoord, 2]]) 

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  loadTextures(gl, ["./puffer.jpg", "./disk.jpg", "./rock.jpg"], () => {
    gl.clear(gl.COLOR_BUFFER_BIT)   
    
    modelMatrix.setTranslate(-0.5, 0, 0)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(u_Sampler, 0)   
    gl.drawArrays(gl.TRIANGLES, 0, n)

    modelMatrix.setIdentity()
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(u_Sampler, 1)   
    gl.drawArrays(gl.TRIANGLES, 0, n)

    modelMatrix.setTranslate(0.5, 0, 0)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.uniform1i(u_Sampler, 2)   
    gl.drawArrays(gl.TRIANGLES, 0, n)
  })
}
