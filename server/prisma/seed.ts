import { PrismaClient, Role, ReviewStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

const companies = [
  {
    name: 'БОКУС',
    logo: '/bokus.jpg',
    description:
      'Нравится делать веб приложения, которые реально используют тысячи людей? Мы покажем тебе, как создавать современные сайты на PHP и Vue, делать мобильные приложения на Flutter и работать с Битрикс. Здесь ты будешь работать над настоящими проектами для крупных клиентов, а не на учебных задачах. Приходи, стань частью команды.',
    technologies: ['PHP', 'TypeScript', 'Vue', 'Flutter'],
    sector: 'Автоматизация бизнеса',
    contacts: 'hr@bocus.ru, +7 (495) 123-45-67',
    city: 'Чебоксары',
    universities: ['ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'],
    faculty: 'факультет ИВТ',
    lat: 56.15233,
    lng: 47.195723,
  },
  {
    name: 'ЭКРА',
    logo: '/ekra.jpg',
    description:
      'Нравится программировать чипы и работать с железом? Мы покажем тебе, как писать на C++ для микроконтроллеров, создавать API на FastAPI и Python, делать системы управления оборудованием. Здесь ты сможешь прикоснуться к реальным промышленным проектам и понять, как код управляет физическим миром. Присоединяйся, будет интересно.',
    technologies: ['C#', 'C++', 'Python', 'FastAPI'],
    sector: 'Микроконтролллеры',
    contacts: 'practice@ekra.ru, +7 (812) 234-56-78',
    city: 'Чебоксары',
    universities: ['ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'],
    faculty: 'факультет ИВТ',
    lat: 56.112333,
    lng: 47.257424,
  },
  {
    name: 'F5',
    logo: '/f5.jpg',
    description:
      'Хочешь делать приложения, которые работают без сбоев для миллионов пользователей? Мы покажем тебе Laravel для бэкенда, Kotlin и Flutter для мобилок, 1C CRM для бизнеса. Здесь ты узнаешь, как строить надежные системы, которые не падают под нагрузкой. Приходи, научим делать продукты уровня enterprise.',
    technologies: ['Laravel', '1C', 'Kotlin', 'Flutter'],
    sector: 'Автоматизация бизнеса',
    contacts: 'careers@f5.com, +7 (495) 345-67-89',
    city: 'Чебоксары',
    universities: ['ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'],
    faculty: 'факультет ИВТ',
    lat: 56.134753,
    lng: 47.244015,
  },
  {
    name: 'КЕЙСИСТЕМС',
    logo: '/keysystems.png',
    description:
      'Интересует информационная безопасность и защита данных? Мы покажем тебе React для фронтенда, Python и C# для бэкенда, Entity Framework для работы с базами. Здесь ты научишься строить безопасные системы, которые защищают данные пользователей. Приходи, стань тем, кто защищает цифровой мир.',
    technologies: ['React', 'Python', 'TypeScript', 'C#'],
    sector: 'Инфобез',
    contacts: 'hr@keysystems.ru, +7 (495) 567-89-01',
    city: 'Чебоксары',
    universities: ['ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'],
    faculty: 'факультет ИВТ',
    lat: 56.151836,
    lng: 47.234289,
  },
]

const seedReviews: Record<
  number,
  Array<{
    author: string
    periodLabel: string
    text: string
    rating: number
    employment: string
    location: string
  }>
> = {
  1: [
    {
      author: 'Алексей Петров',
      periodLabel: 'лето 2025',
      text: 'Отличная практика! Научился работать с Vue и PHP на реальных проектах. Команда очень дружелюбная, всегда помогут разобраться. Рекомендую!',
      rating: 5,
      employment: 'Трудоустройство не предложили',
      location: 'Проходил удаленно',
    },
    {
      author: 'Мария Иванова',
      periodLabel: 'зима 2026',
      text: 'Практика превзошла все ожидания. Получил много практического опыта, работал над интересными задачами. Особенно понравилось работать с Flutter.',
      rating: 4,
      employment: 'Трудоустройство предложили',
      location: 'Проходил в офисе',
    },
  ],
  2: [
    {
      author: 'Дмитрий Сидоров',
      periodLabel: 'осень 2025',
      text: 'Интересная практика по микроконтроллерам. Узнал много нового про C++ и Python. Работа с железом - это совсем другой уровень программирования!',
      rating: 5,
      employment: 'Трудоустройство не предложили',
      location: 'Проходил в офисе',
    },
    {
      author: 'Елена Козлова',
      periodLabel: 'весна 2026',
      text: 'Отличный опыт работы с FastAPI. Команда профессионалов, всегда готовы помочь. Получил ценные знания, которые пригодятся в будущем.',
      rating: 4,
      employment: 'Трудоустройство предложили',
      location: 'Проходил удаленно',
    },
  ],
  3: [
    {
      author: 'Иван Смирнов',
      periodLabel: 'лето 2025',
      text: 'Практика в F5 - это отличная возможность поработать с enterprise-технологиями. Laravel, Kotlin, Flutter - все на реальных проектах. Очень доволен!',
      rating: 5,
      employment: 'Трудоустройство не предложили',
      location: 'Проходил удаленно',
    },
    {
      author: 'Анна Волкова',
      periodLabel: 'зима 2026',
      text: 'Отличная команда и интересные задачи. Научилась работать с 1C CRM и мобильной разработкой. Практика дала много практических навыков.',
      rating: 4,
      employment: 'Трудоустройство предложили',
      location: 'Проходил в офисе',
    },
  ],
  4: [
    {
      author: 'Сергей Новиков',
      periodLabel: 'осень 2025',
      text: 'Практика по информационной безопасности очень интересная. Работал с React, Python и C#. Узнал много про безопасность данных и защиту систем.',
      rating: 5,
      employment: 'Трудоустройство не предложили',
      location: 'Проходил в офисе',
    },
    {
      author: 'Ольга Морозова',
      periodLabel: 'весна 2026',
      text: 'Отличный опыт! Команда профессионалов, интересные проекты. Особенно понравилось работать с Entity Framework и базами данных.',
      rating: 4,
      employment: 'Трудоустройство предложили',
      location: 'Проходил удаленно',
    },
  ],
}

const seedUniversityNames = [
  'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА',
  'МГУ им. М. В. Ломоносова',
  'СПбГУ',
  'НИУ ВШЭ',
  'МФТИ',
  'КНИТУ-КАИ',
]

async function main() {
  await prisma.review.deleteMany()
  await prisma.company.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.university.deleteMany()
  await prisma.user.deleteMany()

  for (const name of seedUniversityNames) {
    await prisma.university.create({
      data: {
        name,
        faculties:
          name === 'ЧУВГУ ИМ. И. Н. УЛЬЯНОВА'
            ? { create: [{ name: 'факультет ИВТ' }] }
            : undefined,
      },
    })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@practice.local'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.create({
    data: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
    },
  })

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i]
    const company = await prisma.company.create({
      data: {
        ...c,
        technologies: c.technologies,
      },
    })
    const id = company.id
    const list = seedReviews[i + 1] ?? []
    for (const r of list) {
      await prisma.review.create({
        data: {
          companyId: id,
          authorDisplay: r.author,
          text: r.text,
          rating: r.rating,
          employment: r.employment,
          location: r.location,
          periodLabel: r.periodLabel,
          status: ReviewStatus.APPROVED,
        },
      })
    }
  }

  console.log('Seed OK. Admin:', adminEmail)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
