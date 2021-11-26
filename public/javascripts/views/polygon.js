// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const render = (context, polygon, stroke, fill, width = 1, opacity = 1) => {
  context.beginPath()

  polygon.forEach(([x, y,], index) => {
    index === 0 ?
      context.moveTo(x, y) :
      context.lineTo(x, y)
  })

  context.closePath()
  context.globalAlpha = opacity

  context.shadowColor = stroke || fill

  context.lineWidth = width

  if (stroke) {
    context.strokeStyle = stroke
    context.stroke()
  }

  if (fill) {
    context.fillStyle = fill
    context.fill()
  }

  context.lineWidth = 1
  context.globalAlpha = 1
}

export default render
