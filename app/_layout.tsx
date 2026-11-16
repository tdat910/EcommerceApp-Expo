import { Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { FeedbackProvider } from "../src/components/Feedback";
import { AppStoreProvider, useAppStore } from "../src/store/AppStore";
import "../global.css";

export default function RootLayout() {
    return (
        <FeedbackProvider>
            <AppStoreProvider>
                <RootNavigator />
            </AppStoreProvider>
        </FeedbackProvider>
    );
}

function RootNavigator() {
    const { ready, loadError } = useAppStore();
    if (!ready) return <View className="flex-1 items-center justify-center"><ActivityIndicator /></View>;
    if (loadError) return <View className="flex-1 items-center justify-center p-8"><Text className="text-center text-red-600">{loadError}</Text></View>;
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="order-details/[id]" />
        </Stack>
    );
}
