/**
 * @file reeceLib.js
 * My WebGL graphics library that I have been developing over the semester for CS3110.
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
 * One solid color for the whole shape, set with u_FragColor.
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
 * GRADIENT Vertex Shader: each point has its own color (a_Color) and passes it on (v_Color).
 * @type {string}
 */
const VS_COLOR = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ModelMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
    v_Color = a_Color;
  }
`

/**
 * GRADIENT Fragment Shader: v_Color shows up already blended between the corners.
 * @type {string}
 */
const FS_COLOR = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`

/**
 * TEXTURE Vertex Shader: each point has a spot in the image (a_TexCoord) and passes it on (v_TexCoord).
 * @type {string}
 */
const VS_TEX = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  uniform mat4 u_ModelMatrix;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
    v_TexCoord = a_TexCoord;
  }
`

/**
 * TEXTURE Fragment Shader: looks up the image's color at v_TexCoord (u_Sampler = which image).
 * @type {string}
 */
const FS_TEX = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`

// ------------------------------------------------------------------------------------------
// SETUP
// ------------------------------------------------------------------------------------------

/**
 * Setup the webGL boilerplate. Works with any shader pair (they all have a_Position and u_ModelMatrix).
 * Grab anything else the shaders have (u_FragColor, a_Color...) with getUniform / getAttrib.
 * @param {string} vs
 * @param {string} fs
 * @returns {{
 *  canvas: HTMLCanvasElement,
 *  gl: WebGLRenderingContext,
 *  a_Position: number,
 *  u_ModelMatrix: WebGLUniformLocation
 * }}
 */
function setupWebGL(vs, fs) {
  const canvas = document.getElementById("webgl")
  if (canvas == null) { throw new Error("Couldn't get canvas") }

  /** @type {WebGLRenderingContext} */
  const gl = getWebGLContext(canvas)
  if (gl == null) { throw new Error("Couldn't get gl context") }

  if (!initShaders(gl, vs, fs)) { throw new Error("Couldn't init shaders") }

  const a_Position = getAttrib(gl, "a_Position")
  const u_ModelMatrix = getUniform(gl, "u_ModelMatrix")

  return {
    canvas,
    gl,
    a_Position,
    u_ModelMatrix
  }
}

/**
 * Get an attribute's slot number from the shaders, throws if it isn't there.
 * (not there = typo, or the shader declares it but never uses it so the gpu deleted it)
 * @param {WebGLRenderingContext} gl
 * @param {string} name e.g. "a_Color"
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
// BUFFERS
// ------------------------------------------------------------------------------------------

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
 * Buffer points that have MORE than just x, y in them (interleaved), e.g. x, y, r, g, b per point.
 * layout says what's in each point, in order: [[slot, how many numbers], ...]
 *   buffer_interleaved(gl, verts, [[a_Position, 2], [a_Color, 3]])  // x, y, r, g, b
 * stride and offset get worked out for you.
 * @param {WebGLRenderingContext} gl
 * @param {number[]} verticesArr flat list of every point's numbers
 * @param {number[][]} layout [[slot, size], ...] in the same order as the numbers
 * @returns {number} how many points (for drawArrays)
 */
function buffer_interleaved(gl, verticesArr, layout) {
  const vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    throw new Error("Failed creating vertex buffer")
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesArr), gl.STATIC_DRAW)

  // stride and offset are in BYTES, each float is 4 bytes
  const FSIZE = Float32Array.BYTES_PER_ELEMENT
  let floatsPerPoint = 0
  for (const [, size] of layout) { floatsPerPoint += size }

  // each attribute starts right after the one before it
  let offset = 0
  for (const [slot, size] of layout) {
    gl.vertexAttribPointer(slot, size, gl.FLOAT, false, FSIZE * floatsPerPoint, FSIZE * offset)
    gl.enableVertexAttribArray(slot)
    offset += size
  }

  return verticesArr.length / floatsPerPoint
}

// ------------------------------------------------------------------------------------------
// TEXTURES
// ------------------------------------------------------------------------------------------

/**
 * Load images into textures, then call onDone once they're ALL ready (images load slow / async).
 * Image k goes in texture unit k, pick which one to draw with gl.uniform1i(u_Sampler, k).
 *   loadTextures(gl, ["./a.png", "./b.png"], () => { ...draw in here... })
 * Needs Live Server (opening the file directly blocks images).
 * @param {WebGLRenderingContext} gl
 * @param {string[]} srcs image paths (up to 8)
 * @param {() => void} onDone runs once every image is loaded
 * @param {number} [wrap] gl.CLAMP_TO_EDGE (default, any image size), gl.REPEAT or gl.MIRRORED_REPEAT
 *                        (those two need a power of 2 image: 64x64, 128x128, 256x256 ...)
 * @param {number} [filter] gl.LINEAR (default, smooth) or gl.NEAREST (pixelated)
 */
