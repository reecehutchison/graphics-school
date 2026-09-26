const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 6.0;
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

  const BLACK = [0.0, 0.0, 0.0, 1.0]
  const GREEN = [0.4, 0.9, 0.3, 1.0]

  const grid = new Float32Array([
    -0.33,  1.0,   -0.33, -1.0,
     0.33,  1.0,    0.33, -1.0,
    -1.0,   0.33,   1.0,   0.33,
    -1.0,  -0.33,   1.0,  -0.33
  ])
  const border = new Float32Array([
    -0.99,  0.99,
     0.99,  0.99,
     0.99, -0.99,
    -0.99, -0.99
  ])
  drawShape(gl, gl.LINES, BLACK, grid)
  drawShape(gl, gl.LINE_LOOP, BLACK, border)

  const shape = new Float32Array([
    -0.07,  0.14,
    -0.15,  0.04, 
    -0.08, -0.09, 
     0.07, -0.14, 
     0.15,  0.02, 
     0.08,  0.11 
  ])
  const translations = [
    [ 0.0,   0.67],
    [-0.67,  0.0 ],
    [ 0.0,   0.0 ],
    [ 0.67,  0.0 ],
    [-0.67, -0.67], 
    [ 0.0,  -0.67],  
    [ 0.67, -0.67]  
  ]
  const modes = [
    gl.POINTS,
    gl.LINES,
    gl.LINE_STRIP,
    gl.LINE_LOOP,
    gl.TRIANGLES,
    gl.TRIANGLE_STRIP,
    gl.TRIANGLE_FAN
  ]
  const shapes = []
  for (const [dx, dy] of translations) {
    const moved = new Float32Array(shape.length)
    for (let j = 0; j < shape.length; j += 2) {
      moved[j] = shape[j] + dx
      moved[j + 1] = shape[j + 1] + dy
    }
    shapes.push(moved)
  }
  for (let i = 0; i < shapes.length; i++) {
    let verts = shapes[i]
    // the shape that needed to have it's vertices re-ordered
    if (i === 5) {
      verts = new Float32Array([
        shapes[i][2],  shapes[i][3],
        shapes[i][4],  shapes[i][5],
        shapes[i][0],  shapes[i][1],
        shapes[i][6],  shapes[i][7],
        shapes[i][10], shapes[i][11],
        shapes[i][8],  shapes[i][9]])
    }

    if (i >= 4) {
      drawShape(gl, modes[i], GREEN, verts)
      drawTriangleEdges(gl, modes[i], BLACK, verts)
    } else {
      drawShape(gl, modes[i], BLACK, verts)
    }
    drawShape(gl, gl.POINTS, BLACK, verts)
  }
}

function drawTriangleEdges(gl, mode, color, vertices) {
  const n = vertices.length / 2
  const triangles = []
  if (mode === gl.TRIANGLES) {
    for (let k = 0; k + 2 < n; k += 3) triangles.push([k, k + 1, k + 2])
  } else if (mode === gl.TRIANGLE_STRIP) {
    for (let k = 0; k + 2 < n; k++) triangles.push([k, k + 1, k + 2])
  } else if (mode === gl.TRIANGLE_FAN) {
    for (let k = 1; k + 1 < n; k++) triangles.push([0, k, k + 1])
  }

  for (const [a, b, c] of triangles) {
    const corners = new Float32Array([
      vertices[2 * a], vertices[2 * a + 1],
      vertices[2 * b], vertices[2 * b + 1],
      vertices[2 * c], vertices[2 * c + 1]
    ])
    drawShape(gl, gl.LINE_LOOP, color, corners)
  }
}

function drawShape(gl, mode, color, vertices) {
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