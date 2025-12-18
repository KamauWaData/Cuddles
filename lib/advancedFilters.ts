import { supabase } from "./supabase";

export interface UserAttributes {
  id: string;
  user_id: string;
  height_cm: number | null;
  smoking: "never" | "sometimes" | "regularly" | "not_specified";
  drinking: "never" | "sometimes" | "regularly" | "not_specified";
  education: "high_school" | "bachelors" | "masters" | "phd" | "not_specified";
  religion: "christian" | "muslim" | "jewish" | "hindu" | "buddhist" | "atheist" | "not_specified";
  pets_preference: string | null; // comma-separated: 'dogs', 'cats', 'other'
  relationship_type: "casual" | "serious" | "not_specified";
  created_at: string;
  updated_at: string;
}

export interface FilterCriteria {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  gender?: string[];
  minHeight?: number;
  maxHeight?: number;
  smoking?: string[];
  drinking?: string[];
  education?: string[];
  religion?: string[];
  relationshipType?: string[];
}

/**
 * Save user attributes
 */
export async function saveUserAttributes(attributes: Partial<UserAttributes>): Promise<UserAttributes | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("user_attributes")
      .upsert(
        {
          user_id: userId,
          ...attributes,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Save user attributes error:", error);
    return null;
  }
}

/**
 * Get user attributes
 */
export async function getUserAttributes(userId: string): Promise<UserAttributes | null> {
  try {
    const { data, error } = await supabase
      .from("user_attributes")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No attributes found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get user attributes error:", error);
    return null;
  }
}

/**
 * Get current user's filter preferences from their attributes
 */
export async function getUserFilterPreferences(): Promise<FilterCriteria | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("show_me, show_only_online, distance_preference")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    return {
      gender: profile?.show_me || [],
      maxDistance: profile?.distance_preference || 50,
    };
  } catch (error) {
    console.error("Get user filter preferences error:", error);
    return null;
  }
}

/**
 * Apply filters to get matching users
 * This is a complex query - consider moving to backend for performance
 */
