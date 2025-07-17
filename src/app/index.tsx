// src/app/index.tsx
import React, { useState, useRef, useCallback, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AuthContext } from '@/context/AuthContext'
import { login } from '@/utils/auth'
/* testing */

// ——— Quick check that our .env values are flowing through ———
import Constants from 'expo-constants'
const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? ''
const socketUrl  = Constants.expoConfig?.extra?.socketUrl  ?? ''
const domain     = Constants.expoConfig?.extra?.domain     ?? ''

console.log('🔌 API_BASE_URL:', apiBaseUrl)
console.log('🔌 SOCKET_URL:  ', socketUrl)
console.log('🔌 DOMAIN:      ', domain)

export default function HomeScreen() {
  const { authenticate } = useContext(AuthContext)
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [invalid, setInvalid] = useState({ email: false, password: false })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordInput = useRef<TextInput>(null)

  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim()
    const trimmedPw = password.trim()
    const emailValid = trimmedEmail.includes('@')
    const pwValid = trimmedPw.length > 6

    if (!emailValid || !pwValid) {
      setInvalid({ email: !emailValid, password: !pwValid })
      setError('Please check your entered credentials.')
      return
    }

    setInvalid({ email: false, password: false })
    setError('')
    setIsLoading(true)

    try {
      const { token, user } = await login(trimmedEmail, trimmedPw)
      await authenticate(token, user)
      router.push({
  pathname: '/users/[id]',
  params: { id: user._id },
})


    } catch (e: any) {
      setError(e.message ?? 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }, [email, password, authenticate, router])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🚀 oxsaid-mobile</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={[styles.input, invalid.email && styles.inputError]}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          onSubmitEditing={() => passwordInput.current?.focus()}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            ref={passwordInput}
            style={[styles.input, invalid.password && styles.inputError]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(p => !p)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgot}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const PRIMARY = '#0066CC'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  errorText: {
    color: '#D00',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#D00',
    backgroundColor: '#FEE',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgot: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotText: {
    color: PRIMARY,
    fontSize: 14,
  },
})
