import CategoryItem from '@/components/items/CategoryItem';
import { CATEGORIES } from '@/constants/categoryData';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';


interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void; 
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {

  const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <CategoryItem
      name={item.name}
      koreanName={item.koreanName}
      icon={item.icon}
      onPress={onCategoryPress || ((name) => console.log(`${name} 카테고리 클릭`))}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES} 
        renderItem={renderItem}
        keyExtractor={(item) => item.id} 
        numColumns={3}
        columnWrapperStyle={styles.row} 
        scrollEnabled={false} 
        contentContainerStyle={styles.gridContent} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10, 
    marginBottom: 20, 
  },
  row: {
    justifyContent: 'space-around', 

  },
  gridContent: {

  }
});

export default CategoryGrid;