export async function getFilteredMatches(
  criteria: FilterCriteria,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) throw new Error("User not authenticated");

    // Start with base query
    let query = supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        name,
        avatar_url,
        location,
        latitude,
        longitude,
        birthday,
        about,
        interests,
        is_verified,
        user_attributes:user_attributes(*)
      `)
      .neq("id", currentUserId);

    // Apply age filter
    if (criteria.minAge || criteria.maxAge) {
      // This is a simplified version - actual date filtering would be more complex
      // In production, you'd want to calculate age on the backend
    }

    // Apply gender filter
    if (criteria.gender && criteria.gender.length > 0) {
      // Assuming profiles have a gender field
      // You might need to adjust based on your actual schema
    }

    // Apply height filter
    if (criteria.minHeight || criteria.maxHeight) {
      if (criteria.minHeight) {
        query = query.gte("user_attributes.height_cm", criteria.minHeight);
      }
      if (criteria.maxHeight) {
        query = query.lte("user_attributes.height_cm", criteria.maxHeight);
      }
    }

    // Apply smoking filter
    if (criteria.smoking && criteria.smoking.length > 0) {
      query = query.in("user_attributes.smoking", criteria.smoking);
    }

    // Apply drinking filter
    if (criteria.drinking && criteria.drinking.length > 0) {
      query = query.in("user_attributes.drinking", criteria.drinking);
    }

    // Apply education filter
    if (criteria.education && criteria.education.length > 0) {
      query = query.in("user_attributes.education", criteria.education);
    }

    // Apply religion filter
    if (criteria.religion && criteria.religion.length > 0) {
      query = query.in("user_attributes.religion", criteria.religion);
    }

    // Apply relationship type filter
    if (criteria.relationshipType && criteria.relationshipType.length > 0) {
      query = query.in("user_attributes.relationship_type", criteria.relationshipType);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    // Filter by distance on client-side (would be better on backend)
    if (criteria.maxDistance && data) {
      // This would need the current user's location
      // For now, return all results
    }

    return data || [];
  } catch (error) {
    console.error("Get filtered matches error:", error);
    return [];
  }
}

/**
 * Check if a user matches current user's dealbreakers
 */
export async function checkUserDealbreakers(
  userId: string,
  dealbreakers: FilterCriteria
): Promise<boolean> {
  try {
    const userAttributes = await getUserAttributes(userId);
    if (!userAttributes) return true; // Allow if no attributes

    // Check smoking dealbreaker
    if (
      dealbreakers.smoking &&
      dealbreakers.smoking.length > 0 &&
      !dealbreakers.smoking.includes(userAttributes.smoking)
    ) {
      return false;
    }

    // Check drinking dealbreaker
    if (
      dealbreakers.drinking &&
      dealbreakers.drinking.length > 0 &&
      !dealbreakers.drinking.includes(userAttributes.drinking)
    ) {
      return false;
    }

    // Check education dealbreaker
    if (
      dealbreakers.education &&
      dealbreakers.education.length > 0 &&
      !dealbreakers.education.includes(userAttributes.education)
    ) {
      return false;
    }

    // Check religion dealbreaker
    if (
      dealbreakers.religion &&
      dealbreakers.religion.length > 0 &&
      !dealbreakers.religion.includes(userAttributes.religion)
    ) {
      return false;
    }

    // Check height dealbreaker
    if (userAttributes.height_cm) {
      if (dealbreakers.minHeight && userAttributes.height_cm < dealbreakers.minHeight) {
        return false;
      }
      if (dealbreakers.maxHeight && userAttributes.height_cm > dealbreakers.maxHeight) {
        return false;
      }
    }

    return true; // User passes all dealbreaker checks
  } catch (error) {
    console.error("Check user dealbreakers error:", error);
    return true; // Allow on error
  }
}

/**
 * Get human-readable filter summary
 */
export function getFilterSummary(criteria: FilterCriteria): string {
  const parts: string[] = [];

  if (criteria.minAge || criteria.maxAge) {
    parts.push(`${criteria.minAge || 18}–${criteria.maxAge || 99} years`);
  }

  if (criteria.maxDistance) {
    parts.push(`within ${criteria.maxDistance} km`);
  }

  if (criteria.gender && criteria.gender.length > 0) {
    parts.push(`${criteria.gender.join(", ")}`);
  }

  if (criteria.smoking && criteria.smoking.length > 0) {
    parts.push(`non-smokers only` || criteria.smoking.join("/"));
  }

  if (criteria.education && criteria.education.length > 0) {
    parts.push(`${criteria.education.join(", ")} education`);
  }

  return parts.join(" • ");
}

/**
 * Get recommended dealbreaker filters
 */
export function getDealbreakerOptions() {
  return {
    height: {
      label: "Height",
      min: 150,
      max: 210,
      unit: "cm",
    },
    smoking: {
      label: "Smoking",
      options: [
        { label: "Never", value: "never" },
        { label: "Sometimes", value: "sometimes" },
        { label: "Regularly", value: "regularly" },
      ],
    },
    drinking: {
      label: "Drinking",
      options: [
        { label: "Never", value: "never" },
        { label: "Sometimes", value: "sometimes" },
        { label: "Regularly", value: "regularly" },
      ],
    },
    education: {
      label: "Education",
      options: [
        { label: "High School", value: "high_school" },
        { label: "Bachelors", value: "bachelors" },
        { label: "Masters", value: "masters" },
        { label: "PhD", value: "phd" },
      ],
    },
    religion: {
      label: "Religion",
      options: [
        { label: "Christian", value: "christian" },
        { label: "Muslim", value: "muslim" },
        { label: "Jewish", value: "jewish" },
        { label: "Hindu", value: "hindu" },
        { label: "Buddhist", value: "buddhist" },
        { label: "Atheist", value: "atheist" },
      ],
    },
    relationshipType: {
      label: "Looking for",
      options: [
        { label: "Something Casual", value: "casual" },
        { label: "Something Serious", value: "serious" },
      ],
    },
  };
}
