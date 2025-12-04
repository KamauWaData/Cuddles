// app/(main)/profile/Settings.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function Settings() {
    const router = useRouter();

    const signOut = async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/login");
    };

    const deleteAccount = () => {
        Alert.alert("Delete account", "This will remove your account. Are you sure you want to continue?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        const uid = userData?.user?.id;
                        if (!uid) return;
                        // delete profile row & related data (depends on cascade)
                        await supabase.from("profiles").delete().eq("id", uid);
                        await supabase.auth.api.deleteUser(uid);
                        router.replace("/(auth)/login");
                    } catch (err) {
                        Alert.alert("Delete failed");
                    }
                }

            }
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Settings</Text>

            <TouchableOpacity onPress={() => router.push("/(main)/profile/EditProfile")} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 12 }}>
                <Text>Edit profile</Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => router.push("/(screens)/PrivacyPolicy")} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 12 }}>
                <Text>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(screens)/DataPrivacyGDPR")} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 12 }}>
                <Text>Data Privacy / GDPR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(screens)/About")} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 12 }}>
                <Text>About / 18+ Only</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(screens)/safety/SafetyTips")} style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10, marginBottom: 12 }}>
                <Text>Safety Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={signOut} style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 10, marginBottom: 12 }}>
                <Text>Sign out</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={deleteAccount} style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 10 }}>
                <Text style={{ color: "#b91c1c" }}>Delete account</Text>
            </TouchableOpacity>
            </View>
    );
}

