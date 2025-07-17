// src/app/users/_components/PostCard.tsx
import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function PostCard({
  post,
  userId,
  onEdit,
  onDelete,
}: {
  post: any
  userId?: string
  onEdit?: () => void
  onDelete?: (id: string) => void
}) {
  const owns = post.userId === userId

  return (
    <View style={styles.card}>
      <Text style={styles.author}>
        {post.firstName} {post.lastName}
      </Text>
      <Text style={styles.body}>{post.description}</Text>
      {post.picturePath && (
        <Image source={{ uri: post.picturePath }} style={styles.image} />
      )}
      {owns && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit}>
            <Ionicons name="pencil" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(post._id)}>
            <Ionicons name="trash" size={20} color="#CC0000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card:    { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 12 },
  author:  { fontWeight: 'bold', marginBottom: 4 },
  body:    { marginBottom: 8 },
  image:   { width: '100%', height: 150, borderRadius: 6, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
})
