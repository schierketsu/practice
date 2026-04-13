## Первый раз
```bash
npm ci
cd server && npm ci && cd ..
```

Скопируйте настройки API:
```bash
copy server\.env.example server\.env
```

База и клиент Prisma:
```bash
cd server
npx prisma generate
npx prisma migrate dev
cd ..
```


## Запуск 
**Терминал 1 — API** (порт из `PORT` в `server/.env`, обычно `3001`):
```bash
npm run server
```

**Терминал 2 — сайт** (Vite, обычно http://localhost:5173):
```bash
npm run dev
```
