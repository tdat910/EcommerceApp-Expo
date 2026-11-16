import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { StoreOrder, useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";

const statuses: StoreOrder["orderStatus"][] = ["placed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderManagement() {
    const { orders, users, updateOrderStatus } = useAppStore();
    const { notify } = useFeedback();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = orders.find((order) => order._id === selectedId);

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="ORDERS" showBack showCart={false} />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {!orders.length ? <View className="items-center rounded-xl bg-white py-16"><Ionicons name="receipt-outline" size={40} color="#999" /><Text className="mt-4 font-semibold text-primary">No orders yet</Text></View> : orders.map((order) => {
                    const customer = users.find((entry) => entry._id === order.user);
                    return (
                        <View key={order._id} className="mb-3 rounded-xl bg-white p-4">
                            <View className="flex-row justify-between"><Text className="font-bold text-primary">{order.orderNumber}</Text><Text className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</Text></View>
                            <Text className="mt-2 font-semibold text-primary">{customer?.name ?? "Deleted customer"}</Text>
                            {customer?.email && <Text className="text-xs text-gray-500">{customer.email}</Text>}
                            <Text className="mt-3 text-xs font-bold uppercase text-gray-500">Items</Text>
                            {order.items.map((item, index) => <Text key={`${item.name}-${index}`} className="mt-1 text-sm text-gray-600">{item.quantity} × {item.name} {item.size ? `(${item.size})` : ""} · ${item.price.toFixed(2)}</Text>)}
                            <Text className="mt-3 text-xs text-gray-500">Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</Text>
                            <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
                                <Text className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</Text>
                                <TouchableOpacity onPress={() => setSelectedId(order._id)} className="flex-row items-center rounded-full bg-gray-100 px-3 py-2"><Text className="mr-2 text-xs font-bold uppercase text-primary">{order.orderStatus}</Text><Ionicons name="pencil-outline" size={14} color="#333" /></TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
            <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelectedId(null)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="rounded-t-2xl bg-white p-5">
                        <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-bold text-primary">Update order status</Text><TouchableOpacity onPress={() => setSelectedId(null)}><Ionicons name="close" size={23} color="#555" /></TouchableOpacity></View>
                        {statuses.map((status) => (
                            <TouchableOpacity key={status} onPress={() => {
                                if (selected) void updateOrderStatus(selected._id, status).catch((error: unknown) => notify("Could not update order", error instanceof Error ? error.message : "Please try again."));
                                setSelectedId(null);
                            }} className={`mb-2 flex-row items-center justify-between rounded-lg p-4 ${selected?.orderStatus === status ? "bg-gray-100" : "bg-white"}`}>
                                <Text className="font-semibold capitalize text-primary">{status}</Text>
                                {selected?.orderStatus === status && <Ionicons name="checkmark-circle" size={20} color="#111" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
