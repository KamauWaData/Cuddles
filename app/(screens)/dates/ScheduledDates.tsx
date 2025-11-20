import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import BrandedLoading from "../../../components/BrandedLoading";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function ScheduledDatesScreen() {
    const { user } = useAuth();
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchScheduledDates = async () => {
        setLoading(true);

        // fetch logged in user's preferences
        const { data: me } = await supabase
            .from("user_profiles")
            .select("looking_for")
            .eq("id", user.id)
            .single();

        const { data, error} = await supabase
            
            .from("scheduled_dates")
            .select(`
                id, title, description, event_date, budget, location,
                user_profiles(
                  id, full_name, gender, photo_url
                )
            `)
            .neq("user_id", user.id)
            .gte("event_date", new Date().toISOString())
            .eq("is_active", true)
            .in("user_profiles.gender", me?.looking_for ?? [])
            .order("event_date", { ascending: true });

        if (!error) setDates(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchScheduledDates();
    }, []);

    if(loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <BrandedLoading message="Loading Scheduled Dates" />
            </View>
        );
    }

    if (dates.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No scheduled dates available right now</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
        <FlatList
            data={dates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity className="p-4 border-b border-gray-200">
                <Text className="font-bold text-lg">{item.title}</Text>
                <Text>{item.description}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                    {new Date(item.event_date).toLocaleString()}
                </Text>

                <View className="mt-2">
                    <Text className="font-semibold">Posted by:</Text>
                    <Text>{item.user_profiles.full_name}</Text>
                </View>
                </TouchableOpacity>
            )}
            />
            {/* Floating action button */}
            <TouchableOpacity
                onPress={() => router.push("/(main)/dates/ScheduleDate")}
                style={{
                position: "absolute",
                right: 20,
                bottom: Platform.OS === "ios" ? 36 : 20,
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ec4899",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6,
                }}
            >
                <Ionicons name="calendar" size={28} color="white" />
            </TouchableOpacity>
        </View>
            
    )
}