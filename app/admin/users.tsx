import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";

export default function UserManagement() {
    const { user, users, changeUserRole, deleteUser } = useAppStore();
    const { notify, confirm } = useFeedback();
    const [search, setSearch] = useState("");
    const visibleUsers = users.filter((entry) => `${entry.name} ${entry.email}`.toLowerCase().includes(search.trim().toLowerCase()));

    const remove = (id: string, name: string) => confirm("Delete user", `Permanently delete ${name}?`, () => {
        void deleteUser(id).catch((error: unknown) => notify("Could not delete user", error instanceof Error ? error.message : "Please try again."));
    });

    const switchRole = (id: string, role: "user" | "admin") => {
        void changeUserRole(id, role).catch((error: unknown) => notify("Could not update role", error instanceof Error ? error.message : "Please try again."));
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="USERS" showBack showCart={false} />
            <View className="px-4 pb-2 pt-4"><Text className="mb-3 text-lg font-bold text-primary">{users.length} accounts</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search name or email" className="rounded-xl border border-gray-200 bg-white px-4 py-3" /></View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
                {visibleUsers.map((entry) => (
                    <View key={entry._id} className="mb-3 rounded-xl bg-white p-4">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1"><Text className="font-bold text-primary">{entry.name}{entry._id === user?._id ? " (you)" : ""}</Text><Text className="mt-1 text-sm text-gray-500">{entry.email}</Text><Text className="mt-1 text-xs text-gray-400">Joined {new Date(entry.createdAt).toLocaleDateString()}</Text></View>
                            <TouchableOpacity onPress={() => remove(entry._id, entry.name)} disabled={entry._id === user?._id} className="p-2"><Ionicons name="trash-outline" size={19} color={entry._id === user?._id ? "#ccc" : "#b42318"} /></TouchableOpacity>
                        </View>
                        <View className="mt-4 flex-row items-center">
                            <Text className="mr-3 text-xs font-semibold uppercase text-gray-500">Role</Text>
                            {(["user", "admin"] as const).map((role) => (
                                <TouchableOpacity key={role} onPress={() => switchRole(entry._id, role)} className={`mr-2 rounded-full px-3 py-1.5 ${entry.role === role ? "bg-primary" : "bg-gray-100"}`}>
                                    <Text className={`text-xs font-semibold capitalize ${entry.role === role ? "text-white" : "text-gray-600"}`}>{role}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
                {!visibleUsers.length && <Text className="py-12 text-center text-gray-500">No users match your search.</Text>}
            </ScrollView>
        </View>
    );
}
