import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const mock = [
  { id: "1", name: "Aisha", age: 24, image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "2", name: "Rachel", age: 26, image: "https://randomuser.me/api/portraits/women/47.jpg" },
  { id: "3", name: "Maya", age: 22, image: "https://randomuser.me/api/portraits/women/55.jpg" },
];

export default function Matches() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Matches</Text>
            <Text style={styles.headerSubtitle}>{mock.length} people liked you</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="heart" size={28} color="#FF3366" />
          </View>
        </View>

        {/* Matches Grid */}
        <FlatList
          data={mock}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(screens)/profile/[id]", params: { id: item.id } })}
              style={styles.matchCardContainer}
              activeOpacity={0.85}
            >
              <View style={styles.matchCard}>
                {/* Image */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.matchImage}
                />

                {/* Heart Badge */}
                <View style={styles.heartBadge}>
                  <Ionicons name="heart" size={20} color="#FF3366" />
                </View>

                {/* Info Section */}
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
                  style={styles.infoGradient}
                >
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchName}>
                      {item.name}, {item.age}
                    </Text>
                    <View style={styles.likedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.likedText}>Liked you</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFE4E6",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  matchCardContainer: {
    width: "48%",
    aspectRatio: 0.85,
  },
  matchCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  matchImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heartBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  infoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    justifyContent: "flex-end",
  },
  matchInfo: {
    padding: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  likedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  likedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
});
