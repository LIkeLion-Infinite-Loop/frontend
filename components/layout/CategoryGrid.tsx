import CategoryItem from '@/components/items/CategoryItem';
import { CATEGORIES_LIST } from '@/constants/categoryDisplayData';
import React from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void; 
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  const { width } = useWindowDimensions();
  const itemSize = (width - 20) / 3 - 10;

  const renderItem = ({ item }: { item: typeof CATEGORIES_LIST[0] }) => {
    const handlePress = () => {
      if (onCategoryPress) {
        // CategoryItem에서는 name(영어)을 사용하지만, 
        // 부모에게는 koreanName(한글)을 전달해야 할 수도 있습니다.
        // 여기서는 기존 코드대로 item.name을 전달합니다.
        onCategoryPress(item.name);
      }
    };

    return (
      <CategoryItem
        name={item.name} // CategoryItem에는 name(영어)을 전달
        koreanName={item.name} // CategoryItem의 koreanName prop에는 한글 이름 전달
        icon={item.icon}
        onPress={handlePress}
        style={{ width: itemSize, height: itemSize }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        // ⭐️ 이 부분을 수정했습니다!
        data={CATEGORIES_LIST} 
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