// app/(main)/profile/Favorites.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Favorites() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const { data } = await supabase.from('favorites').select('favorite:profiles(id, first_name, avatar)').eq('user_id', (await supabase.auth.getUser()).data?.user?.id);
    setList(data || []);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList data={list} keyExtractor={(i) => i.favorite.id} renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center" }}>
          {item.favorite.avatar ? <Image source={{ uri: item.favorite.avatar }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }} /> : null}
          <Text style={{ fontWeight: "700" }}>{item.favorite.first_name}</Text>
        </View>
      )} ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 24, color: "#64748b" }}>No saved profiles</Text>} />
    </View>
  );
}
