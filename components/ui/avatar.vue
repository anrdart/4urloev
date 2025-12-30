<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { AvatarRoot, type AvatarRootProps } from 'radix-vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const avatarVariant = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

type AvatarVariants = VariantProps<typeof avatarVariant>

interface Props extends AvatarRootProps {
  size?: AvatarVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const delegatedProps = computed(() => {
  const { class: _, size: __, ...delegated } = props
  return delegated
})
</script>

<template>
  <AvatarRoot v-bind="delegatedProps" :class="cn(avatarVariant({ size }), props.class)">
    <slot />
  </AvatarRoot>
</template>


