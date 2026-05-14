/**
 * Decodifica audio AAC/MP4 a PCM usando Web Audio API,
 * luego codifica a MP3 usando lamejs
 *
 * lamejs se carga desde public/lame.all.js como script (no como módulo ES)
 * para evitar problemas de CJS → ESM con Vite (MPEGMode no definido).
 * Se mantiene lazy-load: solo se carga al descargar.
 */

let lamejsModule: any = null

async function getLamejs(): Promise<any> {
  if (!lamejsModule) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/lame.all.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Error al cargar lamejs'))
      document.head.appendChild(script)
    })
    lamejsModule = (window as any).lamejs
  }
  return lamejsModule
}

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  return int16
}


export async function decodeToPcm(
  audioBlob: Blob
): Promise<{ left: Float32Array; right: Float32Array; sampleRate: number }> {
  const audioCtx = new AudioContext()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

  const channels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate

  let left: Float32Array
  let right: Float32Array

  if (channels >= 2) {
    left = audioBuffer.getChannelData(0)
    right = audioBuffer.getChannelData(1)
  } else {
    left = audioBuffer.getChannelData(0)
    right = left // Copiamos mono a ambos canales
  }

  audioCtx.close()
  return { left, right, sampleRate }
}

export async function encodeToMp3(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  bitrate: number
): Promise<Uint8Array[]> {
  const lamejs = await getLamejs()

  const encoder = new lamejs.Mp3Encoder(2, sampleRate, bitrate)
  const mp3Chunks: Uint8Array[] = []

  const sampleBlockSize = 1152
  let offset = 0

  while (offset < left.length) {
    const chunkSize = Math.min(sampleBlockSize, left.length - offset)

    const leftChunk = left.slice(offset, offset + chunkSize)
    const rightChunk = right.slice(offset, offset + chunkSize)

    const leftInt16 = float32ToInt16(leftChunk)
    const rightInt16 = float32ToInt16(rightChunk)

    const mp3Data = encoder.encodeBuffer(leftInt16, rightInt16)
    if (mp3Data.length > 0) {
      mp3Chunks.push(new Uint8Array(mp3Data))
    }

    offset += chunkSize
  }

  const mp3End = encoder.flush()
  if (mp3End.length > 0) {
    mp3Chunks.push(new Uint8Array(mp3End))
  }

  return mp3Chunks
}

export async function transcodeToMp3(
  audioBlob: Blob,
  bitrate: number
): Promise<Blob> {
  const pcm = await decodeToPcm(audioBlob)
  const mp3Chunks = await encodeToMp3(pcm.left, pcm.right, pcm.sampleRate, bitrate)

  const totalLength = mp3Chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of mp3Chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return new Blob([result], { type: 'audio/mpeg' })
}
