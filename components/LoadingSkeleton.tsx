import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type SkeletonProps = {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
};

export default function LoadingSkeleton({
  width = '100%',
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

type SkeletonGridProps = {
  count: number;
  height: number;
  gap?: number;
  style?: any;
};

export function SkeletonGrid({ count, height, gap = 8, style }: SkeletonGridProps) {
  return (
    <View style={[styles.grid, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ gap, flex: 1 }}>
          <LoadingSkeleton height={height} borderRadius={12} width="100%" />
          <LoadingSkeleton height={height * 0.4} borderRadius={8} width="80%" />
        </View>
      ))}
    </View>
  );
}

type SkeletonListProps = {
  count: number;
  gap?: number;
};

export function SkeletonList({ count, gap = 12 }: SkeletonListProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <LoadingSkeleton width={56} height={56} borderRadius={28} />
          <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
            <LoadingSkeleton height={16} width="70%" borderRadius={4} />
            <LoadingSkeleton height={14} width="90%" borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
