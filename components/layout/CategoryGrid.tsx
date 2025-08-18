import CategoryItem from '@/components/items/CategoryItem';
import { CATEGORIES } from '@/constants/categoryData';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void; 
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  const { width } = useWindowDimensions();

  // 화면 너비에 따라 Item의 크기를 계산
  const itemSize = (width - 20) / 3 - 10; // (전체 너비 - 좌우 패딩) / 3 - 각 아이템 좌우 마진

  const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <CategoryItem
      name={item.name}
      koreanName={item.koreanName}
      icon={item.icon}
      onPress={onCategoryPress || ((name) => console.log(`${name} 카테고리 클릭`))}
      style={{ width: itemSize, height: itemSize }}
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
    justifyContent: 'space-between', // space-around 대신 space-between을 사용해 균등하게 정렬
  },
  gridContent: {
    // 필요한 경우 추가 스타일
  }
});

export default CategoryGrid;