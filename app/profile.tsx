import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { useAppStore } from "../src/store/AppStore";
import { useFeedback } from "../src/components/Feedback";

export default function Profile() {
    const router = useRouter();
    const { user, logout } = useAppStore();
    const { notify } = useFeedback();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/(tabs)");
        } catch (error) {
            notify("Unable to log out", error instanceof Error ? error.message : "Please try again.");
        }
    };

    if (!user) {
        return <View className="flex-1 bg-gray-50"><Header title="MY PROFILE" showBack /><View className="flex-1 items-center justify-center p-8"><Text className="text-center text-gray-600">Sign in to manage your profile and orders.</Text><TouchableOpacity onPress={() => router.push("/(tabs)/login")} className="mt-4 rounded-lg bg-primary px-6 py-3"><Text className="font-semibold text-white">Login</Text></TouchableOpacity></View></View>;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="MY PROFILE" />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
                <View className="mb-4 items-center rounded-xl bg-white p-6">
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <Ionicons name="person" size={42} color="#777" />
                    </View>
                    <Text className="mt-3 text-xl font-bold text-primary">{user.name}</Text>
                    <Text className="mt-1 text-gray-500">{user.email}</Text>
                </View>
                <View className="overflow-hidden rounded-xl bg-white">
                    <TouchableOpacity onPress={() => router.push("/edit-profile")} className="flex-row items-center border-b border-gray-100 px-4 py-4">
                        <Ionicons name="create-outline" size={21} color="#333" />
                        <Text className="ml-3 flex-1 font-semibold text-primary">Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={18} color="#777" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/orders")} className="flex-row items-center border-b border-gray-100 px-4 py-4">
                        <Ionicons name="receipt-outline" size={21} color="#333" />
                        <Text className="ml-3 flex-1 font-semibold text-primary">My Orders</Text>
                        <Ionicons name="chevron-forward" size={18} color="#777" />
                    </TouchableOpacity>
                    {user.role === "admin" && (
                        <TouchableOpacity onPress={() => router.push("/admin")} className="flex-row items-center border-b border-gray-100 px-4 py-4">
                            <Ionicons name="grid-outline" size={21} color="#333" />
                            <Text className="ml-3 flex-1 font-semibold text-primary">Admin dashboard</Text>
                            <Ionicons name="chevron-forward" size={18} color="#777" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => void handleLogout()} className="flex-row items-center px-4 py-4">
                        <Ionicons name="log-out-outline" size={21} color="#d33" />
                        <Text className="ml-3 flex-1 font-semibold text-red-600">Logout</Text>
                        <Ionicons name="chevron-forward" size={18} color="#777" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
