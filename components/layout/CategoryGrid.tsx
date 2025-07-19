// components/layout/CategoryGrid.tsx

import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import CategoryItem from '@/components/items/CategoryItem'; // CategoryItem 임포트
import { CATEGORIES } from '@/constants/dummyData'; // CATEGORIES 데이터 임포트

// CategoryGrid 컴포넌트의 props 타입 정의 (필요에 따라 확장)
interface CategoryGridProps {
  onCategoryPress?: (categoryName: string) => void; // 카테고리 클릭 시 실행될 함수
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  // FlatList가 각 아이템을 어떻게 렌더링할지 정의
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
        data={CATEGORIES} // dummyData에서 가져온 카테고리 배열
        renderItem={renderItem} // 각 아이템 렌더링 함수
        keyExtractor={(item) => item.id} // 각 아이템의 고유 키
        numColumns={3} // 한 줄에 3개씩 표시
        columnWrapperStyle={styles.row} // 각 행의 스타일 (아이템 간 간격 조절)
        scrollEnabled={false} // FlatList가 스크롤되지 않도록 설정 (전체 화면 스크롤은 ScrollView가 담당)
        contentContainerStyle={styles.gridContent} // 그리드 내용 컨테이너 스타일
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10, // 섹션 좌우 패딩 (그리드 내부 아이템 마진과 조화롭게)
    marginBottom: 20, // 그리드 섹션 하단 여백
  },
  row: {
    justifyContent: 'space-around', // 한 행의 아이템들을 균등하게 배치
    // flexWrap: 'wrap', // 기본적으로 FlatList는 wrap을 처리하지만, View로 감쌀 때 유용
  },
  gridContent: {
    // 아이템들의 상위 컨테이너 스타일 (FlatList의 padding 등)
  }
});

export default CategoryGrid;