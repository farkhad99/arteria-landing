import { prisma } from 'lib/prisma'

const sendTelegram = async ({ name, email, company, phone, message }) => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return { ok: false, error: 'Missing Telegram configuration' }
  }

  const text = [
    'New contact form request',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || '-'}`,
    `Phone: ${phone || '-'}`,
    `Message: ${message}`,
  ].join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return { ok: false, error: errorText }
  }

  return { ok: true }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, company, phone, message } = req.body || {}
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' })
    }

    const saved = await prisma.contactRequest.create({
      data: {
        name,
        email,
        company: company || null,
        phone: phone || null,
        message,
      },
    })

    const telegramResult = await sendTelegram({ name, email, company, phone, message })
    return res.status(201).json({
      item: saved,
      telegramSent: telegramResult.ok,
      telegramError: telegramResult.error || null,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to submit contact form' })
  }
}
