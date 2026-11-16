import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../src/store/AppStore";
import { useFeedback } from "../../src/components/Feedback";

export default function Signup() {
    const router = useRouter();
    const { register, user } = useAppStore();
    const { notify } = useFeedback();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!name.trim() || !email.includes("@") || password.length < 6) {
            notify("Check your details", "Enter your name, a valid email address, and a password of at least 6 characters.");
            return;
        }
        try {
            setBusy(true);
            await register(name, email, password);
            router.replace("/(tabs)");
        } catch (error) {
            notify("Registration failed", error instanceof Error ? error.message : "Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <View className="flex-1 justify-center bg-white px-6">
            <Text className="text-3xl font-bold text-primary">Create account</Text>
            <Text className="mb-7 mt-2 text-gray-500">Join us to save favorites and track your orders.</Text>
            {user ? (
                <View className="rounded-xl bg-gray-50 p-5">
                    <Text className="font-semibold text-primary">Signed in as {user.name}</Text>
                    <TouchableOpacity onPress={() => router.replace(user.role === "admin" ? "/admin" : "/(tabs)")} className="mt-4 rounded-lg bg-primary p-3">
                        <Text className="text-center font-semibold text-white">Continue shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <TextInput value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" className="mb-3 rounded-xl border border-gray-200 px-4 py-4" />
                    <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" className="mb-3 rounded-xl border border-gray-200 px-4 py-4" />
                    <TextInput value={password} onChangeText={setPassword} placeholder="Password (at least 6 characters)" secureTextEntry className="mb-5 rounded-xl border border-gray-200 px-4 py-4" />
                    <TouchableOpacity disabled={busy} onPress={() => void submit()} className="rounded-xl bg-primary p-4">
                        <Text className="text-center font-bold text-white">{busy ? "Creating account..." : "Sign Up"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/login")} className="mt-5">
                        <Text className="text-center text-gray-600">Already have an account? <Text className="font-bold text-primary">Log in</Text></Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}
