/**
 * 多节点模型
 */
var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal; // 法向量
  uniform mat4 u_MvpMatrix; // 模型视图投影矩阵
  uniform mat4 u_NormalMatrix; // 用来变换法向量的矩阵
  uniform vec3 u_LightColor; // 平行光颜色
  uniform vec3 u_LightDirection; // 平行光线方向
  uniform vec3 u_AmbientLight; // 环境光漫反射
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 归一化法向量
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    // 计算光线和法线的点积
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    // 计算漫反射光颜色
    vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
    // 计算环境光反射
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    v_Color = vec4(diffuse + ambient, a_Color.a);
  }
`

// 片元着色器
var FSHADER_SOURCE = `
  // 片元着色器使用变量必须声明精度，否则报错失败
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    // 片元颜色
    gl_FragColor = v_Color;
  }
`

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)
  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)
  var n = initVertextBuffers(gl)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  
  // 设置光照
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)
  var lightDirection = new Vector3([0.5, 3.0, 4.0])
  lightDirection.normalize()
  gl.uniform3fv(u_LightDirection, lightDirection.elements)

  // 计算视图投影矩阵
  var viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  // 注册事件
  document.addEventListener('keydown', function(event) {
    keydown(event, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
  })

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

var ANGLE_STEP = 3.0 // 每次按键转动的角度
var g_arm1Angle = 90.0 // arm1的当前角度
var g_joint1Angle = 45.0 // joint1的当前角度
var g_joint2Angle = 0.0 // joint2的当前角度
var g_joint3Angle = 0.0 // joint3的当前角度

function keydown(event, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  switch (event.keyCode) {
    case 38: // 上方向键 arm2绕z轴正向转动
      if (g_joint1Angle < 235.0) {
        g_joint1Angle += ANGLE_STEP
      }
      break
    case 40: // 下方向键 arm2绕z轴负向转动
      if (g_joint1Angle > -135.0) {
        g_joint1Angle -= ANGLE_STEP
      }
      break
    case 37: // 左方向键 arm1绕y轴正向转动
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360
      break
    case 39: // 右方向键 arm1绕y轴负向转动
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360
      break
    case 90: // z键 joint2正向转动
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360
      break
    case 88: // x键 joint2负向转动
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360
      break
    case 86: // v键 joint3正向转动
      if (g_joint3Angle < 60.0) {
        g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360
      }
      break
    case 67: // c键 joint3负向转动
      if (g_joint3Angle > -60.0) {
        g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360
      }
      break
    default:
      return
  }
  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

var g_modelMatrix = new Matrix4() // 模型矩阵
var g_mvpMatrix = new Matrix4() // 模型视图投影矩阵
var g_normalMatrix = new Matrix4() // 法线旋转矩阵
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // 基座
  var baseHeight = 2.0
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0)
  drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
  
  // arm1
  var arm1Length = 10.0
  g_modelMatrix.translate(0.0, baseHeight, 0.0) // 移至基座
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0) //绕y轴旋转
  drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)

  // arm2
  var arm2Length = 10.0
  g_modelMatrix.translate(0.0, arm1Length, 0.0) // 移至joint1处
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0) // 绕z轴旋转
  drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)

  // palm
  var palmLength = 2.0
  g_modelMatrix.translate(0.0, arm2Length, 0.0)
  g_modelMatrix.rotate(g_joint2Angle, 0.0, 0.0, 1.0)
  drawBox(gl, n, 2.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)

  // 移至palm的中点
  g_modelMatrix.translate(0.0, palmLength, 0.0)
  // 绘制 fingler1
  pushMatrix(g_modelMatrix)
  g_modelMatrix.translate(0.0, 0.0, 2.0)
  g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0)
  drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)

  // finger2
  g_modelMatrix = popMatrix()
  g_modelMatrix.translate(0.0, 0.0, -2.0)
  g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0)
  drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

var g_matrixStack = []
function pushMatrix(m) {
  var m2 = new Matrix4(m)
  g_matrixStack.push(m2)
}

function popMatrix() {
  return g_matrixStack.pop()
}

// 绘制立方体
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  pushMatrix(g_modelMatrix) // 保存原始矩阵模型
  g_modelMatrix.scale(width, height, depth)
  // 计算模型视图矩阵并传递给u_mvpMatrix变量
  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements)

  // 计算法向量变换矩阵并传递给u_NormalMatrix变量
  g_normalMatrix.setInverseOf(g_modelMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements)

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
  g_modelMatrix = popMatrix() // 还原矩阵模型
}

// 初始化立方体模型顶点
function initVertextBuffers(gl) {
  var vertices = new Float32Array([ // 顶点坐标 每个面逆时针（正视法向量方向观察）绘制顶点
    0.5, 1, 0.5,  -0.5, 1, 0.5,  -0.5, 0, 0.5,  0.5, 0, 0.5, // 前面
    0.5, 1, 0.5,  0.5, 0, 0.5,  0.5, 0, -0.5,  0.5, 1, -0.5, // 右面
    0.5, 1, 0.5,  0.5, 1, -0.5,  -0.5, 1, -0.5,  -0.5, 0.5, 0.5, // 上面
    -0.5, 0, -0.5,  -0.5, 1, -0.5,  -0.5, 1, 0.5,  -0.5, 0, 0.5, // 左面
    -0.5, 0, -0.5,  0.5, 0, -0.5,  0.5, 0, 0.5,  -0.5, 0, 0.5, // 下面
    -0.5, 0, -0.5,  -0.5, 1, -0.5,  0.5, 1, -0.5, 0.5, 0, -0.5 // 后面
  ])
  var colors = new Float32Array([ // 颜色
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
  ])
  var indices = new Uint8Array([ // 顶点索引， 6个面，每个面两个三角形，每个三角形3个顶点，顶点逆时针绘制
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9 ,10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ])

  var normals = new Float32Array([ // 法向量
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    1, 0, 0, 1, 0, 0,  1, 0, 0,  1, 0, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
  ])

  var indexBuffer = gl.createBuffer()
  initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')
  initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')
  initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  return indices.length
}

function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  var a_attribute = gl.getAttribLocation(gl.program, attribute)
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
  gl.enableVertexAttribArray(a_attribute)
  return true
}

main()