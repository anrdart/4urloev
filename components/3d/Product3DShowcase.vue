<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos'

const props = withDefaults(defineProps<{
  type?: 'box' | 'sphere' | 'torus' | 'gift'
  color?: string
  autoRotate?: boolean
}>(), {
  type: 'box',
  color: '#6366f1',
  autoRotate: true,
})

const meshRef = ref()

// Material properties
const materialProps = computed(() => ({
  color: props.color,
  metalness: 0.3,
  roughness: 0.4,
}))
</script>

<template>
  <div class="w-full h-full min-h-[200px]">
    <TresCanvas clear-color="transparent" alpha>
      <!-- Camera -->
      <TresPerspectiveCamera :position="[0, 0, 4]" :fov="45" />
      
      <!-- Controls -->
      <OrbitControls
        :auto-rotate="autoRotate"
        :auto-rotate-speed="2"
        :enable-zoom="false"
        :enable-pan="false"
        :max-polar-angle="Math.PI / 1.5"
        :min-polar-angle="Math.PI / 3"
      />
      
      <!-- Lighting -->
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" cast-shadow />
      <TresDirectionalLight :position="[-5, 5, -5]" :intensity="0.5" />
      <TresPointLight :position="[0, 3, 0]" :intensity="0.5" :color="color" />
      
      <!-- 3D Objects -->
      <template v-if="type === 'sphere'">
        <TresMesh ref="meshRef" cast-shadow>
          <TresSphereGeometry :args="[1, 32, 32]" />
          <TresMeshStandardMaterial v-bind="materialProps" />
        </TresMesh>
      </template>
      
      <template v-else-if="type === 'torus'">
        <TresMesh ref="meshRef" cast-shadow>
          <TresTorusGeometry :args="[1, 0.4, 16, 32]" />
          <TresMeshStandardMaterial v-bind="materialProps" />
        </TresMesh>
      </template>
      
      <template v-else-if="type === 'gift'">
        <TresGroup ref="meshRef">
          <!-- Gift Box -->
          <TresMesh cast-shadow>
            <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
            <TresMeshStandardMaterial v-bind="materialProps" />
          </TresMesh>
          <!-- Ribbon Horizontal -->
          <TresMesh :position="[0, 0, 0]" cast-shadow>
            <TresBoxGeometry :args="[1.6, 0.2, 0.2]" />
            <TresMeshStandardMaterial color="#f472b6" :metalness="0.5" :roughness="0.3" />
          </TresMesh>
          <!-- Ribbon Vertical -->
          <TresMesh :position="[0, 0, 0]" cast-shadow>
            <TresBoxGeometry :args="[0.2, 0.2, 1.6]" />
            <TresMeshStandardMaterial color="#f472b6" :metalness="0.5" :roughness="0.3" />
          </TresMesh>
        </TresGroup>
      </template>
      
      <template v-else>
        <TresMesh ref="meshRef" cast-shadow>
          <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
          <TresMeshStandardMaterial v-bind="materialProps" />
        </TresMesh>
      </template>
    </TresCanvas>
  </div>
</template>

