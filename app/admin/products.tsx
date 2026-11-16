import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";
import { Product } from "../../constants/types";
import { useFeedback } from "../../src/components/Feedback";

type FormProps = {
    visible: boolean;
    product?: Product;
    categories: string[];
    initialCategory?: string;
    onClose: () => void;
    onSave: (values: Partial<Product> & Pick<Product, "name" | "price" | "category">, id?: string) => Promise<void>;
};

function ProductForm({ visible, product, categories, initialCategory, onClose, onSave }: FormProps) {
    const productCategory = product ? (typeof product.category === "string" ? product.category : product.category.name) : initialCategory ?? categories[0] ?? "";
    const [name, setName] = useState(product?.name ?? "");
    const [description, setDescription] = useState(product?.description ?? "");
    const [price, setPrice] = useState(product ? String(product.price) : "");
    const [stock, setStock] = useState(product ? String(product.stock) : "0");
    const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
    const [category, setCategory] = useState(productCategory);
    const [image, setImage] = useState(product?.images[0] ?? "");
    const [featured, setFeatured] = useState(product?.isFeatured ?? false);
    const [saving, setSaving] = useState(false);
    const { notify } = useFeedback();

    const submit = async () => {
        const numericPrice = Number(price);
        const numericStock = Number(stock);
        if (!name.trim() || !category || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) {
            notify("Check product details", "Enter a product name, category, valid price, and whole-number stock quantity.");
            return;
        }
        try {
            setSaving(true);
            await onSave({
                name,
                description,
                price: numericPrice,
                stock: numericStock,
                category,
                sizes: sizes.split(",").map((size) => size.trim()).filter(Boolean),
                images: image.trim() ? [image.trim()] : product?.images,
                isFeatured: featured,
                isActive: product?.isActive ?? true,
            }, product?._id);
            onClose();
        } catch (error) {
            notify("Could not save product", error instanceof Error ? error.message : "Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-gray-50">
                <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
                    <Text className="text-xl font-bold text-primary">{product ? "Edit product" : "Add product"}</Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={25} color="#111" /></TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
                    <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Product name</Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Product name" className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-3" />
                    <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Description</Text>
                    <TextInput value={description} onChangeText={setDescription} placeholder="Product description" multiline className="mb-4 min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-3" />
                    <View className="flex-row gap-3">
                        <View className="flex-1"><Text className="mb-1 text-xs font-bold uppercase text-gray-500">Price ($)</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-3" /></View>
                        <View className="flex-1"><Text className="mb-1 text-xs font-bold uppercase text-gray-500">Stock</Text><TextInput value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="0" className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-3" /></View>
                    </View>
                    <Text className="mb-2 text-xs font-bold uppercase text-gray-500">Category</Text>
                    <View className="mb-4 flex-row flex-wrap gap-2">
                        {categories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} className={`rounded-full px-3 py-2 ${category === item ? "bg-primary" : "bg-white"}`}><Text className={`text-sm ${category === item ? "font-semibold text-white" : "text-primary"}`}>{item}</Text></TouchableOpacity>)}
                    </View>
                    <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Sizes (comma separated)</Text>
                    <TextInput value={sizes} onChangeText={setSizes} placeholder="XS, S, M, L" className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-3" />
                    <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Image URL</Text>
                    <TextInput value={image} onChangeText={setImage} autoCapitalize="none" placeholder="https://..." className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-3" />
                    <View className="mb-5 flex-row items-center justify-between rounded-lg bg-white p-3"><Text className="font-semibold text-primary">Featured product</Text><Switch value={featured} onValueChange={setFeatured} /></View>
                    <TouchableOpacity disabled={saving} onPress={() => void submit()} className={`rounded-xl bg-primary p-4 ${saving ? "opacity-60" : ""}`}><Text className="text-center font-bold text-white">{saving ? "Saving..." : product ? "Save changes" : "Create product"}</Text></TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}

export default function ProductManagement() {
    const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
    const { products, categories, saveProduct, deleteProduct } = useAppStore();
    const { notify, confirm } = useFeedback();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Product | undefined>();
    const initialCategory = typeof categoryParam === "string" ? categoryParam : undefined;

    const confirmDelete = (product: Product) => confirm("Delete product", `Delete “${product.name}”?`, () => {
        void deleteProduct(product._id).catch((error: unknown) => notify("Could not delete product", error instanceof Error ? error.message : "Please try again."));
    });

    const openForm = (product?: Product) => {
        setEditing(product);
        setFormOpen(true);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="PRODUCTS" showBack showCart={false} />
            <View className="flex-row items-center justify-between bg-white px-4 py-3">
                <Text className="font-semibold text-primary">{products.length} products</Text>
                <TouchableOpacity onPress={() => openForm()} className="flex-row items-center rounded-full bg-primary px-4 py-2"><Ionicons name="add" size={18} color="white" /><Text className="ml-1 font-semibold text-white">Add product</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 12 }}>
                {products.map((product) => (
                    <View key={product._id} className="mb-3 flex-row items-center rounded-xl bg-white p-3">
                        <Image source={{ uri: product.images[0] }} className="h-16 w-16 rounded-lg bg-gray-100" resizeMode="cover" />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-primary" numberOfLines={1}>{product.name}</Text>
                            <Text className="mt-1 text-xs text-gray-500">{typeof product.category === "string" ? product.category : product.category.name} · Stock: {product.stock}</Text>
                            <Text className="mt-1 font-semibold text-primary">${product.price.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => openForm(product)} className="p-2"><Ionicons name="create-outline" size={19} color="#333" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(product)} className="p-2"><Ionicons name="trash-outline" size={19} color="#b42318" /></TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <ProductForm
                key={`${formOpen}-${editing?._id ?? "new"}-${initialCategory ?? ""}`}
                visible={formOpen}
                product={editing}
                categories={categories}
                initialCategory={initialCategory}
                onClose={() => { setFormOpen(false); setEditing(undefined); }}
                onSave={saveProduct}
            />
        </View>
    );
}
