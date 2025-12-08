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

    // Client-side code (in your deleteAccount function)

const deleteAccount = () => {
    Alert.alert(
        "Delete Account", 
        "Your account will be deactivated and permanently deleted in 30 days. You can sign back in before then to cancel deletion. Are you sure?", 
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Deactivate",
                style: "destructive",
                onPress: async () => {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        const uid = userData?.user?.id;
                        if (!uid) return;

                        // 1. Soft-Delete: Mark the user's profile with the current timestamp
                        const { error: updateError } = await supabase
                            .from("profiles")
                            .update({
                                is_active: false, // Optional: for immediate deactivation/hiding
                                deleted_at: new Date().toISOString(), // Record deletion request time
                            })
                            .eq("id", uid);
                        
                        if (updateError) throw updateError;
                        
                        // 2. Sign the user out locally
                        await supabase.auth.signOut(); 
                        
                        Alert.alert("Account Deactivated", "You have 30 days to sign back in and recover your account.");
                        
                        // 3. Redirect to login
                        router.replace("/(auth)/login");
                    } catch (err) {
                        console.error("Deactivation failed:", err);
                        Alert.alert("Error", "Account deactivation failed.");
                    }
                }
            }
        ]
    );
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

