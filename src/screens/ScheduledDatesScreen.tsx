import React, {useEffect, useState} from 'react'
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { supabase } from "../supabase/supabaseClient"; // your initialized client
import { Calendar, MapPin, Clock } from "lucide-react-native";

type DatePost = {
    id: string;
    title: string;
    description: string;
    location: string;
    date_time: string;
    image_url: string;
    host_is: string;
}

export default function ScheduledDateScreen() {
    const [dates, setDates] = useState<DatePost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDates();
    }, []);

    const fetchDates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("dates")
            .select("*")
            .order("date_time", { ascending: true });
        if (error) console.log(error);
        else setDates(data || []);
        setLoading(false);
    };

    const renderDate = ({ item }: { item: DatePost }) => (
        <View className='bg-white m-3 rounded-2xl shadow p-3'>
            {item.image_url && (
                <Image 
                    source={{ uri: item.image_url}}
                    className='w-full h-48 rounded-xl'
                    resizeMode='cover'
                />
            )}
            <Text className='text-xl font-bold mt-2 text-gray-900'>
                {item.title}
            </Text>
            <Text className='text-gray-500 text-sm mt-1'>{item.description}</Text>
            <View className='flex-row items-center mt-2'>
                <MapPin size={16} color="#f472b6"/>
                <Text className='text-gray-700 ml-1'>{item.location}</Text>
            </View>
            <View className='flex-row items-center mt-1'>
                <Clock size={16} color="#f472b6"/>
                <Text className='text-gray-700 ml-1'>
                    {new Date(item.date_time).toLocaleString()}
                </Text>
            </View>
            <TouchableOpacity className='bg-pink-500 mt-3 py-2 rounded-xl'>
                <Text className='text-white text-center font-semibold'>
                    Show Interest
                </Text>
            </TouchableOpacity>
        </View>

    );

    if (loading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Text>Loading scheduled dates...</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-gray-100'>
            <View className='flex-row items-center justify-center py-4 bg-white shadow-sm'>
                <Calendar size={24} color="#f472b6" />
                <Text className='ml-2 text-lg font-bold text-gray-800'>
                    Scheduled Dates Nearby
                </Text>
            </View>

            {dates.length === 0 ? (
                <View className='flex-1 justify-center items-center'>
                    <Text className='text-gray-500'>No scheduled dates yet</Text>
                </View>
            ) : (
                <FlatList 
                    data={dates}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDate}
                />
            )}
        </View>
    );
}