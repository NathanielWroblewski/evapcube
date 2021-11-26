// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

export const createShader = (gl, type, source) => {
  const shader = gl.createShader(type)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  } else {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw new Error('Shader did not compile')
  }
}

export const createProgram = (gl, vertexShader, fragmentShader, tfvs = []) => {
  const program = gl.createProgram()

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  if (tfvs.length) gl.transformFeedbackVaryings(program, tfvs, gl.SEPARATE_ATTRIBS)

  gl.linkProgram(program)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  } else {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)

    throw new Error('GPU Program did not compile')
  }
}

export const link = (gl, vertexShaderSource, fragmentShaderSource, tfvs) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  return createProgram(gl, vertexShader, fragmentShader, tfvs)
}

export const bufferAttr = (gl, program, vao, attribute, data, config) => {
  const attributeLocation = gl.getAttribLocation(program, attribute)
  const buffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW) // data is Float32Array

  if (vao) gl.bindVertexArray(vao)

  gl.enableVertexAttribArray(attributeLocation)

  const { size = 2, type = gl.FLOAT, normalize = false, stride = 0, offset = 0 } = config || {}

  gl.vertexAttribPointer(
    attributeLocation,
    size,
    type,
    normalize,
    stride, // size * Float32Array.BYTES_PER_ELEMENT for interleaved buffers
    offset
  )

  return buffer;
}

export const clear = (gl, rgba) => {
  gl.clearColor(...rgba.map(value => value / 255))
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

export const setUniform = (gl, program, uniform, value) => {
  const uniformLocation = gl.getUniformLocation(program, uniform)

  switch (value.length) {
    case 1:
      gl.uniform1f(uniformLocation, ...value);
      break;
    case 2:
      gl.uniform2f(uniformLocation, ...value);
      break;
    case 3:
      gl.uniform3f(uniformLocation, ...value);
      break;
    case 4:
      gl.uniform4f(uniformLocation, ...value);
      break;
  }

  return uniformLocation
}
