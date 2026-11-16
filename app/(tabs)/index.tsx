import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import { BANNERS } from "../../assets/assets";
import CategorySelector from "../../src/components/CategorySelector";
import ProductCard from "../../src/components/ProductCard";
import { useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";
import { Product } from "../../constants/types";

const categoryOf = (product: Product) => typeof product.category === "string" ? product.category : product.category.name;

export default function Home() {
    const router = useRouter();
    const { user, products, categories, favorites, toggleFavorite } = useAppStore();
    const { notify } = useFeedback();
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const visibleProducts = useMemo(() => products.filter((product) => {
        const matchesCategory = category === "All" || categoryOf(product) === category;
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || product.name.toLowerCase().includes(term) || categoryOf(product).toLowerCase().includes(term);
        const lower = minPrice === "" ? 0 : Number(minPrice);
        const upper = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);
        return product.isActive && matchesCategory && matchesSearch && product.price >= lower && product.price <= upper;
    }), [products, category, search, minPrice, maxPrice]);

    const onFavorite = async (id: string) => {
        if (!user) {
            router.push("/(tabs)/login");
            return;
        }
        try {
            await toggleFavorite(id);
        } catch (error) {
            notify("Unable to save favorite", error instanceof Error ? error.message : "Please try again.");
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header title="FOREVER" />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="px-4 pt-4">
                    <Text className="text-2xl font-bold text-primary">Find your style</Text>
                    <Text className="mt-1 text-sm text-gray-500">Fresh essentials for every day.</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {BANNERS.map((banner) => (
                        <TouchableOpacity key={banner.id} activeOpacity={0.9} onPress={() => setCategory("All")}>
                            <ImageBackground source={{ uri: banner.image }} imageStyle={{ borderRadius: 16 }} className="h-40 w-[320px] justify-end overflow-hidden bg-gray-300 p-5">
                                <View className="absolute inset-0 rounded-2xl bg-black/25" />
                                <Text className="text-2xl font-bold text-white">{banner.title}</Text>
                                <Text className="mt-1 text-sm text-white">{banner.subtitle}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View className="mt-6">
                    <Text className="mb-3 px-4 text-lg font-bold text-primary">Shop categories</Text>
                    <CategorySelector categories={categories} selected={category} onSelect={setCategory} />
                </View>

                <View className="mx-4 mt-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
                    <Ionicons name="search-outline" size={20} color="#777" />
                    <TextInput value={search} onChangeText={setSearch} placeholder="Search products or categories" className="flex-1 px-2 py-3 text-primary" returnKeyType="search" />
                    {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={19} color="#888" /></TouchableOpacity>}
                </View>
                <View className="mx-4 mt-3 flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-primary">Price ($)</Text>
                    <TextInput value={minPrice} onChangeText={setMinPrice} keyboardType="decimal-pad" placeholder="Min" className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    <Text className="text-gray-400">to</Text>
                    <TextInput value={maxPrice} onChangeText={setMaxPrice} keyboardType="decimal-pad" placeholder="Max" className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                    {(minPrice || maxPrice) && <TouchableOpacity onPress={() => { setMinPrice(""); setMaxPrice(""); }}><Text className="text-xs font-semibold text-gray-600">Reset</Text></TouchableOpacity>}
                </View>

                <View className="mt-7 flex-row items-center justify-between px-4">
                    <Text className="text-lg font-bold text-primary">{category === "All" ? "All products" : category}</Text>
                    <Text className="text-sm text-gray-500">{visibleProducts.length} items</Text>
                </View>
                {visibleProducts.length ? (
                    <View className="mt-4 flex-row flex-wrap justify-between px-4">
                        {visibleProducts.map((product) => (
                            <ProductCard key={product._id} product={product} favorite={favorites.includes(product._id)} onFavorite={() => void onFavorite(product._id)} />
                        ))}
                    </View>
                ) : (
                    <View className="items-center px-6 py-16">
                        <Ionicons name="search-outline" size={36} color="#aaa" />
                        <Text className="mt-3 font-semibold text-primary">No products match your filters</Text>
                        <TouchableOpacity onPress={() => { setCategory("All"); setSearch(""); setMinPrice(""); setMaxPrice(""); }} className="mt-4">
                            <Text className="font-semibold text-blue-700">Clear filters</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View className="mb-8 mt-2 flex-row justify-center gap-6">
                    <TouchableOpacity onPress={() => router.push("/profile")} className="flex-row items-center"><Ionicons name="person-outline" size={16} color="#444" /><Text className="ml-1 text-sm text-gray-600">My profile</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/favorites")} className="flex-row items-center"><Ionicons name="heart-outline" size={16} color="#444" /><Text className="ml-1 text-sm text-gray-600">Favorites</Text></TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
