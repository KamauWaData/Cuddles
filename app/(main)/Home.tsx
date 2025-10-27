import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SwipeCard from '../../components/SwipeCard'
import Icon from 'react-native-vector-icons/Ionicons'

const mockUsers = [
  {
    id: 1,
    name: 'Alfredo Calzoni',
    age: 20,
    location: 'Hamburg, Germany',
    distance: 16.8,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
  {
    id: 2,
    name: 'Lara Schmidt',
    age: 22,
    location: 'Berlin, Germany',
    distance: 8.2,
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  },
]

export default function HomeScreen() {
  const [activeTab, setActiveTab ] = useState<'friends' | 'partners'>('partners')
  const [users, setUsers] = useState(mockUsers)

  const handleSwipe = (direction: string) => {
    console.log(direction)
    setUsers((prev) => prev.slice(1))
  }

  return (
    <View className="flex-1 bg-pinkPrimary pt-12">
      {/* Header */}
      <View className="flex-row justify-between px-6 items-center mb-4">
        <View className="flex-row bg-white rounded-full p-1">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${activeTab === 'friends' ? 'bg-pinkAccent' : ''}`}
            onPress={() => setActiveTab('friends')}
          >
            <Text className={activeTab === 'friends' ? 'text-white' : 'text-gray-500'}>
              Make Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${activeTab === 'partners' ? 'bg-pinkAccent' : ''}`}
            onPress={() => setActiveTab('partners')}
          >
            <Text className={activeTab === 'partners' ? 'text-white' : 'text-gray-500'}>
              Search Partners
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Icon name="heart-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View className="flex-1 items-center justify-center">
        {users.map((user, i) => (
          <SwipeCard key={user.id} user={user} onSwipe={handleSwipe} />
        ))}
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-evenly mb-6">
        <TouchableOpacity className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-lg">
          <Icon name="close" size={30} color="#FF5C5C" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-lg">
          <Icon name="star" size={30} color="#9B59B6" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white w-16 h-16 rounded-full items-center justify-center shadow-lg">
          <Icon name="heart" size={30} color="#E48DDE" />
        </TouchableOpacity>
      </View>

    </View>
  )
}