import { defineStore } from 'pinia'
import type { Theme } from '~/types'

interface ThemeState {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundGradient: string[]
  glassmorphismIntensity: number
  pointerStyle: string
  customCss: string | null
  isDark: boolean
  isCustomizerOpen: boolean
}

const defaultTheme: ThemeState = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  accentColor: '#F59E0B',
  backgroundGradient: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
  glassmorphismIntensity: 0.7,
  pointerStyle: 'default',
  customCss: null,
  isDark: false,
  isCustomizerOpen: false,
}

export const useThemeStore = defineStore('theme', () => {
  const supabase = useSupabaseClient()
  
  // State
  const primaryColor = ref(defaultTheme.primaryColor)
  const secondaryColor = ref(defaultTheme.secondaryColor)
  const accentColor = ref(defaultTheme.accentColor)
  const backgroundGradient = ref(defaultTheme.backgroundGradient)
  const glassmorphismIntensity = ref(defaultTheme.glassmorphismIntensity)
  const pointerStyle = ref(defaultTheme.pointerStyle)
  const customCss = ref(defaultTheme.customCss)
  const isDark = ref(defaultTheme.isDark)
  const isCustomizerOpen = ref(defaultTheme.isCustomizerOpen)

  // Computed
  const cssVariables = computed(() => ({
    '--primary': hexToHsl(primaryColor.value),
    '--secondary': hexToHsl(secondaryColor.value),
    '--accent': hexToHsl(accentColor.value),
    '--bg-gradient-from': backgroundGradient.value[0],
    '--bg-gradient-via': backgroundGradient.value[1],
    '--bg-gradient-to': backgroundGradient.value[2],
  }))

  // Actions
  const toggleDark = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const toggleCustomizer = () => {
    isCustomizerOpen.value = !isCustomizerOpen.value
  }

  const setTheme = (theme: Partial<ThemeState>) => {
    if (theme.primaryColor) primaryColor.value = theme.primaryColor
    if (theme.secondaryColor) secondaryColor.value = theme.secondaryColor
    if (theme.accentColor) accentColor.value = theme.accentColor
    if (theme.backgroundGradient) backgroundGradient.value = theme.backgroundGradient
    if (theme.glassmorphismIntensity !== undefined) glassmorphismIntensity.value = theme.glassmorphismIntensity
    if (theme.pointerStyle) pointerStyle.value = theme.pointerStyle
    if (theme.customCss !== undefined) customCss.value = theme.customCss
    if (theme.isDark !== undefined) isDark.value = theme.isDark
    
    applyTheme()
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
  }

  const applyTheme = () => {
    if (!import.meta.client) return
    
    const root = document.documentElement
    
    // Apply dark mode
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Apply CSS variables
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    
    // Apply custom CSS
    let customStyleElement = document.getElementById('custom-theme-css')
    if (customCss.value) {
      if (!customStyleElement) {
        customStyleElement = document.createElement('style')
        customStyleElement.id = 'custom-theme-css'
        document.head.appendChild(customStyleElement)
      }
      customStyleElement.textContent = customCss.value
    } else if (customStyleElement) {
      customStyleElement.remove()
    }
  }

  const loadThemeFromSupabase = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('themes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      
      if (data) {
        const theme = data as Theme
        setTheme({
          primaryColor: theme.primary_color,
          secondaryColor: theme.secondary_color,
          accentColor: theme.accent_color,
          backgroundGradient: theme.background_gradient as string[],
          glassmorphismIntensity: theme.glassmorphism_intensity,
          pointerStyle: theme.pointer_style,
          customCss: theme.custom_css,
        })
      }
    } catch (error) {
      console.error('Error loading theme from Supabase:', error)
    }
  }

  const saveThemeToSupabase = async (userId: string, themeName = 'Custom Theme') => {
    try {
      // Deactivate existing themes
      await supabase
        .from('themes')
        .update({ is_active: false })
        .eq('user_id', userId)
      
      // Insert new theme
      const { data, error } = await supabase
        .from('themes')
        .insert({
          user_id: userId,
          name: themeName,
          is_active: true,
          primary_color: primaryColor.value,
          secondary_color: secondaryColor.value,
          accent_color: accentColor.value,
          background_gradient: backgroundGradient.value,
          glassmorphism_intensity: glassmorphismIntensity.value,
          pointer_style: pointerStyle.value,
          custom_css: customCss.value,
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving theme to Supabase:', error)
      throw error
    }
  }

  return {
    // State
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundGradient,
    glassmorphismIntensity,
    pointerStyle,
    customCss,
    isDark,
    isCustomizerOpen,
    
    // Computed
    cssVariables,
    
    // Actions
    toggleDark,
    toggleCustomizer,
    setTheme,
    resetTheme,
    applyTheme,
    loadThemeFromSupabase,
    saveThemeToSupabase,
  }
})

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}


