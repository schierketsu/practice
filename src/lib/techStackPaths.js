/** Соответствие названия технологии → файл в /public/stack/ (fallback) */
export const techSvgMap = {
  Vue: 'vue.svg',
  React: 'reactquery.svg',
  TypeScript: 'typescript.svg',
  Flutter: 'flutter.svg',
  PHP: 'php.svg',
  'C#': 'csharp.svg',
  'C++': 'c-plusplus.svg',
  Python: 'python.svg',
  FastAPI: 'fastapi.svg',
  Laravel: 'laravel.svg',
  Kotlin: 'kotlin.svg',
  Entity: 'csharp.svg',
  Битрикс: 'php.svg',
  '1C CRM': 'csharp.svg',
  '1C': 'csharp.svg',
  JavaScript: 'javascript.svg',
  CSS: 'css.svg',
  'Tailwind CSS': 'tailwindcss.svg',
  Django: 'django.svg',
  Dart: 'dart.svg',
  PostgreSQL: 'postgresql.svg',
  Angular: 'angular.svg',
  C: 'c.svg',
}

export function getStackFallbackPath(tech) {
  return `/stack/${techSvgMap[tech] || 'javascript.svg'}`
}
