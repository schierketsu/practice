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

Если команда **`pm2` не найдена**, сначала:

```bash
sudo npm install -g pm2
```

Рабочая директория должна быть **`server`**, чтобы читались `.env`, `uploads/` и путь к SQLite:

```bash
cd /var/www/practice/server
pm2 start dist/index.js --name practice-api
pm2 save
pm2 startup
# выполните команду, которую выведет pm2 startup (один раз)
```

---

## 8. DNS на REG.ru для **практикастудентам.рф**

1. В [личном кабинете REG.ru](https://www.reg.ru/) откройте домен → раздел **DNS** (или «Управление DNS» / DNS-серверы).
2. Если домен обслуживается DNS REG.ru, добавьте **A-записи** на **IP вашего VDS** (тот же, куда вы SSH):
   - **`@`** (корень домена) → `155.212.170.165` (подставьте актуальный IP, если другой);
   - при необходимости **`www`** → тот же IP — чтобы открывались и `https://практикастудентам.рф`, и `https://www.практикастудентам.рф`.
3. Подождите распространения DNS (часто **15–60 минут**, иногда дольше). Проверка с вашего ПК: `ping практикастудентам.рф` или [dnschecker.org](https://dnschecker.org) по типу **A**.

В списке записей REG.ru иногда показывают **punycode** (`xn--…`) — это нормально, тот же домен.

---

## 9. nginx: один сайт на сервере

Домен **`практикастудентам.рф`** и **`www.практикастудентам.рф`**, API на порту **3001** (как в `server/.env`). Файл сохраняйте в **UTF-8**.

Файл `/etc/nginx/sites-available/practice`:

```nginx
server {
    listen 80;
    # Кириллица — для людей в браузере; punycode — тот же домен в ASCII (из REG), нужен certbot --nginx
    server_name практикастудентам.рф www.практикастудентам.рф
                xn--80aaapfpnbwiomskedn.xn--p1ai www.xn--80aaapfpnbwiomskedn.xn--p1ai;

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

**HTTPS** (после того как **A-запись** домена указывает на VDS):

```bash
sudo apt install -y certbot python3-certbot-nginx
```

**Certbot** в параметре `-d` не принимает кириллицу — укажите **Punycode** (строка `xn--…` из карточки домена в REG). Для **практикастудентам.рф** пример:

Сначала в **`server_name`** должны быть и кириллица, и **тот же punycode**, что в `-d` (скопируйте `xn--…` из ЛК REG). Иначе certbot напишет: *Could not automatically find a matching server block* — сертификат при этом может уже лежать в `/etc/letsencrypt/live/…`.

```bash
sudo certbot --nginx -d xn--80aaapfpnbwiomskedn.xn--p1ai -d www.xn--80aaapfpnbwiomskedn.xn--p1ai
```

Если выпуск прошёл, а **в nginx не вставилось** — после правки `server_name` и `sudo nginx -t && sudo systemctl reload nginx`:

```bash
sudo certbot install --cert-name xn--80aaapfpnbwiomskedn.xn--p1ai
```

Certbot сам допишет `listen 443 ssl` и пути к `fullchain.pem` / `privkey.pem`. Если `www` не нужен — уберите второй `-d` и соответствующие имена из `server_name`. В браузере по-прежнему можно открывать кириллический домен.

---

## 10. Если на VDS уже есть другой сайт

Ничего не удаляйте из `sites-enabled`, что обслуживает старый проект.

1. **Новый конфиг** — новый файл в `sites-available` и новая ссылка в `sites-enabled`.
2. У нового сайта **другой `server_name`** (другой домен или поддомен), иначе nginx не различит сайты на порту 80/443.
3. У нового API — **свой `PORT`** в `server/.env`, не занятый старым бэкендом.
4. Отдельный процесс PM2 (например `practice-api`), старый процесс не трогайте.

Открывать два разных полноценных сайта **только по одному IP без домена** неудобно: для IP nginx выберет один `server`. Нужен хотя бы поддомен.

---

## 11. Файрвол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Порт Node (**3001** и т.д.) **наружу не открывайте** — доступ только с localhost через nginx.

---

## 12. Обновление сайта после `git push` (пошагово)

Ниже — полный цикл: вы вносите правки локально, пушите в GitHub, на VDS подтягиваете код, пересобираете фронт и API, перезапускаете процесс. Путь к проекту на сервере ниже **`/var/www/practice`**; если у вас другой — подставьте свой.

### 12.1. На своём компьютере (перед сервером)

1. Откройте терминал в папке проекта (где лежит `package.json` в корне и папка `server/`).
2. Посмотрите статус:

   ```bash
   git status
   ```

3. Сохраните изменения в коммит и отправьте в репозиторий (ветка чаще всего **`main`**):

   ```bash
   git add -A
   git commit -m "Краткое описание изменений на русском или английском"
   git push origin main
   ```

   Если `git push` ругается на ветку, выполните то, что подскажет Git (например один раз `git push -u origin main`), либо уточните имя ветки: `git branch`.

4. Дождитесь успешного push на GitHub — **пока этого нет, на сервере `git pull` не подтянет новые правки**.

### 12.2. Подключение к серверу по SSH

С вашего ПК (PowerShell, терминал Linux/macOS):

```bash
ssh ИМЯ_ПОЛЬЗОВАТЕЛЯ@IP_СЕРВЕРА
```

Пример: `ssh root@155.212.170.165`. Дальше все команды выполняются **уже на сервере**, пока вы не вышли из SSH (`exit`).

### 12.3. Переход в каталог проекта

```bash
cd /var/www/practice
```

Проверка, что это нужный репозиторий:

```bash
git remote -v
```

Должен быть URL вида `https://github.com/schierketsu/practice.git` или SSH-URL того же репозитория.

### 12.4. Подтянуть код с GitHub: `git pull`

```bash
git pull origin main
```

- Если ветка у вас не `main`, замените на свою (см. `git branch` на сервере).
- Если Git просит логин/пароль по **HTTPS** — для GitHub нужен **Personal Access Token**, не пароль от аккаунта. Удобнее один раз настроить **SSH-ключ** на сервере и клонировать/пуллить по SSH.
- При сообщении о **конфликте слияния** — на сервере вручную правятся файлы с маркерами `<<<<<<<`, затем `git add` и `git commit`. Для типичного деплоя конфликтов быть не должно, если на сервере не правили код в обход Git.

### 12.5. Обновление и пересборка API (папка `server/`)

```bash
cd /var/www/practice/server
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

- **`npm ci`** ставит зависимости строго по lock-файлу (как на чистой установке).
- **`prisma migrate deploy`** применяет новые миграции к SQLite по пути из `DATABASE_URL` в **`server/.env`**. Перед важными обновлениями имеет смысл скопировать файл БД в резервную копию (см. раздел 14).
- **`npm run build`** собирает TypeScript в `server/dist/`.

Перезапуск процесса в PM2:

```bash
pm2 restart practice-api
```

Если процесс **`practice-api`** ещё ни разу не создавали, сначала настройте запуск по разделу **7** (оттуда `pm2 start …`), затем в следующих обновлениях используйте только **`pm2 restart practice-api`**.

Проверка API с самого сервера (порт подставьте из `PORT` в `server/.env`, чаще **3001**):

```bash
curl -sS http://127.0.0.1:3001/api/health
```

Ожидается ответ с `"ok":true`. Если ошибка — смотрите **`pm2 logs practice-api --lines 80`**.

### 12.6. Сборка фронта (корень репозитория)

Как в разделе **6**: если nginx отдаёт сайт с **того же домена**, что и API, **`VITE_API_BASE` не указывайте** — запросы пойдут на `/api/...` относительно сайта.

```bash
cd /var/www/practice
npm ci
npm run build
```

После этого обновляется каталог **`dist/`** — именно его обычно раздаёт nginx (`root …/dist`).

Если API у вас на **отдельном URL**, перед `npm run build` задайте базу один раз в той же строке:

```bash
VITE_API_BASE=https://api.ваш-домен npm run build
```

### 12.7. Перезагрузка nginx

Конфиг вы не меняли — достаточно перечитать его и не рвать соединения:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Если **`nginx -t`** выдаёт ошибку — **не** делайте `reload`, исправьте конфиг (часто опечатка в `sites-available`).

### 12.8. Проверка в браузере

1. Откройте сайт по вашему домену с **`https://`**.
2. Сделайте **жёсткое обновление** страницы (чтобы не кешировался старый JS): **Ctrl+F5** (Windows/Linux) или **Cmd+Shift+R** (macOS).
3. В инструментах разработчика (вкладка **Сеть**) убедитесь, что запрос **`/api/companies`** (или **`/api/health`**) возвращает **200**.

### 12.9. Краткая шпаргалка одним блоком

Если уже всё настроено и нужно просто обновиться после `git push`:

```bash
cd /var/www/practice
git pull origin main

cd server
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart practice-api

cd /var/www/practice
npm ci
npm run build
sudo nginx -t && sudo systemctl reload nginx
```

---

## 13. Перенос базы SQLite и `uploads/` с локального ПК на сервер

Фильтры (города, вузы, факультеты) и карта на главной строятся **из компаний в БД**. Если на сервере пустая база или вы её не переносили — в фильтрах нечего выбирать, список компаний пустой. Админка — это обычный **пользователь с ролью ADMIN** в этой же БД (email + пароль), а не «магические» переменные в `.env` для каждого запроса (см. ниже).

### 13.1. Где лежит база локально

При `DATABASE_URL="file:./dev.db"` в `server/.env` файл SQLite обычно создаётся рядом со схемой Prisma:

- **`server/prisma/dev.db`**

Если у вас другой путь в `DATABASE_URL` — скопируйте именно тот файл.

### 13.2. Остановите API на сервере (на секунду)

Чтобы процесс не держал файл БД открытым во время замены:

```bash
pm2 stop practice-api
```

### 13.3. Скопируйте файл БД на сервер

**Вариант A — SCP с вашего ПК (Linux/macOS или Windows с OpenSSH):**

На **локальной** машине (из папки, где удобно, подставьте свой путь к `dev.db` и пользователя/IP сервера):

```bash
scp server/prisma/dev.db USER@IP_СЕРВЕРА:/var/www/practice/server/data/prod.db
```

На сервере заранее создайте каталог, если его ещё нет:

```bash
mkdir -p /var/www/practice/server/data
```

**Вариант B — WinSCP / FileZilla:** подключитесь по SFTP, перетащите локальный `dev.db` в `/var/www/practice/server/data/prod.db` (или другое имя, но тогда поправьте `DATABASE_URL`).

### 13.4. `DATABASE_URL` на сервере

В **`/var/www/practice/server/.env`** должна быть строка на **тот же путь**, куда положили файл, например:

```env
DATABASE_URL="file:/var/www/practice/server/data/prod.db"
```

Сохраните файл. Путь в кавычках, слэши как в примере.

### 13.5. Каталог `server/uploads/`

Логотипы, галереи компаний, иконки технологий, загруженные резюме лежат в **`server/uploads/`**. Если переносите только `.db` без **`uploads/`**, на сайте будут битые картинки и файлы. Скопируйте всю папку **`server/uploads`** с локали на сервер в **`/var/www/practice/server/uploads/`** (слияние/замена файлов), права такие же, как у пользователя, от которого крутится PM2.

### 13.6. Миграции и перезапуск

На сервере (если проект уже собирали по этой инструкции):

```bash
cd /var/www/practice/server
npx prisma migrate deploy
npm run build
pm2 restart practice-api
```

Команды выполняйте из **`/var/www/practice/server`**, чтобы PM2 по-прежнему подхватывал `.env` и `uploads/` (как в разделе 7).

Проверка:

```bash
curl -sS http://127.0.0.1:3001/api/companies | head -c 200
```

Должен вернуться JSON с массивом `companies` (не пустой, если в базе есть компании).

### 13.7. `JWT_SECRET` на сервере

Он может **отличаться** от локального — это нормально. Пользователи просто заново войдут по email и паролю. Важно: на проде держите **один** стабильный `JWT_SECRET`, не меняйте его без необходимости (иначе все сессии обнулятся).

### 13.8. Вход администратора: какие email и пароль

- **Вход в админку** — это **логин зарегистрированного пользователя** с ролью **ADMIN** в SQLite (те же поля, что и у обычного пользователя: email + пароль).
- Переменные **`ADMIN_EMAIL`** и **`ADMIN_PASSWORD`** в `server/.env` используются **только при выполнении сида** (`npm run db:seed` в папке `server`): в пустую базу создаётся один такой админ. Они **не подставляются** автоматически при каждом запросе и **не меняют** пароль уже существующего админа.
- Если вы **скопировали** `dev.db` с локального ПК на сервер — **админ на сервере тот же**, что у вас локально: тот же **email** и **пароль**, под которыми вы заходили в админку дома. У вас в типичном `.env` для сида это часто `admin@practice.local` и пароль из `ADMIN_PASSWORD` (например `Admin123!`), если вы не меняли их перед сидом.
- Если базу на сервере создавали только через **`prisma migrate deploy`** без сида и **не** копировали локальный файл — админа может не быть; тогда либо один раз выполните сид (он **очистит** таблицы по логике сида — осторожно), либо скопируйте локальную БД, как выше.

---

## 14. Резервное копирование

Регулярно копируйте:

- файл базы из пути в `DATABASE_URL`;
- каталог **`server/uploads/`** (логотипы, галереи и т.д.).

---

## 15. Частые проблемы

| Симптом | Что проверить |
|---------|----------------|
| 502 на `/api` | `pm2 status`, логи `pm2 logs practice-api`, `curl http://127.0.0.1:3001/api/health` |
| Пустая страница по маршрутам Vue | В `location /` есть `try_files ... /index.html` |
| Картинки из `/uploads` не грузятся | Прокси `/uploads/` на тот же порт, что и API |
| Почта не уходит | На VDS задайте `MAIL_MODE=smtp` и корректные `SMTP_*`; с домашнего ПК SMTP часто блокируют — это не ошибка приложения |
| Нет компаний в фильтрах / пустая карта | `curl …/api/companies` — пустой массив значит пустая или не та БД на сервере; перенесите `dev.db` и `uploads/` (раздел 13) |
| Не подходит пароль админа на сервере | Админ = запись в БД; при копировании локальной БД — те же учётные данные, что локально. `ADMIN_*` в `.env` влияют только на `db:seed` |

---

## 16. Полезные команды

```bash
pm2 logs practice-api --lines 100
sudo nginx -t
sudo journalctl -u nginx -n 50 --no-pager
```

Если IP сервера, с которого вы начинали настройку, был **155.212.170.165** — логика та же; везде подставьте свой актуальный домен и порты.
