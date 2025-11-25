import React, { useState } from "react";
import { View, Text, TouchableOpacity, Slider } from "react-native";

export default function FiltersDrawer({ onApply }: { onApply: (filters:any) => void }) {
  const [distance, setDistance] = useState(50);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);
  const [gender, setGender] = useState<string | null>(null);

  return (
    <View style={{ padding: 12 }}>
      <Text style={{ fontWeight: "700" }}>Distance: {distance} km</Text>
      {/* Use any slider library or simple buttons */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity onPress={() => setDistance(Math.max(5, distance - 5))}><Text>-</Text></TouchableOpacity>
        <Text style={{ marginHorizontal: 12 }}>{distance}</Text>
        <TouchableOpacity onPress={() => setDistance(distance + 5)}><Text>+</Text></TouchableOpacity>
      </View>

      <Text style={{ marginTop: 12 }}>Age: {minAge} - {maxAge}</Text>
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity onPress={() => setMinAge(Math.max(18, minAge - 1))}><Text>-</Text></TouchableOpacity>
        <Text style={{ marginHorizontal: 12 }}>{minAge}</Text>
        <TouchableOpacity onPress={() => setMinAge(minAge + 1)}><Text>+</Text></TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => onApply({ distance, minAge, maxAge, gender })} style={{ marginTop: 12, backgroundColor: "#ec4899", padding: 12, borderRadius: 8 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}