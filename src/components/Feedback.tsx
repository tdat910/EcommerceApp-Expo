import React, { createContext, useContext, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Dialog = {
    title: string;
    message: string;
    confirm?: () => void;
};

type FeedbackValue = {
    notify: (title: string, message: string) => void;
    confirm: (title: string, message: string, action: () => void) => void;
};

const FeedbackContext = createContext<FeedbackValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
    const [dialog, setDialog] = useState<Dialog | null>(null);
    const value = useMemo<FeedbackValue>(() => ({
        notify: (title, message) => setDialog({ title, message }),
        confirm: (title, message, action) => setDialog({ title, message, confirm: action }),
    }), []);

    return (
        <FeedbackContext.Provider value={value}>
            {children}
            <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
                <View className="flex-1 items-center justify-center bg-black/40 px-6">
                    <View className="w-full max-w-sm rounded-2xl bg-white p-5">
                        <Text className="text-xl font-bold text-primary">{dialog?.title}</Text>
                        <Text className="mt-2 leading-5 text-gray-600">{dialog?.message}</Text>
                        <View className="mt-5 flex-row justify-end gap-3">
                            {dialog?.confirm && (
                                <TouchableOpacity onPress={() => setDialog(null)} className="rounded-lg bg-gray-100 px-4 py-3">
                                    <Text className="font-semibold text-gray-700">Cancel</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    const action = dialog?.confirm;
                                    setDialog(null);
                                    action?.();
                                }}
                                className="rounded-lg bg-primary px-4 py-3"
                            >
                                <Text className="font-semibold text-white">{dialog?.confirm ? "Confirm" : "OK"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (!context) throw new Error("useFeedback must be used inside FeedbackProvider.");
    return context;
}
