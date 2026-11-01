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
 * Setup the webGL boilerplate.
 *   setupWebGL()             -> just canvas + gl, then makeProgram for each shader pair (template way)
 *   setupWebGL(vs, fs)       -> old way, one shader pair for the whole program
 *                               (grab anything else the shaders have with getUniform / getAttrib)
 * @param {string} [vs]
 * @param {string} [fs]
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

  // no shaders given = template way, makeProgram does the shaders
  if (vs == undefined) { return { canvas, gl } }

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

  return verticesArr.length / pointAttributes(gl, layout)
}

/**
 * Hook the bound buffer up to the shader slots (vertexAttribPointer + enable for each).
 * Used by buffer_interleaved and useShape, you don't call it yourself.
 * @param {WebGLRenderingContext} gl
 * @param {number[][]} layout [[slot, size], ...]
 * @returns {number} floats per point
 */
function pointAttributes(gl, layout) {
  // stride and offset are in BYTES, each float is 4 bytes
  const FSIZE = Float32Array.BYTES_PER_ELEMENT
  let floatsPerPoint = 0
  for (const [, size] of layout) { floatsPerPoint += size }

  // unhook everything from the last shape first (might have been a different program)
  for (let slot = 0; slot < gl.getParameter(gl.MAX_VERTEX_ATTRIBS); slot++) {
    gl.disableVertexAttribArray(slot)
  }

  // each attribute starts right after the one before it
  let offset = 0
  for (const [slot, size] of layout) {
    if (slot >= 0) {
      gl.vertexAttribPointer(slot, size, gl.FLOAT, false, FSIZE * floatsPerPoint, FSIZE * offset)
      gl.enableVertexAttribArray(slot)
    }
    offset += size
  }

  return floatsPerPoint
}

// ------------------------------------------------------------------------------------------
// PROGRAMS + SHAPES (the template way, works with one OR many shader pairs on one canvas)
// ------------------------------------------------------------------------------------------

/**
 * Build a shader pair ONCE at the start. Reads the shaders and grabs every attribute + uniform for you:
 *   const tex = makeProgram(gl, VS_TEX, FS_TEX)  ->  tex.a_Position, tex.a_TexCoord, tex.u_Sampler ...
 * @param {WebGLRenderingContext} gl
 * @param {string} vs
 * @param {string} fs
 * @returns {Object} { program, attributes: [[name, size], ...], a_..., u_... }
 */
function makeProgram(gl, vs, fs) {
  const program = createProgram(gl, vs, fs)
  if (!program) { throw new Error("Couldn't make program (typo in a shader? check the console)") }

  const p = { program, attributes: [] }

  // attributes in the order they're written = the order of the numbers in each point
  // size: a_Position = 2 (x, y), everything else = its vec size (vec4 = 4, vec2 = 2, float = 1)
  for (const [, type, name] of vs.matchAll(/attribute\s+(\w+)\s+(\w+)/g)) {
    p[name] = gl.getAttribLocation(program, name)
    if (p[name] < 0) { console.warn(`${name} is never used in the shader, so the gpu deleted it`) }
    const size = name == "a_Position" ? 2 : (type == "float" ? 1 : Number(type.slice(-1)))
    p.attributes.push([name, size])
  }

  for (const [, name] of (vs + fs).matchAll(/uniform\s+\w+\s+(\w+)/g)) {
    p[name] = gl.getUniformLocation(program, name)
    if (p[name] == null) { console.warn(`${name} is never used in the shader, so the gpu deleted it`) }
  }

  return p
}

