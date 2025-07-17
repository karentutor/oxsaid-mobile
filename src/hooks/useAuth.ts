// src/app/hooks/useAuth.ts
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

/**
 * A small wrapper around useContext(AuthContext)
 * so that consumers never reach in to the context object directly.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthContextProvider>')
  }
  return ctx
}
