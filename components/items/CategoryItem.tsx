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
    width: '31%', 
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(250, 250, 250, 0.5)' : 'rgba(250, 250, 250, 0.45)',    borderRadius: 10,
    padding: 10,
    margin: 5,
    shadowColor: '#000000', 
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
    color: '#333333',
    textAlign: 'center', 
  },
});

export default CategoryItem;