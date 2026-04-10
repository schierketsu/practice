import { z } from 'zod'

const EMAIL_MAX = 320
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export const registerFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Укажите email')
      .max(EMAIL_MAX, 'Email слишком длинный')
      .regex(emailRegex, 'Некорректный формат email')
      .transform((s) => s.toLowerCase()),
    password: z.string(),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    const pwd = data.password.trim()
    if (pwd.length < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароль не короче 12 символов',
        path: ['password'],
      })
    }
    if (data.password !== data.password.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Уберите пробелы в начале и в конце пароля',
        path: ['password'],
      })
    }
    if (!/[a-zа-яё]/.test(pwd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Нужна хотя бы одна строчная буква',
        path: ['password'],
      })
    }
    if (!/[A-ZА-ЯЁ]/.test(pwd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Нужна хотя бы одна заглавная буква',
        path: ['password'],
      })
    }
    if (!/\d/.test(pwd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Нужна хотя бы одна цифра',
        path: ['password'],
      })
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Нужен хотя бы один спецсимвол',
        path: ['password'],
      })
    }
    const local = data.email.split('@')[0] ?? ''
    if (local.length >= 3 && pwd.toLowerCase().includes(local.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароль не должен содержать локальную часть email',
        path: ['password'],
      })
    }
    if (data.passwordConfirm.trim() !== pwd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароли не совпадают',
        path: ['passwordConfirm'],
      })
    }
  })

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Укажите email').transform((s) => s.toLowerCase()),
  password: z.string().min(1, 'Укажите пароль'),
})

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
    password: z.string(),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    const pwd = data.password.trim()
    if (pwd.length < 12) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Пароль не короче 12 символов', path: ['password'] })
    }
    if (!/[a-zа-яё]/.test(pwd)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Нужна строчная буква', path: ['password'] })
    }
    if (!/[A-ZА-ЯЁ]/.test(pwd)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Нужна заглавная буква', path: ['password'] })
    }
    if (!/\d/.test(pwd)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Нужна цифра', path: ['password'] })
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Нужен спецсимвол', path: ['password'] })
    }
    if (data.passwordConfirm.trim() !== pwd) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Пароли не совпадают', path: ['passwordConfirm'] })
    }
  })
