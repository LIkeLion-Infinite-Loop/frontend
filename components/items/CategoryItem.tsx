import { Image } from 'react-native'; 
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';

interface CategoryItemProps {
    name: string;
    koreanName: string;
    icon: any; 
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
        resizeMode="contain"
      />
      <Text style={styles.name}>{koreanName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%', 
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 1)',    borderRadius: 10,
    padding: 5,
    margin: 5,
    // shadowColor: '#9e9e9eff', 
    // shadowOffset: { width: 2, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    elevation: 3, 
    borderWidth: 1, 
    borderColor: '#f2f2f2', 
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
    color: '#464646ff',
    textAlign: 'center', 
    fontFamily: 'NotoSansKRBold'
  },
});

export default CategoryItem;