<template>
  <div class="py-4 sm:py-8">
    <div v-if="pageLoading" class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 text-center py-16 text-gray-500">
      Загрузка…
    </div>
    <div v-else class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
    <div v-if="company" class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden relative">
      <div class="absolute top-0 left-0 w-24 h-24 sm:w-40 sm:h-40 rounded-r-lg rounded-br-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 z-10">
        <img
          :src="company.logo"
          :alt="company.name"
          @error="handleImageError"
          class="w-full h-full object-contain"
          :class="{ 'hidden': imageError }"
        />
        <div v-if="imageError" class="text-xs sm:text-sm font-medium text-gray-500 dark:text-white text-center px-2">
          {{ getPlaceholderText(company.name) }}
        </div>
      </div>
      <div class="pt-4 pr-4 pb-0 sm:pt-5 sm:pr-6 sm:pb-0 lg:pt-7 lg:pr-8 lg:pb-0 pl-[calc(96px+12px)] sm:pl-[calc(160px+24px)]">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between min-h-20 sm:min-h-36 mb-2 sm:mb-3">
          <div class="flex flex-col justify-start">
            <h1 class="about-company-heading company-name-heading break-words hyphens-auto">{{ company.name }}</h1>
            <p class="company-sector">{{ company.sector }}</p>
          </div>
          <!-- Технологии для десктопа - правый верхний угол -->
          <div class="hidden lg:flex lg:flex-wrap lg:gap-2.5 lg:max-w-md lg:justify-end mt-0">
            <div
              v-for="tech in company.technologies"
              :key="tech"
              class="w-16 h-16 flex items-center justify-center p-2.5 bg-white dark:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <div class="relative flex h-full w-full items-center justify-center">
                <img
                  v-show="techIconUrl(tech) && !techIconBroken.has(tech)"
                  :src="techIconUrl(tech) || undefined"
                  :alt="tech"
                  :class="[
                    'max-h-full max-w-full object-contain',
                    tech === 'PHP' && isDark ? 'brightness-0 invert' : ''
                  ]"
                  @error="markTechIconBroken(tech)"
                />
                <div
                  v-show="!techIconUrl(tech) || techIconBroken.has(tech)"
                  class="h-10 w-10 shrink-0 rounded-md bg-gray-300 dark:bg-gray-600"
                  :title="tech"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <!-- Секция "О КОМПАНИИ" — чуть ниже аватарки, без лишнего отступа влево -->
      <div
        class="mt-5 pt-0 pr-4 pb-4 sm:-mt-3 sm:pt-1 sm:pr-6 sm:pb-6 lg:-mt-4 lg:pt-2 lg:pr-8 lg:pb-8 pl-4 sm:pl-6 lg:pl-8 flex flex-col gap-4 sm:gap-6"
      >
        <div class="w-full">
          <h2 class="about-company-heading about-company-label"><span>О КОМПАНИИ</span></h2>
          <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">{{ company.description }}</p>
        </div>
        <!-- Технологии для мобильной версии - остаются на месте -->
        <div class="w-full lg:hidden">
          <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full justify-items-stretch">
            <div
              v-for="tech in company.technologies"
              :key="tech"
              class="aspect-square flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <div class="relative flex h-full w-full items-center justify-center">
                <img
                  v-show="techIconUrl(tech) && !techIconBroken.has(tech)"
                  :src="techIconUrl(tech) || undefined"
                  :alt="tech"
                  :class="[
                    'max-h-full max-w-full object-contain p-1',
                    tech === 'PHP' && isDark ? 'brightness-0 invert' : ''
                  ]"
                  @error="markTechIconBroken(tech)"
                />
                <div
                  v-show="!techIconUrl(tech) || techIconBroken.has(tech)"
                  class="h-[70%] w-[70%] max-h-12 max-w-12 rounded-md bg-gray-300 dark:bg-gray-600"
                  :title="tech"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Карусель фотографий -->
      <div class="w-full">
        <div class="relative w-full overflow-hidden">
          <div 
            class="flex transition-transform duration-300 ease-in-out"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div
              v-for="(slide, index) in companySlides"
              :key="index"
              class="min-w-full h-64 sm:h-80 lg:h-96 flex-shrink-0 bg-gray-200 dark:bg-gray-700"
            >
              <img
                v-if="slide.src"
                :src="slide.src"
                :alt="`${company.name} - фото ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleCarouselImageError"
              />
            </div>
          </div>
          
          <!-- Навигационные стрелки -->
          <button
            v-if="companySlides.length > 1"
            @click="previousImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Предыдущее фото"
          >
            <img src="/arrowleft.png" alt="←" class="w-4 h-4 brightness-0 invert" />
          </button>
          <button
            v-if="companySlides.length > 1"
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Следующее фото"
          >
            <img src="/arrowright.png" alt="→" class="w-4 h-4 brightness-0 invert" />
          </button>
          
          <!-- Индикаторы точек -->
          <div
            v-if="companySlides.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
          >
            <button
              v-for="(slide, index) in companySlides"
              :key="index"
              @click="currentImageIndex = index"
              class="w-2 h-2 rounded-full transition-all"
              :class="currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'"
              :aria-label="`Перейти к фото ${index + 1}`"
            />
          </div>
        </div>
      </div>
      
      <!-- Кнопка подачи заявки -->
      <button
        type="button"
        class="w-full py-2.5 sm:py-3 bg-[#1D4ED8] text-white rounded-b-lg rounded-t-none hover:bg-[#164bc2] transition-colors font-semibold text-sm sm:text-base lg:text-lg"
        @click="openPracticeApplicationModal"
      >
        подать заявку на практику
      </button>
    </div>
    </div>

    <!-- Окно с отзывами: точки снаружи, на всю ширину как слой с фильтрами и картой -->
    <div v-if="company" class="reviews-dots-wrap mt-8 sm:mt-10 w-full">
      <div class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="reviews-layer rounded-lg overflow-hidden">
      <div class="pt-4 pr-4 pb-4 sm:pt-6 sm:pr-6 sm:pb-6 lg:pt-8 lg:pr-8 lg:pb-8 pl-4 sm:pl-6 lg:pl-8">
        <h2 class="about-company-heading mb-4 sm:mb-6">ОТКЛИКИ</h2>
        <div v-if="reviewsLoading" class="text-gray-500 text-sm py-4 mb-6">Загрузка откликов…</div>
        <div v-else class="mb-6 p-4 sm:p-6 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg">
          <template v-if="!auth.isAuthenticated">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Нам важно твоё мнение</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <router-link :to="{ path: '/вход', query: { redirect: $route.fullPath } }" class="text-[#1D4ED8] underline">
                Войдите
              </router-link>
              , чтобы отправить отклик (после модерации он появится в списке).
            </p>
          </template>
          <p
            v-else-if="myReviewLoading"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Проверка статуса отклика…
          </p>
          <div
            v-else-if="myReviewStatus === 'PENDING'"
            class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 w-full"
          >
            <p class="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400 flex-1 min-w-0">
              Отклик отправлен и ожидает модерации.
            </p>
            <button
              type="button"
              :disabled="reviewDeleting"
              class="shrink-0 px-4 py-2 text-sm font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-[#164bc2] transition-colors disabled:opacity-50"
              @click="deleteMyReview"
            >
              {{ reviewDeleting ? 'Удаление…' : 'Удалить отзыв' }}
            </button>
            <p v-if="reviewFormError" class="text-red-600 text-sm w-full basis-full order-last">{{ reviewFormError }}</p>
          </div>
          <div
            v-else-if="myReviewStatus === 'APPROVED'"
            class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 w-full"
          >
            <p class="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1 min-w-0">
              Ваш отзыв успешно опубликован!
            </p>
            <button
              type="button"
              :disabled="reviewDeleting"
              class="shrink-0 px-4 py-2 text-sm font-medium rounded-lg bg-[#1D4ED8] text-white hover:bg-[#164bc2] transition-colors disabled:opacity-50"
              @click="deleteMyReview"
            >
              {{ reviewDeleting ? 'Удаление…' : 'Удалить отзыв' }}
            </button>
            <p v-if="reviewFormError" class="text-red-600 text-sm w-full basis-full order-last">{{ reviewFormError }}</p>
          </div>
          <template v-else>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Нам важно твоё мнение</h3>
            <form class="flex flex-col gap-3 text-sm" @submit.prevent="submitReview">
            <textarea
              v-model="reviewForm.text"
              required
              minlength="10"
              rows="3"
              placeholder="Текст отклика (от 10 символов)"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
            />
            <div>
              <span id="review-rating-label" class="block font-medium text-gray-800 dark:text-gray-200 mb-1">Оценка</span>
              <div
                role="radiogroup"
                aria-labelledby="review-rating-label"
                class="flex items-center gap-1 sm:gap-1.5"
                @mouseleave="ratingHover = null"
              >
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="p-0.5 rounded transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#2a2a2a]"
                  :aria-label="`Оценка ${n} из 5`"
                  :aria-checked="reviewForm.rating === n"
                  role="radio"
                  @click="reviewForm.rating = n"
                  @mouseenter="ratingHover = n"
                  @focus="ratingHover = n"
                  @blur="ratingHover = null"
                >
                  <img
                    :src="n <= (ratingHover != null ? ratingHover : reviewForm.rating) ? '/сердце3д.png' : '/сердце3дсерое.png'"
                    alt=""
                    class="w-8 h-8 sm:w-9 sm:h-9 object-contain block pointer-events-none select-none"
                    width="36"
                    height="36"
                    draggable="false"
                  />
                </button>
              </div>
            </div>
            <div>
              <label class="block font-medium text-gray-800 dark:text-gray-200 mb-1">Трудоустройство после практики</label>
              <select
                v-model="reviewForm.employment"
                required
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <option value="" disabled>Выберите вариант</option>
                <option value="Предложили">Предложили</option>
                <option value="Нет">Нет</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-gray-800 dark:text-gray-200 mb-1">Год практики</label>
              <select
                v-model="reviewForm.periodLabel"
                required
                class="w-full max-w-[12rem] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <option value="" disabled>Год</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-gray-800 dark:text-gray-200 mb-1">Формат работы</label>
              <select
                v-model="reviewForm.location"
                required
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <option value="" disabled>Как проходила практика</option>
                <option value="Гибрид — офис и удалённо">Гибрид — офис и удалённо</option>
                <option value="Очно в офисе">Очно в офисе</option>
                <option value="Удалённо">Удалённо</option>
              </select>
            </div>
            <p v-if="reviewFormError" class="text-red-600 text-sm">{{ reviewFormError }}</p>
            <button
              type="submit"
              :disabled="reviewSubmitting"
              class="self-start px-4 py-2 bg-[#1D4ED8] text-white rounded-lg disabled:opacity-50"
            >
              {{ reviewSubmitting ? 'Отправка…' : 'Отправить на модерацию' }}
            </button>
          </form>
          </template>
        </div>
        <div class="space-y-4 sm:space-y-6 mt-8 sm:mt-10">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="p-4 sm:p-6 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg"
          >
            <div class="flex items-start gap-3 sm:gap-4 mb-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span class="text-lg sm:text-xl font-bold text-gray-600 dark:text-white">
                  {{ review.author.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {{ review.author }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {{ review.date }}
                </p>
              </div>
            </div>
            <p class="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed mb-3">
              {{ review.text }}
            </p>
            <div class="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span class="review-rating-block flex items-center gap-1.5 text-sm sm:text-base font-semibold">
                {{ review.rating }}
                <img src="/сердце3д.png" alt="" class="review-heart-icon w-4 h-4 sm:w-5 sm:h-5 object-contain" />
              </span>
              <span>{{ review.employment }}</span>
              <span>{{ review.location }}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>

    <div v-if="!pageLoading && !company" class="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 text-center py-12">
      <p class="text-gray-500 dark:text-white text-lg">Компания не найдена</p>
      <button
        @click="$router.push('/практики')"
        class="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        Вернуться к списку
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="practiceModalOpen"
        ref="practiceOverlayRef"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-modal-title"
        tabindex="-1"
        @pointerdown="onPracticeBackdropPointerDown"
        @pointerup="onPracticeBackdropPointerUp"
        @keyup.escape="closePracticeModal"
      >
        <div
          class="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl max-w-lg w-full p-5 sm:p-6 relative border border-gray-200 dark:border-gray-600"
          @click.stop
        >
          <button
            type="button"
            class="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg"
            aria-label="Закрыть"
            :disabled="practiceSubmitting"
            @click="closePracticeModal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 id="practice-modal-title" class="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-10">
            Заявка на практику
          </h2>

          <div v-if="practiceSuccess" class="space-y-4">
            <p class="text-gray-700 dark:text-gray-300">
              Письмо отправлено компании. Ответ обычно приходит на вашу почту, указанную в аккаунте.
            </p>
            <button
              type="button"
              class="w-full py-2.5 bg-[#1D4ED8] text-white font-semibold rounded-lg hover:bg-[#164bc2]"
              @click="closePracticeModal"
            >
              Закрыть
            </button>
          </div>

          <template v-else>
            <p v-if="!parsedContacts.email" class="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 rounded-lg px-3 py-2 mb-3">
              Контакты компании еще не указаны, отправить заявку пока не получится :(
            </p>
            <template v-else>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] px-3 py-2">
                Текст письма начнётся так:
                <span class="italic">«Привет, я {{ studentDisplayName }}, хочу пройти у вас практику!»</span>
              </p>
            </template>
            <label class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Сопроводительное письмо</label>
            <textarea
              v-model="practiceCoverLetter"
              rows="6"
              :disabled="!parsedContacts.email || practiceSubmitting"
              placeholder="Расскажите, почему хотите практику у этой компании (не меньше 20 символов)"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm disabled:opacity-50"
            />
            <label
              v-if="parsedContacts.email"
              class="mt-3 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <input
                v-model="practiceConfirmed"
                type="checkbox"
                class="mt-1 rounded border-gray-300 dark:border-gray-600"
                :disabled="practiceSubmitting"
              />
              <span>Подтверждаю отправку заявки в компанию «{{ company?.name }}»</span>
            </label>
            <p v-if="practiceFormError" class="text-red-600 dark:text-red-400 text-sm mt-2">{{ practiceFormError }}</p>
            <button
              type="button"
              class="mt-4 w-full py-2.5 bg-[#1D4ED8] text-white font-semibold rounded-lg hover:bg-[#164bc2] disabled:opacity-50"
              :disabled="!canSubmitPracticeApplication"
              @click="submitPracticeApplication"
            >
              {{ practiceSubmitting ? 'Отправка…' : 'Отправить заявку' }}
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, reactive, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { apiFetch } from '../api/client'
import { useBackdropDismiss } from '../composables/useBackdropDismiss'

const route = useRoute()
const router = useRouter()
const store = useCompaniesStore()
const themeStore = useThemeStore()
const auth = useAuthStore()
const imageError = ref(false)
/** Технологии, у которых иконка не загрузилась — показываем серый квадрат */
const techIconBroken = ref(new Set())
const currentImageIndex = ref(0)
const pageLoading = ref(true)
const reviews = ref([])
const reviewsLoading = ref(false)
const reviewFormError = ref('')
const reviewSubmitting = ref(false)
const reviewDeleting = ref(false)
/** Подсветка сердец при наведении (1–5); null — только выбранная оценка */
const ratingHover = ref(null)
/** null | PENDING | APPROVED | REJECTED — с сервера, сохраняется между визитами */
const myReviewStatus = ref(null)
const myReviewLoading = ref(false)

const practiceModalOpen = ref(false)
const practiceOverlayRef = ref(null)
const practiceCoverLetter = ref('')
const practiceConfirmed = ref(false)
const practiceSubmitting = ref(false)
const practiceFormError = ref('')
const practiceSuccess = ref(false)

const reviewForm = reactive({
  text: '',
  rating: 0,
  employment: '',
  location: '',
  periodLabel: '',
})

const isDark = computed(() => themeStore.isDark)

const company = computed(() => store.getCompanyByRouteSegment(route.params.id))

const parsedContacts = computed(() => {
  if (!company.value) return { email: null, phone: null }

  const contacts = company.value.contacts
  const emailMatch = contacts.match(/[\w.-]+@[\w.-]+\.\w+/)
  const phoneMatch = contacts.match(/\+?\d[\d\s()-]{7,}/)

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
  }
})

const studentDisplayName = computed(() => {
  const fn = (auth.user?.firstName ?? '').trim()
  const ln = (auth.user?.lastName ?? '').trim()
  return fn || ln ? `${fn} ${ln}`.trim() : '… (укажите имя в профиле)'
})

const canSubmitPracticeApplication = computed(() => {
  if (!parsedContacts.value.email || !practiceConfirmed.value || practiceSubmitting.value) return false
  return practiceCoverLetter.value.trim().length >= 20
})

function closePracticeModal() {
  if (practiceSubmitting.value) return
  practiceModalOpen.value = false
}

const { onBackdropPointerDown: onPracticeBackdropPointerDown, onBackdropPointerUp: onPracticeBackdropPointerUp } =
  useBackdropDismiss(closePracticeModal)

function openPracticeApplicationModal() {
  if (!auth.isAuthenticated) {
    router.push({ path: '/вход', query: { redirect: route.fullPath } })
    return
  }
  practiceFormError.value = ''
  practiceSuccess.value = false
  practiceCoverLetter.value = ''
  practiceConfirmed.value = false
  practiceModalOpen.value = true
  nextTick(() => practiceOverlayRef.value?.focus())
}

watch(
  () => company.value?.id,
  () => {
    techIconBroken.value = new Set()
    ratingHover.value = null
  },
)

function markTechIconBroken(tech) {
  techIconBroken.value = new Set([...techIconBroken.value, tech])
}

async function loadReviews() {
  const id = route.params.id
  if (!id) return
  reviewsLoading.value = true
  try {
    const data = await apiFetch(`/api/companies/${id}/reviews`, { skipAuth: true })
    reviews.value = (data.reviews || []).map((r) => ({
      ...r,
      id: r.id,
    }))
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

async function loadMyReview() {
  const id = route.params.id
  if (!id || !auth.isAuthenticated || !auth.token) {
    myReviewStatus.value = null
    myReviewLoading.value = false
    return
  }
  myReviewLoading.value = true
  try {
    const data = await apiFetch(`/api/companies/${id}/my-review`, { token: auth.token })
    myReviewStatus.value = data.status ?? null
  } catch {
    myReviewStatus.value = null
  } finally {
    myReviewLoading.value = false
  }
}

async function ensureCompany() {
  pageLoading.value = true
  if (!store.loaded) {
    await store.fetchCompanies()
  }
  pageLoading.value = false
  await loadReviews()
  await loadMyReview()
}

onMounted(ensureCompany)

watch(
  () => route.params.id,
  () => {
    myReviewStatus.value = null
    ensureCompany()
    reviewFormError.value = ''
  }
)

watch(
  () => auth.isAuthenticated,
  async (loggedIn) => {
    if (loggedIn && route.params.id) await loadMyReview()
    else {
      myReviewStatus.value = null
      myReviewLoading.value = false
    }
  }
)

async function deleteMyReview() {
  const id = route.params.id
  if (!id || !auth.token) return
  reviewFormError.value = ''
  reviewDeleting.value = true
  try {
    await apiFetch(`/api/companies/${id}/my-review`, { method: 'DELETE', token: auth.token })
    myReviewStatus.value = null
    await loadReviews()
  } catch (e) {
    reviewFormError.value = e.message || 'Не удалось удалить отзыв'
  } finally {
    reviewDeleting.value = false
  }
}

async function submitReview() {
  reviewFormError.value = ''
  if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
    reviewFormError.value = 'Выберите оценку'
    return
  }
  const id = route.params.id
  reviewSubmitting.value = true
  try {
    await apiFetch(`/api/companies/${id}/reviews`, {
      method: 'POST',
      body: {
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        employment: reviewForm.employment.trim(),
        location: reviewForm.location.trim(),
        periodLabel: reviewForm.periodLabel.trim() || undefined,
      },
      token: auth.token,
    })
    myReviewStatus.value = 'PENDING'
    reviewForm.text = ''
    reviewForm.rating = 0
    reviewForm.employment = ''
    reviewForm.location = ''
    reviewForm.periodLabel = ''
    ratingHover.value = null
  } catch (e) {
    reviewFormError.value = e.message || 'Не удалось отправить'
  } finally {
    reviewSubmitting.value = false
  }
}

// Сброс индекса карусели при смене компании
watch(() => company.value?.id, () => {
  currentImageIndex.value = 0
})

/** Слайды карусели: galleryCount штук; без URL — только серая подложка (класс на контейнере) */
const companySlides = computed(() => {
  const c = company.value
  if (!c) return []
  const count = Math.min(10, Math.max(1, Number(c.galleryCount) || 3))
  const imgs = Array.isArray(c.galleryImages) ? c.galleryImages.filter((u) => typeof u === 'string' && u.trim()) : []
  return Array.from({ length: count }, (_, i) => ({
    src: imgs[i]?.trim() || null,
  }))
})

function nextImage() {
  if (currentImageIndex.value < companySlides.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = companySlides.value.length - 1
  }
}

const grayImgDataUri =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect fill="#e5e7eb" width="100%" height="100%"/></svg>'
  )

function handleCarouselImageError(event) {
  event.target.src = grayImgDataUri
}

async function submitPracticeApplication() {
  practiceFormError.value = ''
  const id = route.params.id
  if (!id || !parsedContacts.value.email || !auth.token) return
  practiceSubmitting.value = true
  try {
    await apiFetch(`/api/companies/${id}/practice-application`, {
      method: 'POST',
      body: { coverLetter: practiceCoverLetter.value.trim() },
      token: auth.token,
    })
    practiceSuccess.value = true
  } catch (e) {
    practiceFormError.value = e.message || 'Не удалось отправить заявку'
  } finally {
    practiceSubmitting.value = false
  }
}

function handleImageError(event) {
  imageError.value = true
}

function getPlaceholderText(name) {
  if (name.length <= 3) {
    return name
  }
  return name.charAt(0).toUpperCase()
}

function techIconUrl(tech) {
  return store.techIconUrlFor(tech)
}
</script>

<style scoped>
.about-company-heading {
  font-family: 'Polonium', serif;
  color: rgb(33 33 33);
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 900;
  text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .about-company-heading {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

.about-company-label {
  color: #fff;
  background-color: #164BC2;
  padding: 0.25em 0.5em;
  display: inline-block;
  transform: skewX(-8deg);
  
}

.about-company-label span {
  display: inline-block;
  transform: skewX(8deg);
}

.company-name-heading {
  font-size: 1.375rem;
  line-height: 1.25;
  margin-bottom: -0.125rem;
}

@media (min-width: 640px) {
  .company-name-heading {
    font-size: 2.5rem;
    line-height: 3rem;
  }
}

@media (min-width: 1024px) {
  .company-name-heading {
    font-size: 3.75rem;
    line-height: 4rem;
  }
}

.company-sector {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: rgb(33 33 33);
  margin: 0;
  font-size: 1rem;
  line-height: 1.375rem;
  font-weight: 600;
  text-transform: uppercase;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .company-sector {
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .company-sector {
    font-size: 1.25rem;
    line-height: 1.625rem;
  }
}

/* Область откликов на всю ширину, как слой с фильтрами и картой */
.reviews-dots-wrap {
  background-color: #fafaf8;
  background-image: radial-gradient(circle, #212121 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 2.5rem 0;
  box-sizing: border-box;
}

/* Белая панель откликов */
.reviews-layer {
  background: #fff;
}
</style>

