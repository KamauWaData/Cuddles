import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import Icon from "@expo/vector-icons/Ionicons";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!password || !confirm) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully! Redirecting...");
      setLoading(false);

      setTimeout(() => {
        router.replace("/(auth)/login"); // redirect to login
      }, 1500);

    } catch (err: any) {
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
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

        <Text className="text-3xl font-bold text-gray-900">Reset Password</Text>
        <Text className="text-gray-500 mt-2">
          Enter your new password below.
        </Text>
      </View>

      {/* New Password */}
      <View className="mt-10">
        <Text className="text-gray-600 mb-2 font-medium">New Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-4">
          <TextInput
            className="flex-1 py-3 text-gray-900"
            placeholder="Enter new password"
            secureTextEntry={!showPass}
            onChangeText={setPassword}
            value={password}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Icon name={showPass ? "eye-off" : "eye"} size={22} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password */}
      <View className="mt-6">
        <Text className="text-gray-600 mb-2 font-medium">Confirm Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-4">
          <TextInput
            className="flex-1 py-3 text-gray-900"
            placeholder="Confirm password"
            secureTextEntry={!showConfirm}
            onChangeText={setConfirm}
            value={confirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Icon name={showConfirm ? "eye-off" : "eye"} size={22} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error / Success Message */}
      {message && (
        <Text
          className={`text-center text-sm mt-4 ${
            message.includes("success") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </Text>
      )}

      {/* Reset Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleReset}
        className={`mt-10 py-4 rounded-xl ${
          loading ? "bg-gray-300" : "bg-[#FF3366]"
        }`}
      >
        <Text className="text-center text-white text-lg font-semibold">
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
