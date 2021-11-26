import Vector from '../models/vector.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

export const remap = (value, [oldmin, oldmax], [newmin, newmax]) => {
  return newmin + (newmax - newmin) * (value - oldmin) / (oldmax - oldmin)
}

export const grid = ({ from, to, by }, fn) => {
  const results = []

  for (let row = from.x; row <= to.x; row += by.x) {
    for (let column = from.y; column <= to.y; column += by.y) {
      const coordinates = Vector.from([row, column])

      results.push(fn ? fn(coordinates) : coordinates)
    }
  }

  return results
}

export const cube = ({ from, to, by }, fn) => {
  const results = []

  for (let row = from.x; row < to.x; row += by.x) {
    for (let column = from.y; column < to.y; column += by.y) {
      for (let depth = from.z; depth < to.z; depth += by.z) {
        const coordinates = Vector.from([row, column, depth])

        results.push(fn ? fn(coordinates) : coordinates)
      }
    }
  }

  return results
}

export const cubeSurface = ({ from, to, by }, fn) => {
  const results = []
  const surface = from.concat(to)

  for (let row = from.x; row <= to.x; row += by.x) {
    for (let column = from.y; column <= to.y; column += by.y) {
      for (let depth = from.z; depth <= to.z; depth += by.z) {
        const coordinates = Vector.from([row, column, depth])

        if (coordinates.some(coord => surface.includes(coord))) {
          results.push(fn ? fn(coordinates) : coordinates)
        }
      }
    }
  }

  return results
}

// Array#sort is unstable
export const stableSort = (array, compare) => {
  const list = array.map((value, index) => ({ value, index }))

  list.sort((a, b) => {
    const r = compare(a.value, b.value)

    return r == 0 ? a.index - b.index : r
  })

  return list.map(element => element.value)
}

export const sample = array => array[Math.floor(Math.random() * array.length)]

export const durstenfeldShuffle = array => {
  const results = array.slice()

  for (var i = results.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = results[i]

    results[i] = results[j]
    results[j] = temp
  }

  return results
}

export const range = (from, to, by) => {
  const values = []

  for (let i = from; i < to; i += by) {
    values.push(i)
  }

  return values
}

export const clamp = (value, [min, max]) => Math.min(Math.max(value, min), max)

export const lerp = (start, end, amount) => (1 - amount) * start + amount * end
