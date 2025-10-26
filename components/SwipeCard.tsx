import React from 'react'
import { Image, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/Ionicons'

type User = {
  image: string
  distance?: number
  name: string
  age?: number | string
  location?: string
}

type SwipeCardProps = {
  user: User
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0)
  const rotate = useSharedValue(0)

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
      rotate.value = event.translationX / 20
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > 120) {
        onSwipe(translateX.value > 0 ? 'right' : 'left')
        translateX.value = withSpring(translateX.value > 0 ? 500 : -500)
      } else {
        translateX.value = withSpring(0)
        rotate.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="absolute w-[90%] self-center rounded-3xl overflow-hidden bg-gray-200"
        style={animatedStyle}
      >
        <Image source={{ uri: user.image }} className="w-full h-[500px]" />
        <View className="absolute left-3 top-3 bg-black/40 px-3 py-1 rounded-full">
          <Text className="text-white text-sm">{user.distance} km away</Text>
        </View>

        <View className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
          <Text className="text-white text-2xl font-semibold">
            {user.name}, {user.age}
          </Text>
          <Text className="text-gray-200">{user.location}</Text>
          <View className="flex-row space-x-3 mt-2">
            <Icon name="logo-instagram" size={20} color="white" />
            <Icon name="logo-twitter" size={20} color="white" />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}