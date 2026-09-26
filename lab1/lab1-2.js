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
  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const topLeftShape = new Float32Array([
    -0.8, 0.65,
    -0.2, 0.65,
    -0.8, 0.35,
    -0.2, 0.35
  ])

  const topRightLines = new Float32Array([
    0.2, 0.7,    0.8, 0.7,
    0.2, 0.65,   0.8, 0.65,
    0.2, 0.6,    0.8, 0.6,
    0.2, 0.55,   0.8, 0.55,
    0.2, 0.5,    0.8, 0.5
  ])

  const topRightTriangles = new Float32Array([
    0.28, 0.35,   0.43, 0.35,   0.36, 0.5,
    0.58, 0.35,   0.73, 0.35,   0.66, 0.5
  ])

  const bottomRightShape = new Float32Array([
    0.22, -0.38,   0.78, -0.38,   0.5, -0.5,
    0.22, -0.38,   0.5, -0.5,     0.22, -0.62,
    0.78, -0.38,   0.78, -0.62,   0.5, -0.5
  ])

  const border = new Float32Array([
    -0.99,  0.99,
     0.99,  0.99,
     0.99, -0.99,
    -0.99, -0.99
  ])

  drawShape(gl, gl.LINE_LOOP, border, [0.0, 0.0, 0.0, 1.0])
  drawShape(gl, gl.LINE_STRIP, topLeftShape, [1.0, 0.0, 0.0, 1.0])
  drawShape(gl, gl.LINES, topRightLines, [0.0, 0.0, 1.0, 1.0])
  drawShape(gl, gl.TRIANGLES, topRightTriangles, [1.0, 1.0, 0.0, 1.0])
  const circle = [-0.5, -0.5]
  const edge = makeCircleVertices(-0.5, -0.5, 0.3, 0.15, 60)
  for (const value of edge) {
    circle.push(value)
  }
  const bottomLeftShape = new Float32Array(circle)

  drawShape(gl, gl.TRIANGLES, bottomRightShape, [0.3, 0.7, 0.2, 1.0])
  drawShape(gl, gl.TRIANGLE_FAN, bottomLeftShape, [0.0, 0.0, 0.0, 1.0])
}

function makeCircleVertices(centerX, centerY, radiusX, radiusY, vertexCount) {
  const circleData = []
  for (let i = 0; i <= vertexCount; i++) {
    const angle = i / vertexCount * 2 * Math.PI
    circleData.push(centerX + radiusX * Math.cos(angle))
    circleData.push(centerY + radiusY * Math.sin(angle))
  }
  return circleData
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