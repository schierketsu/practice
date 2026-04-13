import 'dotenv/config'
import { app } from './app.js'
import { getMailMode } from './lib/mail.js'

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`)
  if (getMailMode() === 'log') {
    console.warn(
      '[mail] MAIL_MODE=log: заявки на практику не уходят на SMTP — текст писем только в этой консоли. На продакшене используйте MAIL_MODE=smtp на сервере с открытым исходящим SMTP.',
    )
  }
})
