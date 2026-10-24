/**
 * @file reeceLib.js 
 * My WebGL graphics library that I have been developing over the semester for CS3110.
 * 
 * 
 * @author Reece Hutchison
 * @copyright 2026 Reece Hutchison
 * @license MIT
 */

/**
 * BASIC (go-to) Vertex Shader source for the GPU. 
 * @type {string}
 */
const VS_BASIC = `
  attribute vec4 a_Position; 
  uniform mat4 u_ModelMatrix; 
  void main() {
    gl_Position = u_ModelMatrix * a_Position; 
    gl_PointSize = 10.0;
  }
`

/**
 * BASIC (go-to) Fragment Shader source for the GPU.
 * @type {string} 
 */
const FS_BASIC = `
  precision mediump float; 
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor; 
  }
`

/**
 * Setup the webGL boilerplate
 * @param {string} vs 
 * @param {string} fs 
 * @returns {{
 *  canvas: HTMLCanvasElement,
 *  gl: WebGLRenderingContext,
 *  a_Position: number,
 *  u_ModelMatrix: WebGLUniformLocation,
 *  u_FragColor: WebGLUniformLocation
 * }}
 */
function setupWebGL(vs, fs) {
  const canvas = document.getElementById("webgl")
  if (canvas == null) { throw new Error("Couldn't get canvas") }

  /** @type {WebGLRenderingContext} */
  const gl = getWebGLContext(canvas)
  if (gl == null) { throw new Error("Couldn't get gl context") }

  if (!initShaders(gl, vs, fs)) { throw new Error("Couldn't init shaders") }

  const a_Position = gl.getAttribLocation(gl.program, "a_Position")
  if (a_Position < 0) { throw new Error("Could not get a_Position") }

  const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix")
  if (u_ModelMatrix == null) { throw new Error("Could not get u_ModelMatrix") }

  const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor")
  if (u_FragColor == null) { throw new Error("Could not get u_FragColor") }

  return {
    canvas, 
    gl, 
    a_Position, 
    u_ModelMatrix,
    u_FragColor
  }
}

/**
 * buffer points
 * @param {WebGLRenderingContext} gl
 * @param {number[]} verticesArr
 */
function buffer_points(gl, verticesArr, a_Position) {
  let vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    throw new Error("Failed creating vertex buffer")
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesArr), gl.STATIC_DRAW)
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)

  return verticesArr.length / 2
}

/**
 * Points for a filled circle, ready for gl.TRIANGLE_FAN.
 * @param {number} cx centre x
 * @param {number} cy centre y
 * @param {number} r radius
 * @param {number} n how many slices (6 = hexagon, 50 = smooth circle)
 * @returns {number[]} flat array: cx, cy, x0, y0, x1, y1, ...
 */
function circlePoints(cx, cy, r, n) {
  const vertices = [cx, cy]
  for (let k = 0; k <= n; k++) {
    const angle = 2 * Math.PI * k / n 
    vertices.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  return vertices
}

/**
 * Dictionary: this section includes all of the main concepts we used in class and how to 
 * use each concept as well using the WebGL library. 
 * 
 * 
 * Colors: 
 * 
 * 
 * Transformations:
 * -- Use a matrix to decide where to put the shape when you draw it!
 * 
 * const modelMatrix = new Matrix4() 
 * 
 * // options for transformations below! (angles are in DEGREES)
 *
 * // set... = start fresh (wipes whatever was in the matrix)
 * modelMatrix.setIdentity()                            // reset to "no change"
 * modelMatrix.setTranslate(dx, dy, dz)                 // move up down left or right (dz = 0 for 2d)
 * modelMatrix.setRotate(degrees, axisX, axisY, axisZ)  // spin around the axis (axisX, axisY, axisZ)
 * modelMatrix.setScale(sx, sy, sz)                     // stretch: 1 = same, 2 = double, 0.5 = half (sz = 1 for 2d)
 *
 * // plain = add on (stacks onto what's already there)
 * modelMatrix.translate(dx, dy, dz)
 * modelMatrix.rotate(degrees, axisX, axisY, axisZ)
 * modelMatrix.scale(sx, sy, sz)
 *
 * // axis: set ONE of them to 1 to pick what to spin around
 * //   0, 0, 1 -> z: flat spin on the screen (normal 2d)
 * //   0, 1, 0 -> y: revolving door
 * //   1, 0, 0 -> x: flips forward and back
 *
 * // composite: ONE set... first, then plain ones after (set then set wipes the first one!)
 * // order: the LAST call happens to the shape FIRST
 * modelMatrix.setTranslate(dx, dy, 0).rotate(degrees, 0, 0, 1) // spin in place, then move (the usual one)
 * modelMatrix.setRotate(degrees, 0, 0, 1).translate(dx, dy, 0) // move, then orbit around the centre
 *
 * // in loops use set... so each shape starts fresh
 *
 * gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements) // send matrix to gpu
 */