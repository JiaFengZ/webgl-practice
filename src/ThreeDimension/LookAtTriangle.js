/**
 * 绘制三维场景中的三个三角形
 * setLookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) 设置视图矩阵
 * (eyeX, eyeY, eyeZ) 视点
 * (atX, atY, atZ) 观察点
 * (upX, upY, upZ) 上方向
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ViewMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ViewMatrix * a_Position;
    v_Color = a_Color;
  }
`

// 片元着色器
var FSHADER_SOURCE = `
  // 顶点着色器使用变量必须声明精度，否则报错失败
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    // 片元颜色
    gl_FragColor = v_Color;
  }
`

main()

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  var n = initVertextBuffers(gl)

  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  var viewMatrix = new Matrix4()
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertextBuffers(gl) {
  var verticesColors = new Float32Array([
    // 顶点坐标和颜色
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // 绿色三角形在后
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // 黄色三角形在中间
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.5, -0.6, -0.2, 1.0, 1.0, 0.4,

    0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // 蓝色三角形在前
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4
  ])
  var n = 9 // 点个数
  // 创建缓冲区
  var vertexColorBuffer = gl.createBuffer()
  // 绑定缓冲区到webgl中存在的目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  // 往缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

  // 类型化数组中每个元素占的字节数
  var FSIZE = verticesColors.BYTES_PER_ELEMENT

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 将缓冲区对象分配给a_Position变量（将整个缓冲区对象即引用指针分配给attribute）
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  // 连接a_Position到缓冲区对象
  gl.enableVertexAttribArray(a_Position)

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  // stride=FSIZE*5 每次读取长度量 offset=FSIZE*2每次读取偏移量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color)
  
  return n
}