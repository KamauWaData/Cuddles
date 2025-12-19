import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { blockUser, reportUser } from '../../../lib/block';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  about?: string;
  interests?: string[];
  gallery?: string[];
  location?: string;
  is_verified?: boolean;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProfile(data);
      } else {
        Alert.alert('Error', 'Could not load profile');
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id;
      if (!myId) {
        Alert.alert('Error', 'You must be signed in');
        return;
      }
      await blockUser(myId, profile.id);
      Alert.alert('Blocked', 'User has been blocked. You won\'t see them again.');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id;
      if (!myId) {
        Alert.alert('Error', 'You must be signed in');
        return;
      }
      await reportUser(myId, profile.id, 'Inappropriate behaviour');
      Alert.alert('Reported', 'Thanks for flagging. We\'ll review this user.');
    } catch (err) {
      Alert.alert('Error', 'Failed to report user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF0F5', '#FFFFFF']} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient colors={['#FFF0F5', '#FFFFFF']} style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FF3366" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3366" />
            <Text style={styles.errorText}>Profile not found</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';

  return (
    <LinearGradient colors={['#FFF0F5', '#FFFFFF', '#FFF5F7']} style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          <View style={styles.heroSection}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="person" size={60} color="#FF3366" />
              </View>
            )}
            {profile.is_verified && (
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              </View>
            )}
          </View>

          {/* Profile Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.profileName}>{displayName}</Text>
                {profile.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color="#FF3366" />
                    <Text style={styles.locationText}>{profile.location}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* About Section */}
          {profile.about && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.aboutText}>{profile.about}</Text>
              </View>
            </View>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Interests</Text>
              </View>
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest: string) => (
                  <View key={interest} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gallery Section */}
          {profile.gallery && profile.gallery.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Gallery</Text>
              </View>
              <View style={styles.galleryGrid}>
                {profile.gallery.map((pic: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: pic }}
                    style={styles.galleryImage}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.blockButton]}
              onPress={handleBlock}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="ban" size={18} color="#DC2626" />
                  <Text style={styles.blockButtonText}>Block User</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.reportButton]}
              onPress={handleReport}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <>
                  <Ionicons name="flag" size={18} color="#6B7280" />
                  <Text style={styles.reportButtonText}>Report User</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    position: 'relative',
    height: 320,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#FFE4E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3366',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryImage: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  actionSection: {
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  blockButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  blockButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
  reportButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportButtonText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 15,
  },
});
