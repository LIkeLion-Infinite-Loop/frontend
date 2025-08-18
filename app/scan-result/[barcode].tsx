import React, { useEffect, useState } from 'react'; // useState는 사용되지 않지만, 기존 코드에 있었으므로 유지
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // Image는 expo-image에서 가져옴
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Image } from 'expo-image'; // expo-image에서 Image 가져오기
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function ScanResultScreen() {
  const { barcode } = useLocalSearchParams();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme(); // useTheme 훅으로 isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 스타일 변수 정의
  const safeAreaBackgroundColor = isDarkMode ? '#121212' : '#f9fafb';
  const headerBackgroundColor = isDarkMode ? '#04c75a' : '#06D16E'; // 헤더 배경색 (다크 모드 시 약간 어둡게)
  const headerTintColor = isDarkMode ? '#E0E0E0' : '#fff'; // 헤더 텍스트/아이콘 색상
  const imageWrapperBackgroundColor = isDarkMode ? '#333333' : '#fff';
  const instructionBoxBackgroundColor = isDarkMode ? '#222222' : '#fff';
  const instructionHeaderBackgroundColor = isDarkMode ? '#333333' : '#e5e7eb';
  const instructionHeaderTextColor = isDarkMode ? '#E0E0E0' : '#111827';
  const instructionTextColor = isDarkMode ? '#E0E0E0' : '#374151';
  const notFoundTextColor = isDarkMode ? '#AAAAAA' : '#6b7280';
  const barcodeTextColor = isDarkMode ? '#888888' : '#9ca3af';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '[캔류] 펩시콜라 제로슈거 라임향 335ml', // 실제 제품 데이터로 대체하는 것이 좋음
      headerStyle: {
        backgroundColor: headerBackgroundColor,
      },
      headerTintColor: headerTintColor,
      headerTitleAlign: 'center',
    });
  }, [navigation, headerBackgroundColor, headerTintColor]); // 의존성 배열에 동적 변수 추가

  if (barcode !== '8801056241506') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackgroundColor }]}>
        <View style={styles.defaultContainer}>
          <Text style={[styles.notFoundText, { color: notFoundTextColor }]}>등록된 제품이 아닙니다.</Text>
          <Text style={[styles.barcodeText, { color: barcodeTextColor }]}>스캔한 바코드: {barcode}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackgroundColor }]}>
      {/* 초록색 배경은 다크 모드에서도 유지하거나, 필요에 따라 색상 변경 */}
      <View style={[styles.topGreenBackground, { backgroundColor: headerBackgroundColor }]} /> 

      <View style={[styles.imageWrapper, { backgroundColor: imageWrapperBackgroundColor, shadowColor: isDarkMode ? 'transparent' : '#000' }]}>
        <Image
          source={require('../../assets/images/pepsi-can.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={[styles.instructionBox, { backgroundColor: instructionBoxBackgroundColor }]} contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={[styles.instructionHeader, { backgroundColor: instructionHeaderBackgroundColor, color: instructionHeaderTextColor }]}>분리수거 방법</Text>
        <View style={styles.instructionContent}>
          {/* 줄바꿈을 포함한 텍스트 렌더링 방식 수정 */}
          <Text style={[styles.instructionText, { color: instructionTextColor }]}>
            1. 내용을 비우기 및 헹구기{'\n'}
            2. 라벨 제거 (있을 경우){'\n'}
            3. 압착하여 부피를 줄인 후 분리 배출{'\n'}
            *유의사항: 캔의 이물질 제거
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  topGreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: -1,
  },
  imageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginTop: -30,
    marginBottom: 50,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  instructionBox: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    flexGrow: 0,
  },
  instructionHeader: {
    paddingVertical: 14,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  instructionContent: {
    padding: 20,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10, // 이 부분은 텍스트가 여러 줄일 때 마지막 줄에만 적용되므로, 실제로는 텍스트가 길어지면 문제가 될 수 있음.
                       // 필요에 따라 각 줄을 별도의 <Text>로 감싸거나, FlatList를 사용하는 것을 고려.
  },
  defaultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  barcodeText: {
    fontSize: 14,
  },
});