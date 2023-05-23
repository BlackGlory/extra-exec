export function removeTrailingNewline(text: string): string {
  return text.replace(/\n$/, '')
}
