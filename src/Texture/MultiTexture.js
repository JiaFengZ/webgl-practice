/**
 * 使用多个纹理
 * 片元着色器访问两个纹理
 * 最终片元颜色由两个纹理上的纹理颜色共同决定
 * initTextures 创建了两个纹理对象
 */

 // 顶点着色器
 var VSHADER_SPURCE = `
 attribute vec4 a_Position;
 attribute vec2 a_TexCoord;
 varying vec2 v_TexCoord;
 void main() {
   gl_Position = a_Position;
   v_TexCoord = a_TexCoord;
 }
 `
 
 // 片元着色器
 var FSHADER_SOURCE = `
 // 顶点着色器使用变量必须声明精度，否则报错失败
 precision mediump float;
 uniform sampler2D u_Sampler0;
 uniform sampler2D u_Sampler1;
 varying vec2 v_TexCoord;
 void main() {
   // 片元颜色
   vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
   vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
   gl_FragColor = color0 * color1;
 }
 `
 main()
 
 function main() {
   var canvas = document.getElementById('webgl')
   var gl = getWebGLContext(canvas)
 
   // 初始化着色器程序
   initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)
   // 设置顶点信息
   var n = initVertextBuffers(gl)
   // 初始化纹理
   initTextures(gl, n)
 }


function initVertextBuffers(gl) {
  var vertexTexCoords = new Float32Array([
    // 顶点坐标，纹理坐标
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0
  ])
  var n = 4

  var vertexTexCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertexTexCoords, gl.STATIC_DRAW)

  var FSIZE = vertexTexCoords.BYTES_PER_ELEMENT

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 将缓冲区对象分配给a_Position变量（将整个缓冲区对象即引用指针分配给attribute）
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
  // 连接a_Position到缓冲区对象
  gl.enableVertexAttribArray(a_Position)

  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}

function initTextures(gl, n) {
  // 创建缓冲区对象
  var texture0 = gl.createTexture()
  var texture1 = gl.createTexture()

  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1')

  var image0 = new Image()
  var image1 = new Image()

  image0.onload = function() {
    loadTexture(gl, n, texture0, u_Sampler0, image0, 0)
  }
  image1.onload = function() {
    loadTexture(gl, n, texture1, u_Sampler1, image1, 1)
  }

  image0.src = '../resource/city.jpg'
  image1.src = '../resource/circle.png'
  return true
}

// 标记纹理单元是否已经就绪
var g_texUnit0 = false
var g_texUnit1 = false

function loadTexture(gl, n, texture, u_Sampler, image, textUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  if (textUnit === 0) {
    gl.activeTexture(gl.TEXTURE0)
    g_texUnit0 = true
  }
  if (textUnit === 1) {
    gl.activeTexture(gl.TEXTURE1)
    g_texUnit1 = true
  }

  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.uniform1i(u_Sampler, texUnit)

  if (g_texUnit0 && g_texUnit1) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
  }
}