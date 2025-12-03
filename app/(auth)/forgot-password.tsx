import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import Icon from "@expo/vector-icons/Ionicons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "yourapp://reset-password", // deep link handler
      });

      if (error) {
        setMessage(error.message);
        setSending(false);
        return;
      }

      setMessage("We've sent a password reset link to your email.");
      setSending(false);
    } catch (err: any) {
      setMessage("Something went wrong. Please try again.");
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white px-6"
    >
      {/* Header */}
      <View className="mt-16">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Icon name="arrow-back" size={28} color="#FF3366" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900">Forgot Password</Text>
        <Text className="text-gray-500 mt-2">
          Enter your email to receive a password reset link.
        </Text>
      </View>

      {/* Form */}
      <View className="mt-10">
        <Text className="text-gray-600 mb-2 font-medium">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
          placeholder="you@example.com"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      {/* Error/Info Message */}
      {message && (
        <Text className="text-center text-sm text-red-500 mt-4">{message}</Text>
      )}

      {/* Reset Button */}
      <TouchableOpacity
        disabled={sending}
        onPress={handleReset}
        className={`mt-10 py-4 rounded-xl ${sending ? "bg-gray-300" : "bg-[#FF3366]"}`}
      >
        <Text className="text-center text-white text-lg font-semibold">
          {sending ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
