/**
 * 绘制变换三角形
 * 平移
 * ----------------
 * 1 0 0 Tx
 * 0 1 0 Ty
 * 0 0 1 Tz
 * 0 0 0 1
 * ----------------
 * 绕z轴选转
 * ----------------
 * cosB -sinB 0 0
 * sinB cosB  0 0
 *   0    0   1 0
 *   0    0   0 1
 * ----------------
 * 缩放
 * ----------------
 * sx 0  0  0
 * 0  sy 0  0
 * 0  0  sz 0
 * 0  0  0  1
 * ----------------
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_matrix;
  void main() {
    // 乘以变换矩阵
    gl_Position = u_matrix * a_Position;
    // PointSize绘制单个点才有效
    // gl_PointSize = 10.0;
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

  // 获取变量引用
  var u_matrix = gl.getUniformLocation(gl.program, 'u_matrix')

  var inputs = document.querySelectorAll('[name="type"]')
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function(event) {
      var value = event.target.value
      setTransform(value, gl, u_matrix, n)
    })
  }

  // 初始无变换绘制三角形
  setTransform('', gl, u_matrix, n)
}

function setTransform(type, gl, u_matrix, n) {
  var matrix
  switch (type) {
    case '':
      matrix = setNoTransform()
      break
    case 'translate':
      matrix = setTranslate(0.5, 0.5, 0.0)
      break
    case 'rotate':
      matrix = setRotate(90.0)
      break
    case 'scale':
      matrix = setScale(1.0, 1.5, 1.0)
      break
    default:
      return
  }
  // 传递矩阵变量
  gl.uniformMatrix4fv(u_matrix, false, matrix)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function setNoTransform() {
  return new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ])
}

function setTranslate(tx, ty, tz) {
  var matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    tx, ty, tz, 1.0
  ])
  return matrix
}

function setRotate(angle) {
  var radian = Math.PI * angle / 180.0
  var cosB = Math.cos(radian)
  var sinB = Math.sin(radian)
  var matrix = new Float32Array([
    cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ])
  return matrix
}

function setScale(sx, sy, sz) {
  var matrix = new Float32Array([
    sx, 0.0, 0.0, 0.0,
    0.0, sy, 0.0, 0.0,
    0.0, 0.0, sz, 0.0,
    0.0, 0.0, 0.0, 1.0
  ])
  return matrix
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