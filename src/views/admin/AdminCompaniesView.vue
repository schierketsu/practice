<template>
  <div>
    <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
    <button
      type="button"
      class="mb-4 px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm font-medium"
      @click="openCreate"
    >
      Добавить компанию
    </button>
    <div v-if="loading" class="text-gray-500">Загрузка…</div>
    <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left p-3 font-semibold">ID</th>
            <th class="text-left p-3 font-semibold">Название</th>
            <th class="text-left p-3 font-semibold">Город</th>
            <th class="text-left p-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in companies" :key="c.id" class="border-b border-gray-100">
            <td class="p-3">{{ c.id }}</td>
            <td class="p-3">{{ c.name }}</td>
            <td class="p-3">{{ c.city }}</td>
            <td class="p-3 flex gap-2">
              <button type="button" class="text-[#1D4ED8] underline" @click="openEdit(c)">Изменить</button>
              <button type="button" class="text-red-600 underline" @click="remove(c)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="modal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4"
      @click.self="modal = null"
    >
      <div
        class="bg-white dark:bg-[#1a1a1a] rounded-lg max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-xl text-gray-900 dark:text-gray-100"
      >
        <h2 class="text-lg font-bold mb-4">{{ editingId ? 'Редактирование' : 'Новая компания' }}</h2>
        <form class="flex flex-col gap-4 text-sm" @submit.prevent="saveCompany">
          <label class="flex flex-col gap-1">
            <span class="font-medium">Название</span>
            <input v-model="form.name" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>

          <div class="flex flex-col gap-2">
            <span class="font-medium">Логотип компании</span>
            <div class="flex flex-wrap items-center gap-3">
              <div
                class="h-20 w-20 shrink-0 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
              >
                <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="" class="max-h-full max-w-full object-contain" />
                <span v-else class="text-xs text-gray-400 text-center px-1">нет файла</span>
              </div>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="text-xs max-w-full" @change="onLogoFile" />
            </div>
            <label class="flex flex-col gap-1">
              <span class="text-xs text-gray-500">или URL (после загрузки файла подставится автоматически)</span>
              <input
                v-model="form.logo"
                type="text"
                inputmode="url"
                autocomplete="off"
                placeholder="https://… или /uploads/…"
                class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
              />
            </label>
          </div>

          <label class="flex flex-col gap-1">
            <span class="font-medium">Описание</span>
            <textarea v-model="form.description" required rows="4" class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>

          <fieldset class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <legend class="px-1 font-medium">Технологии (справочник)</legend>
            <p v-if="catalogTechnologies.length === 0" class="text-amber-600 text-xs mt-2 mb-2">
              Справочник пуст. Добавьте технологии во вкладке «Технологии», затем обновите эту страницу.
            </p>
            <p v-else-if="orphanBaselineTechs.length" class="text-amber-600 text-xs mt-2 mb-2">
              У компании есть технологии вне справочника: {{ orphanBaselineTechs.join(', ') }}. Добавьте их во вкладке «Технологии» с тем же именем, затем закройте окно и снова нажмите «Изменить» — сохранение недоступно, пока имена не совпадают со справочником.
            </p>
            <div class="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto">
              <label v-for="t in catalogTechnologies" :key="t.name" class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :value="t.name" v-model="selectedTechnologies" class="rounded border-gray-300" />
                <span>{{ t.name }}</span>
              </label>
            </div>
            <p v-if="catalogTechnologies.length > 0 && selectedTechnologies.length === 0" class="text-amber-600 text-xs mt-2">
              Отметьте хотя бы одну технологию
            </p>
          </fieldset>

          <label class="flex flex-col gap-1">
            <span class="font-medium">Сектор</span>
            <input v-model="form.sector" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="font-medium">Контакты</span>
            <input v-model="form.contacts" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="font-medium">Город</span>
            <input v-model="form.city" required class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
          </label>

          <fieldset class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <legend class="px-1 font-medium">Вузы (можно несколько)</legend>
            <p v-if="catalogUniversities.length === 0" class="text-amber-600 text-xs mt-2 mb-2">
              Справочник пуст. Добавьте вузы во вкладке «Вузы», затем обновите эту страницу.
            </p>
            <div class="flex flex-col gap-2 mt-1">
              <label v-for="u in catalogUniversities" :key="u.id" class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :value="u.name" v-model="selectedUniversities" class="rounded border-gray-300" />
                <span>{{ u.name }}</span>
              </label>
            </div>
            <p v-if="selectedUniversities.length === 0" class="text-amber-600 text-xs mt-2">Выберите хотя бы один вуз</p>
          </fieldset>

          <label class="flex flex-col gap-1">
            <span class="font-medium">Факультет</span>
            <select
              v-model="facultyOptionKey"
              required
              class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]"
            >
              <option value="" disabled>Выберите факультет</option>
              <option v-for="o in facultyOptions" :key="o.key" :value="o.key">{{ o.label }}</option>
            </select>
            <span v-if="facultyOptions.length === 0 && selectedUniversities.length > 0" class="text-amber-600 text-xs">
              У выбранных вузов нет факультетов — задайте их во вкладке «Вузы».
            </span>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="font-medium">Широта</span>
              <input v-model="form.lat" type="text" inputmode="decimal" required class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-medium">Долгота</span>
              <input v-model="form.lng" type="text" inputmode="decimal" required class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-[#2a2a2a]" />
            </label>
          </div>

          <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="flex-1 py-2.5 bg-[#212121] text-white rounded font-medium">Сохранить</button>
            <button type="button" class="px-4 py-2 border border-gray-300 rounded" @click="modal = null">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import { useCompaniesStore } from '../../stores/companies'

const auth = useAuthStore()
const companiesStore = useCompaniesStore()
const companies = ref([])
const loading = ref(true)
const error = ref('')
const modal = ref(null)
const editingId = ref(null)
const saveError = ref('')
const selectedUniversities = ref([])
const catalogUniversities = ref([])
const catalogTechnologies = ref([])
const selectedTechnologies = ref([])
/** Технологии компании при открытии формы (для проверки «вне справочника») */
const baselineCompanyTechnologies = ref([])
const facultyOptionKey = ref('')
const pendingLogoFile = ref(null)
const logoPreviewUrl = ref('')

const form = reactive({
  name: '',
  logo: '',
  description: '',
  sector: '',
  contacts: '',
  city: '',
  faculty: '',
  lat: '',
  lng: '',
})

const catalogTechNameSet = computed(() => new Set(catalogTechnologies.value.map((t) => t.name)))

const orphanBaselineTechs = computed(() =>
  baselineCompanyTechnologies.value.filter((t) => !catalogTechNameSet.value.has(t)),
)

const facultyOptions = computed(() => {
  const sel = new Set(selectedUniversities.value)
  const out = []
  for (const u of catalogUniversities.value) {
    if (!sel.has(u.name)) continue
    for (const f of u.faculties || []) {
      out.push({
        key: `${u.id}-${f.id}`,
        label: `${u.name} — ${f.name}`,
        facultyName: f.name,
      })
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label, 'ru'))
})

watch(facultyOptionKey, (key) => {
  const o = facultyOptions.value.find((x) => x.key === key)
  form.faculty = o ? o.facultyName : ''
})

watch(
  [selectedUniversities, facultyOptions],
  () => {
    const names = new Set(facultyOptions.value.map((o) => o.facultyName))
    if (form.faculty && !names.has(form.faculty)) {
      form.faculty = ''
      facultyOptionKey.value = ''
    }
    const match = facultyOptions.value.find((o) => o.facultyName === form.faculty)
    facultyOptionKey.value = match?.key ?? ''
  },
  { deep: true, flush: 'post' },
)

async function loadCatalog() {
  try {
    const [uniData, techData] = await Promise.all([
      apiFetch('/api/universities', { skipAuth: true }),
      apiFetch('/api/technologies', { skipAuth: true }),
    ])
    catalogUniversities.value = uniData.universities || []
    catalogTechnologies.value = techData.technologies || []
  } catch {
    catalogUniversities.value = []
    catalogTechnologies.value = []
  }
}

watch(
  () => form.logo,
  (url) => {
    if (pendingLogoFile.value) return
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      logoPreviewUrl.value = url
    } else if (!url) {
      logoPreviewUrl.value = ''
    }
  }
)

