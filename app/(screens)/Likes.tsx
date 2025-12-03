import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { FlatList } from "react-native-gesture-handler";


const LikesScreen = () => {
    const [tab, setTab] = useState("likesYou");
    const [likesYou, setLikesYou] = useState([]);
    const [youLiked, setYouLiked] = useState([]);

    useEffect(() => {
        fetchLikes();
    }, []);

    async function fetchLikes() {
        const [likesYouRes, youLikedRes] = await Promise.all([
            supabase
                .from("likes")
                .select("from_user")
                .eq("to_user", user.id),

            supabase
                .from("likes")
                .select("to_user")
                .eq("from_user", user.id),
        ]);

        const likesYouProfiles = await supabase
            .from("profiles")
            .select("*")
            .in(
                "id",
                likesYouRes.data.map((x) => x.from_user)
            );

            const youLikedProfiles = await supabase
                .from("profiles")
                .select("*")
                .in(
                    "id",
                    youLikedRes.data.map((x) => x.to_user)
                );

            setLikesYou(likesYouProfiles.data);
            setYouLiked(youLikedProfiles.data);

            const list = tab === "likesYou" ? likesYou : youLiked;

            return (
                <View className="flex-1 bg-black">
                    <View className="flex-row justify-center mt-4">
                        <TouchableOpacity onPress={() => setTab("likesYou")} className="px-4 py-2">
                            <Text className={tab === "likesYou" ? "text-pink-500" : "text-white"}>
                                    Likes You  
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTab("youLiked")} className="px-4 py-2">
                            <Text className={tab === "youLiked" ? "text-pink-500" : "text-white"}>
                                    You Liked
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={list}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: "space-between"}}
                        contentContainerStyle={{ padding: 16}}
                        renderItem={({ item }) => (
                            <View className="w-[48%] bg-gray-900 p-3 rounded-xl mb-4">
                                <Image 
                                    source={{ uri: item.avatar }}
                                    className="w-full h-40 rounded-lg"
                                />
                                <Text className="text-white text-lg mt-2">{item.name}</Text>
                            </View>
                        )}
                        />
                </View>
            );
    }
};

export default LikesScreen;