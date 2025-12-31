import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, AppRole } from '~/types'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const LAST_ACTIVITY_KEY = 'lastActivity'
const CHECK_INTERVAL = 60 * 1000 // Check every minute

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<Profile | null>(null)
  const isLoading = ref(true)
  const isAdmin = ref(false)
  
  let inactivityCheckInterval: ReturnType<typeof setInterval> | null = null

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.display_name || user.value?.email || 'User')
  const avatarUrl = computed(() => profile.value?.avatar_url)

  // Actions
  const updateActivity = () => {
    if (user.value && import.meta.client) {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    }
  }

  const startInactivityCheck = () => {
    if (!import.meta.client) return
    
    if (inactivityCheckInterval) {
      clearInterval(inactivityCheckInterval)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    inactivityCheckInterval = setInterval(async () => {
      const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY)
      
      if (user.value && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
        
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          console.log('Session expired due to inactivity')
          await signOut()
          sessionStorage.removeItem(LAST_ACTIVITY_KEY)
        }
      }
    }, CHECK_INTERVAL)
  }

  const stopInactivityCheck = () => {
    if (!import.meta.client) return
    
    if (inactivityCheckInterval) {
      clearInterval(inactivityCheckInterval)
      inactivityCheckInterval = null
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.removeEventListener(event, updateActivity)
    })

    sessionStorage.removeItem(LAST_ACTIVITY_KEY)
  }

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      profile.value = data as Profile
    }
  }

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single()
    
    isAdmin.value = !!data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    if (data.user) {
      user.value = data.user
      session.value = data.session
      await fetchProfile(data.user.id)
      await checkAdminRole(data.user.id)
      startInactivityCheck()
      updateActivity()
    }
    
    return data
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    stopInactivityCheck()
    await supabase.auth.signOut()
    user.value = null
    session.value = null
    profile.value = null
    isAdmin.value = false
  }

  const initialize = async () => {
    try {
      isLoading.value = true

      // Set up auth state listener
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null

        if (newSession?.user) {
          startInactivityCheck()
          updateActivity()
          await fetchProfile(newSession.user.id)
          await checkAdminRole(newSession.user.id)
        } else {
          stopInactivityCheck()
          profile.value = null
          isAdmin.value = false
        }
      })

      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      session.value = existingSession
      user.value = existingSession?.user ?? null

      if (existingSession?.user) {
        // Check if session is still valid based on last activity
        if (import.meta.client) {
          const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY)
          
          if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
            
            if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
              console.log('Session expired, signing out')
              await signOut()
              isLoading.value = false
              return
            }
          }
        }

        await fetchProfile(existingSession.user.id)
        await checkAdminRole(existingSession.user.id)
        startInactivityCheck()
        updateActivity()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user.value) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    
    if (error) throw error
    if (data) {
      profile.value = data as Profile
    }
    
    return data
  }

  return {
    // State
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    
    // Computed
    isAuthenticated,
    displayName,
    avatarUrl,
    
    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    initialize,
    updateProfile,
    updateActivity,
  }
})


