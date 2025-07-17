// src/app/users/[id].tsx
import React, { useState, useEffect, useContext } from 'react'
import { ScrollView, View, Text, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Constants from 'expo-constants'
import { AuthContext } from '@/context/AuthContext'
import { axiosBase } from '@/services/BaseService'
import PostCard from './_components/PostCard'
import { Ionicons } from '@expo/vector-icons'

export default function UserProfileScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { auth } = useContext(AuthContext)
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const isOwner = auth.user?._id === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    axiosBase
      .get(`/users/${id}`)
      .then(res => setUser(res.data.user || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    // If it’s you, auto-load posts
    if (isOwner) {
      setIsConnected(true)
      axiosBase.get(`/posts/${user._id}`)
        .then(res => setPosts(res.data))
        .catch(console.error)
    }
    // else you could load connection status + posts similarly…
  }, [user, isOwner])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile…</Text>
      </View>
    )
  }
  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Profile</Text>

      {/* Avatar */}
      {user.picturePath
        ? <Image source={{ uri: user.picturePath }} style={styles.avatar} />
        : <View style={[styles.avatar, styles.avatarPlaceholder]} />
      }

      {/* Basic Info */}
      <View style={styles.card}>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.subtext}>College: {user.college || 'N/A'}</Text>
        <Text style={styles.subtext}>Industry: {user.occupation || 'N/A'}</Text>
        {user.professionalProfileUrl ? (
          <Text
            style={[styles.subtext, styles.link]}
            onPress={() => Linking.openURL(user.professionalProfileUrl)}
          >
            {user.professionalProfileUrl}
          </Text>
        ) : null}
      </View>

      {/* Chat / Email
      {!isOwner && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push(`/chats/${auth.user!._id}-${user._id}`)}
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.emailBtn]}
            onPress={() => Linking.openURL(`mailto:${user.email}`)}
          >
            <Ionicons name="mail-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Email</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Posts */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {posts.length > 0
          ? posts.map(p => (
              <PostCard
                key={p._id}
                post={p}
                userId={auth.user?._id}
                onEdit={() => router.push(`/users/${id}/my-posts/${p._id}/edit`)}
                onDelete={pid => setPosts(ps => ps.filter(x => x._id !== pid))}
              />
            ))
          : <Text style={styles.subtext}>No posts to display.</Text>
        }
      </View>
    </ScrollView>
  )
}

const PRIMARY = '#0066CC'
const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:     { fontSize: 24, fontWeight: 'bold', color: PRIMARY, marginBottom: 12 },
  avatar:    { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: '#EEE' },
  card:      { width: '100%', backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 16 },
  name:      { fontSize: 20, fontWeight: 'bold' },
  subtext:   { fontSize: 14, color: '#666', marginTop: 4 },
  link:      { color: PRIMARY, textDecorationLine: 'underline' },
  actionsRow:{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 16 },
  button:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY, padding: 12, borderRadius: 6, marginHorizontal: 4 },
  emailBtn:  { backgroundColor: '#DD9900' },
  buttonText:{ color: '#FFF', marginLeft: 6 },
  postsSection: { width: '100%', marginTop: 24 },
  sectionTitle:{ fontSize: 18, fontWeight: '600', marginBottom: 8 },
})
