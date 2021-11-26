import Vector from './models/vector.js'
import FourByFour from './models/four_by_four.js'
import Camera from './models/orthographic.js'
import VORONOI from './data/voronoi.js'
import angles from './isomorphisms/angles.js'
import { VERTEX_SOURCE } from '../glsl/vertex.js'
import { FRAGMENT_SOURCE } from '../glsl/fragment.js'
import { stableSort, clamp } from './utilities/index.js'
import { link, bufferAttr, setUniform, clear } from './utilities/webgl.js'
import { FPS, Δt } from './constants/dimensions.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const canvas = document.querySelector('.canvas')
const gl = canvas.getContext('webgl2')

if (!gl) {
  alert('WebGL is required for this animation, and your browser does not support WebGL.')
} else {
  gl.viewport(0, 0, canvas.width, canvas.height)

  gl.disable(gl.DEPTH_TEST);

  const program = link(gl, VERTEX_SOURCE, FRAGMENT_SOURCE)
  gl.useProgram(program)

  const vao = gl.createVertexArray()

  let t = 0

  const campos = Vector.from([-100, -100, -100])
  const dim = 11
  const lights = [
    Vector.from([-dim, -dim, -dim]),
    Vector.from([dim, -dim, -dim]),
    Vector.from([-dim, dim, -dim]),
    Vector.from([-dim * 1.2, -dim * 1.2, dim * 0.8]),
  ]

  const perspective = FourByFour.identity()
    .rotX(angles.toRadians(55))
    .rotZ(angles.toRadians(60))

  const camera = new Camera({
    position: Vector.zeroes(),
    direction: Vector.zeroes(),
    up: Vector.from([0, 1, 0]),
    width: canvas.width,
    height: canvas.height,
    zoom: 0.025
  })

  const renderComparator = (a, b) => {
    const centera = Vector.from(a.center)
    const centerb = Vector.from(b.center)
    const diff = centera.distanceSquaredTo(campos) - centerb.distanceSquaredTo(campos)

    if (diff > 0) return -1
    if (diff < 0) return 1
    return 0
  }

  let voronoi = stableSort(VORONOI, renderComparator).map(cell => {
    const faces = stableSort(cell.faces, (a, b) => {
      const verticesa = a.indices.map(index => Vector.from(cell.points[index]))
      const verticesb = b.indices.map(index => Vector.from(cell.points[index]))
      const centroida = verticesa.reduce((memo, point) => memo.add(point), Vector.zeroes()).divide(3).transform(perspective)
      const centroidb = verticesb.reduce((memo, point) => memo.add(point), Vector.zeroes()).divide(3).transform(perspective)
      const diff = (centroida.distanceSquaredTo(campos) - centroidb.distanceSquaredTo(campos))

      if (diff > 0) return -1
      if (diff < 0) return 1
      return 0
    })

    return { ...cell, faces }
  })

  function * getFaces (voronoi) {
    for (let i = 0; i < voronoi.length; i++) {
      const cell = voronoi[i]

      for (let j = 0; j < cell.faces.length; j++) {
        const face = cell.faces[j]
        const vertexIndices = face.indices
        const edgeIndices = face.sides

        for (let k = 0; k < vertexIndices.length; k++) {
          const index = vertexIndices[k]
          const point = Vector.from(cell.points[index])
          const projected = camera.project(point.transform(perspective))

          yield projected[0]
          yield projected[1]
          yield 0.0
        }

        for (let l = 0; l < edgeIndices.length; l++) {
          const srcindex = edgeIndices[l][0]
          const srcpoint = Vector.from(cell.points[srcindex])
          const srcproj = camera.project(srcpoint.transform(perspective))
          const destindex = edgeIndices[l][1]
          const destpoint = Vector.from(cell.points[destindex])
          const destproj = camera.project(destpoint.transform(perspective))

          yield (srcproj[0] + 0.2)
          yield (srcproj[1] + 0.2)
          yield srcproj[2]

          yield (destproj[0] + 0.2)
          yield (destproj[1] + 0.2)
          yield destproj[2]

          yield srcproj[0]
          yield srcproj[1]
          yield srcproj[2]

          if (
            (destproj[2] < srcproj[2] && destproj[1] > srcproj[1]) ||
            (destproj[2] > srcproj[2] && destproj[1] < srcproj[1])
          ) {
            yield destproj[0]
            yield destproj[1]
            yield destproj[2]

            yield srcproj[0]
            yield srcproj[1]
            yield srcproj[2]

            yield (destproj[0] + 0.2)
            yield (destproj[1] + 0.2)
            yield destproj[2]
          } else {
            yield destproj[0]
            yield destproj[1]
            yield destproj[2]

            yield srcproj[0]
            yield srcproj[1]
            yield srcproj[2]

            yield (destproj[0] + 0.2)
            yield (destproj[1] + 0.2)
            yield destproj[2]
          }
        }
      }
    }
  }

  function * getCenters (voronoi) {
    for (let i = 0; i < voronoi.length; i++) {
      const cell = voronoi[i]
      const center = camera.project(Vector.from(cell.center).transform(perspective))

      for (let j = 0; j < cell.faces.length; j++) {
        const face = cell.faces[j]
        const vertexIndices = face.indices
        const edgeIndices = face.sides

        for (let k = 0; k < vertexIndices.length; k++) {
          yield center[0]
          yield center[1]
          yield cell.center[2]
        }

        for (let l = 0; l < edgeIndices.length; l++) {
          yield center[0]
          yield center[1]
          yield cell.center[2]

          yield center[0]
          yield center[1]
          yield cell.center[2]

          yield center[0]
          yield center[1]
          yield cell.center[2]

          yield center[0]
          yield center[1]
          yield cell.center[2]

          yield center[0]
          yield center[1]
          yield cell.center[2]

          yield center[0]
          yield center[1]
          yield cell.center[2]
        }
      }
    }
  }

  // isomorphism
  function hexToRgb (hex) {
    return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex).map(value => (
      parseInt(value, 16)
    )).slice(1, 4)
  }

  function * getDiffuse (voronoi) {
    for (let i = 0; i < voronoi.length; i++) {
      const cell = voronoi[i]

      for (let j = 0; j < cell.faces.length; j++) {
        const face = cell.faces[j]
        const vertexIndices = face.indices
        const edgeIndices = face.sides

        for (let k = 0; k < vertexIndices.length; k++) {
          const index = vertexIndices[k]
          const point = Vector.from(cell.points[index])
          const surfaceNormal = Vector.from(face.normal).add(point)
          const power = 2

          const facingRatios = lights.reduce((memo, light) => {
            const ray = light.subtract(point)
            const facingRatio = ray.dot(surfaceNormal)
            return Math.max(memo, (facingRatio / light.distanceSquaredTo(point)))
          }, 0)

          yield clamp(facingRatios * power, [0, 1])
        }

        for (let l = 0; l < edgeIndices.length; l++) {
          yield 0.0

          yield 0.0

          yield 0.0

          yield 0.0

          yield 0.0

          yield 0.0
        }
      }
    }
  }

  const positions = new Float32Array(getFaces(voronoi))
  const centers = new Float32Array(getCenters(voronoi))
  const diffuse = new Float32Array(getDiffuse(voronoi))

  gl.bindVertexArray(vao)

  const position = bufferAttr(gl, program, vao, 'a_position', positions, { size: 3 })
  const center = bufferAttr(gl, program, vao, 'a_center', centers, { size: 3 })
  const normal = bufferAttr(gl, program, vao, 'a_diffuse', diffuse, { size: 1 })

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindVertexArray(null)

  const u_t = setUniform(gl, program, 'u_t', [t])

  setUniform(gl, program, 'u_resolution', [canvas.width, canvas.height])

  const count = positions.length / 3

  const render = () => {
    gl.bindVertexArray(vao)
    gl.uniform1f(u_t, t + Δt)

    gl.drawArrays(gl.TRIANGLES, 0, count)

    if (t > 1000000) Δt = Δt * -1
    t += Δt
  }

  let prevTick = 0

  const step = () => {
    window.requestAnimationFrame(step)

    const now = Math.round(FPS * Date.now() / 1000)
    if (now === prevTick) return
    prevTick = now

    render()
  }

  step()
}
