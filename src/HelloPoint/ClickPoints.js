/**
 * 通过鼠标点击绘制点
 * 使用 attribute变量给顶点着色器传递点坐标值
 */

var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`

var FSHADER_SOURCE = `
  void main() {
    // 片元颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

main()

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)
  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)
  // 获取a_Position变量的存储位置
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 注册点击事件
  canvas.onmousedown = function(event) {
    click(event, gl, canvas, a_Position)
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
}

var g_points = []
function click(event, gl, canvas, a_Position) {
  var x = event.clientX
  var y = event.clientY
  var rect = event.target.getBoundingClientRect()
  // 屏幕坐标到webgl坐标转换
  x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2)
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2)

  g_points.push(x)
  g_points.push(y)

  gl.clear(gl.COLOR_BUFFER_BIT)

  var len = g_points.length
  for (var i = 0; i < len; i += 2) {
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0)
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}