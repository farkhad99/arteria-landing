export function renderProjectBody(body) {
  if (!body) return null

  if (typeof body === 'string') {
    return body
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block, index) => (
        <p key={index} className="p">
          {block}
        </p>
      ))
  }

  return null
}
