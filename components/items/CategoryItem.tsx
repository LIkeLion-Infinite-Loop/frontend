import { Image } from 'react-native'; 
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

interface CategoryItemProps {
    name: string;
    koreanName: string;
    icon: any; 
    onPress: (categoryName: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({name, koreanName, icon, onPress}) => {
    const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기
    
    const handlePress = () => {
        onPress(name);
    };

    // 다크 모드에 따른 동적 스타일 변수
    const containerBackgroundColor = isDarkMode ? '#222222' : 'rgba(255, 255, 255, 1)';
    const containerBorderColor = isDarkMode ? '#444444' : '#f2f2f2';
    const nameColor = isDarkMode ? '#E0E0E0' : '#464646';

  return (
    <TouchableOpacity 
        style={[
            styles.container, 
            { 
                backgroundColor: containerBackgroundColor,
                borderColor: containerBorderColor,
                // 다크 모드에서는 그림자를 제거하거나 조정
                shadowColor: isDarkMode ? 'transparent' : '#9e9e9eff' 
            }
        ]} 
        onPress={handlePress}
    >
      <Image
        source={icon}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[styles.name, { color: nameColor }]}>{koreanName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%', 
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    margin: 5,
    // shadowColor, shadowOffset, shadowOpacity, shadowRadius는 다크 모드에 따라 동적으로 설정
    shadowColor: '#9e9e9eff', 
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, 
    borderWidth: 1, 
    // borderColor는 다크 모드에 따라 동적으로 설정
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
    // color는 다크 모드에 따라 동적으로 설정
  },
});

export default CategoryItem;