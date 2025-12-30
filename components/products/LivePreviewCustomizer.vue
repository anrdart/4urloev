<script setup lang="ts">
import { Canvas, FabricImage, Textbox } from 'fabric'
import { Type, Image, Palette, Download, RotateCcw, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  productImage?: string
}>()

const emit = defineEmits<{
  save: [dataUrl: string]
}>()

const canvasRef = ref<HTMLCanvasElement>()
const canvas = ref<Canvas | null>(null)
const text = ref('')
const textColor = ref('#000000')
const fileInputRef = ref<HTMLInputElement>()
const activeTab = ref('text')

onMounted(() => {
  if (!canvasRef.value) return

  canvas.value = new Canvas(canvasRef.value, {
    width: 600,
    height: 600,
    backgroundColor: '#ffffff',
  })

  // Load product image as background if provided
  if (props.productImage) {
    loadProductImage(props.productImage)
  }
})

onUnmounted(() => {
  canvas.value?.dispose()
})

const loadProductImage = async (imageUrl: string) => {
  if (!canvas.value) return

  try {
    const img = await FabricImage.fromURL(imageUrl)
    img.scaleToWidth(600)
    img.scaleToHeight(600)
    img.selectable = false
    canvas.value.add(img)
    canvas.value.sendObjectToBack(img)
    canvas.value.renderAll()
  } catch (error) {
    console.error('Error loading product image:', error)
  }
}

const handleAddText = () => {
  if (!canvas.value || !text.value) return

  const textObj = new Textbox(text.value, {
    left: 100,
    top: 100,
    fill: textColor.value,
    fontSize: 40,
    fontFamily: 'Plus Jakarta Sans, Arial, sans-serif',
  })

  canvas.value.add(textObj)
  canvas.value.setActiveObject(textObj)
  canvas.value.renderAll()
  text.value = ''

  toast.success('Teks ditambahkan', {
    description: 'Anda dapat menarik dan mengubah ukuran teks',
  })
}

const handleImageUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!canvas.value || !input.files?.[0]) return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = async (event) => {
    const imageUrl = event.target?.result as string
    try {
      const img = await FabricImage.fromURL(imageUrl)
      img.scaleToWidth(200)
      img.left = 200
      img.top = 200
      canvas.value!.add(img)
      canvas.value!.setActiveObject(img)
      canvas.value!.renderAll()

      toast.success('Gambar ditambahkan', {
        description: 'Anda dapat menarik dan mengubah ukuran gambar',
      })
    } catch (error) {
      toast.error('Gagal memuat gambar')
    }
  }

  reader.readAsDataURL(file)
  input.value = ''
}

const handleColorChange = () => {
  if (!canvas.value) return
  const activeObject = canvas.value.getActiveObject()
  if (activeObject && activeObject.type === 'textbox') {
    ;(activeObject as Textbox).set('fill', textColor.value)
    canvas.value.renderAll()
    toast.success('Warna diperbarui')
  }
}

const handleDeleteSelected = () => {
  if (!canvas.value) return
  const activeObject = canvas.value.getActiveObject()
  if (activeObject && activeObject.selectable !== false) {
    canvas.value.remove(activeObject)
    canvas.value.renderAll()
    toast.success('Objek dihapus')
  }
}

const handleReset = () => {
  if (!canvas.value) return
  
  // Remove all objects except background
  const objects = canvas.value.getObjects()
  objects.forEach(obj => {
    if (obj.selectable !== false) {
      canvas.value!.remove(obj)
    }
  })
  canvas.value.renderAll()

  toast.success('Canvas direset', {
    description: 'Semua kustomisasi telah dihapus',
  })
}

const handleDownload = () => {
  if (!canvas.value) return

  const dataUrl = canvas.value.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 2,
  })

  // Create download link
  const link = document.createElement('a')
  link.download = 'custom-product.png'
  link.href = dataUrl
  link.click()

  emit('save', dataUrl)

  toast.success('Desain diunduh', {
    description: 'File PNG telah disimpan',
  })
}

const tabs = [
  { id: 'text', label: 'Teks', icon: Type },
  { id: 'image', label: 'Gambar', icon: Image },
  { id: 'color', label: 'Warna', icon: Palette },
]
</script>

<template>
  <div class="space-y-6">
    <div class="glass-card rounded-2xl p-6">
      <h3 class="text-2xl font-bold mb-4 gradient-text">Live Preview Customizer</h3>
      <p class="text-muted-foreground mb-6">
        Kustomisasi produk Anda dengan teks, gambar, dan warna. Lihat perubahan secara real-time!
      </p>

      <!-- Canvas -->
      <div class="mb-6 flex justify-center">
        <canvas
          ref="canvasRef"
          class="border-2 border-border rounded-lg shadow-lg max-w-full"
        />
      </div>

      <!-- Controls -->
      <div class="glass-card-sm rounded-xl p-4">
        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/50'
            ]"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Text Tab -->
        <div v-if="activeTab === 'text'" class="space-y-4">
          <div>
            <UiLabel for="text-input">Tambah Teks</UiLabel>
            <div class="flex gap-2 mt-2">
              <UiInput
                id="text-input"
                v-model="text"
                placeholder="Ketik teks Anda..."
                @keypress.enter="handleAddText"
              />
              <UiButton @click="handleAddText" :disabled="!text">
                Tambah
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Image Tab -->
        <div v-if="activeTab === 'image'" class="space-y-4">
          <div>
            <UiLabel>Upload Gambar</UiLabel>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
            <UiButton
              @click="fileInputRef?.click()"
              variant="outline"
              class="w-full mt-2"
            >
              <Image class="h-4 w-4" />
              Pilih Gambar
            </UiButton>
          </div>
        </div>

        <!-- Color Tab -->
        <div v-if="activeTab === 'color'" class="space-y-4">
          <div>
            <UiLabel for="color-picker">Warna Teks</UiLabel>
            <div class="flex gap-2 mt-2">
              <input
                id="color-picker"
                type="color"
                v-model="textColor"
                class="w-20 h-10 rounded-lg border border-input cursor-pointer"
              />
              <UiButton @click="handleColorChange" class="flex-1">
                Terapkan Warna
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
        <UiButton @click="handleDeleteSelected" variant="outline">
          <Trash2 class="h-4 w-4" />
          Hapus
        </UiButton>
        <UiButton @click="handleReset" variant="outline">
          <RotateCcw class="h-4 w-4" />
          Reset
        </UiButton>
        <UiButton @click="handleDownload" class="col-span-2">
          <Download class="h-4 w-4" />
          Download Desain
        </UiButton>
      </div>
    </div>
  </div>
</template>


