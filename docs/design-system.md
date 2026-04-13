# Дизайн-система проекта «Практика студентам»

Документ для переноса визуального языка в другие приложения (Vue/React, чистый HTML и т.д.). **Markdown не импортируется сборщиком** — скопируйте блоки CSS / конфигурации вручную или через свой пайплайн.

Источники в репозитории: `src/style.css`, `tailwind.config.js`, `src/App.vue` (кнопки шапки), `src/components/Footer.vue`, типовые классы во `src/views` и `src/components`.

---

## 1. CSS-переменные (ядро)

Подключите шрифты (см. §2), затем добавьте в глобальный CSS:

```css
:root {
  /* Текст интерфейса */
  --font-sans: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  /* Заголовки и акцентные кнопки */
  --font-display: 'Polonium', serif;

  /* Палитра */
  --color-page: #f9fafb;
  --color-ink: #212121;
  --color-primary: #1d4ed8;
  --color-primary-hover: #164bc2;
  --color-surface: #ffffff;
  --color-surface-dark: #1a1a1a;
  --color-elevated-dark: #2a2a2a;
  --color-accent-mint: #a8e4a0;
  --color-accent-mint-hover: #98d490;
  --color-muted-bg: #f3f4f6;

  /* Обводки */
  --color-border: #e5e7eb;
  --color-border-dark: #404040;

  /* Футер (Tailwind blue-700) */
  --color-footer: #1d4ed8;

  /* Радиусы */
  --radius-card: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Тень «кнопка шапки» при hover */
  --shadow-header-btn: 5px 5px 0 0 var(--color-ink);
}
```

---

## 2. Шрифты

### 2.1 Файлы в проекте

| Назначение | Файл |
|------------|------|
| Polonium Regular | `src/assets/fonts/Polonium/Polonium.otf` |
| Polonium Bold | `src/assets/fonts/Polonium/Polonium-Bold.otf` |

### 2.2 `@font-face` (копия из `src/style.css`)

Пути поправьте под структуру нового проекта.

```css
@font-face {
  font-family: 'Polonium';
  src: url('./assets/fonts/Polonium/Polonium.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Polonium';
  src: url('./assets/fonts/Polonium/Polonium-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 2.3 Использование

- **Body / формы / моноширинный UI:** `font-family: var(--font-sans);` — в продакшене подключите **JetBrains Mono** (Google Fonts или локально).
- **Заголовки h1–h6:** `font-family: 'Polonium', serif;`, `font-weight: 700`, `letter-spacing: 0.06em`, `text-transform: uppercase` (см. `@layer base` в `style.css`).
- **Утилита Tailwind в проекте:** класс `font-polonium`.

---

## 3. Типографика заголовков (адаптив)

Логика в `src/style.css` (`@layer base`): на мобильных кегль меньше, с `640px` и `1024px` — крупнее.

Кратко:

| Уровень | &lt; 640px | ≥ 640px | ≥ 1024px |
|---------|------------|---------|-----------|
| h1 | 1.75rem | 2.5rem | 3rem |
| h2 | 1.5rem | 2rem | 2.5rem |
| h3 | 1.25rem | 1.75rem | 2rem |

Заголовки: `overflow-wrap: anywhere`, `word-break: break-word`, `max-width: 100%`.

---

## 4. Цвета и смысл

| Токен / HEX | Роль |
|-------------|------|
| `#F9FAFB` | Фон страницы (`bg-[#F9FAFB]`) |
| `#212121` | Основной тёмный текст, границы акцента (`tailwind extend black`) |
| `#1D4ED8` | Основной синий: кнопки, ссылки, левая полоса карточек, футер `bg-blue-700` в палитре Tailwind совпадает |
| `#164bc2` | Hover для синего |
| `#FFFFFF` | Карточки, фон кнопки при hover в шапке |
| `#1A1A1A` | Тёмная тема: фон карточек/полей |
| `#2A2A2A` | Тёмная тема: поднятые блоки, бордеры попапов |
| `#A8E4A0` | Акцент «мятный» (теги бэкенда, вторичные кнопки в модалках) |
| `#98D490` | Hover для мятного |
| `#F3F4F6` | Светлый фон тегов / нейтраль |
| Серые Tailwind `gray-200`…`gray-600` | Рамки, вторичный текст |

