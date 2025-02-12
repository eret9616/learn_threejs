// varying变量用于在顶点着色器和片元着色器之间传递数据
varying float cameraDistance;

void main() {
    // 将顶点位置从模型空间转换到裁剪空间
    // projectionMatrix: 投影矩阵，处理透视效果
    // modelViewMatrix: 模型视图矩阵，处理模型在相机空间中的位置和旋转
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 计算顶点在世界空间中的位置
    // modelMatrix: 模型矩阵，将顶点从模型空间转换到世界空间
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    // 计算从相机位置到顶点的方向向量
    // cameraPosition: 相机在世界空间中的位置（Three.js内置变量）
    // worldPosition.xyz: 顶点的世界坐标
    vec3 viewVector = cameraPosition - worldPosition.xyz;
   
    // 计算相机到顶点的距离（向量长度）
    // length(): GLSL内置函数，计算向量的长度
    cameraDistance = length(viewVector);

    // 根据相机距离动态设置点的大小
    // 点的大小与距离成反比，距离越远点越小
    gl_PointSize = 100.0 / cameraDistance;
}