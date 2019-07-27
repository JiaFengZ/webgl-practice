/**
 * 通过鼠标点击绘制随机颜色点
 * 使用 attribute变量给顶点着色器传递点坐标值
 * 使用 uniform 变量给片元着色器传递颜色值
 */

var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    // 片元颜色
    gl_FragColor = u_FragColor;
  }
`

main()

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)
  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)
  // 获取a_Position变量的存储位置
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 获取uniform变量存储位置
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
  // 注册点击事件
  canvas.onmousedown = function(event) {
    click(event, gl, canvas, a_Position, u_FragColor)
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
}

var g_points = []
var g_colors = []
function click(event, gl, canvas, a_Position, u_FragColor) {
  var x = event.clientX
  var y = event.clientY
  var rect = event.target.getBoundingClientRect()
  // 屏幕坐标到webgl坐标转换
  x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2)
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2)

  g_points.push([x, y])
  g_colors.push([Math.random(), Math.random(), Math.random(), 1.0])

  gl.clear(gl.COLOR_BUFFER_BIT)

  var len = g_points.length
  for (var i = 0; i < len; i++) {
    var xy = g_points[i]
    var rgba = g_colors[i]
    // 传递值
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0)
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])
    // 绘制
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}