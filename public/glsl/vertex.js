export const VERTEX_SOURCE = `#version 300 es
  layout(location=0) in vec3 a_position;
  layout(location=1) in vec3 a_center;
  layout(location=2) in float a_diffuse;

  uniform vec2 u_resolution;
  uniform float u_t;

  out vec4 v_color;

  void main () {
    float percent = (sin((0.9 * (a_center.z + a_center.y/175.0)) + u_t) + 1.0) / 2.0;
    vec3 difference = a_center.xyz - a_position;
    vec3 position = a_position.xyz + (difference * percent);
    vec2 zeroToOne = position.xy / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);

    if (a_diffuse == 0.0) {
      v_color = vec4(0.133, 0.290, 0.254, 1.0);
    } else {
      vec3 ambient = vec3(0.016 * 2.5, 0.0945 * 2.5, 0.0765 * 2.5);
      vec3 materialColor = vec3(0.16, 0.945, 0.765);
      vec3 lightColor = vec3(0.16, 0.945, 0.765);

      vec3 color = ambient + (materialColor * lightColor * a_diffuse);
      v_color = vec4(color, 1.0);
    }
  }
`
