function main() {
  // 1. choose shaders: basic = VS_BASIC/FS_BASIC (solid color), gradient = VS_COLOR/FS_COLOR, tex = VS_TEX/FS_TEX (image)
  const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_TEX, FS_TEX)
  const a_TexCoord = getAttrib(gl, "a_TexCoord")   
  const u_Sampler = getUniform(gl, "u_Sampler")   

  // 2. put vertices in the buffer (basic: x, y   gradient: x, y, r, g, b   tex: x, y, u, v)
  let vertices = [
    0.2, 0.2, 1.0, 1.0, 
    0.2, -0.2, 1.0, 0.0,
    -0.2, -0.2, 0.0, 0.0,
    -0.2, 0.2, 0.0, 1.0
  ]
  
  const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_TexCoord, 2]]) 

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const modelMatrix = new Matrix4()
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  let dx = 0.0
  let dy = 0.0

  document.addEventListener('keydown', (event) => {
    if (event.key === "ArrowUp") dy += 0.1
    else if (event.key === "ArrowRight") dx += 0.1
    else if (event.key === "ArrowDown") dy -= 0.1
    else if (event.key === "ArrowLeft") dx -= 0.1
    console.log(dx, dy)
  })

  loadTextures(gl, ["./puffer.jpg"], () => {  
    tick()
  })

  function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT)   
    gl.uniform1i(u_Sampler, 0) 
    modelMatrix.setTranslate(dx, dy, 0)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
    requestAnimationFrame(tick)
  }
}
