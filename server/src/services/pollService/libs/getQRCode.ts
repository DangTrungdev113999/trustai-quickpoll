import QRCode from 'qrcode'
import type { QRCodeData } from '@shared/types'
import { db } from '../../../lib/db'
import type { GetQRCodeParams } from '../types'

export async function getQRCode(params: GetQRCodeParams): Promise<QRCodeData> {
  const { pollId } = params
  const stored = db.getPoll(pollId)

  if (!stored) {
    throw new Error('Poll not found code:POLL_NOT_FOUND')
  }

  const shareUrl = `/poll/${pollId}`
  const qrCodeDataUrl = await QRCode.toDataURL(shareUrl)

  return {
    pollId,
    shareUrl,
    qrCodeDataUrl,
  }
}
