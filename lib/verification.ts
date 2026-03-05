import { supabase } from "./supabase";
import { uploadToCloudinary } from "./cloudinary";

export interface UserVerification {
  id: string;
  user_id: string;
  verification_type: "selfie" | "id" | "email" | "phone";
  status: "pending" | "verified" | "rejected";
  image_url: string | null;
  submitted_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  retry_count: number;
}

/**
 * Submit a selfie for verification
 */
export async function submitSelfieVerification(localImageUri: string): Promise<UserVerification | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Upload image to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(localImageUri);
    if (!cloudinaryUrl) throw new Error("Failed to upload image");

    // Save verification record to Supabase
    const { data, error } = await supabase
      .from("user_verifications")
      .upsert(
        {
          user_id: userId,
          verification_type: "selfie",
          status: "pending",
          image_url: cloudinaryUrl,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,verification_type" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Selfie verification submission error:", error);
    return null;
  }
}

/**
 * Get verification status for current user
 */
export async function getVerificationStatus(
  verificationType: "selfie" | "id" | "email" | "phone" = "selfie"
): Promise<UserVerification | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_verifications")
      .select("*")
      .eq("user_id", userId)
      .eq("verification_type", verificationType)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No verification found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get verification status error:", error);
    return null;
  }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_verifications")
      .select("status")
      .eq("user_id", userId)
      .eq("verification_type", "selfie")
      .eq("status", "verified")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No verified record found
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Is user verified error:", error);
    return false;
  }
}

/**
 * Get verification badge URL or icon for display
 */
export function getVerificationBadge(verification: UserVerification | null): {
  show: boolean;
  label: string;
  icon: string;
  color: string;
} {
  if (!verification) {
    return { show: false, label: "", icon: "", color: "" };
  }

  if (verification.status === "verified") {
    return {
      show: true,
      label: "Verified",
      icon: "checkmark-circle",
      color: "#10B981",
    };
  }

  if (verification.status === "pending") {
    return {
      show: true,
      label: "Pending",
      icon: "hourglass",
      color: "#F59E0B",
    };
  }

  if (verification.status === "rejected") {
    return {
      show: true,
      label: "Rejected",
      icon: "close-circle",
      color: "#EF4444",
    };
  }

  return { show: false, label: "", icon: "", color: "" };
}

/**
 * Retry verification (after rejection)
 */
export async function retryVerification(localImageUri: string): Promise<UserVerification | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check current verification
    const currentVerification = await getVerificationStatus("selfie");
    if (!currentVerification) {
      // No existing verification, create new one
      return submitSelfieVerification(localImageUri);
    }

    // Check retry count
    if (currentVerification.retry_count >= 3) {
      throw new Error("Maximum retry attempts reached. Contact support.");
    }

    // Upload new image
    const cloudinaryUrl = await uploadToCloudinary(localImageUri);
    if (!cloudinaryUrl) throw new Error("Failed to upload image");

    // Update verification
    const { data, error } = await supabase
      .from("user_verifications")
      .update({
        image_url: cloudinaryUrl,
        status: "pending",
        submitted_at: new Date().toISOString(),
        retry_count: currentVerification.retry_count + 1,
      })
      .eq("user_id", userId)
      .eq("verification_type", "selfie")
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Retry verification error:", error);
    return null;
  }
}

/**
 * Mark user as verified (admin only - for testing/demo)
 */
export async function markUserVerified(userId: string): Promise<boolean> {
  try {
    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    // Update verification record
    const { error: verError } = await supabase
      .from("user_verifications")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("verification_type", "selfie");

    if (verError && verError.code !== "PGRST116") {
      throw verError;
    }

    return true;
  } catch (error) {
    console.error("Mark user verified error:", error);
    return false;
  }
}
