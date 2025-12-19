import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 20 },
    large: { paddingVertical: 14, paddingHorizontal: 24 },
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#FF3366'}
        />
      ) : (
        <>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles[`${variant}Text`],
              getSizeTextStyle(size),
              isDisabled && { opacity: 0.6 },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[{ width: fullWidth ? '100%' : 'auto' }, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#FFB4C4', '#FFB4C4']
              : ['#FF3366', '#FF6B8A']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            styles.primaryButton,
            sizeStyles[size],
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.button,
          styles.dangerButton,
          sizeStyles[size],
          { width: fullWidth ? '100%' : 'auto' },
          isDisabled && { opacity: 0.6 },
          style,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.button,
          styles.outlineButton,
          sizeStyles[size],
          { width: fullWidth ? '100%' : 'auto' },
          isDisabled && { opacity: 0.6 },
          style,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  // Secondary variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        styles.secondaryButton,
        sizeStyles[size],
        { width: fullWidth ? '100%' : 'auto' },
        isDisabled && { opacity: 0.6 },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

function getSizeTextStyle(size: 'small' | 'medium' | 'large'): TextStyle {
  const textSizes = {
    small: { fontSize: 13, fontWeight: '600' as const },
    medium: { fontSize: 15, fontWeight: '700' as const },
    large: { fontSize: 17, fontWeight: '700' as const },
  };
  return textSizes[size];
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#FF3366',
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    marginRight: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: '#FF3366',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: '#FF3366',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dangerText: {
    color: '#DC2626',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
