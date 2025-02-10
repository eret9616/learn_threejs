/*
这些变量需要在两个着色器中都声明：
在顶点着色器中声明并赋值
在片元着色器中声明并使用
*/
// 从顶点着色器接收颜色数据
varying vec3 vColor;
// 从顶点着色器接收透明度数据
varying float vAlpha;

void main(){
    // 设置片元（像素）的最终颜色
    // vec4的四个分量分别表示：红色、绿色、蓝色和透明度(alpha)
    // vColor提供RGB值，vAlpha提供透明度值
    gl_FragColor = vec4(vColor, vAlpha);
}

