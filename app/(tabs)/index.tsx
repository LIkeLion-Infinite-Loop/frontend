import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import SearchInput from '@/components/common/SearchInput';
import CategoryGrid from '@/components/layout/CategoryGrid';
import RecyclingInfoModal from '@/components/modals/RecyclingInfoModal';
import { CATEGORIES_LIST } from '@/constants/categoryDisplayData';

const COLORS = {
  primary: '#06D16E',
  bgLight: '#F3F4F6',
  bgDark: '#121212',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1F1F1F',
  textLight: '#111827',
  textDark: '#E0E0E0',
  borderLight: '#e5e7eb',
  borderDark: '#333333',
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any | null>(null);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search-result?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    const categoryInfo = CATEGORIES_LIST.find(cat => cat.name === categoryName);
    if (categoryInfo) {
      setSelectedCategoryData(categoryInfo.modalData);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => setModalVisible(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? COLORS.bgDark : COLORS.bgLight }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* 로고 영역 */}
        <View style={styles.topDecorationArea}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        {/* 검색 */}
        <View style={styles.searchArea}>
          <SearchInput
            placeholder="재활용품을 검색해주세요!"
            onSearch={handleSearchSubmit}
          />
        </View>

        {/* 구분선 */}
        <View
          style={[
            styles.dividerLine,
            { backgroundColor: isDarkMode ? COLORS.borderDark : COLORS.borderLight },
          ]}
        />

        {/* 섹션 타이틀 */}
        <View style={styles.titleRow}>
          <View style={[styles.titleBadge, { backgroundColor: COLORS.primary }]} />
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? COLORS.textDark : COLORS.textLight },
            ]}
          >
            카테고리
          </Text>
        </View>

        {/* 카테고리 그리드 */}
        <CategoryGrid onCategoryPress={handleCategoryPress} />
      </ScrollView>

      {/* 모달 */}
      <RecyclingInfoModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        categoryData={selectedCategoryData}
      />
    </SafeAreaView>
  );
}

/** ===== 스타일 (팔레트만 반영, 구조/컴포넌트는 그대로) ===== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  topDecorationArea: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  searchArea: {
    paddingHorizontal: 20,
    marginTop: -36, // 살짝 오버랩 느낌 유지(로그인/퀴즈 톤)
    marginBottom: 16,
  },
  dividerLine: {
    height: 1,
    width: '92%',
    alignSelf: 'center',
    marginVertical: 16,
    borderRadius: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleBadge: {
    width: 8,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
});
