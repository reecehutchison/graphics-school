const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_xformMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_xformMatrix * a_Position;
    gl_PointSize = 10.0;
    v_Color = a_Color;
  }
`

const FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
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

    const MIN_REVOLUTIONS = 1
    const MAX_REVOLUTIONS = 8

    const ANGLE_STEP = 10.0

    let scene = 1
    let currLevel = MIN_LEVEL
    let squareAngle = 0.0
    let revolutions = 2
    let spiralAngle = 0.0

  function draw() {
    if (scene === 1) {
      drawLevels(gl, currLevel, squareLevels, squareAngle)
    } else {
      drawSpiral(gl, revolutions, spiralAngle)
    }
  }

  draw()

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault()
      scene = (scene % 2) + 1
    } else if (scene === 1) {
      if (event.key === 'ArrowUp') {
        currLevel = Math.min(currLevel + 1, MAX_LEVEL)
      } else if (event.key === 'ArrowDown') {
        currLevel = Math.max(currLevel - 1, MIN_LEVEL)
      } else if (event.key === 'ArrowLeft') {
        squareAngle = (squareAngle + ANGLE_STEP) % 360
      } else if (event.key === 'ArrowRight') {
        squareAngle = (squareAngle - ANGLE_STEP) % 360
      }
    } else if (scene === 2) {
      if (event.key === 'ArrowUp') {
        revolutions = Math.min(revolutions + 1, MAX_REVOLUTIONS)
      } else if (event.key === 'ArrowDown') {
        revolutions = Math.max(revolutions - 1, MIN_REVOLUTIONS)
      } else if (event.key === 'ArrowLeft') {
        spiralAngle = (spiralAngle + ANGLE_STEP) % 360
      } else if (event.key === 'ArrowRight') {
        spiralAngle = (spiralAngle - ANGLE_STEP) % 360
      }
    }
    draw()
  })
}

function setRotation(gl, angle, axis) {
  const radian = Math.PI * angle / 180.0
  const cosB = Math.cos(radian)
  const sinB = Math.sin(radian)
  let xformMatrix
  if (axis === 'z') {
    xformMatrix = new Float32Array([
       cosB, sinB, 0.0, 0.0,
      -sinB, cosB, 0.0, 0.0,
        0.0,  0.0, 1.0, 0.0,
        0.0,  0.0, 0.0, 1.0
    ])
  } else if (axis === 'y') {
    xformMatrix = new Float32Array([
      cosB, 0.0, -sinB, 0.0,
       0.0, 1.0,   0.0, 0.0,
      sinB, 0.0,  cosB, 0.0,
       0.0, 0.0,   0.0, 1.0
    ])
  }
  const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix')
  if (!u_xformMatrix) {
    throw new Error('Failed to get the storage location of u_xformMatrix')
  }
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
}

function drawBorder(gl) {
  const BLACK = [0.0, 0.0, 0.0, 1.0]

  const border = new Float32Array([
    -0.99,  0.99,
     0.99,  0.99,
     0.99, -0.99,
    -0.99, -0.99
  ])

  setRotation(gl, 0, 'z')
  drawShape(gl, gl.LINE_LOOP, border, BLACK)
}

function drawLevels(gl, currLevel, squareLevels, angle) {
  const BLACK = [0.0, 0.0, 0.0, 1.0]
  const BLUE = [0.0, 0.0, 1.0, 1.0]

  gl.clear(gl.COLOR_BUFFER_BIT)

  drawBorder(gl)

  setRotation(gl, angle, 'z')
  for (let i = 0; i < currLevel * 2; i++) {
    let color = BLACK
    if (i % 2 != 0) {
      color = BLUE
    }
    drawShape(gl, gl.LINE_LOOP, squareLevels[i], color)
  }
}

function drawSpiral(gl, revolutions, angle) {
  const CENTER_COLOR = [0.0, 0.05, 0.3]
  const EDGE_COLOR = [0.3, 0.7, 1.0]
  const MAX_RADIUS = 0.75
  const POINTS_PER_REVOLUTION = 100

  const numPoints = revolutions * POINTS_PER_REVOLUTION + 1
  const thetaMax = 2 * Math.PI * revolutions
  const vertices = new Float32Array(numPoints * 2)
  const colors = new Float32Array(numPoints * 4)

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)
    const theta = t * thetaMax
    const r = MAX_RADIUS * t
    vertices[2 * i] = r * Math.cos(theta)
    vertices[2 * i + 1] = r * Math.sin(theta)
    for (let c = 0; c < 3; c++) {
      colors[4 * i + c] = CENTER_COLOR[c] * (1 - t) + EDGE_COLOR[c] * t
    }
    colors[4 * i + 3] = 1.0
  }

  gl.clear(gl.COLOR_BUFFER_BIT)

  drawBorder(gl)

  setRotation(gl, angle, 'y')
  drawShape(gl, gl.LINE_STRIP, vertices, colors)
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

  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  if (a_Color < 0) {
    throw new Error('Failed to get the storage location of a_Color')
  }
  if (color instanceof Float32Array) {
    const colorBuffer = gl.createBuffer()
    if (!colorBuffer) {
      throw new Error('Failed to create the color buffer object')
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW)
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(a_Color)
  } else {
    gl.disableVertexAttribArray(a_Color)
    gl.vertexAttrib4f(a_Color, color[0], color[1], color[2], color[3])
  }

  gl.drawArrays(mode, 0, (vertices.length / 2))
}
