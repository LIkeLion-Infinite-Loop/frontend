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
        <Image
          source={require('../assets/images/biugo.png')}
          style={{ width: 144, height: 48, resizeMode: 'contain' }}
        />
      </View>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={() => setIsHovered(true)}   // hover 시작
        onHoverOut={() => setIsHovered(false)} // hover 끝
        style={({ pressed }) => [
          styles.button,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isHovered ? '#04c75a' : '#FFFFFF',
            cursor: 'pointer',
            userSelect: 'none',
            opacity: pressed ? 0.8 : 1, // 눌렀을 때 투명도 변화
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.buttonText,
            { color: isHovered ? '#e0ffe8' : '#05D16E' },
          ]}
        >
          START
        </Animated.Text>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 32,
  },
  buttonText: {
    color: '#05D16E',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
