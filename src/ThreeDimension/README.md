## 模型矩阵、视图矩阵、投影矩阵
三个矩阵相乘得到最终的变换矩阵`模型视图投影矩阵`
```javascript
var modelMatrix = new Matrix4()
var viewMatrix = new Matrix4()
var projMatrix = new Matrix4()
var mvpMatrix = new Matrix4()

modelMatrix.setTranslate(0.75, 0, 0)
viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix)
```

## 隐藏面消除
开启隐藏面消除
```javascript
// 深度检测
gl.enable(gl.DEPTH_TEST)
// 绘制前消除深度缓冲区
gl.clear(gl.DEPTH_BUFFER_BIT)
```

## 深度冲突
如果两个表面过于接近，深度缓冲区有限的精度不足以区分深度，则产生深度冲突
可使用 `多边形偏移`机制解决问题。即自动在Z值上加上偏移量
```javascript
gl.enable(gl.POLYGON_OFFSET_FILL)
// 绘制前计算偏移量
/**
 * @param factor
 * @param units
 * 偏移量按照公式 m*factor+r*units计算，m表示顶点所在表面相对于观察者视线角度，r表示硬件能够区分的最小z值精度
*/
gl.polygonOffset(1.0, 1.0)
```