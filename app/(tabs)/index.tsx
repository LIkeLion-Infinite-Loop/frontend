import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Text, View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native'; // useColorScheme 훅 추가
import SearchInput from '@/components/common/SearchInput';
import CategoryGrid from '@/components/layout/CategoryGrid';
import RecyclingInfoModal from '@/components/modals/RecyclingInfoModal';
import { RECYCLING_DATA, CategoryData } from '@/constants/recyclingData';

export default function HomeScreen() {
  const colorScheme = useColorScheme(); // 기기의 현재 테마를 가져옵니다.
  const isDarkMode = colorScheme === 'dark'; // 현재 테마가 'dark'인지 확인합니다.

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CategoryData | null>(null);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${query}`);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    const data = RECYCLING_DATA[categoryName.toLowerCase()];
    if (data) {
      setSelectedCategoryData(data);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // 다크 모드에 따라 동적으로 스타일을 적용합니다.
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

// 컴포넌트 스타일 정의
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 라이트 모드 배경색
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212', // 다크 모드 배경색
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
    color: '#333333', // 라이트 모드 글자색
    marginBottom: 10,
  },
  darkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0', // 다크 모드 글자색
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E0E0E0', // 라이트 모드 선 색상
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  darkDividerLine: {
    height: 1,
    backgroundColor: '#444444', // 다크 모드 선 색상
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
});