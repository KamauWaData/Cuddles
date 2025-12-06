import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "react-native";

export default function TabsLayout() {
    console.log('[TabsLayout] Mounted');
  try {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF3366",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "Discover",
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconContainer : undefined}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  color={color}
                  size={24}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="ScheduledDates"
          options={{
            title: "Dates",
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconContainer : undefined}>
                <Ionicons
                  name={focused ? "calendar" : "calendar-outline"}
                  color={color}
                  size={24}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconContainer : undefined}>
                <Ionicons
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  color={color}
                  size={24}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: "Matches",
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconContainer : undefined}>
                <Ionicons
                  name={focused ? "people" : "people-outline"}
                  color={color}
                  size={24}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    );
  } catch (err) {
    console.log('[TabsLayout] Error:', err);
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}>
        <Ionicons name="alert" size={48} color="#FF3366" />
        <View style={{height:16}} />
        <Text style={{color:'red',fontSize:18}}>TabsLayout error: {String(err)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: 12,
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 0 : 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  activeIconContainer: {
    backgroundColor: "#FFF0F5",
    padding: 8,
    borderRadius: 12,
    marginBottom: -4,
  },
});
