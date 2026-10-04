const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_xformMatrix;
  void main() {
    gl_Position = u_xformMatrix * a_Position;
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

  const startSquare = new Float32Array([
      -0.5,  0.5,   
      0.5,  0.5,   
      0.5, -0.5,   
      -0.5, -0.5   
    ])

    const MIN_LEVEL = 1
    const MAX_LEVEL = 6

    let squareLevels = []
    squareLevels.push(startSquare)
    for (let i = 0; i < MAX_LEVEL * 2 - 1; i++) {
      squareLevels.push(getMidpoints(squareLevels[i]))
    }

    const ANGLE_STEP = 10.0

    let currLevel = MIN_LEVEL
    let angle = 0.0
    drawLevels(gl, currLevel, squareLevels, angle)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      currLevel = Math.min(currLevel + 1, MAX_LEVEL)
    } else if (event.key === 'ArrowDown') {
      currLevel = Math.max(currLevel - 1, MIN_LEVEL)
    } else if (event.key === 'ArrowLeft') {
      angle = (angle + ANGLE_STEP) % 360
    } else if (event.key === 'ArrowRight') {
      angle = (angle - ANGLE_STEP) % 360
    }
    drawLevels(gl, currLevel, squareLevels, angle)
  })
}

function setRotation(gl, angle) {
  const radian = Math.PI * angle / 180.0
  const cosB = Math.cos(radian)
  const sinB = Math.sin(radian)
  const xformMatrix = new Float32Array([
     cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0
  ])
  const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix')
  if (!u_xformMatrix) {
    throw new Error('Failed to get the storage location of u_xformMatrix')
  }
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
}

function drawLevels(gl, currLevel, squareLevels, angle) {
  const BLACK = [0.0, 0.0, 0.0, 1.0]
  const BLUE = [0.0, 0.0, 1.0, 1.0]

  const border = new Float32Array([
    -0.99,  0.99,
     0.99,  0.99,
     0.99, -0.99,
    -0.99, -0.99
  ])

  gl.clear(gl.COLOR_BUFFER_BIT)

  setRotation(gl, 0)
  drawShape(gl, gl.LINE_LOOP, border, BLACK)

  setRotation(gl, angle)
  for (let i = 0; i < currLevel * 2; i++) {
    let color = BLACK
    if (i % 2 != 0) {
      color = BLUE
    }
    drawShape(gl, gl.LINE_LOOP, squareLevels[i], color)
  }
}


function getMidpoints(vertices) {
  const numPoints = vertices.length / 2
  const midpoints = new Float32Array(vertices.length)
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints
    midpoints[2 * i] = (vertices[2 * i] + vertices[2 * next]) / 2
    midpoints[2 * i + 1] = (vertices[2 * i + 1] + vertices[2 * next + 1]) / 2
  }
  return midpoints
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