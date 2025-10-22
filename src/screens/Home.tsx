import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SwipeCard from '../components/SwipeCard'
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

