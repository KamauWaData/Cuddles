import { Image, Text, TouchableOpacity, View } from "react-native";




const MatchDetailScreen = ({ route, navigation }) => {
    const { me, otherUser, matchId } = route.params;

    return (
        <View className="flex-1 bg-black items-center justify-center p-6">
            <Text className="text-pink-500 text-3xl font-bold mb-6">
                It’s a Match!
            </Text>

            <View className="flex-row items-center space-x-6">
                <Image
                    source={{ uri: me.avatar }}
                    className="w-28 h-28 rounded-full"
                />
                <Image
                    source={{ uri: otherUser.avatar }}
                    className="w-28 h-28 rounded-full"
                />
            </View>

            <Text className="text-white text-xl mt-6">
                You and {otherUser.name} like each other.
            </Text>

            <TouchableOpacity
                className="bg-pink-500 w-full p-4 rounded-2xl rounded-2xl mt-10"
                onPress={() => 
                    navigation.replace("Chat", {
                        matchId,
                        otherUser,
                    })
                }
                >
                    <Text className="text-center text-white text-xl">Say Hi 👋</Text>
                </TouchableOpacity>
        </View>
    )
}