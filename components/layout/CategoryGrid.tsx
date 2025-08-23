import CategoryItem from '@/components/items/CategoryItem';
import { CATEGORIES_LIST } from '@/constants/categoryDisplayData';
import React from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void;
}

const PADDING = 20;   // 좌/우 패딩
const GAP = 12;       // 아이템 사이 간격
const NUM_COLS = 3;

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  const { width } = useWindowDimensions();
  // (전체 너비 - 좌/우 패딩 - (열-1)*간격) / 열
  const itemSize = (width - PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

  const renderItem = ({ item }: { item: typeof CATEGORIES_LIST[0] }) => {
    const displayName =  item.name; // 없으면 name 사용

    const handlePress = () => {
      // 부모(HomeScreen)에서 cat.name으로 찾고 있으므로 name을 전달
      onCategoryPress?.(item.name);
    };

    return (
      <CategoryItem
        name={item.name}
        koreanName={displayName}
        icon={item.icon}
        onPress={handlePress}
        style={{ width: itemSize, height: itemSize }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES_LIST}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GAP }}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: PADDING, paddingBottom: GAP }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default CategoryGrid;