function onLogoFile(e) {
  const f = e.target.files?.[0]
  pendingLogoFile.value = f || null
  if (logoPreviewUrl.value && logoPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreviewUrl.value)
  }
  if (f) {
    logoPreviewUrl.value = URL.createObjectURL(f)
  } else {
    logoPreviewUrl.value = form.logo && form.logo.startsWith('http') ? form.logo : form.logo || ''
  }
}

function formFromCompany(c) {
  form.name = c.name
  form.logo = c.logo || ''
  form.description = c.description
  form.sector = c.sector
  form.contacts = c.contacts
  form.city = c.city
  form.faculty = c.faculty
  form.lat = String(c.coordinates?.lat ?? c.lat ?? '')
  form.lng = String(c.coordinates?.lng ?? c.lng ?? '')
  const uni = Array.isArray(c.universities) && c.universities.length ? c.universities : c.university ? [c.university] : []
  selectedUniversities.value = [...uni]
  const techs = [...(c.technologies || [])]
  baselineCompanyTechnologies.value = techs
  const cat = catalogTechNameSet.value
  selectedTechnologies.value = techs.filter((t) => cat.has(t))
  pendingLogoFile.value = null
  logoPreviewUrl.value = form.logo || ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/admin/companies', { token: auth.token })
    companies.value = data.companies
    await loadCatalog()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function openCreate() {
  editingId.value = null
  Object.assign(form, {
    name: '',
    logo: '',
    description: '',
    sector: '',
    contacts: '',
    city: '',
    faculty: '',
    lat: '',
    lng: '',
  })
  selectedUniversities.value = []
  facultyOptionKey.value = ''
  baselineCompanyTechnologies.value = []
  selectedTechnologies.value = []
  pendingLogoFile.value = null
  if (logoPreviewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl.value)
  logoPreviewUrl.value = ''
  saveError.value = ''
  modal.value = true
  await loadCatalog()
}

async function openEdit(c) {
  editingId.value = c.id
  saveError.value = ''
  modal.value = true
  await loadCatalog()
  formFromCompany(c)
}

async function saveCompany() {
  saveError.value = ''
  if (selectedUniversities.value.length === 0) {
    saveError.value = 'Выберите хотя бы один вуз'
    return
  }
  if (!form.faculty?.trim()) {
    saveError.value = 'Выберите факультет из списка'
    return
  }
  const lat = Number(String(form.lat).replace(',', '.'))
  const lng = Number(String(form.lng).replace(',', '.'))
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    saveError.value = 'Укажите корректные широту и долготу'
    return
  }
  if (!form.logo?.trim() && !pendingLogoFile.value) {
    saveError.value = 'Загрузите логотип или укажите URL'
    return
  }

  let logoUrl = form.logo.trim()
  if (pendingLogoFile.value) {
    try {
      const fd = new FormData()
      fd.append('file', pendingLogoFile.value)
      const up = await apiFetch('/api/admin/uploads/company-logo', { method: 'POST', body: fd, token: auth.token })
      logoUrl = up.url
      form.logo = logoUrl
      pendingLogoFile.value = null
    } catch (e) {
      saveError.value = e.message || 'Не удалось загрузить логотип'
      return
    }
  }

  if (orphanBaselineTechs.value.length > 0) {
    saveError.value = `Сначала добавьте во вкладке «Технологии»: ${orphanBaselineTechs.value.join(', ')}`
    return
  }
  const technologies = [...selectedTechnologies.value].sort((a, b) => a.localeCompare(b, 'ru'))
  if (technologies.length === 0) {
    saveError.value = 'Выберите хотя бы одну технологию из справочника'
    return
  }

  const body = {
    name: form.name.trim(),
    logo: logoUrl,
    description: form.description.trim(),
    technologies,
    sector: form.sector.trim(),
    contacts: form.contacts.trim(),
    city: form.city.trim(),
    universities: [...selectedUniversities.value],
    faculty: form.faculty.trim(),
    lat,
    lng,
  }

  try {
    if (editingId.value) {
      await apiFetch(`/api/admin/companies/${editingId.value}`, {
        method: 'PUT',
        body,
        token: auth.token,
      })
    } else {
      await apiFetch('/api/admin/companies', {
        method: 'POST',
        body,
        token: auth.token,
      })
    }
    modal.value = null
    await load()
    await companiesStore.fetchCompanies()
    await companiesStore.fetchTechnologyIcons()
  } catch (e) {
    saveError.value = e.message || 'Ошибка сохранения'
  }
}

async function remove(c) {
  if (!confirm(`Удалить «${c.name}»?`)) return
  try {
    await apiFetch(`/api/admin/companies/${c.id}`, { method: 'DELETE', token: auth.token })
    await load()
    await companiesStore.fetchCompanies()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>
