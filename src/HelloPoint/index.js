// 顶点着色器
var VSHADER_SPURCE = `
  void main() {
    // 顶点坐标
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    // 顶点大小
    gl_PointSize = 10.0;
  }
`
// 片源着色器
var FSHADER_SOURCE = `
  void main() {
    // 片源颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFEER_BIT)
  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1)
}

main()