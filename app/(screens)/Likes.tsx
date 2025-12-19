import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonList } from '../../components/LoadingSkeleton';

type Tab = 'likesYou' | 'youLiked';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  location?: string;
}

export default function LikesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('likesYou');
  const [likesYou, setLikesYou] = useState<UserProfile[]>([]);
  const [youLiked, setYouLiked] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      setMyUserId(data?.user?.id ?? null);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (myUserId) {
      fetchLikes();
    }
  }, [myUserId]);

  const fetchLikes = async () => {
    if (!myUserId) return;
    setLoading(true);
    try {
      const [likesYouRes, youLikedRes] = await Promise.all([
        supabase
          .from('likes')
          .select('user_id')
          .eq('liked_id', myUserId),
        supabase
          .from('likes')
          .select('liked_id')
          .eq('user_id', myUserId),
      ]);

      const likesYouUserIds = (likesYouRes.data || []).map(x => x.user_id);
      const youLikedUserIds = (youLikedRes.data || []).map(x => x.liked_id);

      const [likesYouProfiles, youLikedProfiles] = await Promise.all([
        likesYouUserIds.length > 0
          ? supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, location')
            .in('id', likesYouUserIds)
          : Promise.resolve({ data: [] }),
        youLikedUserIds.length > 0
          ? supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, location')
            .in('id', youLikedUserIds)
          : Promise.resolve({ data: [] }),
      ]);

      setLikesYou((likesYouProfiles.data as any) || []);
      setYouLiked((youLikedProfiles.data as any) || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const list = tab === 'likesYou' ? likesYou : youLiked;
  const isEmpty = list.length === 0;

  const renderCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(screens)/profile/${item.id}`)}
      activeOpacity={0.8}
      style={styles.profileCard}
    >
      <View style={styles.imageContainer}>
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={32} color="#FF3366" />
          </View>
        )}
        <View style={styles.cardOverlay}>
          <TouchableOpacity
            onPress={() => router.push(`/(screens)/profile/${item.id}`)}
            style={styles.viewButton}
            activeOpacity={0.9}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName} numberOfLines={1}>
          {item.first_name || 'User'} {item.last_name}
        </Text>
        {item.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#FFF0F5', '#FFFFFF', '#FFF5F7']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Likes</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setTab('likesYou')}
            style={[
              styles.tab,
              tab === 'likesYou' && styles.tabActive,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="heart"
                size={18}
                color={tab === 'likesYou' ? '#FF3366' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === 'likesYou' && styles.tabTextActive,
                ]}
              >
                Likes You
              </Text>
              {likesYou.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{likesYou.length}</Text>
                </View>
              )}
            </View>
            {tab === 'likesYou' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab('youLiked')}
            style={[
              styles.tab,
              tab === 'youLiked' && styles.tabActive,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="heart-outline"
                size={18}
                color={tab === 'youLiked' ? '#FF3366' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === 'youLiked' && styles.tabTextActive,
                ]}
              >
                You Liked
              </Text>
              {youLiked.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{youLiked.length}</Text>
                </View>
              )}
            </View>
            {tab === 'youLiked' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonList count={4} />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={tab === 'likesYou' ? 'heart-outline' : 'heart-dislike-outline'}
                size={48}
                color="#FF3366"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {tab === 'likesYou' ? 'No likes yet' : 'You haven\'t liked anyone'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tab === 'likesYou'
                ? 'When someone likes you, they\'ll appear here'
                : 'Find someone special and like them to get started'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FFF0F5',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FF3366',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF3366',
    borderRadius: 2,
  },
  badge: {
    backgroundColor: '#FF3366',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  columnWrapper: {
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  viewButton: {
    backgroundColor: '#FF3366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  profileInfo: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
