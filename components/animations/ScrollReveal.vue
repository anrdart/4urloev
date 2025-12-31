<script setup lang="ts">
/**
 * ScrollReveal Component - Viewport-aware animation controller
 * 
 * Feature: performance-seo-optimization
 * Requirements: 3.3 - Pause animations outside viewport using Intersection Observer
 * 
 * This component provides GPU-accelerated reveal animations that:
 * - Only animate when elements enter the viewport
 * - Pause animations when elements leave the viewport (if not once-only)
 * - Respect user's prefers-reduced-motion preference
 * - Use transform/opacity for GPU acceleration
 */

const props = withDefaults(defineProps<{
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
  disabled?: boolean
}>(), {
  direction: 'up',
  delay: 0,
  duration: 500,
  once: true,
  threshold: 0.1,
  rootMargin: '0px',
  disabled: false,
})

const elementRef = ref<HTMLElement>()
const isVisible = ref(false)
const hasAnimated = ref(false)
const isPaused = ref(false)
const prefersReducedMotion = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}

// Animation transform values based on direction (GPU-accelerated)
const getInitialTransform = () => {
  if (prefersReducedMotion.value || props.disabled) {
    return 'translateZ(0)'
  }
  
  const transforms = {
    up: 'translateY(20px) translateZ(0)',
    down: 'translateY(-20px) translateZ(0)',
    left: 'translateX(20px) translateZ(0)',
    right: 'translateX(-20px) translateZ(0)',
  }
  return transforms[props.direction]
}

const getFinalTransform = () => {
  return 'translateY(0) translateX(0) translateZ(0)'
}

// Computed styles for GPU-accelerated animations
const animationStyles = computed(() => {
  // If reduced motion is preferred or disabled, show immediately without animation
  if (prefersReducedMotion.value || props.disabled) {
    return {
      opacity: '1',
      transform: 'translateZ(0)',
      transition: 'none',
    }
  }
  
  // If paused (off-screen and not once-only), maintain current state
  if (isPaused.value && !props.once) {
    return {
      opacity: isVisible.value ? '1' : '0',
      transform: isVisible.value ? getFinalTransform() : getInitialTransform(),
      transition: 'none',
    }
  }
  
  return {
    opacity: isVisible.value ? '1' : '0',
    transform: isVisible.value ? getFinalTransform() : getInitialTransform(),
    transition: `opacity ${props.duration}ms ease-out, transform ${props.duration}ms ease-out`,
    willChange: isVisible.value ? 'auto' : 'opacity, transform',
  }
})

onMounted(() => {
  checkReducedMotion()
  
  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', checkReducedMotion)
    })
  }
  
  // If disabled or reduced motion, show immediately
  if (props.disabled || prefersReducedMotion.value) {
    isVisible.value = true
    hasAnimated.value = true
    return
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is entering viewport
          isPaused.value = false
          
          setTimeout(() => {
            isVisible.value = true
            hasAnimated.value = true
          }, props.delay)
          
          if (props.once) {
            observer.unobserve(entry.target)
          }
        } else {
          // Element is leaving viewport
          if (!props.once && hasAnimated.value) {
            // Pause animation when off-screen (for non-once animations)
            isPaused.value = true
            isVisible.value = false
          }
        }
      })
    },
    { 
      threshold: props.threshold,
      rootMargin: props.rootMargin,
    }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

// Expose animation state for testing
defineExpose({
  isVisible,
  hasAnimated,
  isPaused,
  prefersReducedMotion,
})
</script>

<template>
  <div
    ref="elementRef"
    :style="animationStyles"
    class="scroll-reveal"
  >
    <slot />
  </div>
</template>

<style scoped>
.scroll-reveal {
  /* Ensure GPU layer creation for smooth animations */
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Reduced motion support at component level */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
