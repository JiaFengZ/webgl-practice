/**
 * 绘制一个正方体
 * 通过顶点索引绘制
 * gl.drawElements(mode, count, type, offset)
 * @param mode 绘制模式 gl.POINTS gl.LINES等
 * @param count 绘制顶点的个数
 * @param type 索引值的数据类型 gl.UNSIGNED_BYTE gl.UNSIGNED_SHORT
 * @param offset 指定索引数组中开始绘制的位置，字节为单位
 */

// 顶点着色器
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  uniform mat4 u_MvpMatrix;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
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
  gl.enable(gl.DEPTH_TEST)

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  var mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, 1, 1, 100)
  // 左乘视图矩阵
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
  
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initVertextBuffers(gl) {
  var verticesColors = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 白色
    -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 品红色
    -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, //v2 红色
    1.0, -1.0, 1.0, 1.0, 1.0, 1.0, // v3 黄色
    1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // v4 绿色
    1.0, 1.0, -1.0, 0.0, 1.0, 1.0, //v5 青色
    -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, //v6 蓝色
    -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 //v7 黑色
  ])

  // 顶点索引
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, //前
    0, 3, 4, 0, 4, 5, // 右
    0, 5, 6, 0, 6, 1, // 上
    1, 6, 7, 1, 7, 2, // 左
    7, 4, 3, 7, 3, 2, // 下
    4, 7, 6, 4, 6, 5 // 后
  ])

  var vertexColorBUffer = gl.createBuffer()
  var indexBUffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBUffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

  var FSIZE = verticesColors.BYTES_PER_ELEMENT
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position)

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  // stride=FSIZE*5 每次读取长度量 offset=FSIZE*2每次读取偏移量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBUffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  return indices.length
}