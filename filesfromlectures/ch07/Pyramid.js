// ColoredPyramid.js
// Based on the ColoredCube.js structure from the WebGL Programming Guide.

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information for the pyramid
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set background color and enable depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  // Create Matrix4 object (assuming cuon-matrix.js is loaded)
  var mvpMatrix = new Matrix4();

  // --- Setup Model-View-Projection Matrix ---
  
  // 1. Projection Matrix: Perspective view
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  
  // 2. View Matrix: Position the camera (Eye, At, Up)
  // Camera placed at (3, 3, 7) looking at the origin (0, 0, 0).
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0); 
  
  // 3. Model Matrix: Rotate the pyramid slightly for better visibility
  mvpMatrix.rotate(30, 0, 1, 0); // Rotate 30 degrees around the Y-axis

  // Pass the MVP matrix to the uniform variable
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffers
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the pyramid using indices (n is the number of indices)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
  // Vertices for a 4-sided pyramid with a square base (5 unique points)
  var vertices = new Float32Array([
    // Coordinates (x, y, z)
    // 0: Apex
     0.0,  1.0,  0.0,   
    // 1-4: Base corners (on y=-0.5 plane)
     0.5, -0.5,  0.5,   // 1: Front-Right
    -0.5, -0.5,  0.5,   // 2: Front-Left
    -0.5, -0.5, -0.5,   // 3: Back-Left
     0.5, -0.5, -0.5    // 4: Back-Right
  ]);

  // Colors (one color per vertex)
  var colors = new Float32Array([
    1.0, 1.0, 1.0,  // v0 White (Apex)
    1.0, 0.0, 0.0,  // v1 Red
    0.0, 1.0, 0.0,  // v2 Green
    0.0, 0.0, 1.0,  // v3 Blue
    1.0, 1.0, 0.0   // v4 Yellow
  ]);

  // Indices to draw 6 triangles (4 sides + 2 base triangles)
  var indices = new Uint8Array([
    // Sides
    0, 1, 2,   // Front (v0, v1, v2)
    0, 2, 3,   // Left (v0, v2, v3)
    0, 3, 4,   // Back (v0, v3, v4)
    0, 4, 1,   // Right (v0, v4, v1)

    // Base (Two triangles forming the square base)
    1, 3, 2,   // Base Triangle 1 (v1, v3, v2)
    1, 4, 3    // Base Triangle 2 (v1, v4, v3)
  ]);

  // Create a buffer object for indices
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer)
    return -1;

  // Write the vertex coordinates and color to the buffer object (using initArrayBuffer helper)
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

// Helper function to create, bind, and set attribute pointers for an array buffer
// (Assumed to be part of the original project structure, if not, copy from the book)
function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_Attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_Attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_Attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_Attribute);

  return true;
}