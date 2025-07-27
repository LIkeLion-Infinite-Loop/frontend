import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';

const MOCK_DATA: { [key: string]: any } = {
  '8801056241506': { 
    productName: '[캔류] 펩시콜라 제로슈거 라임향 335ml',
    image: require('../../assets/images/pepsi-can.png'), 
    steps: [
      '1. 내용물 비우기 및 헹구기',
      '2. 라벨 제거(있을 경우)',
      '3. 압착하여 부피를 줄인 후 분리 배출',
      '*유의사항: 캔의 이물질 제거',
    ],
  },

};

export default function ScanResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const productInfo = barcode ? MOCK_DATA[barcode] : null;

  if (!productInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: '정보 없음' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>'{barcode}'에 대한 상품 정보가 없습니다.</Text>
          <Button
            title="다시 스캔하기 (뒤로가기)"
            onPress={() => router.back()} 
            color="#00D16E"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: '스캔 결과', headerBackTitle: '뒤로' }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.productName}>{productInfo.productName}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={productInfo.image} style={styles.productImage} contentFit="contain" />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>분리수거 방법</Text>
          <View style={styles.divider} />
          {productInfo.steps.map((step: string, index: number) => (
            <Text key={index} style={styles.stepText}>{step}</Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f7' },
  container: { flex: 1 },
  header: {
    height: 200,
    backgroundColor: '#00D16E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: -40, 
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'white',
  },
  infoCard: {
    margin: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20, 
    fontSize: 16,
    color: 'gray',
  },
});