import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

type Props = {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
};

export default function CategorySelector({ categories, selected, onSelect }: Props) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {["All", ...categories].map((category) => {
                const active = selected === category;
                return (
                    <TouchableOpacity
                        key={category}
                        onPress={() => onSelect(category)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={`rounded-full border px-4 py-2 ${active ? "border-primary bg-primary" : "border-gray-200 bg-white"}`}
                    >
                        <Text className={active ? "font-semibold text-white" : "font-medium text-primary"}>{category}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}
