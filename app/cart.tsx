import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { useAppStore } from "../src/store/AppStore";
import { useFeedback } from "../src/components/Feedback";

const emptyAddress = { street: "", city: "", state: "", zipCode: "", country: "" };

export default function Cart() {
    const router = useRouter();
    const { user, cart, products, setCartQuantity, removeFromCart, placeOrder } = useAppStore();
    const { notify } = useFeedback();
    const [address, setAddress] = useState(user?.address ?? emptyAddress);
    const [placing, setPlacing] = useState(false);
    const lines = useMemo(() => cart.map((entry) => ({
        ...entry,
        product: products.find((item) => item._id === entry.productId),
    })).filter((line) => line.product), [cart, products]);
    const subtotal = lines.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 5;

    const checkout = async () => {
        if (!user) {
            router.push("/(tabs)/login");
            return;
        }
        if (Object.values(address).some((value) => !value.trim())) {
            notify("Shipping details required", "Fill in every address field before placing your order.");
            return;
        }
        try {
            setPlacing(true);
            await placeOrder(address);
            notify("Order placed", "Your order is now in your purchase history.");
            router.push("/orders");
        } catch (error) {
            notify("Checkout failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    const changeQuantity = async (productId: string, size: string, quantity: number) => {
        try {
            await setCartQuantity(productId, size, quantity);
        } catch (error) {
            notify("Could not update quantity", error instanceof Error ? error.message : "Please try again.");
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="YOUR BAG" showBack />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
                {lines.length === 0 ? (
                    <View className="items-center rounded-2xl bg-white px-6 py-16">
                        <Ionicons name="bag-outline" size={42} color="#999" />
                        <Text className="mt-4 text-lg font-bold text-primary">Your bag is empty</Text>
                        <Text className="mt-1 text-center text-gray-500">Find something you love and it will show up here.</Text>
                        <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="mt-5 rounded-xl bg-primary px-6 py-3"><Text className="font-semibold text-white">Continue shopping</Text></TouchableOpacity>
                    </View>
                ) : lines.map(({ product, quantity, size, productId }) => product && (
                    <View key={`${productId}-${size}`} className="mb-3 flex-row rounded-xl bg-white p-3">
                        <Image source={{ uri: product.images[0] }} className="h-28 w-24 rounded-lg bg-gray-100" resizeMode="cover" />
                        <View className="ml-3 flex-1 justify-between">
                            <View className="flex-row justify-between">
                                <View className="flex-1 pr-2">
                                    <Text className="font-semibold text-primary" numberOfLines={2}>{product.name}</Text>
                                    <Text className="mt-1 text-sm text-gray-500">Size: {size}</Text>
                                    <Text className="mt-1 font-bold text-primary">${product.price.toFixed(2)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => void removeFromCart(productId, size)} accessibilityLabel="Remove item"><Ionicons name="trash-outline" size={19} color="#777" /></TouchableOpacity>
                            </View>
                            <View className="flex-row items-center self-start rounded-lg border border-gray-200">
                                <TouchableOpacity onPress={() => void changeQuantity(productId, size, quantity - 1)} className="px-3 py-1"><Text className="text-lg text-primary">−</Text></TouchableOpacity>
                                <Text className="min-w-8 text-center font-semibold text-primary">{quantity}</Text>
                                <TouchableOpacity onPress={() => void changeQuantity(productId, size, quantity + 1)} className="px-3 py-1"><Text className="text-lg text-primary">+</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {lines.length > 0 && (
                    <>
                        <View className="mt-3 rounded-xl bg-white p-4">
                            <Text className="mb-3 text-lg font-bold text-primary">Shipping address</Text>
                            {([
                                ["street", "Street address"],
                                ["city", "City"],
                                ["state", "State / Province"],
                                ["zipCode", "ZIP / Postal code"],
                                ["country", "Country"],
                            ] as const).map(([field, label]) => (
                                <TextInput key={field} value={address[field]} onChangeText={(text) => setAddress((current) => ({ ...current, [field]: text }))} placeholder={label} className="mb-2 rounded-lg border border-gray-200 px-3 py-3 text-primary" />
                            ))}
                        </View>
                        <View className="mt-3 rounded-xl bg-white p-4">
                            <Text className="mb-3 text-lg font-bold text-primary">Order summary</Text>
                            <View className="mb-2 flex-row justify-between"><Text className="text-gray-600">Subtotal</Text><Text className="font-medium text-primary">${subtotal.toFixed(2)}</Text></View>
                            <View className="mb-3 flex-row justify-between"><Text className="text-gray-600">Shipping</Text><Text className="font-medium text-primary">{shipping ? `$${shipping.toFixed(2)}` : "Free"}</Text></View>
                            <View className="border-t border-gray-100 pt-3"><View className="flex-row justify-between"><Text className="font-bold text-primary">Total</Text><Text className="text-lg font-bold text-primary">${(subtotal + shipping).toFixed(2)}</Text></View></View>
                            <Text className="mt-2 text-xs text-gray-500">Payment: cash on delivery</Text>
                        </View>
                        <TouchableOpacity disabled={placing} onPress={() => void checkout()} className={`mt-4 rounded-xl bg-primary p-4 ${placing ? "opacity-60" : ""}`}>
                            <Text className="text-center font-bold text-white">{placing ? "Placing order..." : user ? "Place order" : "Log in to checkout"}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
