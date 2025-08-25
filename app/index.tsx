import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text } from 'react-native';

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
    <LinearGradient
      colors={['#06D16E', '#B5F7C1']} 
      style={styles.container}
    >
      <Image
        source={require('../assets/images/biugo_earth.png')} 
        style={styles.fullImage}
        resizeMode="contain"
      />

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fullImage: {
    width: 280,
    height: 280,
    marginBottom: 64,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 32,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});