import { sampleQrMatrixSvg } from '../../components/QRCode/sampleQrMatrix'

/**
 * A real QR code for the demo screens to show.
 *
 * Deck encodes nothing — `QRCode` draws a plate around a matrix you supply —
 * so every screen that offers to share something needs a matrix from
 * somewhere. This is the sample one the QRCode stories use, in a file of its
 * own so the card fixtures stay data.
 */
export const SampleQr = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)
