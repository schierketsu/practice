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
              v-for="(image, index) in companyImages"
              :key="index"
              class="min-w-full h-64 sm:h-80 lg:h-96 flex-shrink-0"
            >
              <img
                :src="image"
                :alt="`${company.name} - фото ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleCarouselImageError"
              />
            </div>
          </div>
          
          <!-- Навигационные стрелки -->
          <button
            v-if="companyImages.length > 1"
            @click="previousImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Предыдущее фото"
          >
            <img src="/arrowleft.png" alt="←" class="w-4 h-4 brightness-0 invert" />
          </button>
          <button
            v-if="companyImages.length > 1"
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Следующее фото"
          >
            <img src="/arrowright.png" alt="→" class="w-4 h-4 brightness-0 invert" />
          </button>
          
          <!-- Индикаторы точек -->
          <div
            v-if="companyImages.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
          >
            <button
              v-for="(image, index) in companyImages"
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
        class="w-full py-2.5 sm:py-3 bg-[#1D4ED8] text-white rounded-b-lg rounded-t-none hover:bg-[#164bc2] transition-colors font-semibold text-sm sm:text-base lg:text-lg"
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
              <label class="block font-medium text-gray-800 dark:text-gray-200 mb-1">Оценка</label>
              <select
                v-model.number="reviewForm.rating"
                class="w-full max-w-[12rem] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
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
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useCompaniesStore } from '../stores/companies'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { apiFetch } from '../api/client'

const route = useRoute()
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
/** null | PENDING | APPROVED | REJECTED — с сервера, сохраняется между визитами */
const myReviewStatus = ref(null)
const myReviewLoading = ref(false)

const reviewForm = reactive({
  text: '',
  rating: 5,
  employment: '',
  location: '',
  periodLabel: '',
})

const isDark = computed(() => themeStore.isDark)

const company = computed(() => store.getCompanyById(route.params.id))

watch(
  () => company.value?.id,
  () => {
    techIconBroken.value = new Set()
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
    reviewForm.employment = ''
    reviewForm.location = ''
    reviewForm.periodLabel = ''
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

// Фотографии для карусели — по умолчанию 3 слайда с back3.png
const companyImages = computed(() => {
  if (!company.value) return []
  return ['/backk.png', '/backk.png', '/backk.png']
})

function nextImage() {
  if (currentImageIndex.value < companyImages.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = companyImages.value.length - 1
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

const parsedContacts = computed(() => {
  if (!company.value) return { email: null, phone: null }
  
  const contacts = company.value.contacts
  const emailMatch = contacts.match(/[\w\.-]+@[\w\.-]+\.\w+/)
  const phoneMatch = contacts.match(/\+?\d[\d\s()-]{7,}/)
  
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null
  }
})

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