/**
 * Put a shape's vertices in its own buffer, tied to the program that draws it. Do this ONCE (not in tick).
 *   basic: x, y                 makeShape(gl, basic, vertices)
 *   grad:  x, y, r, g, b, a     makeShape(gl, grad, vertices)          (x, y, ...RED works)
 *          x, y, r, g, b        makeShape(gl, grad, vertices, [2, 3])  (no alpha)
 *   tex:   x, y, u, v           makeShape(gl, tex, vertices)
 * The shape also has all its program's stuff: shape.u_ModelMatrix, shape.u_FragColor, shape.u_Sampler ...
 * @param {WebGLRenderingContext} gl
 * @param {Object} prog from makeProgram
 * @param {number[]} vertices flat list of every point's numbers
 * @param {number[]} [sizes] only if your points aren't the default above, e.g. [2, 3]
 * @returns {Object} { ...prog, buffer, layout, n }  (n = how many points, for drawArrays)
 */
function makeShape(gl, prog, vertices, sizes) {
  const buffer = gl.createBuffer()
  if (!buffer) { throw new Error("Failed creating vertex buffer") }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  const layout = prog.attributes.map(([name, size], k) => [prog[name], sizes ? sizes[k] : size])
  let floatsPerPoint = 0
  for (const [, size] of layout) { floatsPerPoint += size }

  const shape = { ...prog, buffer, layout, n: vertices.length / floatsPerPoint }
  useShape(gl, shape)
  return shape
}

/**
 * Switch to this shape's program + buffer. Call BEFORE setting its matrix/color/image and drawing.
 *   useShape(gl, tri)
 *   gl.uniformMatrix4fv(tri.u_ModelMatrix, false, m.elements)
 *   gl.drawArrays(gl.TRIANGLES, 0, tri.n)
 * @param {WebGLRenderingContext} gl
 * @param {Object} shape from makeShape
 */
