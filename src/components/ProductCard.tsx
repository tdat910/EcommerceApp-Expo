import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../../constants/types";

export default function ProductCard({ product, onFavorite, favorite = false }: {
    product: Product;
    onFavorite?: () => void;
    favorite?: boolean;
}) {
    const router = useRouter();
    return (
        <View className="mb-4 w-[48%] overflow-hidden rounded-xl border border-gray-100 bg-white">
            <TouchableOpacity onPress={() => router.push(`/product/${product._id}`)} activeOpacity={0.85}>
                <Image source={{ uri: product.images[0] }} className="h-52 w-full bg-gray-100" resizeMode="cover" />
                <View className="p-3">
                    <Text className="mb-1 text-xs uppercase tracking-wide text-gray-500">{typeof product.category === "string" ? product.category : product.category.name}</Text>
                    <Text className="font-semibold text-primary" numberOfLines={2}>{product.name}</Text>
                    <Text className="mt-2 font-bold text-primary">${product.price.toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
            {onFavorite && (
                <TouchableOpacity onPress={onFavorite} className="absolute right-2 top-2 rounded-full bg-white p-2" accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}>
                    <Ionicons name={favorite ? "heart" : "heart-outline"} size={19} color={favorite ? "#e83b54" : "#222"} />
                </TouchableOpacity>
            )}
        </View>
    );
}
