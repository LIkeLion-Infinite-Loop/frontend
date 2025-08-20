import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Text, View, SafeAreaView, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { router } from 'expo-router';

// 1. 필요한 컴포넌트와 '우리가 만든' 최종 데이터를 불러옵니다.
import SearchInput from '@/components/common/SearchInput';
import CategoryGrid from '@/components/layout/CategoryGrid';
import RecyclingInfoModal from '@/components/modals/RecyclingInfoModal';
import { CATEGORIES_LIST } from '@/constants/categoryDisplayData'; // 👈 수정됨: RECYCLING_DATA 대신 CATEGORIES_LIST 사용

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [isModalVisible, setModalVisible] = useState(false);
  // 👈 수정됨: state의 타입을 any로 변경하여 유연성 확보
  const [selectedCategoryData, setSelectedCategoryData] = useState<any | null>(null);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search-result?query=${query}`); // search-result 경로로 수정 (expo-router 규칙)
    }
  };

  /**
   * 👈 수정됨: handleCategoryPress 함수를 CATEGORIES_LIST 배열을 사용하도록 변경
   * CategoryGrid에서 '금속', '플라스틱' 같은 한글 이름(categoryName)을 넘겨받습니다.
   */
  const handleCategoryPress = (categoryName: string) => {
    const categoryInfo = CATEGORIES_LIST.find(cat => cat.name === categoryName);
    if (categoryInfo) {
      setSelectedCategoryData(categoryInfo.modalData);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // 다크 모드에 따른 동적 스타일 (이 부분은 그대로 사용합니다. 아주 좋습니다!)
  const containerStyle = isDarkMode ? styles.darkContainer : styles.safeArea;
  const textStyle = isDarkMode ? styles.darkText : styles.categoryText;
  const dividerStyle = isDarkMode ? styles.darkDividerLine : styles.dividerLine;

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.topDecorationArea}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>
        <View style={styles.searchArea}>
          <SearchInput placeholder="재활용품을 검색해주세요!" onSearch={handleSearchSubmit} />
        </View>
        <View style={dividerStyle} />
        <View style={styles.textArea}>
          <Text style={textStyle}>카테고리</Text>
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

// 스타일 정의 (이 부분은 그대로 사용합니다.)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  topDecorationArea: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 211,
    height: 211,
    resizeMode: 'contain',
  },
  searchArea: {
    paddingHorizontal: 20,
    marginTop: -50,
    marginBottom: 20,
  },
  textArea: {
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  darkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  darkDividerLine: {
    height: 1,
    backgroundColor: '#444444',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
});