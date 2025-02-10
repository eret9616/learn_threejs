// 定义点的透明度属性，用于控制每个顶点的透明度
attribute float alpha;
// 定义点的大小属性，用于控制每个顶点渲染时的大小
attribute float size;

// 定义传递给片元着色器的颜色变量
varying vec3 vColor;
// 定义传递给片元着色器的透明度变量
varying float vAlpha;
/* 
 基本语法规则：
 1. 大小写敏感
 2. 语句末尾必须要有分号
 3. 变量必须以$或_开头
 4. 函数名必须以小写字母开头
 6. 变量类型：float, int, vec2, vec3, vec4, mat2, mat3, mat4
 7. 常量：PI, TWO_PI, HALF_PI, ONE_OVER_PI, SQRT_2, SQRT_3, SQRT_6, SQRT_12, SQRT_24 
 
 变量声明
 1. attribute: 顶点属性，只能在顶点着色器中使用，用于传递顶点数据
 2. uniform: 全局变量，在所有顶点都具有相同的值
 3. varying: 传递给片元着色器的变量，用于在顶点着色器和片元着色器之间传递数据

 逐顶点，逐片元
 逐顶点：每个顶点都要执行1次顶点着色器主函数main中的程序
 逐片元：设置每个像素的颜色 gl_FragColor :片元像素的颜色，vec4(r,g,b,a)
*/

void main(){
    // 将顶点颜色数据传递给片元着色器
    vColor = color;
    // 将顶点透明度数据传递给片元着色器
    vAlpha = alpha;

    // 计算顶点的最终位置：将局部坐标转换为裁剪空间坐标
    // projectionMatrix：投影矩阵，用于将3D坐标转换为2D屏幕坐标
    // modelViewMatrix：模型视图矩阵，用于将3D坐标转换为2D屏幕坐标
    // position：顶点的原始位置（vec3）
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
    // 设置点的大小：将输入的size属性乘以10作为最终的点大小
    gl_PointSize = size * 10.0;
}


