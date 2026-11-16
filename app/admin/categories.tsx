import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";
import { Product } from "../../constants/types";
import { useFeedback } from "../../src/components/Feedback";

const categoryOf = (product: Product) => typeof product.category === "string" ? product.category : product.category.name;

export default function CategoryManagement() {
    const router = useRouter();
    const { categories, products, saveCategory, deleteCategory } = useAppStore();
    const { notify, confirm } = useFeedback();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<string | undefined>();
    const [name, setName] = useState("");

    const open = (category?: string) => {
        setEditing(category);
        setName(category ?? "");
        setModalOpen(true);
    };
    const save = async () => {
        try {
            await saveCategory(name, editing);
            setModalOpen(false);
        } catch (error) {
            notify("Could not save category", error instanceof Error ? error.message : "Please try again.");
        }
    };
    const remove = (category: string) => confirm("Delete category", `Delete “${category}”?`, () => {
        void deleteCategory(category).catch((error: unknown) => notify("Could not delete category", error instanceof Error ? error.message : "Please try again."));
    });

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="CATEGORIES" showBack showCart={false} />
            <View className="flex-row items-center justify-between bg-white px-4 py-3">
                <Text className="font-semibold text-primary">{categories.length} categories</Text>
                <TouchableOpacity onPress={() => open()} className="flex-row items-center rounded-full bg-primary px-4 py-2"><Ionicons name="add" size={18} color="white" /><Text className="ml-1 font-semibold text-white">Add</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {categories.map((category) => {
                    const categoryProducts = products.filter((product) => categoryOf(product) === category);
                    return (
                        <View key={category} className="mb-3 rounded-xl bg-white p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1"><Text className="text-lg font-bold text-primary">{category}</Text><Text className="mt-1 text-sm text-gray-500">{categoryProducts.length} product(s)</Text></View>
                                <TouchableOpacity onPress={() => open(category)} className="p-2"><Ionicons name="create-outline" size={20} color="#333" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => remove(category)} className="p-2"><Ionicons name="trash-outline" size={20} color="#b42318" /></TouchableOpacity>
                            </View>
                            {categoryProducts.slice(0, 3).map((product) => <Text key={product._id} className="mt-2 text-sm text-gray-600" numberOfLines={1}>· {product.name}</Text>)}
                            <TouchableOpacity onPress={() => router.push({ pathname: "/admin/products", params: { category } })} className="mt-4 flex-row items-center self-start rounded-lg bg-gray-100 px-3 py-2">
                                <Ionicons name="add-circle-outline" size={17} color="#111" /><Text className="ml-2 text-xs font-semibold text-primary">Add product to {category}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
            <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
                <View className="flex-1 justify-center bg-black/40 px-6">
                    <View className="rounded-2xl bg-white p-5">
                        <Text className="mb-4 text-xl font-bold text-primary">{editing ? "Edit category" : "New category"}</Text>
                        <TextInput autoFocus value={name} onChangeText={setName} placeholder="Category name" className="rounded-lg border border-gray-200 px-4 py-3" />
                        <View className="mt-4 flex-row justify-end gap-3">
                            <TouchableOpacity onPress={() => setModalOpen(false)} className="rounded-lg bg-gray-100 px-4 py-3"><Text className="font-semibold text-gray-700">Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => void save()} className="rounded-lg bg-primary px-4 py-3"><Text className="font-semibold text-white">Save</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
