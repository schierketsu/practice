/**
 * Русские тексты для встроенной HTML5-валидации (constraint validation API).
 * Подключается один раз в main.js.
 */

function messageForValidity(el) {
  const v = el.validity
  if (v.valid) return ''

  if (v.typeMismatch && el.type === 'email') {
    return 'Введите корректный адрес email'
  }
  if (v.valueMissing) {
    if (el.tagName === 'SELECT') return 'Выберите значение из списка'
    if (el.tagName === 'TEXTAREA') return 'Заполните это поле'
    if (el.type === 'email') return 'Укажите email'
    if (el.type === 'radio' || el.type === 'checkbox') return 'Сделайте выбор'
    return 'Заполните это поле'
  }
  if (v.tooShort) {
    const min = el.getAttribute('minlength')
    return min ? `Введите не менее ${min} символов` : 'Слишком короткое значение'
  }
  if (v.tooLong) {
    const max = el.getAttribute('maxlength')
    return max ? `Не более ${max} символов` : 'Слишком длинное значение'
  }
  if (v.patternMismatch) return 'Неверный формат'
  if (v.rangeUnderflow || v.rangeOverflow || v.stepMismatch) {
    return 'Укажите допустимое число'
  }
  if (v.badInput) return 'Некорректное значение'
  return 'Исправьте значение в этом поле'
}

function onInvalidCapture(e) {
  const el = e.target
  if (
    !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
  ) {
    return
  }
  if (!el.willValidate) return
  const msg = messageForValidity(el)
  if (msg) el.setCustomValidity(msg)
}

function clearCustomValidityCapture(e) {
  const el = e.target
  if (
    !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
  ) {
    return
  }
  el.setCustomValidity('')
}

export function installRussianNativeValidity() {
  document.addEventListener('invalid', onInvalidCapture, true)
  document.addEventListener('input', clearCustomValidityCapture, true)
  document.addEventListener('change', clearCustomValidityCapture, true)
}
