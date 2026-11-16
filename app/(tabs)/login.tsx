import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";

export default function Login() {
    const router = useRouter();
    const { login, user } = useAppStore();
    const { notify } = useFeedback();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        try {
            setBusy(true);
            const account = await login(email, password);
            router.replace(account.role === "admin" ? "/admin" : "/(tabs)");
        } catch (error) {
            notify("Login failed", error instanceof Error ? error.message : "Please check your details and try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <View className="flex-1 justify-center bg-white px-6">
            <Text className="text-3xl font-bold text-primary">Welcome back</Text>
            <Text className="mb-7 mt-2 text-gray-500">Sign in to continue to your account.</Text>
            {user ? (
                <View className="rounded-xl bg-gray-50 p-5">
                    <Text className="font-semibold text-primary">You are signed in as {user.name}.</Text>
                    <TouchableOpacity onPress={() => router.replace(user.role === "admin" ? "/admin" : "/(tabs)")} className="mt-4 rounded-lg bg-primary p-3">
                        <Text className="text-center font-semibold text-white">Continue</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" className="mb-3 rounded-xl border border-gray-200 px-4 py-4" />
                    <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry className="mb-5 rounded-xl border border-gray-200 px-4 py-4" />
                    <TouchableOpacity disabled={busy} onPress={() => void submit()} className="rounded-xl bg-primary p-4">
                        <Text className="text-center font-bold text-white">{busy ? "Signing in..." : "Login"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/signup")} className="mt-5">
                        <Text className="text-center text-gray-600">New here? <Text className="font-bold text-primary">Create an account</Text></Text>
                    </TouchableOpacity>
                </>
            )}
            <Text className="mt-8 text-center text-xs text-gray-400">Store admin demo: admin@forever.com / Admin123!</Text>
        </View>
    );
}
