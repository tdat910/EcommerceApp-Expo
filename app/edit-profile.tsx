import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { useFeedback } from "../src/components/Feedback";
import { useAppStore } from "../src/store/AppStore";

export default function EditProfile() {
    const router = useRouter();
    const { user, updateProfile } = useAppStore();
    const { notify } = useFeedback();
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        ...user?.address,
    });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!name.trim() || !email.trim()) {
            notify("Required information missing", "Enter your full name and email address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            notify("Invalid email address", "Enter a valid email address.");
            return;
        }

        try {
            setSaving(true);
            await updateProfile({ name, email, phone, address });
            notify("Profile updated", "Your account details have been saved.");
            router.back();
        } catch (error) {
            notify("Could not save profile", error instanceof Error ? error.message : "Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return <View className="flex-1 bg-gray-50"><Header title="EDIT PROFILE" showBack /><View className="flex-1 items-center justify-center p-8"><Text className="text-center text-gray-600">Sign in to edit your profile.</Text><TouchableOpacity onPress={() => router.push("/(tabs)/login")} className="mt-4 rounded-lg bg-primary px-6 py-3"><Text className="font-semibold text-white">Login</Text></TouchableOpacity></View></View>;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="EDIT PROFILE" showBack />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
                <View className="mb-4 rounded-xl bg-white p-4">
                    <Text className="text-lg font-bold text-primary">Personal information</Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Full name" autoComplete="name" className="mt-4 rounded-lg border border-gray-200 px-3 py-3" />
                    <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" className="mt-3 rounded-lg border border-gray-200 px-3 py-3" />
                    <TextInput value={phone} onChangeText={setPhone} placeholder="Phone (optional)" keyboardType="phone-pad" className="mt-3 rounded-lg border border-gray-200 px-3 py-3" />
                </View>
                <View className="rounded-xl bg-white p-4">
                    <Text className="mb-2 text-lg font-bold text-primary">Default shipping address</Text>
                    {([
                        ["street", "Street address"],
                        ["city", "City"],
                        ["state", "State / Province"],
                        ["zipCode", "ZIP / Postal code"],
                        ["country", "Country"],
                    ] as const).map(([field, label]) => (
                        <TextInput key={field} value={address[field]} onChangeText={(text) => setAddress((current) => ({ ...current, [field]: text }))} placeholder={label} className="mb-2 rounded-lg border border-gray-200 px-3 py-3" />
                    ))}
                </View>
                <TouchableOpacity disabled={saving} onPress={() => void save()} className={`mt-4 rounded-xl bg-primary p-4 ${saving ? "opacity-60" : ""}`}>
                    <Text className="text-center font-bold text-white">{saving ? "Saving..." : "Save profile"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
