import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
        contentFit="contain"
      />
      <Text style={styles.name}>{koreanName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%', 
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0.5)', 
    borderRadius: 10,
    padding: 10,
    margin: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, 
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