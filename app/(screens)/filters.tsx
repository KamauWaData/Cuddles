import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Filters() {
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [distance, setDistance] = useState(50);
  const [genderFilter, setGenderFilter] = useState<string[]>(["Man", "Woman"]);

  const toggleGender = (g: string) => {
    setGenderFilter((prev) => (prev.includes(g) ? prev.filter((i) => i !== g) : [...prev, g]));
  };

  const applyFilters = () => {
    router.push({
      pathname: "/(main)/Home",
      params: {
        minAge,
        maxAge,
        distance,
        gender: JSON.stringify(genderFilter),
      },
    });
  };

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.scrollContent}>
          {/* Age Range Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#FF3366" />
              <Text style={styles.sectionTitle}>Age Range</Text>
            </View>
            <View style={styles.ageDisplayBox}>
              <Text style={styles.ageText}>{minAge}</Text>
              <Text style={styles.ageHyphen}>—</Text>
              <Text style={styles.ageText}>{maxAge}</Text>
            </View>

            <Text style={styles.sliderLabel}>Minimum Age: {minAge}</Text>
            <Slider
              style={styles.slider}
              value={minAge}
              minimumValue={18}
              maximumValue={60}
              onValueChange={(v: number) => setMinAge(Math.round(v))}
              minimumTrackTintColor="#FF3366"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FF3366"
            />

            <Text style={styles.sliderLabel}>Maximum Age: {maxAge}</Text>
            <Slider
              style={styles.slider}
              value={maxAge}
              minimumValue={18}
              maximumValue={99}
              onValueChange={(v: number) => setMaxAge(Math.round(v))}
              minimumTrackTintColor="#FF3366"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FF3366"
            />
          </View>

          {/* Distance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#FF3366" />
              <Text style={styles.sectionTitle}>Distance</Text>
            </View>
            <View style={styles.distanceBox}>
              <Text style={styles.distanceValue}>{distance}</Text>
              <Text style={styles.distanceUnit}>km</Text>
            </View>
            <Slider
              style={styles.slider}
              value={distance}
              minimumValue={5}
              maximumValue={200}
              onValueChange={(v: number) => setDistance(Math.round(v))}
              minimumTrackTintColor="#FF3366"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FF3366"
            />
          </View>

          {/* Gender Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#FF3366" />
              <Text style={styles.sectionTitle}>Show Me</Text>
            </View>
            <View style={styles.genderGrid}>
              {["Man", "Woman"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => toggleGender(g)}
                  style={[
                    styles.genderButton,
                    genderFilter.includes(g) && styles.genderButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      genderFilter.includes(g) && styles.genderButtonTextActive,
                    ]}
                  >
                    {g === "Man" ? "👨 " : "👩 "}
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Apply Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={applyFilters} style={styles.applyButton} activeOpacity={0.85}>
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="options-outline" size={20} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  headerSpacer: { width: 40 },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  ageDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF0F5",
    borderRadius: 10,
    marginBottom: 16,
  },
  ageText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF3366",
  },
  ageHyphen: {
    fontSize: 20,
    color: "#D1D5DB",
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  slider: {
    height: 40,
    marginBottom: 20,
  },
  distanceBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF0F5",
    borderRadius: 10,
    marginBottom: 16,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF3366",
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  genderGrid: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  genderButtonActive: {
    borderColor: "#FF3366",
    backgroundColor: "#FFF0F5",
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  genderButtonTextActive: {
    color: "#FF3366",
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  applyButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
  },
});
