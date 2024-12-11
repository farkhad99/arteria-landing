function clamp(min, input, max) {
  return Math.max(min, Math.min(input, max))
}

function mapRange(inMin, inMax, input, outMin, outMax) {
  return ((input - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

function truncate(value, decimals) {
  return parseFloat(value.toFixed(decimals))
}

function pad(n) {
  if (n < 10) return '0' + n
  return n
}

const Maths = { lerp, clamp, mapRange, truncate, pad }

export { lerp, clamp, mapRange, truncate, pad }
export default Maths
