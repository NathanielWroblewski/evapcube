// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const render = (context, [x1, y1,], [x2, y2,], stroke, width) => {
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)

  if (stroke) {
    context.lineWidth = width
    context.strokeStyle = stroke
    context.stroke()
  }

  context.lineWidth = 1
}

export default render
