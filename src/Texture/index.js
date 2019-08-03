/**
 * 加载纹理图像
 * 程序流程
 * ------------
 * 1、顶点着色器接收顶点纹理坐标，光栅化后传递给片元着色器
 * 2、片元着色器根据片元纹理坐标，从纹理图像中抽取出纹素颜色赋给当前片元
 * 3、设置顶点纹理坐标
 * 4、准备加载的纹理图像
 * 5、监听纹理图像加载事件，加载完毕后loadTexture
 * ------------
 * 纹理单元：
 * -----------
 * webgl通过 纹理单元（texture unit）机制同时使用多个纹理
 * 每个纹理单元使用一个单元编号管理一个纹理图像，即使加载一张纹理图像，也必须指定纹理单元
 * -----------
 * 纹理使用步骤：
 * -------------
 * 1、gl.pixelStorei y轴反转
 * 2、gl.activeTexture 激活纹理单元
 * 3、gl.bindTexture 绑定纹理
 * 4、gl.texParameteri(target, pname, param) 设置纹理参数
 *    @param target gl.TEXTURE_2D 或 gl.TEXTURE_CUBE_MAP
 *    @param pname 纹理参数 
 *                  gl.TEXTURE_MAG_FILTER 放大方法 
 *                  gl.TEXTURE_MIN_FILTER 缩小方法 
 *                  gl.TEXTURE_WRAP_S 水平填充 
 *                  gl.TEXTURE_WARP_T 垂直填充
 *    @param param 纹理参数的值
 * 5、gl.texImage2D(target, level, internalformat, format, type, image) 配置纹理对象
 *    @param target gl.TEXTURE_2D 或 gl.TEXTURE_CUBE_MAP
 *    @param level 0（金字塔纹理设置用）
 *    @param internalformat 图像内部格式
 *    @param format 纹理数据的格式
 *    @param type 纹理数据类型
 *    @param image iamge对象
 * -------------
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
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main() {
  // 片元颜色
  gl_FragColor = texture2D(u_Sampler, v_TexCoord);
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
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0)
  // 连接a_Position到缓冲区对象
  gl.enableVertexAttribArray(a_Position)

  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}

function initTextures(gl, n) {
  var texture = gl.createTexture()
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
  var image = new Image()
  image.onload = function() {
    loadTexture(gl, n, texture, u_Sampler, image)
  }
  image.src = '../resource/city.jpg'
  return true
}

function loadTexture(gl, n, texture, u_Sampler, image) {
  // 对纹理图像进行y轴反转
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  // 开启纹理单元0
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // 配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  // 将0号纹理单元传递给着色器中的取样器变量
  gl.uniform1i(u_Sampler, 0)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}