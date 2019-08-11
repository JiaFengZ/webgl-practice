/**
 * 逐顶点计算点光源照射
 */

var VSHADER_SPURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal; // 法向量
  uniform mat4 u_ModelMatrix; // 模型矩阵
  uniform mat4 u_NormalMatrix; // 用来变换法向量的矩阵
  uniform mat4 u_MvpMatrix;
  uniform vec3 u_LightColor;
  uniform vec3 u_LightPosition; // 光源位置
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 归一化法向量
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    // 计算顶点的世界坐标
    vec4 vertexPosition = u_ModelMatrix * a_Position;
    // 计算光线方向
    vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
    // 计算光线和法线的点积
    float nDotL = max(dot(lightDirection, normal), 0.0);
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
main()

function main() {
  var canvas = document.getElementById('webgl')
  var gl = getWebGLContext(canvas)

  initShaders(gl, VSHADER_SPURCE, FSHADER_SOURCE)

  var n = initVertextBuffers(gl)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  draw(gl, canvas, n)
}

function draw(gl, canvas, n) {
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
  // 设置光线颜色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)
  
  // 设置点光源
  gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0)

  var modelMatrix = new Matrix4()
  modelMatrix.setRotate(90, 0, 1, 0) // 绕Y轴旋转
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  var normalMatrix = new Matrix4() // 对法线变换
  normalMatrix.setInverseOf(modelMatrix) // 计算逆矩阵
  normalMatrix.transpose() // 转置
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  var mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
  // 左乘视图矩阵
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
  //mvpMatrix.lookAt(-7, 2.5, 6, 0, 0, 0, 0, 1, 0)
  mvpMatrix.multiply(modelMatrix)
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

  // 绘制
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initVertextBuffers(gl) {
  var vertices = new Float32Array([ // 顶点坐标
    1, 1, 1,  -1, 1, 1,  -1, -1, 1,  1, -1, 1, // 前面
    1, 1, 1,  1, -1, 1,  1, -1, -1,  1, 1, -1, // 右面
    1, 1, 1,  1, 1, -1,  -1, 1, -1,  -1, 1, 1, // 上面
    -1, -1, -1,  -1, 1, -1,  -1, 1, 1,  -1, -1, 1, // 左面
    -1, -1, -1,  1, -1, -1,  1, -1, 1,  -1, -1, 1, // 下面
    -1, -1, -1,  -1, 1, -1,  1, 1, -1, 1, -1, -1 // 后面
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
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,,
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