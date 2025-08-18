import { Image } from 'react-native'; 
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CategoryItemProps {
  name: string;
  koreanName: string;
  icon: any; 
  onPress: (categoryName: string) => void;
  style?: ViewStyle; // CategoryGrid에서 넘겨받을 style prop 추가
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, koreanName, icon, onPress, style }) => {
  const { isDarkMode } = useTheme(); 
  
  // reanimated를 사용해 애니메이션 값을 관리
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(1.05, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    onPress(name);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const containerBackgroundColor = isDarkMode ? '#222222' : 'rgba(255, 255, 255, 1)';
  const containerBorderColor = isDarkMode ? '#444444' : '#f2f2f2';
  const nameColor = isDarkMode ? '#E0E0E0' : '#464646';
  const shadowColor = isDarkMode ? 'transparent' : '#9e9e9eff';
  
  return (
    <TouchableOpacity 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      style={{ margin: 5 }} // CategoryItem의 마진을 여기서 관리
    >
      <Animated.View
        style={[
          styles.container, 
          style, // CategoryGrid에서 넘어온 동적 크기 스타일 적용
          { 
            backgroundColor: containerBackgroundColor,
            borderColor: containerBorderColor,
            shadowColor: shadowColor,
            shadowOffset: styles.container.shadowOffset,
            shadowOpacity: styles.container.shadowOpacity,
            shadowRadius: styles.container.shadowRadius,
            elevation: styles.container.elevation,
          },
          animatedStyle,
        ]} 
      >
        <Image
          source={icon}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={[styles.name, { color: nameColor }]}>{koreanName}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: '30%', -> 이 값은 CategoryGrid에서 동적으로 계산
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    // margin: 5, -> 이 값은 TouchableOpacity에서 관리
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, 
    borderWidth: 1, 
  },
  icon: {
    width: '85%', 
    height: '85%',
    resizeMode: 'contain',
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center', 
    fontFamily: 'NotoSansKRBold'
  },
});

export default CategoryItem;