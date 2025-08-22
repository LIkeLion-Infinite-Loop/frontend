import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기
import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';

export default function ShopDetailScreen() {
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // isDarkMode 상태가 변경될 때마다 헤더 스타일을 다시 설정하도록 의존성 배열에 추가
  useLayoutEffect(() => {
    const headerBackgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
    const headerTintColor = isDarkMode ? '#E0E0E0' : '#000000';

    navigation.setOptions({
      headerStyle: {
        backgroundColor: headerBackgroundColor,
      },
      headerTintColor: headerTintColor,
      headerTitle: '기부 상세',
    });
  }, [navigation, isDarkMode]);

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
  const donateButtonBackgroundColor = isDarkMode ? '#04c75a' : '#06D16E';

  // 화면 너비에 따라 동적으로 폰트 크기 및 여백 계산
  const baseFontSize = width > 500 ? 16 : 14;
  const titleFontSize = width > 500 ? 24 : 18;
  const highlightFontSize = width > 500 ? 24 : 18;
  const amountFontSize = width > 500 ? 30 : 22;
  const unitFontSize = width > 500 ? 18 : 16;
  const donateButtonFontSize = width > 500 ? 20 : 16;
  const paddingHorizontal = width * 0.05;

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Image
        source={require('../assets/images/treeshop.png')}
        style={[styles.image, { height: height * 0.35 }]}
      />

      <View style={[styles.content, { paddingHorizontal: paddingHorizontal }]}>
        <Text style={[styles.title, { color: titleColor, fontSize: titleFontSize }]}>자연을 위한 한 걸음, 지속 가능한 지구 만들기</Text>
        <Text style={[styles.description, { color: descriptionColor, fontSize: baseFontSize }]}>
          우리가 공존할 수 있는 지구를 만들기 위해 나무심기에 동참해주세요.
          {'\n'}기부금은 모두 산림 재생을 위한 나무심기에 사용됩니다.
        </Text>

        <View style={styles.statsContainer}>
          <Text style={[styles.participants, { color: descriptionColor, fontSize: baseFontSize }]}>
            <Text style={[styles.highlight, { fontSize: highlightFontSize }]}>209</Text>명 참여
          </Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: amountColor, fontSize: amountFontSize }]}>26,574,000</Text>
            <Text style={[styles.unit, { color: unitColor, fontSize: unitFontSize }]}>원 달성</Text>
            <View style={[styles.progressBadge, { backgroundColor: progressBadgeBackgroundColor }]}>
              <Text style={[styles.progressText, { color: progressTextColor, fontSize: baseFontSize * 0.85 }]}>5,314% 달성</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <TouchableOpacity style={[styles.donateButton, { backgroundColor: donateButtonBackgroundColor }]} onPress={handleDonate}>
          <Text style={[styles.donateButtonText, { fontSize: donateButtonFontSize }]}>기부하기</Text>
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
    resizeMode: 'cover',
  },
  content: {
    paddingVertical: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 20,
  },
  participants: {
    marginBottom: 12,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#06D16E',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold',
    marginRight: 6,
  },
  unit: {
    marginRight: 8,
  },
  progressBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressText: {},
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
    color: '#fff',
    fontWeight: 'bold',
  },
});