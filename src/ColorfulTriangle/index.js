/**
 * 利用一个buffer存储顶点和颜色信息，绘制一个彩色三角形
 * 简要过程：
 * ------------
 * * 读取顶点坐标
 * * 根据顶点坐标进行图形装配
 * * 光栅化，将几何图形转化为片元
 * * 逐个片元调用片着色器，计算片元颜色，写入颜色缓冲区，绘制图形
 * ------------
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main() {
    gl_Position = a_Position;
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

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertextBuffers(gl) {
  var verticesColors = new Float32Array([
    // 顶点坐标和颜色
    0.0, 0.5, 1.0, 0.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5, 0.0, 0.0, 1.0
  ])
  var n = 3 // 点个数
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
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0)
  // 连接a_Position到缓冲区对象
  gl.enableVertexAttribArray(a_Position)

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  // stride=FSIZE*5 每次读取长度量 offset=FSIZE*2每次读取偏移量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2)
  gl.enableVertexAttribArray(a_Color)
  
  return n
}