// app/(main)/ScheduledDates.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduledDates() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id || null;

      // fetch upcoming dates from other users (includes owner profile via join)
      const { data, error } = await supabase
        .from("scheduled_dates")
        .select(`
          id, title, description, location, event_date, image_url, created_at,
          owner:profiles(id, first_name, avatar)
        `)
        .gte("event_date", new Date().toISOString())
        .eq("is_active", true)
        .neq("user_id", myId)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("ScheduledDates fetch error", error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("fetch scheduled dates", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Explore Dates</Text>
            <Text style={styles.headerSubtitle}>{items.length} upcoming date{items.length !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(main)/dates/ScheduleDate")}
            style={styles.headerButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dates List */}
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(main)/dates/details/[id]", params: { id: item.id } })}
              style={styles.dateCard}
              activeOpacity={0.85}
            >
              {/* Image Section */}
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.dateImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="calendar-outline" size={40} color="#FF3366" />
                </View>
              )}

              {/* Content Section */}
              <View style={styles.dateContent}>
                <Text style={styles.dateTitle} numberOfLines={1}>{item.title}</Text>

                <View style={styles.dateInfoRow}>
                  <Ionicons name="location-outline" size={16} color="#FF3366" />
                  <Text style={styles.dateLocation} numberOfLines={1}>
                    {item.location || "No location specified"}
                  </Text>
                </View>

                <View style={styles.dateInfoRow}>
                  <Ionicons name="time-outline" size={16} color="#FF3366" />
                  <Text style={styles.dateTime}>
                    {new Date(item.event_date).toLocaleDateString()} at {new Date(item.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>

                {/* Host Info */}
                {item.owner ? (
                  <View style={styles.ownerSection}>
                    {item.owner.avatar ? (
                      <Image source={{ uri: item.owner.avatar }} style={styles.ownerAvatar} />
                    ) : (
                      <View style={styles.ownerAvatarPlaceholder}>
                        <Text>👤</Text>
                      </View>
                    )}
                    <Text style={styles.ownerName}>{item.owner.first_name}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color="#FF3366" />
              </View>
              <Text style={styles.emptyTitle}>No upcoming dates</Text>
              <Text style={styles.emptySubtitle}>Check back later for new date ideas</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/dates/ScheduleDate")}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#ff69b4", "#ff1493"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
