/**
 * 动画
 * 绘制一个旋转的三角形
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  void main() {
    // 乘以变换矩阵
    gl_Position = u_ModelMatrix * a_Position;
  }
`

// 片元着色器
var FSHADER_SOURCE = `
  void main() {
    // 片元颜色
    gl_FragColor = vec4(0.25, 0.5, 0.3, 1.0);
  }
`

// 旋转速度常量 度/秒
var ANGLE_STEP = 45.0

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  var n = initVertextBuffers(gl)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  var currentAngle = 0.0
  // 模型矩阵，构造函数位于lib/cuon-matrix.js
  var modelMatrix = new Matrix4()

  var tick = function() {
    currentAngle = animation(currentAngle)
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix)
    requestAnimationFrame(tick)
  }
  // 开启动画
  tick()
}

var g_last = Date.now()
function animation(angle) {
  var now = Date.now()
  var elapsed = now - g_last
  g_last = now
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0
  return newAngle %= 360
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  modelMatrix.setRotate(currentAngle, 0, 0, 1)

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, n)
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

main()