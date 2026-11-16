import React from "react";
import { ScrollView, Text, View } from "react-native";
import Header from "../components/Header";
import ProductCard from "../src/components/ProductCard";
import { useAppStore } from "../src/store/AppStore";
import { useFeedback } from "../src/components/Feedback";

export default function Favorites() {
    const { favorites, products, toggleFavorite } = useAppStore();
    const { notify } = useFeedback();
    const saved = products.filter((product) => favorites.includes(product._id));
    return (
        <View className="flex-1 bg-white">
            <Header title="WISHLIST" showBack />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {saved.length ? <View className="flex-row flex-wrap justify-between">{saved.map((product) => <ProductCard key={product._id} product={product} favorite onFavorite={() => void toggleFavorite(product._id).catch((error: unknown) => notify("Unable to update favorites", error instanceof Error ? error.message : "Please try again."))} />)}</View> : <Text className="py-16 text-center text-gray-500">Your wishlist is empty</Text>}
            </ScrollView>
        </View>
    );
}
