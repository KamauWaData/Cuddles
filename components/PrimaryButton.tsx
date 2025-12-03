import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type PrimaryButtonProps = {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
};

export default function PrimaryButton({
  text,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 14 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.outlineButton,
          { paddingVertical: sizeStyles[size].paddingVertical },
          isDisabled && styles.disabled,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color="#FF3366" />
          ) : (
            <>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Text style={[styles.outlineText, { fontSize: sizeStyles[size].fontSize }]}>
                {text}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.secondaryButton,
          { paddingVertical: sizeStyles[size].paddingVertical },
          isDisabled && styles.disabled,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color="#FF3366" />
          ) : (
            <>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Text style={[styles.secondaryText, { fontSize: sizeStyles[size].fontSize }]}>
                {text}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[isDisabled && styles.disabled]}
    >
      <LinearGradient
        colors={isDisabled ? ['#FFB4C4', '#FFB4C4'] : ['#FF3366', '#FF6B8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientButton,
          { paddingVertical: sizeStyles[size].paddingVertical },
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Text style={[styles.primaryText, { fontSize: sizeStyles[size].fontSize }]}>
                {text}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  outlineButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#FF3366',
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#FFF0F5',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: '#FF3366',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: '#FF3366',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});
