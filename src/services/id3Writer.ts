import type { Track } from '@/types'

function toSynchSafe(num: number): number[] {
  const bytes = [0, 0, 0, 0]
  for (let i = 3; i >= 0; i--) {
    bytes[i] = num & 0x7f
    num >>= 7
  }
  return bytes
}

function createTextFrame(frameId: string, text: string): ArrayBuffer {
  const textBytes = new TextEncoder().encode(text)
  const frameSize = 1 + textBytes.byteLength
  const buffer = new ArrayBuffer(10 + frameSize)
  const view = new DataView(buffer)

  for (let i = 0; i < 4; i++) {
    view.setUint8(i, frameId.charCodeAt(i))
  }

  view.setUint32(4, frameSize, false)
  view.setUint16(8, 0, false)
  view.setUint8(10, 0x03)

  new Uint8Array(buffer, 11).set(textBytes)

  return buffer
}

function createApicFrame(coverBlob: Blob): Promise<ArrayBuffer> {
  return new Promise(async (resolve) => {
    const mimeType = coverBlob.type || 'image/jpeg'
    const imgData = new Uint8Array(await coverBlob.arrayBuffer())

    const mimeBytes = new TextEncoder().encode(mimeType + '\0')
    const descBytes = new TextEncoder().encode('\0')

    const frameSize = 1 + mimeBytes.byteLength + 1 + descBytes.byteLength + imgData.byteLength
    const buffer = new ArrayBuffer(10 + frameSize)
    const view = new DataView(buffer)

    for (let i = 0; i < 4; i++) {
      view.setUint8(i, 'APIC'.charCodeAt(i))
    }

    view.setUint32(4, frameSize, false)
    view.setUint16(8, 0, false)

    let offset = 10
    view.setUint8(offset, 0x03)
    offset++

    new Uint8Array(buffer, offset).set(mimeBytes)
    offset += mimeBytes.byteLength

    view.setUint8(offset, 0x03)
    offset++

    new Uint8Array(buffer, offset).set(descBytes)
    offset += descBytes.byteLength

    new Uint8Array(buffer, offset).set(imgData)

    resolve(buffer)
  })
}

function combineBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }

  return result.buffer
}

export async function writeId3Tags(
  audioBlob: Blob,
  track: Track,
  coverBlob?: Blob | null
): Promise<Blob> {
  const frames: ArrayBuffer[] = []

  if (track.title) frames.push(createTextFrame('TIT2', track.title))
  if (track.artist) frames.push(createTextFrame('TPE1', track.artist))
  if (track.album) frames.push(createTextFrame('TALB', track.album))
  if (track.year) frames.push(createTextFrame('TYER', String(track.year)))
  if (track.genre) frames.push(createTextFrame('TCON', track.genre))

  if (coverBlob) {
    try {
      const apic = await createApicFrame(coverBlob)
      frames.push(apic)
    } catch {
      // Cover art es opcional
    }
  }

  const framesBuffer = combineBuffers(frames)
  const paddingSize = 2048
  const tagSize = framesBuffer.byteLength + paddingSize

  const header = new ArrayBuffer(10)
  const headerView = new DataView(header)

  headerView.setUint32(0, 0x49443300, false)
  headerView.setUint8(3, 0x03)
  headerView.setUint8(4, 0x00)
  headerView.setUint8(5, 0x00)

  const synchSize = toSynchSafe(tagSize)
  for (let i = 0; i < 4; i++) {
    headerView.setUint8(6 + i, synchSize[i])
  }

  const padding = new ArrayBuffer(paddingSize)

  const audioData = await audioBlob.arrayBuffer()

  const finalBuffer = combineBuffers([header, framesBuffer, padding, audioData])

  const mimeType = audioBlob.type || 'audio/mpeg'
  return new Blob([finalBuffer], { type: mimeType })
}

export async function getMimeType(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer.slice(0, 4))

  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg'
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'audio/mpeg'
  if (bytes[0] === 0x66 && bytes[1] === 0x74 && bytes[2] === 0x79 && bytes[3] === 0x70) return 'audio/mp4'
  if (bytes[0] === 0x4d && bytes[1] === 0x34 && bytes[2] === 0x41 && bytes[3] === 0x20) return 'audio/mp4'

  return 'audio/mpeg'
}
