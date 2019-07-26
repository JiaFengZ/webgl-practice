/**
 * 流程
 * --------------
 * 获取canvas元素 -> 获取webgl绘图上下文 -> 初始化着色器 -> 设置canvas背景色 -> 清除canvas -> 绘图
 * --------------
 */
// 顶点着色器
var VSHADER_SPURCE = `
  void main() {
    // 顶点坐标
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    // 顶点大小
    gl_PointSize = 10.0;
  }
`
// 片元着色器
var FSHADER_SOURCE = `
  void main() {
    // 片元颜色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1)
}

main()