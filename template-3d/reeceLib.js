/**
 * @file reeceLib.js (3D version)
 * My WebGL graphics library that I have been developing over the semester for CS3110.
 * This copy is 3D only, solid colors only: x, y, z points, a camera, perspective, depth.
 *
 *
 * @author Reece Hutchison
 * @copyright 2026 Reece Hutchison
 * @license MIT
 */

// ------------------------------------------------------------------------------------------
// SHADERS
// ------------------------------------------------------------------------------------------

/**
 * 3D Vertex Shader: each point is x, y, z, one matrix (u_MvpMatrix = projection * view * model) places it.
 * @type {string}
 */
const VS_3D = `
  attribute vec4 a_Position;
  uniform mat4 u_MvpMatrix;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
  }
`

/**
 * Fragment Shader: one solid color for the whole shape, set with u_FragColor.
 * @type {string}
 */
const FS_3D = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`

// ------------------------------------------------------------------------------------------
// SETUP
// ------------------------------------------------------------------------------------------

/**
 * Setup the webGL boilerplate: canvas + gl + the shaders (VS_3D + FS_3D).
 * @returns {{ canvas: HTMLCanvasElement, gl: WebGLRenderingContext }}
 */
function setupWebGL() {
  const canvas = document.getElementById("webgl")
  if (canvas == null) { throw new Error("Couldn't get canvas") }

  /** @type {WebGLRenderingContext} */
  const gl = getWebGLContext(canvas)
  if (gl == null) { throw new Error("Couldn't get gl context") }

  if (!initShaders(gl, VS_3D, FS_3D)) { throw new Error("Couldn't init shaders") }

  return { canvas, gl }
}

/**
 * Get an attribute's slot number from the shaders, throws if it isn't there.
 * @param {WebGLRenderingContext} gl
 * @param {string} name e.g. "a_Position"
 * @returns {number}
 */
function getAttrib(gl, name) {
  const slot = gl.getAttribLocation(gl.program, name)
  if (slot < 0) { throw new Error(`Could not get ${name}`) }
  return slot
}

/**
 * Get a uniform's location from the shaders, throws if it isn't there.
 * @param {WebGLRenderingContext} gl
 * @param {string} name e.g. "u_FragColor"
 * @returns {WebGLUniformLocation}
 */
function getUniform(gl, name) {
  const location = gl.getUniformLocation(gl.program, name)
  if (location == null) { throw new Error(`Could not get ${name}`) }
  return location
}

// ------------------------------------------------------------------------------------------
// SHAPES ON THE GPU
// ------------------------------------------------------------------------------------------

/**
 * Put a shape on the gpu ONCE at the start (not in draw).
 *   const ball = makeShape(gl, sphere(30))
 * Two buffers:
 *   ARRAY_BUFFER         = every point's x, y, z
 *   ELEMENT_ARRAY_BUFFER = indices, which 3 points make each triangle
 * @param {WebGLRenderingContext} gl
 * @param {{vertices: number[], indices: number[]}} shape from cube / sphere / cylinder / cone
 * @returns {Object} { buffer, indexBuffer, n, a_Position, u_MvpMatrix, u_FragColor }  (n = how many indices)
 */
function makeShape(gl, shape) {
  const buffer = gl.createBuffer()
  if (!buffer) { throw new Error("Failed creating vertex buffer") }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW)

  // Uint16 not Uint8 (lecture code): Uint8 only reaches 255 points, a smooth sphere has way more
  const indexBuffer = gl.createBuffer()
  if (!indexBuffer) { throw new Error("Failed creating index buffer") }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW)

  return {
    buffer,
    indexBuffer,
    n: shape.indices.length,
    a_Position: getAttrib(gl, "a_Position"),
    u_MvpMatrix: getUniform(gl, "u_MvpMatrix"),
    u_FragColor: getUniform(gl, "u_FragColor")
  }
}

/**
 * Draw one part of the scene.
 *   model.setTranslate(0, 1, 0).scale(0.5, 0.5, 0.5)
 *   drawPart(gl, ball, vp, model, BLUE)
 * @param {WebGLRenderingContext} gl
 * @param {Object} shape from makeShape
 * @param {Matrix4} viewProj from viewProjMatrix (camera + lens)
 * @param {Matrix4} model where this part goes (translate / rotate / scale)
 * @param {number[]} color [r, g, b, a]
 */
function drawPart(gl, shape, viewProj, model, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer)
  gl.vertexAttribPointer(shape.a_Position, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(shape.a_Position)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer)

  const mvp = new Matrix4(viewProj).multiply(model)
  gl.uniformMatrix4fv(shape.u_MvpMatrix, false, mvp.elements)
  gl.uniform4fv(shape.u_FragColor, color)

  gl.drawElements(gl.TRIANGLES, shape.n, gl.UNSIGNED_SHORT, 0)
}

// ------------------------------------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------------------------------------

/**
 * Camera -> one matrix (projection * view). Make it ONCE per frame, then give it to every drawPart.
 *   const cam = { eye: [0, 3, 10], at: [0, 0, 0], fov: 30, near: 1, far: 100 }
 *   eye  = where the camera is          at   = the point it looks at
 *   fov  = how wide the lens is (degrees, bigger = wider = things look smaller)
 *   near / far = closer than near or farther than far gets cut off (both > 0)
 * aspect comes from the canvas so nothing looks stretched.
 * @param {WebGLRenderingContext} gl
 * @param {{eye: number[], at: number[], fov: number, near: number, far: number}} cam
 * @returns {Matrix4}
 */
function viewProjMatrix(gl, cam) {
  const m = new Matrix4()
  m.setPerspective(cam.fov, gl.canvas.width / gl.canvas.height, cam.near, cam.far)
  m.lookAt(...cam.eye, ...cam.at, 0, 1, 0)
  return m
}

// ------------------------------------------------------------------------------------------
// SHAPES (all centred on 0, 0, 0 and fit in -1..1, so scale = half the size / the radius)
// each returns { vertices: [x, y, z, ...], indices: [...] } -> give it straight to makeShape
// ------------------------------------------------------------------------------------------

/**
 * Cube, corners at -1 / 1 (same as the lecture HelloCube). Ground/street = cube scaled flat.
 * @returns {{vertices: number[], indices: number[]}}
 */
function cube() {
  const vertices = [
     1,  1,  1,   -1,  1,  1,   -1, -1,  1,    1, -1,  1,
     1, -1, -1,    1,  1, -1,   -1,  1, -1,   -1, -1, -1
  ]
  const indices = [
    0, 3, 4,   0, 4, 5,
    0, 5, 6,   0, 6, 1,
    1, 6, 7,   1, 7, 2,
    7, 4, 3,   7, 3, 2,
    4, 7, 6,   4, 6, 5,
    0, 1, 2,   0, 2, 3
  ]
  return { vertices, indices }
}

/**
 * Sphere, radius 1. Rings top to bottom (angle a), points around each ring (angle b),
 * then every little square between 2 rings = 2 triangles.
 * @param {number} n how many slices (8 = blocky, 30 = smooth)
 * @returns {{vertices: number[], indices: number[]}}
 */
function sphere(n) {
  const vertices = []
  const indices = []
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * i / n
    for (let j = 0; j <= n; j++) {
      const b = 2 * Math.PI * j / n
      vertices.push(Math.sin(a) * Math.cos(b), Math.cos(a), Math.sin(a) * Math.sin(b))
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const p = i * (n + 1) + j
      const below = p + n + 1
      indices.push(p, below, p + 1,   p + 1, below, below + 1)
    }
  }
  return { vertices, indices }
}

/**
 * Cylinder, radius 1, from y = -1 to y = 1, with caps.
 * Point 0 = bottom centre, 1 = top centre, then bottom/top pairs around the edge.
 * @param {number} n how many slices (30 = smooth)
 * @returns {{vertices: number[], indices: number[]}}
 */
function cylinder(n) {
  const vertices = [0, -1, 0,   0, 1, 0]
  const indices = []
  for (let k = 0; k <= n; k++) {
    const angle = 2 * Math.PI * k / n
    const x = Math.cos(angle)
    const z = Math.sin(angle)
    vertices.push(x, -1, z,   x, 1, z)
  }
  for (let k = 0; k < n; k++) {
    const bottom = 2 + 2 * k
    const top = bottom + 1
    const nextBottom = bottom + 2
    const nextTop = bottom + 3
    indices.push(bottom, top, nextBottom,   nextBottom, top, nextTop)
    indices.push(0, bottom, nextBottom)
    indices.push(1, top, nextTop)
  }
  return { vertices, indices }
}

/**
 * Cone, base radius 1 at y = -1, tip at y = 1 (beak, tree, hat).
 * Point 0 = base centre, 1 = tip, then the base ring.
 * @param {number} n how many slices (30 = smooth)
 * @returns {{vertices: number[], indices: number[]}}
 */
function cone(n) {
  const vertices = [0, -1, 0,   0, 1, 0]
  const indices = []
  for (let k = 0; k <= n; k++) {
    const angle = 2 * Math.PI * k / n
    vertices.push(Math.cos(angle), -1, Math.sin(angle))
  }
  for (let k = 0; k < n; k++) {
    const p = 2 + k
    indices.push(1, p, p + 1)
    indices.push(0, p, p + 1)
  }
  return { vertices, indices }
}

// ------------------------------------------------------------------------------------------
// COLORS (r, g, b, alpha, each 0.0 to 1.0)
// ------------------------------------------------------------------------------------------

const RED     = [1.0, 0.0, 0.0, 1.0]
const GREEN   = [0.0, 1.0, 0.0, 1.0]
const BLUE    = [0.0, 0.0, 1.0, 1.0]
const YELLOW  = [1.0, 1.0, 0.0, 1.0]
const CYAN    = [0.0, 1.0, 1.0, 1.0]
const MAGENTA = [1.0, 0.0, 1.0, 1.0]
const ORANGE  = [1.0, 0.5, 0.0, 1.0]
const PURPLE  = [0.5, 0.0, 1.0, 1.0]
const WHITE   = [1.0, 1.0, 1.0, 1.0]
const GREY    = [0.5, 0.5, 0.5, 1.0]
const BLACK   = [0.0, 0.0, 0.0, 1.0]
