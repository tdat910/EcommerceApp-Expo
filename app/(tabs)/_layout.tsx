import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useAppStore } from "../../src/store/AppStore";

export default function TabLayout() {
    const { user } = useAppStore();
    const isCustomer = user?.role === "user";

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#111",
            tabBarInactiveTintColor: "#888",
            tabBarStyle: { height: 62, paddingTop: 6, paddingBottom: 5 },
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}>
            <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={String(color ?? "#111")} /> }} />
            <Tabs.Screen name="signup" options={{ ...(isCustomer ? { href: null } : {}), title: "Sign Up", tabBarIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={String(color ?? "#111")} /> }} />
            <Tabs.Screen name="login" options={{ ...(isCustomer ? { href: null } : {}), title: "Login", tabBarIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={size} color={String(color ?? "#111")} /> }} />
            <Tabs.Screen name="wishlist" options={{ ...(!isCustomer ? { href: null } : {}), title: "Wishlist", tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={String(color ?? "#111")} /> }} />
            <Tabs.Screen name="account" options={{ ...(!isCustomer ? { href: null } : {}), title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={String(color ?? "#111")} /> }} />
        </Tabs>
    );
}
