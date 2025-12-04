import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function AuthLayout () {
    return (
        <>
            <StatusBar backgroundColor='#ffffff' />
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
                <Stack.Screen
                    name='(onboarding)'
                    options={{ headerShown: false }}
                />

            </Stack>
        </>
    )
}