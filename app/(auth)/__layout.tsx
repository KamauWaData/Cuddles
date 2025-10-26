import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen
                name='Login'
                options={{
                    headerShown: false
                }}
                />
                <Stack.Screen
                name='Register'
                options={{
                    headerShown: false
                }}
                />

                <StatusBar backgroundColor='#fffff' />
            </Stack>
        </>
    )
}