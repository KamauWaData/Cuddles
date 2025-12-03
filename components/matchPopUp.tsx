import React from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";

type Props = {
    visible: boolean;
    me: { id: string; avatar?: string; first_name?: string};
    other: { id: string; avatar?: string; first_name?: string };
    conversationId?: string | null;
    onClose: () => void;
};

const BRAND_LOGO = require("../assets/cuddles.png");

export default function MatchPopup({ visible, me, other, conversationId, onClose}: Props) {
    const router = useRouter();

    const goToChat = () => {
        if (conversationId) {
            onClose();
            router.replace({ pathname: "/(screens)/chat/[conversationId]", params: { conversationId } });
        } else {
            onClose();
            // fallback: navigate to matches screen
            router.replace("/(screens)/match");
        }
    };

    return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: "88%", backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "center" }}>
          <Image source={{ uri: BRAND_LOGO }} style={{ width: 80, height: 80, marginBottom: 8 }} resizeMode="contain" />
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#FF3366", marginBottom: 6 }}>It's a Match!</Text>
          <Text style={{ fontSize: 14, color: "#374151", marginBottom: 12, textAlign: "center" }}>
            You and {other.first_name || "them"} liked each other.
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <Image source={{ uri: me.avatar }} style={{ width: 96, height: 96, borderRadius: 48, marginRight: 12 }} />
            <Image source={{ uri: other.avatar }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          </View>

          <TouchableOpacity onPress={goToChat} style={{ backgroundColor: "#FF3366", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, width: "100%", marginBottom: 10 }}>
            <Text style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>Say Hi 👋</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ paddingVertical: 10 }}>
            <Text style={{ textAlign: "center", color: "#374151" }}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

