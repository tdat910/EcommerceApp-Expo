import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";

export default function ProductDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { products, user, addToCart, favorites, toggleFavorite } = useAppStore();
    const { notify } = useFeedback();
    const product = products.find((item) => item._id === id);
    const [size, setSize] = useState(product?.sizes?.[0] ?? "");
    const [busy, setBusy] = useState(false);

    if (!product) {
        return <View className="flex-1 bg-white"><Header showBack /><View className="flex-1 items-center justify-center"><Text className="text-gray-500">This product is no longer available.</Text></View></View>;
    }

    const handleAdd = async () => {
        if (!user) {
            router.push("/(tabs)/login");
            return;
        }
        try {
            setBusy(true);
            await addToCart(product._id, size);
            notify("Added to bag", `${product.name} (${size}) was added to your cart.`);
        } catch (error) {
            notify("Could not add item", error instanceof Error ? error.message : "Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            router.push("/(tabs)/login");
            return;
        }
        try {
            await toggleFavorite(product._id);
        } catch (error) {
            notify("Could not update favorites", error instanceof Error ? error.message : "Please try again.");
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header showBack />
            <ScrollView>
                <Image source={{ uri: product.images[0] }} className="h-[460px] w-full bg-gray-100" resizeMode="cover" />
                <View className="p-5">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500">{typeof product.category === "string" ? product.category : product.category.name}</Text>
                            <Text className="mt-2 text-2xl font-bold text-primary">{product.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => void handleFavorite()} className="rounded-full border border-gray-200 p-3">
                            <Ionicons name={favorites.includes(product._id) ? "heart" : "heart-outline"} size={21} color={favorites.includes(product._id) ? "#e83b54" : "#111"} />
                        </TouchableOpacity>
                    </View>
                    <Text className="mt-3 text-2xl font-bold text-primary">${product.price.toFixed(2)}</Text>
                    <Text className="mt-4 leading-6 text-gray-600">{product.description || "A versatile addition to your everyday wardrobe."}</Text>
                    <Text className="mb-2 mt-6 font-semibold text-primary">Choose size</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {(product.sizes?.length ? product.sizes : ["One size"]).map((item) => (
                            <TouchableOpacity key={item} onPress={() => setSize(item)} className={`min-w-12 rounded-lg border px-4 py-3 ${size === item ? "border-primary bg-primary" : "border-gray-200"}`}>
                                <Text className={`text-center font-semibold ${size === item ? "text-white" : "text-primary"}`}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text className={`mt-4 text-sm ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </Text>
                    <TouchableOpacity disabled={busy || product.stock < 1} onPress={() => void handleAdd()} className={`mt-5 rounded-xl bg-primary p-4 ${product.stock < 1 || busy ? "opacity-50" : ""}`}>
                        <Text className="text-center font-bold text-white">{busy ? "Adding..." : "Add to bag"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