function loadTextures(gl, srcs, onDone, wrap = gl.CLAMP_TO_EDGE, filter = gl.LINEAR) {
  // images are stored top row first, webgl wants bottom row first
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

  let loaded = 0
  srcs.forEach((src, unit) => {
    const texture = gl.createTexture()
    if (!texture) { throw new Error("Failed creating texture") }

    const image = new Image()
    image.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      loaded++
      if (loaded == srcs.length) { onDone() }
    }
    image.onerror = () => { throw new Error(`Couldn't load ${src} (typo? not using Live Server?)`) }
    image.src = src
  })
}

// ------------------------------------------------------------------------------------------
// SHAPES
// ------------------------------------------------------------------------------------------

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

/**
 * A random solid color.
 * @returns {number[]} [r, g, b, 1.0]
 */
function randomColor() {
  return [Math.random(), Math.random(), Math.random(), 1.0]
}

// ------------------------------------------------------------------------------------------
// DICTIONARY
// ------------------------------------------------------------------------------------------

/**
 * Dictionary: this section includes all of the main concepts we used in class and how to
 * use each concept as well using the WebGL library.
 *
 * ------------------------------------------------------------------------------------------
 * Colors (plain, one color for the whole shape):
 * ------------------------------------------------------------------------------------------
 * -- Use VS_BASIC + FS_BASIC, set u_FragColor BEFORE each drawArrays
 *
 * const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_BASIC, FS_BASIC)
 * const u_FragColor = getUniform(gl, "u_FragColor")
 *
 * gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0)   // r, g, b, alpha as 4 numbers
 * gl.uniform4fv(u_FragColor, RED)                 // same thing but an array (v = vector)
 * gl.uniform4fv(u_FragColor, randomColor())       // random color
 * gl.uniform4f(u_FragColor, ...RED)               // spread an array into the 4 number version
 *
 * // each value is 0.0 to 1.0 (NOT 0 to 255), alpha 1.0 = solid
 * // background color: gl.clearColor(r, g, b, a) then gl.clear(gl.COLOR_BUFFER_BIT)
 * // different color per shape: change u_FragColor between draws
 *
 * ------------------------------------------------------------------------------------------
 * Gradients (each point gets its own color, gpu blends between them):
 * ------------------------------------------------------------------------------------------
 * -- Use VS_COLOR + FS_COLOR, put the colors IN the buffer next to each point
 *
 * const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_COLOR, FS_COLOR)
 * const a_Color = getAttrib(gl, "a_Color")
 *
 * const vertices = [
 * //  x,    y,     r,   g,   b
 *     0.0,  0.5,   1.0, 0.0, 0.0,   // top: red
 *    -0.5, -0.5,   0.0, 1.0, 0.0,   // bottom left: green
 *     0.5, -0.5,   0.0, 0.0, 1.0    // bottom right: blue
 * ]
 * const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_Color, 3]])
 * gl.drawArrays(gl.TRIANGLES, 0, n)
 *
 * // a_Color is a vec4 but we only send r, g, b, the gpu fills in alpha = 1.0
 * // to use the color constants instead: [[a_Position, 2], [a_Color, 4]] and write 0.0, 0.5, ...RED
 * // the blending is done by the varying (v_Color), no code needed for it
 * // still need to send u_ModelMatrix (identity if not moving) or nothing shows up!
 *
 * // stride / offset (what buffer_interleaved does for you, in case it comes up):
 * //   stride = how many bytes from one point to the next  = FSIZE * 5 (x, y, r, g, b)
 * //   offset = how many bytes in this attribute starts    = a_Position: 0, a_Color: FSIZE * 2
 * //   gl.vertexAttribPointer(slot, size, gl.FLOAT, false, stride, offset)
 * //   FSIZE = Float32Array.BYTES_PER_ELEMENT = 4
 *
 * ------------------------------------------------------------------------------------------
 * Textures (glue an image onto a shape):
 * ------------------------------------------------------------------------------------------
 * -- Use VS_TEX + FS_TEX, put a (u, v) spot in the image next to each point, draw INSIDE loadTextures
 *
 * const { gl, a_Position, u_ModelMatrix } = setupWebGL(VS_TEX, FS_TEX)
 * const a_TexCoord = getAttrib(gl, "a_TexCoord")
 * const u_Sampler = getUniform(gl, "u_Sampler")
 *
 * const vertices = [
 * //  x,    y,     u,   v
 *     0.5,  0.5,   1.0, 1.0,   // top right    -> image top right
 *     0.5, -0.5,   1.0, 0.0,   // bottom right -> image bottom right
 *    -0.5, -0.5,   0.0, 0.0,   // bottom left  -> image bottom left
 *    -0.5,  0.5,   0.0, 1.0    // top left     -> image top left
 * ]
 * const n = buffer_interleaved(gl, vertices, [[a_Position, 2], [a_TexCoord, 2]])
 * gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements)
 *
 * loadTextures(gl, ["./puffer.jpg", "./cat.png"], () => {
 *   gl.clear(gl.COLOR_BUFFER_BIT)           // clear IN here (canvas gets wiped while the image loads)
 *   gl.uniform1i(u_Sampler, 0)              // draw with image 0 (puffer.jpg)
 *   gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
 *   gl.uniform1i(u_Sampler, 1)              // switch to image 1 (cat.png) for the next draw
 *   ...
 * })
 *
 * // (u, v): 0, 0 = image bottom left, 1, 1 = image top right (u = across, v = up)
 * // different image per shape/row: put all images in the list, change u_Sampler before each draw
 * // animation: start tick() INSIDE the loadTextures callback
 * // background white instead of your clearColor? put gl.clear inside the callback
 * // nothing shows / black? not using Live Server, wrong path, or drew before the image loaded
 * // image upside down? the u, v corners don't match the x, y corners
 *
 * // only part of the image: use smaller u, v e.g. 0 to 0.5 = bottom left quarter
 * // tile it: u, v past 1.0 (0 to 3 = 3 copies across) + wrap gl.REPEAT
 * //   loadTextures(gl, ["./puffer.jpg"], draw, gl.REPEAT)
 * //   wrap modes (what happens past 1.0):
 * //     gl.CLAMP_TO_EDGE   stretch the edge pixels (default, any size image)
 * //     gl.REPEAT          tile it again                (power of 2 image only)
 * //     gl.MIRRORED_REPEAT tile it flipped every time   (power of 2 image only)
 * //   filters (what happens when it's stretched/shrunk):
 * //     gl.LINEAR          smooth/blurry (default)
 * //     gl.NEAREST         blocky/pixelated
 * //   loadTextures(gl, ["./puffer.jpg"], draw, gl.CLAMP_TO_EDGE, gl.NEAREST)
 *
 * // what loadTextures does for you, in case it comes up:
 * //   createTexture -> pixelStorei (flip y) -> activeTexture(TEXTURE0 + k) -> bindTexture
 * //   -> texParameteri (filter + wrap) -> texImage2D (the image) -> uniform1i(u_Sampler, k)
 *
 * ------------------------------------------------------------------------------------------
 * Draw modes (the first thing you give gl.drawArrays):
 * ------------------------------------------------------------------------------------------
 * gl.drawArrays(mode, first, count)   // start at point `first`, use `count` points
 *
 * gl.POINTS          each point is its own dot (size = gl_PointSize)
 *                    -> dots, stars, particles
 *
 * gl.LINES           every PAIR of points is its own line: 0-1, 2-3, 4-5 ...
 *                    -> separate lines, grid lines, an X (needs an even count)
 *
 * gl.LINE_STRIP      one connected line through every point: 0-1-2-3 ... (does NOT close)
 *                    -> zigzags, graphs, a spiral, an open path
 *
 * gl.LINE_LOOP       like LINE_STRIP but the last point joins back to the first
 *                    -> OUTLINES: square outline, circle outline, star outline
 *                       (circle outline: don't use circlePoints' centre point or you get a spoke,
 *                        draw from first = 1)
 *
 * gl.TRIANGLES       every 3 points is its own triangle: 0-1-2, 3-4-5 ...
 *                    -> single triangles, lots of separate triangles, sierpinski (count = multiple of 3)
 *                       square = 6 points (2 triangles)
 *
 * gl.TRIANGLE_STRIP  each new point makes a triangle with the 2 before it: 0-1-2, 1-2-3, 2-3-4 ...
 *                    -> squares/strips with ZIGZAG order (top left, bottom left, top right, bottom right)
 *                       the lecture TexturedQuad uses this
 *
 * gl.TRIANGLE_FAN    first point is the hub, triangles fan out: 0-1-2, 0-2-3, 0-3-4 ...
 *                    -> FILLED SHAPES: square (4 points AROUND the edge), circle / hexagon
 *                       (circlePoints: centre first + ring), any convex polygon
 *
 * Which one for what:
 *   filled square     -> TRIANGLE_FAN, 4 points going around the edge (or TRIANGLE_STRIP zigzag)
 *   filled circle     -> TRIANGLE_FAN with circlePoints(cx, cy, r, 50)
 *   filled polygon    -> TRIANGLE_FAN with circlePoints(cx, cy, r, sides) e.g. 6 = hexagon
 *   triangle          -> TRIANGLES, 3 points
 *   outline of shape  -> LINE_LOOP
 *   open line / path  -> LINE_STRIP
 *   separate lines    -> LINES
 *   dots              -> POINTS
 *
 * Square looks like a bowtie or is missing a corner? the point ORDER is wrong for the mode
 *
 * ------------------------------------------------------------------------------------------
 * Transformations:
 * ------------------------------------------------------------------------------------------
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
