/**
 * Закрытие по «клику на затемнение» без ложных срабатываний при выделении текста:
 * если mousedown был внутри панели, а pointerup — на фоне, окно не закрывается.
 */
export function useBackdropDismiss(onDismiss) {
  let downOnBackdrop = false

  function onBackdropPointerDown(e) {
    downOnBackdrop = e.target === e.currentTarget
  }

  function onBackdropPointerUp(e) {
    if (downOnBackdrop && e.target === e.currentTarget) {
      onDismiss()
    }
    downOnBackdrop = false
  }

  return { onBackdropPointerDown, onBackdropPointerUp }
}
