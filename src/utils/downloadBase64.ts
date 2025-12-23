/**
 * Download a base64 encoded file
 * @param base64 - The base64 encoded file content
 * @param filename - The filename to save as
 * @param mimetype - The MIME type of the file
 */
export function downloadBase64File(base64: string, filename: string, mimetype: string): void {
  const link = document.createElement('a')
  link.href = `data:${mimetype};base64,${base64}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download a file from a blob
 * @param blob - The blob to download
 * @param filename - The filename to save as
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
