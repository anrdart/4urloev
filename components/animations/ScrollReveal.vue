<script setup lang="ts">
const props = withDefaults(defineProps<{
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  once?: boolean
}>(), {
  direction: 'up',
  delay: 0,
  duration: 500,
  once: true,
})

const elementRef = ref<HTMLElement>()
const isVisible = ref(false)

const animationClass = computed(() => {
  if (!isVisible.value) {
    const directions = {
      up: 'translate-y-10 opacity-0',
      down: '-translate-y-10 opacity-0',
      left: 'translate-x-10 opacity-0',
      right: '-translate-x-10 opacity-0',
    }
    return directions[props.direction]
  }
  return 'translate-y-0 translate-x-0 opacity-100'
})

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            isVisible.value = true
          }, props.delay)
          
          if (props.once) {
            observer.unobserve(entry.target)
          }
        } else if (!props.once) {
          isVisible.value = false
        }
      })
    },
    { threshold: 0.1 }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <div
    ref="elementRef"
    :class="[animationClass, 'transition-all ease-out']"
    :style="{ transitionDuration: `${duration}ms` }"
  >
    <slot />
  </div>
</template>


