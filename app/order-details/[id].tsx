import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";

export default function OrderDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, orders } = useAppStore();
    const order = orders.find((entry) => entry._id === id && entry.user === user?._id);

    if (!order) {
        return <View className="flex-1 bg-gray-50"><Header title="ORDER DETAILS" showBack /><View className="flex-1 items-center justify-center p-8"><Ionicons name="receipt-outline" size={40} color="#999" /><Text className="mt-4 text-center text-gray-600">This order could not be found.</Text></View></View>;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="ORDER DETAILS" showBack />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <View className="rounded-xl bg-white p-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-primary">{order.orderNumber}</Text>
                        <Text className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-primary">{order.orderStatus}</Text>
                    </View>
                    <Text className="mt-2 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</Text>
                </View>
                <View className="mt-3 rounded-xl bg-white p-4">
                    <Text className="mb-3 text-lg font-bold text-primary">Items</Text>
                    {order.items.map((item, index) => (
                        <View key={`${item.product}-${index}`} className="mb-3 flex-row items-center">
                            {item.image ? <Image source={{ uri: item.image }} className="h-16 w-14 rounded-lg bg-gray-100" resizeMode="cover" /> : <View className="h-16 w-14 items-center justify-center rounded-lg bg-gray-100"><Ionicons name="shirt-outline" size={22} color="#999" /></View>}
                            <View className="ml-3 flex-1">
                                <Text className="font-semibold text-primary">{item.name}</Text>
                                <Text className="mt-1 text-sm text-gray-500">Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ""}</Text>
                            </View>
                            <Text className="font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View className="mt-1 border-t border-gray-100 pt-3">
                        <View className="mb-2 flex-row justify-between"><Text className="text-gray-600">Subtotal</Text><Text className="text-primary">${order.subtotal.toFixed(2)}</Text></View>
                        <View className="mb-2 flex-row justify-between"><Text className="text-gray-600">Shipping</Text><Text className="text-primary">${order.shippingCost.toFixed(2)}</Text></View>
                        <View className="flex-row justify-between"><Text className="font-bold text-primary">Total</Text><Text className="font-bold text-primary">${order.totalAmount.toFixed(2)}</Text></View>
                    </View>
                </View>
                <View className="mt-3 rounded-xl bg-white p-4">
                    <Text className="text-lg font-bold text-primary">Delivery</Text>
                    <Text className="mt-2 text-gray-600">{[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode, order.shippingAddress.country].filter(Boolean).join(", ")}</Text>
                    <Text className="mt-2 text-sm capitalize text-gray-500">Payment: {order.paymentMethod}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
