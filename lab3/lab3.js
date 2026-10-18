const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }
`

const FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
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

  const MIN_ITERATIONS = 0
  const MAX_ITERATIONS = 4

  let scene = 1
  let iterations = 0

  gl.clearColor(1.0, 1.0, 1.0, 1.0)

  function draw() {
    drawScene(gl, scene, iterations)
  }

  initTextures(gl, draw)

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault()
      scene = (scene % 2) + 1
    } else if (event.key === 'ArrowUp') {
      iterations = Math.min(iterations + 1, MAX_ITERATIONS)
    } else if (event.key === 'ArrowDown') {
      iterations = Math.max(iterations - 1, MIN_ITERATIONS)
    }
    draw()
  })
}

function buildSierpinski(top, left, right, depth, vertices) {
  if (depth === 0) {
    vertices.push(top[0], top[1], 0.5, 1.0)
    vertices.push(left[0], left[1], 0.0, 0.0)
    vertices.push(right[0], right[1], 1.0, 0.0)
    return
  }

  const topLeft = midpoint(top, left)
  const topRight = midpoint(top, right)
  const bottom = midpoint(left, right)

  // order matters!! top then left then right, so each corner ends up as one chunk of the array
  buildSierpinski(top, topLeft, topRight, depth - 1, vertices)
  buildSierpinski(topLeft, left, bottom, depth - 1, vertices)
  buildSierpinski(topRight, bottom, right, depth - 1, vertices)
}

function midpoint(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

// ---------- above is copy paste from lab 2, below is new stuff! ----------

const PUFFER_IMAGE = 'puffer512.jpg'
const MULTI_IMAGES = ['puffer512.jpg', 'disk512.jpg', 'rock512.jpg']
const NUM_TEXTURES = 6

// keeps track of which texture units r loaded (like g_texUnit0/1 in the multitexture example)
let g_texUnits = new Array(NUM_TEXTURES).fill(false)

function drawScene(gl, scene, iterations) {
  if (!g_texUnits.every(Boolean)) {
    return
  }

  const n = initVertexBuffers(gl, iterations, scene === 1)

  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
  if (!u_Sampler) {
    throw new Error('Failed to get the storage location of u_Sampler')
  }

  const groups = iterations === 0 ? 1 : 3
  const groupSize = n / groups
  // task 1 uses units 0-2, task 2 uses units 3-5
  const firstUnit = scene === 1 ? 0 : 3

  gl.clear(gl.COLOR_BUFFER_BIT)

  // point the shader at a diff texture unit then draw just that groups slice of verts
  for (let i = 0; i < groups; i++) {
    gl.uniform1i(u_Sampler, firstUnit + i)
    gl.drawArrays(gl.TRIANGLES, i * groupSize, groupSize)
  }
}

function initVertexBuffers(gl, iterations, stretch) {
  const SIDE = 1.7
  const height = SIDE * Math.sqrt(3) / 2

  const top = [0.0, height / 2]
  const left = [-SIDE / 2, -height / 2]
  const right = [SIDE / 2, -height / 2]

  const vertices = []
  buildSierpinski(top, left, right, iterations, vertices)

  // push tex coords past 0-1 (same -0.3 to 1.7 range as the repeat example)
  if (stretch) {
    for (let i = 0; i < vertices.length; i += 4) {
      vertices[i + 2] = vertices[i + 2] * 2.0 - 0.3
      vertices[i + 3] = vertices[i + 3] * 1.9 - 0.2
    }
  }

  const verticesTexCoords = new Float32Array(vertices)
  const n = verticesTexCoords.length / 4

  const vertexTexCoordBuffer = gl.createBuffer()
  if (!vertexTexCoordBuffer) {
    throw new Error('Failed to create the buffer object')
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

  // each vert is x, y, s, t in one buffer, so stride is 4 floats and tex coords start 2 floats in
  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    throw new Error('Failed to get the storage location of a_Position')
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
  gl.enableVertexAttribArray(a_Position)

  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
  if (a_TexCoord < 0) {
    throw new Error('Failed to get the storage location of a_TexCoord')
  }
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}

function initTextures(gl, draw) {
  const wrapModes = [gl.CLAMP_TO_EDGE, gl.MIRRORED_REPEAT, gl.REPEAT]

  // task 1, same puffer pic 3 times bc wrap mode is saved on the texture itself
  for (let i = 0; i < 3; i++) {
    initTexture(gl, PUFFER_IMAGE, i, wrapModes[i], draw)
  }
  for (let i = 0; i < 3; i++) {
    initTexture(gl, MULTI_IMAGES[i], 3 + i, gl.REPEAT, draw)
  }
}

function initTexture(gl, src, texUnit, wrapMode, draw) {
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error('Failed to create the texture object')
  }

  const image = new Image()
  image.onload = function() { loadTexture(gl, texture, image, texUnit, wrapMode, draw) }
  image.src = src
}

function loadTexture(gl, texture, image, texUnit, wrapMode, draw) {
  // flip y bc imgs start at the top but tex coords start at the bottom
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl.TEXTURE0 + texUnit)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

  g_texUnits[texUnit] = true

  draw()
}
