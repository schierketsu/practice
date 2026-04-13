import dns from 'node:dns'
import nodemailer from 'nodemailer'

/** `smtp` — реальная отправка. `log` — только вывод в консоль (домашняя сеть часто блокирует SMTP). */
export function getMailMode(): 'smtp' | 'log' {
  const m = (process.env.MAIL_MODE || 'smtp').toLowerCase().trim()
  return m === 'log' ? 'log' : 'smtp'
}

/**
 * По умолчанию резолвим SMTP только в IPv4: у части сетей IPv6 до smtp.mail.ru «висит» и даёт ETIMEDOUT.
 * Отключить: SMTP_IPV4_ONLY=false
 */
function smtpLookup(): nodemailer.TransportOptions['lookup'] | undefined {
  const v = (process.env.SMTP_IPV4_ONLY ?? 'true').toLowerCase()
  if (v === 'false' || v === '0' || v === 'no') return undefined
  return (hostname, _options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback)
  }
}

/** Как на фронте в CompanyDetailView: первый e-mail из строки «Контакты». */
export function extractContactEmail(contacts: string): string | null {
  const m = String(contacts ?? '').match(/[\w.-]+@[\w.-]+\.\w+/)
  return m ? m[0] : null
}

export function isMailConfigured(): boolean {
  if (getMailMode() === 'log') return true
  return !!(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS)
}

let transporter: nodemailer.Transporter | null = null

function smtpPort(): number {
  const n = parseInt(process.env.SMTP_PORT || '465', 10)
  return Number.isNaN(n) ? 465 : n
}

function getTransporter(): nodemailer.Transporter | null {
  if (getMailMode() === 'log') return null
  if (!process.env.SMTP_HOST?.trim() || !process.env.SMTP_USER?.trim() || !process.env.SMTP_PASS) return null
  if (!transporter) {
    const port = smtpPort()
    const secureEnv = process.env.SMTP_SECURE
    /** 465 — SSL; 587 — STARTTLS (часто не блокируют так же жёстко, как 465). */
    const useImplicitTls =
      secureEnv === 'true' || (secureEnv !== 'false' && port === 465)
    const connectionTimeout = parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '20000', 10) || 20000

    const lookup = smtpLookup()
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: useImplicitTls && port !== 587,
      requireTLS: port === 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout,
      greetingTimeout: connectionTimeout,
      socketTimeout: connectionTimeout,
      ...(lookup ? { lookup } : {}),
    })
  }
  return transporter
}

export type PracticeApplicationMailParams = {
  to: string
  from: string
  replyTo: string
  studentFirstName: string
  studentLastName: string
  studentEmail: string
  companyName: string
  coverLetter: string
}

function buildPracticeApplicationContent(params: PracticeApplicationMailParams): { subject: string; text: string } {
  const fn = params.studentFirstName.trim()
  const ln = params.studentLastName.trim()
  const who = [fn, ln].filter(Boolean).join(' ') || 'Студент'
  const intro = `Привет, я ${who}, хочу пройти у вас практику!`
  const contactsBlock =
    `Контактные данные для ответа\n` +
    `Пожалуйста, направляйте ответ на электронную почту, которую студент указал при регистрации на портале:\n` +
    `  Email: ${params.studentEmail}\n` +
    `  Имя и фамилия: ${who}\n` +
    `\n` +
    `В почтовой программе ответ на это письмо по умолчанию уйдёт на тот же адрес (поле Reply-To).`

  const text =
    `${intro}\n\n` +
    `${contactsBlock}\n\n` +
    `Сопроводительное письмо:\n${params.coverLetter}\n\n` +
    `---\n` +
    `Сообщение отправлено через практикастудентам.рф`

  const subject = `Заявка на практику — ${params.companyName}`.slice(0, 200)
  return { subject, text }
}

export async function sendPracticeApplicationMail(params: PracticeApplicationMailParams): Promise<void> {
  const { subject, text } = buildPracticeApplicationContent(params)

  if (getMailMode() === 'log') {
    console.log(
      '\n========== MAIL_MODE=log (SMTP не вызывается; для продакшена задайте MAIL_MODE=smtp на VPS) ==========',
    )
    console.log('From:', params.from)
    console.log('To:', params.to)
    console.log('Reply-To:', params.replyTo)
    console.log('Subject:', subject)
    console.log('---\n' + text + '\n======================================================================\n')
    return
  }

  const t = getTransporter()
  if (!t) {
    throw new Error('MAIL_NOT_CONFIGURED')
  }

  await t.sendMail({
    from: params.from,
    to: params.to,
    replyTo: params.replyTo,
    subject,
    text,
  })
}

export function getMailFromAddress(): string {
  if (getMailMode() === 'log') {
    return (process.env.MAIL_FROM || process.env.SMTP_USER || 'practice-dev@local.invalid').trim()
  }
  return (process.env.MAIL_FROM || process.env.SMTP_USER || '').trim()
}
