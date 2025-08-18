import CategoryItem from '@/components/items/CategoryItem';
import { CATEGORIES } from '@/constants/categoryData';
import React from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void; 
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  const { width } = useWindowDimensions();
  const itemSize = (width - 20) / 3 - 10;

  const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const handlePress = () => {
      if (onCategoryPress) {

        onCategoryPress(item.name);
      }
    };

    return (
      <CategoryItem
        name={item.name}
        koreanName={item.koreanName}
        icon={item.icon}
        onPress={handlePress}
        style={{ width: itemSize, height: itemSize }}
      />
    );
  };

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
    justifyContent: 'space-between',
  },
  gridContent: {
    // 필요한 경우 추가 스타일
  }
});

export default CategoryGrid;
