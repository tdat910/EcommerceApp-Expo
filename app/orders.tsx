import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { useAppStore } from "../src/store/AppStore";

export default function Orders() {
    const router = useRouter();
    const { user, orders } = useAppStore();
    const mine = orders.filter((order) => order.user === user?._id);
    return (
        <View className="flex-1 bg-gray-50">
            <Header title="PURCHASE HISTORY" showBack />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {!user ? (
                    <View className="items-center py-16"><Text className="text-gray-600">Sign in to view your orders.</Text><TouchableOpacity onPress={() => router.push("/(tabs)/login")} className="mt-4 rounded-lg bg-primary px-6 py-3"><Text className="font-semibold text-white">Login</Text></TouchableOpacity></View>
                ) : mine.length === 0 ? (
                    <View className="items-center rounded-xl bg-white px-6 py-14"><Ionicons name="receipt-outline" size={40} color="#999" /><Text className="mt-4 text-center text-gray-500">You haven&apos;t placed any orders yet.</Text></View>
                ) : mine.map((order) => (
                    <TouchableOpacity key={order._id} onPress={() => router.push(`/order-details/${order._id}`)} className="mb-3 rounded-xl bg-white p-4" accessibilityRole="button" accessibilityLabel={`View order ${order.orderNumber}`}>
                        <View className="flex-row justify-between"><Text className="font-bold text-primary">{order.orderNumber}</Text><Text className="text-xs capitalize text-gray-600">{order.orderStatus}</Text></View>
                        <Text className="mt-1 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</Text>
                        <View className="mt-3 flex-row items-center justify-between"><Text className="text-gray-600">{order.items.length} item(s)</Text><View className="flex-row items-center"><Text className="mr-3 font-bold text-primary">${order.totalAmount.toFixed(2)}</Text><Ionicons name="chevron-forward" size={18} color="#777" /></View></View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