**Тёмная тема:** класс `dark` на корне (`darkMode: 'class'` в Tailwind). Паттерн: `bg-white dark:bg-[#1a1a1a]`, `border-gray-200 dark:border-gray-600`.

---

## 5. Tailwind (`tailwind.config.js`)

```js
export default {
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      polonium: ['Polonium', 'serif'],
    },
    extend: {
      colors: {
        black: '#212121',
      },
    },
  },
}
```

---

## 6. Кнопка шапки (`.header-btn`)

Из `src/App.vue` — жирная Polonium, синий фон, при наведении «инверсия» + жёсткая тень.

```css
.header-btn {
  font-family: 'Polonium', serif;
  letter-spacing: 0.06em;
  background-color: #1d4ed8;
  color: #fff;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  box-shadow: none;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.header-btn:hover {
  background-color: #fff;
  color: #212121;
  border: 2px solid #212121;
  box-shadow: 5px 5px 0 0 #212121;
}
```

---

## 7. Карточки и акценты

- **Карточка компании:** белый фон, `rounded-lg`, `shadow-md`, `hover:shadow-xl`, левая полоса **6px** `#1D4ED8`.
- **Панель фильтров:** верхняя полоса **6px** `#1D4ED8`.
- **Теги технологий (логика цвета):** нейтраль `#F3F4F6` / тёмный фон; «бэкенд» — фон `#A8E4A0`, текст `#212121`; «фронт» — фон `#1D4ED8`, текст `#fff` (см. `CompanyCard.vue`, `OrganizationMap.vue`).

---

## 8. Футер

- Фон: **`bg-blue-700`** (Tailwind ≈ `#1d4ed8`).
- Верхняя граница блока с доменом: **`4px solid #fff`** (класс `.footer-top-border`).
- Заголовок домена: **Polonium**, `font-weight: 900`, `uppercase`, белый текст.
- **Мобильные (&lt; 640px):** одна строка, `letter-spacing: 0.045em`, размер через `clamp` + `calc(100cqw / 20.8)` внутри `@supports (font-size: 1cqw)` (см. актуальные значения в `Footer.vue`).
- **≥ 640px:** кегль заголовка домена 3rem → 4rem → 4.25rem по брейкпоинтам.

---

## 9. Базовые глобальные правила

Из `src/style.css`:

- `html`, `body`: `overflow-x: hidden`, сглаживание шрифтов.
- `input`, `textarea`, `select`, `button`: шрифт sans.
- `button`, `[role='button']`, `a`: `touch-action: manipulation`.

---

## 10. Опционально: обводка текста (Safari)

```css
@supports (-webkit-text-stroke: 1px #212121) {
  .portfolio-name-outline {
    -webkit-text-stroke: 2px #212121;
  }
}
```

---

## 11. Чеклист переноса в другой проект

1. Скопировать файлы **Polonium** и подключить `@font-face`.
2. Подключить **JetBrains Mono** (или заменить `--font-sans`).
3. Вставить **`:root`** переменные и при необходимости **Tailwind extend**.
4. Перенести **`@layer base`** для `h1–h6` и глобальных `html/body` из `style.css`.
5. Перенести стили **`.header-btn`** и футера, если нужны те же компоненты.
6. Включить **`darkMode: 'class'`** и вешать `class="dark"` на `<html>` при переключении темы.

---

*Сгенерировано по состоянию репозитория practice-students; при изменении `Footer.vue` / `style.css` обновите §2, §8 и таблицы.*
