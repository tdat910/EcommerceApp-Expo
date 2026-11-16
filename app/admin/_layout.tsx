import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/store/AppStore";

const links = [
    { label: "User Home", icon: "home-outline" as const, href: "/(tabs)" as const },
    { label: "Admin Home", icon: "grid-outline" as const, href: "/admin" as const },
    { label: "Sign Up", icon: "person-add-outline" as const, href: "/(tabs)/signup" as const },
    { label: "Login", icon: "log-in-outline" as const, href: "/(tabs)/login" as const },
];

export default function AdminLayout() {
    const router = useRouter();
    const { user } = useAppStore();
    if (user?.role !== "admin") return <Redirect href="/(tabs)/login" />;
    return (
        <View className="flex-1 bg-gray-50">
            <Stack screenOptions={{ headerShown: false }} />
            <View className="flex-row border-t border-gray-200 bg-white px-1 pb-2 pt-2">
                {links.map((link) => (
                    <TouchableOpacity key={link.label} onPress={() => router.replace(link.href)} className="flex-1 items-center py-1">
                        <Ionicons name={link.icon} size={20} color="#222" />
                        <Text className="mt-1 text-[10px] font-medium text-gray-700">{link.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
