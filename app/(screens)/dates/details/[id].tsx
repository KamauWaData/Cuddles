import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../../lib/supabase";

export default function ScheduleDateDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [myRequest, setMyRequest] = useState<any>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const { data: auth } = await supabase.auth.getUser();
            const meId = auth?.user?.id;

            const { data, error } = await supabase
                .from("scheduled_dates")
                .select(`*, owner:profiles(id, first_name, avatar)`)
                .eq("id", id)
                .single();

            if (error) throw error;
            setItem(data);

            setIsOwner(meId === data.user_id);

            // check if i already requested
            const { data: req } = await supabase.from("date_requests").select("*").eq("scheduled_date_id", id).eq("requester_id", meId).single();
            setMyRequest(req || null);
        } catch (err) {
            console.error(err);
            Alert.alert("failed to load");
        } finally {
            setLoading(false);
        }

    };

    const requestToJoin = async (message?: string) => {
        try {
            const { data: auth } = await supabase.auth.getUser();
            const meId = auth?.user?.id;
            if (!meId) {
                Alert.alert("Please sign in");
                return;
            }

            // insert request
            const { error } = await supabase.from("date_requests").insert({
                scheduled_date_id: id,
                requester_id: meId,
                message: message || "",
            });

            if (error) throw error;
            Alert.alert("Request sent");
            await fetchDetails();
        } catch (err) {
            console.error(err);
            Alert.alert("Request failed");
        }
    };

    if (!item && loading) return <View className="flex-1 items-center justify-center"><Text>Loading...</Text></View>;
    if (!item) return <View className="flex-1 items-center justify-center"><Text>Not found</Text></View>;

    const eventDate = new Date(item.event_date);

    return (
        <ScrollView className="flex-1 bg-white">
            {item.image_url ? <Image source={{ uri: item.image_url}} style={{ width: "100%", height: 350 }} /> : null}

            <View className="p-4">
                <Text className="text-2xl font-bold">{item.title}</Text>
                <Text className="text-gray-500 mt-1">{item.location}</Text>
                <Text className="text-gray-400 mt-1">{eventDate.toLocaleString()}</Text>

            <View className="mt-4">
                <Text className="font-semibold">About</Text>
                <Text className="text-gray-700 mt-2">{item.description || "No description provided."}</Text>
            </View>

            <View className="mt-4 flex-row items-center">
                {item.owner?.avatar ? <Image source={{ uri: item.owner.avatar }} style={{ width: 46, height: 46, borderRadius: 23 }} /> : null}
                <View className="ml-3">
                    <Text className="font-semibold">{item.owner?.first_name || "Host"}</Text>
                    <Text className="text-gray-500">Host</Text>
                </View>
            </View>

            {/* Action */}
            {!isOwner ? (
            <View className="mt-6">
                {myRequest ? (
                <Text className="text-gray-500">Request status: {myRequest.status}</Text>
                ) : (
                <TouchableOpacity className="bg-pink-500 p-4 rounded" onPress={() => requestToJoin()}>
                    <Text className="text-white text-center font-semibold">I'm Interested</Text>
                </TouchableOpacity>
                )}
            </View>
            ) : (
            <View className="mt-6">
                <Text className="text-gray-600">You posted this date. Manage requests on the MyDates screen.</Text>
                <TouchableOpacity className="mt-3 bg-pink-100 p-3 rounded" onPress={() => router.push("/(main)/dates/MyDates")}>
                <Text className="text-pink-600 text-center">View Requests</Text>
                </TouchableOpacity>
            </View>
            )}
        </View>
        </ScrollView>
    )
}