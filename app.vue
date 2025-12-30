<script setup lang="ts">
// Global app setup
useHead({
  htmlAttrs: {
    lang: 'id',
  },
  script: [
    {
      // Inline script to prevent flash of wrong theme
      innerHTML: `
        (function() {
          try {
            var stored = localStorage.getItem('theme');
            if (stored) {
              var parsed = JSON.parse(stored);
              if (parsed.isDark) {
                document.documentElement.classList.add('dark');
              }
            }
          } catch (e) {}
        })();
      `,
      type: 'text/javascript',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
