import { z } from 'zod'

const EMAIL_MAX = 320
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export const registerSchema = z
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
    if (pwd.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароль не короче 8 символов',
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

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: z.string(),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    const pwd = data.password.trim()
    if (pwd.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Пароль не короче 8 символов', path: ['password'] })
    }
    if (data.password !== data.password.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Уберите пробелы в начале и в конце пароля',
        path: ['password'],
      })
    }
    if (data.passwordConfirm.trim() !== pwd) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Пароли не совпадают', path: ['passwordConfirm'] })
    }
  })

export const createReviewSchema = z.object({
  text: z.string().trim().min(10, 'Минимум 10 символов').max(5000),
  rating: z.coerce.number().int().min(1).max(5),
  employment: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  periodLabel: z.string().trim().max(100).optional(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(120),
  lastName: z.string().trim().max(120),
})

const companySlugSchema = z
  .string()
  .trim()
  .min(2, 'Минимум 2 символа')
  .max(80)
  .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
    message: 'Только латиница, цифры и дефисы между блоками, без пробелов',
  })
  .refine((s) => !/^\d+$/.test(s), {
    message: 'Адрес не может состоять только из цифр (как у старого id)',
  })
  .transform((s) => s.toLowerCase())

export const companyWriteSchema = z.object({
  slug: companySlugSchema,
  name: z.string().trim().min(1).max(200),
  logo: z.string().trim().min(1).max(800),
  description: z.string().trim().min(1).max(20000),
  technologies: z.array(z.string().trim().min(1).max(80)).min(1),
  sector: z.string().trim().min(1).max(200),
  contacts: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(200),
  universities: z.array(z.string().trim().min(1).max(300)).min(1),
  faculty: z.string().trim().min(1).max(300),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  galleryCount: z.coerce.number().int().min(1).max(10).optional().default(3),
  galleryImages: z.array(z.string().trim().min(1).max(800)).max(20).optional().default([]),
})
