import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

type SkipButtonProps = {
  /** Path to go to when skipping (e.g. "/(main)/home" or
"/(onboarding)/interests") */
    to?: string;
    /** Optional action before navigating (e.g. save partial data) */
    onSkip?: () => Promise<void> | void;
    /** Optional color override */
    color?: string;
};

export default function SkipButton({
    to = "/(main)/home",
    onSkip,
    color = "#ec4899", // Tailwind pink-500
}: SkipButtonProps) {
    const router = useRouter();

    const handleSkip = async () => {
        try {
            if (onSkip) await onSkip();
        } catch (error) {
            console.error("Skip action failed:", error);
        } finally {
            router.replace(to);
        }
    };
    return (
        <TouchableOpacity onPress={handleSkip}>
            <Text style={{ color, fontWeight: "600"}}>Skip</Text>
        </TouchableOpacity>
    )
}