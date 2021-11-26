import renderLine from './line.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const CUBE_LINES = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0],
  [2, 6],
  [3, 7],
  [0, 4],
  [1, 5],
  [6, 7],
  [6, 4],
  [7, 5],
  [4, 5]
]

const CUBE_FACES = [
  // [3, 2, 6, 7], // bottom
  // [1, 3, 7, 5], // left
  // [0, 1, 3, 2], // back
  [6, 7, 5, 4], // front
  [2, 6, 4, 0], // front left
  [0, 1, 5, 4], // top
]

const render = (context, vertices, stroke, fill) => {
  CUBE_FACES.forEach(face => {
    context.beginPath()

    face.forEach((vertexIndex, index) => {
      index === 0 ?
        context.moveTo(...vertices[vertexIndex]) :
        context.lineTo(...vertices[vertexIndex])
    })

    context.closePath()

    if (fill) {
      context.fillStyle = fill
      context.fill()
    }

    if (stroke) {
      context.strokeStyle = stroke
      context.stroke()
    }
  })

  // uncomment to render just the edges, no faces
  // context.beginPath()
  // CUBE_LINES.forEach(([from, to], index) => {
  //   context.moveTo(...vertices[from])
  //   context.lineTo(...vertices[to])
  // })
  // context.closePath()
  // context.stroke()
  // context.fill()
}

export default render
