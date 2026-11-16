import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../src/store/AppStore";
import { useFeedback } from "../src/components/Feedback";

type Props = {
    title?: string;
    showBack?: boolean;
    showSearch?: boolean;
    showCart?: boolean;
    showMenu?: boolean;
    showLogo?: boolean;
};

export default function Header({ title = "FOREVER", showBack, showCart = true }: Props) {
    const router = useRouter();
    const { user, cart, logout } = useAppStore();
    const { notify } = useFeedback();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/(tabs)");
        } catch (error) {
            notify("Unable to log out", error instanceof Error ? error.message : "Please try again.");
        }
    };

    return (
        <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
            <View className="flex-1 flex-row items-center">
                {showBack && (
                    <TouchableOpacity onPress={() => router.back()} className="mr-3" accessibilityLabel="Go back">
                        <Ionicons name="arrow-back" size={23} color="#111" />
                    </TouchableOpacity>
                )}
                <View className="flex-1">
                    <Text className="text-xl font-black tracking-[3px] text-primary">{title}</Text>
                    {user && <Text className="mt-0.5 text-xs text-gray-500">Hi, {user.name} · {user.role}</Text>}
                </View>
            </View>
            {user ? (
                <TouchableOpacity onPress={handleLogout} className="flex-row items-center rounded-full bg-gray-100 px-3 py-2" accessibilityLabel="Log out">
                    <Ionicons name="log-out-outline" size={17} color="#111" />
                    <Text className="ml-1 text-xs font-semibold text-primary">Log out</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => router.push("/(tabs)/login")} className="rounded-full bg-gray-100 px-3 py-2">
                    <Text className="text-xs font-semibold text-primary">Log in</Text>
                </TouchableOpacity>
            )}
            {showCart && (
                <TouchableOpacity onPress={() => router.push("/cart")} className="ml-3" accessibilityLabel={`Cart, ${itemCount} items`}>
                    <Ionicons name="bag-outline" size={23} color="#111" />
                    {itemCount > 0 && (
                        <View className="absolute -right-2 -top-2 min-w-4 items-center rounded-full bg-red-500 px-1">
                            <Text className="text-[10px] font-bold text-white">{itemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}
