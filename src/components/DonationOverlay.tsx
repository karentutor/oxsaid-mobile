// src/components/DonationOverlay.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import Constants from 'expo-constants'

const { width, height } = Dimensions.get('window')
const domain = Constants.expoConfig?.extra?.domain || 'oxsaid'

export default function DonationOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cnt = Number(localStorage.getItem('visitCount') || 0) + 1
    localStorage.setItem('visitCount', String(cnt))
    if (cnt % 3 === 0) setVisible(true)
  }, [])

  if (!visible) return null

  const isOxalum = domain === 'oxalum'
  const bgColor = isOxalum ? '#333' : '#ffd700'
  const textColor = isOxalum ? '#ffd700' : '#333'
  const accent = isOxalum ? '#555' : '#333'

  return (
    <View style={[styles.overlay, { backgroundColor: bgColor }]}>
      <TouchableOpacity
        style={styles.close}
        onPress={() => setVisible(false)}
      >
        <Text style={[styles.closeText, { color: textColor }]}>×</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.heading, { color: textColor }]}>
          Support Our Work!
        </Text>
        <Text style={[styles.text, { color: textColor }]}>
          This app is free but hosting and maintenance aren’t. Contribute to
          help us keep it going!
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: accent }]}
          onPress={() => {/* navigate to contact screen */}}
        >
          <Text style={{ color: bgColor }}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: isOxalum ? '#666' : '#e6b800' },
          ]}
          onPress={() => setVisible(false)}
        >
          <Text style={{ color: textColor }}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.5,
    top: height * 0.25,
    left: width * 0.1,
    borderRadius: 8,
    padding: 20,
    zIndex: 1000,
    elevation: 10,
  },
  close: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  closeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    marginTop: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  text: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
})
