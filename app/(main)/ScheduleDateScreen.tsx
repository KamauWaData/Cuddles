import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

export default function ScheduleDateScreen() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [date, setDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCreateDate = async () => {
        if (!title || !location) {
            Alert.alert('Missing info', 'Please fill in all fields.')
            return
        }
        setLoading(true)
        const user = (await supabase.auth.getUser()).data.user
        const { error } = await supabase.from('dates').insert([
            {
                creator_id: user.id,
                title,description,
                location,
                date_time: date.toISOString(),
            },
        ])
        setLoading(false)

        if (error) Alert.alert('Error', error.message)
        else {
            Alert.alert('Success', 'Date posted successfully')
            setTitle('')
            setDescription('')
            setLocation('')
            setDate(new Date())
            router.back()
        }
    }

    return (
        <View className='flex-1 bg-white p-5 pt-12'>
            <Text className='text-2xl font-bold mb-4 text-pinkAccent'>
               Schedule a Date 
            </Text>

            <TextInput
                placeholder="Title (e.g. Coffee at Java House)"
                value={title}
                onChangeText={setTitle}
                className="border border-gray-300 rounded-xl p-3 mb-3"
            />
            <TextInput
                placeholder='Description'
                value={description}
                onChangeText={setDescription}
                multiline
                className='border border-gray-300 rounded-xl p-3 mb-3'
            />    
            <TextInput
                placeholder='Location'
                value={location}
                onChangeText={setLocation}
                className='border border-gray-300 rounded-xl p-3 mb-3'
            />

            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                className='border border-gray-300 rounded-xl p-3 mb-3'
            >
               <Text>Select Date & Time: {date.toLocaleString()}</Text> 
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode='datetime'
                    onChange={(e, selected) => {
                        setShowPicker(false)
                        if (selected) setDate(selected)
                    }}
                />
            )}
            <TouchableOpacity
                disabled={loading}
                onPress={handleCreateDate}
                className='bg-pinkAccent py-4 rounded-2xl mt-4'
            >
                <Text className='text-center text-white text-lg font-semibold'>
                    {loading ? 'Posting...' : 'Post Date'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}