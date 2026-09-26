const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`

function main() {
  const canvas = document.getElementById("webgl")
  const gl = getWebGLContext(canvas)
  if (!gl) {
    throw new Error("Failed to get the rendering context for WebGL") 
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("Failed to intialize shaders") 
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)


  drawShape(gl, gl.TRIANGLES, new Float32Array([0.0,  0.5, -0.5, -0.5, 0.5, -0.5]), [1.0, 0.0, 0.0, 1.0])
}

function drawShape(gl, mode, vertices, color) {
  const vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    throw new Error('Failed to create the buffer object')
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    throw new Error('Failed to get the storage location of a_Position')
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
  if (!u_FragColor) {
    throw new Error('Failed to get the storage location of u_FragColor')
  }
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3])
  gl.drawArrays(mode, 0, (vertices.length / 2))
}