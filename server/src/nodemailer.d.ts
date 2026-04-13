/** Минимальные типы для nodemailer (без пакета @types/nodemailer). */
declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    requireTLS?: boolean
    auth?: { user?: string; pass?: string }
    connectionTimeout?: number
    greetingTimeout?: number
    socketTimeout?: number
    lookup?: (
      hostname: string,
      options: import('node:dns').LookupOptions,
      callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
    ) => void
  }

  export interface Transporter {
    sendMail(mail: {
      from?: string
      to?: string
      replyTo?: string
      subject?: string
      text?: string
    }): Promise<{ messageId: string }>
  }

  interface Nodemailer {
    createTransport(options: TransportOptions): Transporter
  }

  const nodemailer: Nodemailer
  export default nodemailer
}
