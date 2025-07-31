import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function ShopDetailScreen() {
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  const handleDonate = () => {
    Alert.alert('기부되었습니다.');
  };

  // 다크 모드에 따른 동적 스타일 변수 정의
  const containerBackgroundColor = isDarkMode ? '#121212' : '#fff';
  const titleColor = isDarkMode ? '#E0E0E0' : '#000';
  const descriptionColor = isDarkMode ? '#AAAAAA' : '#444';
  const amountColor = isDarkMode ? '#E0E0E0' : '#000';
  const unitColor = isDarkMode ? '#E0E0E0' : '#000';
  const progressBadgeBackgroundColor = isDarkMode ? '#333333' : '#eee';
  const progressTextColor = isDarkMode ? '#CCCCCC' : '#444';
  const dividerColor = isDarkMode ? '#444444' : '#E0E0E0';
  const donateButtonBackgroundColor = isDarkMode ? '#04c75a' : '#06D16E'; // 다크 모드 시 약간 어둡게

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Image
        source={require('../assets/images/treeshop.png')}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>자연을 위한 한 걸음, 지속 가능한 지구 만들기</Text>
        <Text style={[styles.description, { color: descriptionColor }]}>
          우리가 공존할 수 있는 지구를 만들기 위해 나무심기에 동참해주세요.
          {'\n'}기부금은 모두 산림 재생을 위한 나무심기에 사용됩니다.
        </Text>

        <View style={styles.statsContainer}>
          <Text style={[styles.participants, { color: descriptionColor }]}>
            <Text style={styles.highlight}>209</Text>명 참여
          </Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: amountColor }]}>26,574,000</Text>
            <Text style={[styles.unit, { color: unitColor }]}>원 달성</Text>
            <View style={[styles.progressBadge, { backgroundColor: progressBadgeBackgroundColor }]}>
              <Text style={[styles.progressText, { color: progressTextColor }]}>5,314% 달성</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <TouchableOpacity style={[styles.donateButton, { backgroundColor: donateButtonBackgroundColor }]} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>기부하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 20,
  },
  participants: {
    fontSize: 16,
    marginBottom: 12,
  },
  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06D16E',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 6,
  },
  unit: {
    fontSize: 16,
    marginRight: 8,
  },
  progressBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  donateButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});