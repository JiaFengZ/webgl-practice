/**
 * 利用缓冲区一次性绘制多个点
 * createBuffer 创建缓冲区
 * bindBuffer 绑定缓冲区到webgl环境目标
 * bufferData 往缓冲区对象写入数据
 * vertexAttribPointer 一次性将缓冲区对象数据引用指针分配给attribute变量
 * enableVertexAttribArray 启用变量
 * drawArrays 绘制
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`

// 片元着色器
var FSHADER_SOURCE = `
  void main() {
    // 片元颜色
    gl_FragColor = vec4(0.25, 0.5, 0.3, 1.0);
  }
`
main()

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  var n = initVertextBuffers(gl)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制3个点
  gl.drawArrays(gl.POINTS, 0, n)
}

function initVertextBuffers(gl) {
  var vertices = new Float32Array([
    0.0, 0.5, -0.5, -0.5, 0.5, -0.5
  ])
  var n = 3 // 点个数
  // 创建缓冲区
  var vertexBuffer = gl.createBuffer()
  // 绑定缓冲区到webgl中存在的目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // 往缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 将缓冲区对象分配给a_Position变量（将整个缓冲区对象即引用指针分配给attribute）
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 连接a_Position到缓冲区对象
  gl.enableVertexAttribArray(a_Position)
  return n
}