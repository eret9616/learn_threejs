varying vec3 vColor;
uniform sampler2D pointTexture;

void main() {
    vec4 color = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
    gl_FragColor = color;
}
