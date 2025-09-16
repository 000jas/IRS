import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
export default function TabLayout() {
  return (
    <Tabs
    initialRouteName="home"
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffffff" },
        headerTintColor: "#2e7d32",
        tabBarActiveTintColor: "#2e7d32",
        headerRight:()=>(
          <Pressable onPress={()=> alert("Profile icon pressed!")}>
            <Ionicons name="person-circle-outline" size={28} color="#2e7d32" style={{marginRight:15}}/>
          </Pressable>
        )
      }}
    >
      <Tabs.Screen
        name="controls"
        options={{
          title: "Controls",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crops"
        options={{
          title: "Crops",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
        <Tabs.Screen
            name="home"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
      <Tabs.Screen
        name="weather"
        options={{
          title: "Weather",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
<Tabs.Screen
  name="history"
  options={{
    title: "History",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="compass" size={size} color={color} />
    ),
  }}
/>
      
    </Tabs>
  );
}
