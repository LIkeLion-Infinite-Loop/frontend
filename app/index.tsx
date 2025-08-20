import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function IntroScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      router.push('/(auth)/login');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoGroup}>
        <Image source={require('../assets/images/earth.png')} style={styles.image} />

        {/* 'resizeMode'를 style 밖의 prop으로 수정했습니다. */}
        <Image
          source={require('../assets/images/biugo.png')}
          style={{ width: 144, height: 48 }}
          resizeMode="contain"
        />
      </View>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
      >
        <Animated.View
          style={[
            styles.button,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: isHovered ? '#04c75a' : '#FFFFFF',
              opacity: isHovered ? 0.95 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: isHovered ? '#e0ffe8' : '#05D16E' },
            ]}
          >
            START
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#06D16E',
    paddingHorizontal: 24,
  },
  logoGroup: {
    alignItems: 'center',
    marginBottom: 64,
    transform: [{ translateY: -40 }],
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
