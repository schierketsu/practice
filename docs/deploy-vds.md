# Развёртывание на VDS (Ubuntu + nginx + Node)

Репозиторий: [github.com/schierketsu/practice](https://github.com/schierketsu/practice). Стек: фронт **Vite + Vue** (`dist/`), бэкенд **Node + Express + Prisma + SQLite**.

---

## 1. Что понадобится

- Сервер с **Ubuntu** (22.04/24.04), доступ по SSH.
- **Домен или поддомен** с A-записью на IP сервера — для нормального HTTPS и разделения с другими сайтами на том же VDS.
- Локально: только `git push` в репозиторий; на сервере секреты в **`server/.env`** (файл не коммитится).

---

## 2. Первичная настройка сервера

Подключитесь:

```bash
ssh user@ВАШ_IP
```

Установите пакеты (пример для Ubuntu):

```bash
sudo apt update
sudo apt install -y git nginx ufw
```

Установите **Node.js LTS** (20 или 22) — с [официального сайта Node.js](https://nodejs.org/) или через [NodeSource](https://github.com/nodesource/distributions).

Опционально **PM2** (удобно держать API запущенным):

```bash
sudo npm install -g pm2
```

---

## 3. Клонирование и зависимости

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/schierketsu/practice.git
cd practice
```

Если в клоне оказались лишние `node_modules` в git — удалите и поставьте заново:

```bash
rm -rf node_modules server/node_modules
```

---

## 4. Переменные окружения API

```bash
cd /var/www/practice/server
cp .env.example .env
nano .env
```

Обязательно задайте:

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Например `file:/var/www/practice/server/data/prod.db` |
| `JWT_SECRET` | Длинная случайная строка |
| `PORT` | Внутренний порт API, например `3001` (свободный на сервере) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Вход в админку (см. `.env.example`) |
| Почта | `MAIL_MODE=smtp`, `SMTP_*`, `MAIL_FROM` — на VDS SMTP обычно доступен |

Создайте каталог под БД:

```bash
mkdir -p /var/www/practice/server/data
```

---

## 5. Сборка бэкенда и миграции

```bash
cd /var/www/practice/server
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

Проверка вручную:

```bash
node dist/index.js
```

В другом терминале: `curl http://127.0.0.1:3001/api/health` → `{"ok":true}`. Остановите тест (`Ctrl+C`).

---

## 6. Сборка фронта

Если сайт открывается **с тем же доменом**, что и API (nginx проксирует `/api` и `/uploads` на Node), **`VITE_API_BASE` не задавайте** — запросы пойдут на тот же хост.

```bash
cd /var/www/practice
npm ci
npm run build
```

Появится каталог **`dist/`**.

Если API на **отдельном поддомене** (например `https://api.example.com`):

```bash
VITE_API_BASE=https://api.example.com npm run build
```

---

## 7. Запуск API через PM2

Рабочая директория должна быть **`server`**, чтобы читались `.env`, `uploads/` и путь к SQLite:

```bash
cd /var/www/practice/server
pm2 start dist/index.js --name practice-api
pm2 save
pm2 startup
# выполните команду, которую выведет pm2 startup (один раз)
```

---

## 8. nginx: один сайт на сервере

Пример сайта: домен **`practice.example.com`**, API на порту **3001**.

Файл `/etc/nginx/sites-available/practice`:

```nginx
server {
    listen 80;
    server_name practice.example.com;

    root /var/www/practice/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Включение и перезагрузка:

```bash
sudo ln -sf /etc/nginx/sites-available/practice /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**HTTPS** (после того как DNS указывает на сервер):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d practice.example.com
```

---

## 9. Если на VDS уже есть другой сайт

Ничего не удаляйте из `sites-enabled`, что обслуживает старый проект.

1. **Новый конфиг** — новый файл в `sites-available` и новая ссылка в `sites-enabled`.
2. У нового сайта **другой `server_name`** (другой домен или поддомен), иначе nginx не различит сайты на порту 80/443.
3. У нового API — **свой `PORT`** в `server/.env`, не занятый старым бэкендом.
4. Отдельный процесс PM2 (например `practice-api`), старый процесс не трогайте.

Открывать два разных полноценных сайта **только по одному IP без домена** неудобно: для IP nginx выберет один `server`. Нужен хотя бы поддомен.

---

## 10. Файрвол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Порт Node (**3001** и т.д.) **наружу не открывайте** — доступ только с localhost через nginx.

---

## 11. Обновление после `git push`

На сервере:

```bash
cd /var/www/practice
git pull

cd server
npm ci
npx prisma migrate deploy
npm run build
pm2 restart practice-api

cd ..
npm ci
npm run build
sudo systemctl reload nginx
```

---

## 12. Резервное копирование

Регулярно копируйте:

- файл базы из пути в `DATABASE_URL`;
- каталог **`server/uploads/`** (логотипы, галереи и т.д.).

---

## 13. Частые проблемы

| Симптом | Что проверить |
|---------|----------------|
| 502 на `/api` | `pm2 status`, логи `pm2 logs practice-api`, `curl http://127.0.0.1:3001/api/health` |
| Пустая страница по маршрутам Vue | В `location /` есть `try_files ... /index.html` |
| Картинки из `/uploads` не грузятся | Прокси `/uploads/` на тот же порт, что и API |
| Почта не уходит | На VDS задайте `MAIL_MODE=smtp` и корректные `SMTP_*`; с домашнего ПК SMTP часто блокируют — это не ошибка приложения |

---

## 14. Полезные команды

```bash
pm2 logs practice-api --lines 100
sudo nginx -t
sudo journalctl -u nginx -n 50 --no-pager
```

Если IP сервера, с которого вы начинали настройку, был **155.212.170.165** — логика та же; везде подставьте свой актуальный домен и порты.
