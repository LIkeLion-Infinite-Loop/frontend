
import React, {useState} from 'react';
import { Image } from 'expo-image';
import { Text, View, SafeAreaView, StyleSheet, ScrollView } from 'react-native'; // ScrollView 추가
import { router } from 'expo-router';
import SearchInput from '@/components/common/SearchInput';
import CategoryGrid from '@/components/layout/CategoryGrid'; 
import RecyclingInfoModal from '@/components/modals/RecyclingInfoModal'; 
import { RECYCLING_DATA, CategoryData } from '@/constants/recyclingData'; 

export default function HomeScreen() {

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CategoryData | null>(null);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) { // 빈 검색어는 무시
      router.push(`/search?query=${query}`);
    }
  };

  const handleCategoryPress = (categoryName: string) => {

    console.log(`[디버깅] handleCategoryPress 실행됨! 클릭된 카테고리: ${categoryName}`);

    const data = RECYCLING_DATA[categoryName.toLowerCase()];

    if (data) {
      setSelectedCategoryData(data);
      setModalVisible(true);
    } else {
      console.log(`[디버깅] '${categoryName}'에 해당하는 데이터가 RECYCLING_DATA에 없습니다.`);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false); // 모달 숨기기
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* ... (기존의 로고, 검색창, 구분선, 카테고리 텍스트) ... */}
        <View style={styles.topDecorationArea}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} 
          contentFit="contain" />
        </View>
        <View style={styles.searchArea}>
          <SearchInput placeholder="재활용품을 검색해주세요!" onSearch={handleSearchSubmit} />
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.textArea}>
          <Text style={styles.categoryText}>카테고리</Text>
        </View>

        <CategoryGrid onCategoryPress={handleCategoryPress} />
      </ScrollView>

      <RecyclingInfoModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        categoryData={selectedCategoryData}
      />
    </SafeAreaView>
  );
}

// 컴포넌트 스타일 정의
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollViewContent: {
    flexGrow: 1, // ScrollView가 내용을 감싸도록 하면서 스크롤 가능하게
    // 이 안에 있는 모든 내용들이 수직으로 쌓이게 됩니다.
    // paddingHorizontal: 20, // 전체적인 좌우 패딩을 여기에 줄 수 있습니다.
  },

  topDecorationArea: {
    height: 300, // 이 영역의 고정 높이 (조정 필요)
    justifyContent: 'center', // 이 영역 안에서 지구본 이미지 세로 중앙 정렬
    alignItems: 'center', // 이 영역 안에서 지구본 이미지 가로 중앙 정렬
    position: 'relative', // 별들의 absolute 위치 기준이 됩니다.
  },
  logoImage: {
    width: 211,
    height: 211,
    resizeMode: 'contain',
    // 이 이미지의 위치는 topDecorationArea의 justify/alignItems에 의해 중앙 정렬됩니다.
  },


  searchArea: {
    // 이 영역은 topDecorationArea 바로 아래에 옵니다.
    // SearchInput 컴포넌트 자체에 paddingHorizontal이 있으므로 여기서는 추가 패딩은 주지 않습니다.
    paddingHorizontal: 20, // 검색창 좌우 여백을 위한 패딩
    marginTop: -50, // 검색창을 지구본 이미지 위로 살짝 올리기 (조정 필요)
    marginBottom: 20, // 검색창 아래 여백
  },

  textArea: {
    alignItems: 'flex-start', 
    marginBottom: 20, // 아래 카테고리 영역과의 간격
    paddingHorizontal: 20, // 텍스트 좌우 여백
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10, // 아래 descriptionText와의 간격
  },
    dividerLine: {
    height: 1, // 선의 두께 (1dp)
    backgroundColor: '#e0e0e0', // 선의 색상 (밝은 회색)
    width: '90%', // 선의 너비 (화면 너비의 90%)
    alignSelf: 'center', // 선을 가로 중앙에 배치
    marginVertical: 20, // 위아래 여백 (조정 가능)
  },
});