function useShape(gl, shape) {
  gl.useProgram(shape.program)
  gl.program = shape.program   // so getAttrib / getUniform still work
  gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer)
  pointAttributes(gl, shape.layout)
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
 * (examples use the template way: setupWebGL() + makeProgram + makeShape + useShape.
 *  the old way, setupWebGL(vs, fs) + getAttrib/getUniform + buffer_points/buffer_interleaved, still works)
 *
 * ------------------------------------------------------------------------------------------
 * Colors (plain, one color for the whole shape):
 * ------------------------------------------------------------------------------------------
 * -- Use VS_BASIC + FS_BASIC, points are x, y, set u_FragColor BEFORE each drawArrays
 *
 * const { gl } = setupWebGL()
 * const basic = makeProgram(gl, VS_BASIC, FS_BASIC)
 * const square = makeShape(gl, basic, [0.5, 0.5,  0.5, -0.5,  -0.5, -0.5,  -0.5, 0.5])
 *
 * useShape(gl, square)
 * gl.uniformMatrix4fv(square.u_ModelMatrix, false, new Matrix4().elements)
 * gl.uniform4fv(square.u_FragColor, RED)
 * gl.drawArrays(gl.TRIANGLE_FAN, 0, square.n)
 *
 * // ways to give the color:
 * gl.uniform4f(square.u_FragColor, 1.0, 0.0, 0.0, 1.0)   // r, g, b, alpha as 4 numbers
 * gl.uniform4fv(square.u_FragColor, RED)                 // same thing but an array (v = vector)
 * gl.uniform4fv(square.u_FragColor, randomColor())       // random color
 * gl.uniform4f(square.u_FragColor, ...RED)               // spread an array into the 4 number version
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
 * const { gl } = setupWebGL()
 * const grad = makeProgram(gl, VS_COLOR, FS_COLOR)
 *
 * const tri = makeShape(gl, grad, [
 * //  x,    y,     r, g, b, a
 *     0.0,  0.5,   ...RED,      // top: red
 *    -0.5, -0.5,   ...GREEN,    // bottom left: green
 *     0.5, -0.5,   ...BLUE      // bottom right: blue
 * ])
 *
 * useShape(gl, tri)
 * gl.uniformMatrix4fv(tri.u_ModelMatrix, false, new Matrix4().elements)
 * gl.drawArrays(gl.TRIANGLES, 0, tri.n)
 *
 * // default is 4 color numbers (r, g, b, a) so ...RED just works
 * // typing only r, g, b (3 numbers)? tell it: makeShape(gl, grad, vertices, [2, 3])
 * //   (the gpu fills in alpha = 1.0)
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
 * const { gl } = setupWebGL()
 * const tex = makeProgram(gl, VS_TEX, FS_TEX)
 *
 * const pic = makeShape(gl, tex, [
 * //  x,    y,     u,   v
 *     0.5,  0.5,   1.0, 1.0,   // top right    -> image top right
 *     0.5, -0.5,   1.0, 0.0,   // bottom right -> image bottom right
 *    -0.5, -0.5,   0.0, 0.0,   // bottom left  -> image bottom left
 *    -0.5,  0.5,   0.0, 1.0    // top left     -> image top left
 * ])
 *
 * loadTextures(gl, ["./puffer.jpg", "./cat.png"], () => {
 *   gl.clear(gl.COLOR_BUFFER_BIT)           // clear IN here (canvas gets wiped while the image loads)
 *   useShape(gl, pic)
 *   gl.uniformMatrix4fv(pic.u_ModelMatrix, false, new Matrix4().elements)
 *   gl.uniform1i(pic.u_Sampler, 0)          // draw with image 0 (puffer.jpg)
 *   gl.drawArrays(gl.TRIANGLE_FAN, 0, pic.n)
 *   gl.uniform1i(pic.u_Sampler, 1)          // switch to image 1 (cat.png) for the next draw
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
 * Mixing (basic + gradient + texture on ONE canvas):
 * ------------------------------------------------------------------------------------------
 * -- makeProgram each type you need, makeShape each shape with ITS program, useShape before each draw
 *
 * const { gl } = setupWebGL()
 * const basic = makeProgram(gl, VS_BASIC, FS_BASIC)
 * const grad  = makeProgram(gl, VS_COLOR, FS_COLOR)
 * const tex   = makeProgram(gl, VS_TEX, FS_TEX)
 *
 * const dot = makeShape(gl, basic, [0.0, 0.8])
 * const tri = makeShape(gl, grad,  [-0.9, -0.5, ...RED,  -0.1, -0.5, ...GREEN,  -0.5, 0.3, ...BLUE])
 * const pic = makeShape(gl, tex,   [0.9, 0.3, 1, 1,  0.9, -0.5, 1, 0,  0.1, -0.5, 0, 0,  0.1, 0.3, 0, 1])
 * const m = new Matrix4()
 *
 * function tick() {
 *   gl.clear(gl.COLOR_BUFFER_BIT)
 *
 *   useShape(gl, dot)                                    // switch, THEN set its stuff, THEN draw
 *   gl.uniformMatrix4fv(dot.u_ModelMatrix, false, m.setIdentity().elements)
 *   gl.uniform4fv(dot.u_FragColor, YELLOW)
 *   gl.drawArrays(gl.POINTS, 0, dot.n)
 *
 *   useShape(gl, tri)
 *   gl.uniformMatrix4fv(tri.u_ModelMatrix, false, m.setIdentity().elements)
 *   gl.drawArrays(gl.TRIANGLES, 0, tri.n)
 *
 *   useShape(gl, pic)
 *   gl.uniformMatrix4fv(pic.u_ModelMatrix, false, m.setIdentity().elements)
 *   gl.uniform1i(pic.u_Sampler, 0)
 *   gl.drawArrays(gl.TRIANGLE_FAN, 0, pic.n)
 *
 *   requestAnimationFrame(tick)
 * }
 * loadTextures(gl, ["./puffer.jpg"], () => { tick() })   // any textures? start inside loadTextures
 *
 * // a shape is ALWAYS drawn with the program you made it with (can't draw pic with grad)
 * // uniforms (matrix, color, image) belong to the program, so set them AFTER useShape
 * // 2 shapes with the same program = 2 makeShape calls with the same prog (or 1 shape + first/count)
 * // makeShape is setup (once), useShape is drawing (every time), never makeShape inside tick
 * // what useShape does: gl.useProgram(program) -> bindBuffer -> vertexAttribPointer + enable for each slot
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
