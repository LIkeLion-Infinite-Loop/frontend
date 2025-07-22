import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Image} from 'expo-image';

interface CategoryItemProps {
    name: string;
    koreanName: string;
    icon: any; // require()를 통해 불러올 이미지의 타입
    onPress: (categoryName: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({name, koreanName, icon, onPress}) => {
    const handlePress = () => {
        onPress(name);
    };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={icon}
        style={styles.icon}
        contentFit="contain"
      />
      <Text style={styles.name}>{koreanName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%', // 한 줄에 3개씩 배치되도록 너비 설정 (조정 가능)
    aspectRatio: 1, // 너비와 높이를 같게 하여 정사각형 형태로 유지
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0.5)', // <-- 이 줄로 변경! (50% 투명)
    borderRadius: 10,
    padding: 10,
    margin: 5, // 아이템 간의 간격
    shadowColor: '#000', // 그림자 (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // 그림자 (Android)
  },
  icon: {
    width: '90%', 
    height: '90%',
    resizeMode: 'contain',
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center', 
  },
});

export default CategoryItem;