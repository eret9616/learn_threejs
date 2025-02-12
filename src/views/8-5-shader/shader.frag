// 定义uniform变量，这些变量可以从JavaScript传入着色器
uniform vec3 color;        // 粒子的基础颜色
uniform sampler2D pointTexture;  // 点精灵纹理，用于渲染粒子
uniform vec3 fogColor;     // 雾的颜色
uniform float fogNear;     // 雾效果的起始距离
uniform float fogFar;      // 雾效果的结束距离

void main() {
    // 将基础颜色与点精灵纹理相乘，得到粒子的最终颜色
    // gl_PointCoord是内置变量，表示点精灵中的纹理坐标
    vec4 color = vec4(color,1.0) * texture2D(pointTexture,gl_PointCoord);

    gl_FragColor = color;

    // 计算片元到相机的距离
    // gl_FragCoord.z是片元的深度值，需要除以gl_FragCoord.w进行透视除法
    float depth = gl_FragCoord.z / gl_FragCoord.w;

    // 使用smoothstep函数计算雾化因子
    // smoothstep在fogNear和fogFar之间进行平滑插值
    // 当depth <= fogNear时，返回0（无雾）
    // 当depth >= fogFar时，返回1（完全雾化）
    // 在fogNear和fogFar之间时，返回0-1之间的平滑过渡值
    float fogFactor = smoothstep(fogNear,fogFar,depth);

    // 使用mix函数根据雾化因子混合原始颜色和雾的颜色
    // mix(x,y,a)函数返回x*(1-a) + y*a
    // 当fogFactor为0时，保持原始颜色
    // 当fogFactor为1时，完全显示雾的颜色
    // 当fogFactor在0-1之间时，按比例混合两种颜色
    gl_FragColor.rgb = mix(gl_FragColor.rgb,fogColor,fogFactor);
}