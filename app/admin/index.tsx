import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";

const actions = [
    { title: "User Management", description: "Manage accounts and permissions", icon: "people-outline" as const, route: "/admin/users" as const },
    { title: "Product Category Management", description: "Organize and assign products", icon: "list-outline" as const, route: "/admin/categories" as const },
    { title: "Product Management", description: "Add, edit and remove products", icon: "shirt-outline" as const, route: "/admin/products" as const },
    { title: "Order Management", description: "Review orders and update status", icon: "receipt-outline" as const, route: "/admin/orders" as const },
];

export default function AdminDashboard() {
    const router = useRouter();
    const { users, products, orders } = useAppStore();
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    return (
        <View className="flex-1 bg-gray-50">
            <Header title="ADMIN HOME" showCart={false} />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
                <Text className="text-2xl font-bold text-primary">Store overview</Text>
                <Text className="mb-5 mt-1 text-gray-500">Manage your store from one place.</Text>
                <View className="mb-6 flex-row flex-wrap justify-between">
                    {[
                        ["Products", products.length.toString()],
                        ["Users", users.length.toString()],
                        ["Orders", orders.length.toString()],
                        ["Revenue", `$${revenue.toFixed(2)}`],
                    ].map(([label, value]) => (
                        <View key={label} className="mb-3 w-[48%] rounded-xl bg-white p-4">
                            <Text className="text-2xl font-bold text-primary">{value}</Text>
                            <Text className="mt-1 text-xs uppercase tracking-wide text-gray-500">{label}</Text>
                        </View>
                    ))}
                </View>
                <Text className="mb-3 text-lg font-bold text-primary">Store management</Text>
                {actions.map((action) => (
                    <TouchableOpacity key={action.route} onPress={() => router.push(action.route)} className="mb-3 flex-row items-center rounded-xl bg-white p-4">
                        <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100"><Ionicons name={action.icon} size={22} color="#111" /></View>
                        <View className="ml-3 flex-1"><Text className="font-bold text-primary">{action.title}</Text><Text className="mt-1 text-xs text-gray-500">{action.description}</Text></View>
                        <Ionicons name="chevron-forward" size={19} color="#888" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
