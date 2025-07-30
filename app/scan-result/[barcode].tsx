import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function ScanResultScreen() {
  const { barcode } = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '[캔류] 펩시콜라 제로슈거 라임향 335ml',
      headerStyle: {
        backgroundColor: '#06D16E',
      },
      headerTintColor: '#fff',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  if (barcode !== '8801056241506') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.defaultContainer}>
          <Text style={styles.notFoundText}>등록된 제품이 아닙니다.</Text>
          <Text style={styles.barcodeText}>스캔한 바코드: {barcode}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topGreenBackground} />

      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/images/pepsi-can.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.instructionBox} contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.instructionHeader}>분리수거 방법</Text>
        <View style={styles.instructionContent}>
          <Text style={styles.instructionText}>1. 내용을 비우기 및 헹구기</Text>
          <Text style={styles.instructionText}>2. 라벨 제거 (있을 경우)</Text>
          <Text style={styles.instructionText}>
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
    backgroundColor: '#f9fafb', // 기본 배경색
    position: 'relative',        // 절대 위치 요소 위한 기준
  },
  topGreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,               // 이미지 반쯤 덮을 높이
    backgroundColor: '#06D16E',
    zIndex: -1,
  },
  imageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: -30,
    marginBottom: 50,
    elevation: 8,
    shadowColor: '#000',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    flexGrow: 0,

  },
  instructionHeader: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  instructionContent: {
    padding: 20,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 10,
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
    color: '#6b7280',
    marginBottom: 10,
  },
  barcodeText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
