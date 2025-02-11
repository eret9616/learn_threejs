attribute float size; // 使用js中定义的属性
varying vec3 vColor;
varying float vSize; //  声明变量

void main() {
  vSize = size; // 接下来做一些赋值，最后给片元着色器使用
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = vSize * 30.0;
}