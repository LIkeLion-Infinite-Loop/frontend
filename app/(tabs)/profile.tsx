import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AppNavigationProp } from '../../types/navigation.d';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();

  // ✅ 색상 팔레트(레이아웃 변경 없음, 색만 통일)
  const C = {
    bg: isDarkMode ? '#121212' : '#F3F4F6',
    surface: isDarkMode ? '#1F1F1F' : '#FFFFFF',
    text: isDarkMode ? '#E5E7EB' : '#111827',
    subText: isDarkMode ? '#9CA3AF' : '#6B7280',
    divider: isDarkMode ? '#262626' : '#E5E7EB',
    green: '#06D16E',
    icon: isDarkMode ? '#E5E7EB' : undefined,
    helpDisabled: isDarkMode ? '#6B7280' : '#B0B0B0',
    popupBg: isDarkMode ? '#1F1F1F' : '#FFFFFF',
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userInfo');
      Alert.alert('로그아웃 되었습니다.');
      router.replace('/login'); // ➜ 경로는 기존 그대로 유지(색상만 통일 요청)
    } catch (error) {
      console.error('로그아웃 오류:', error);
      Alert.alert('⚠️ 로그아웃 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserInfo({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
          });
        }
      } catch (error) {
        console.log('유저 정보를 불러오지 못했습니다:', error);
      }
    };
    loadUserInfo();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 (색상만 통일) */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.text }]}>마이페이지</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={handleLogout}>
            <Image
              source={require('../../assets/images/logout.png')}
              style={[styles.icon, { tintColor: C.icon }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsPopupVisible(!isPopupVisible)}>
            <Image
              source={require('../../assets/images/set.png')}
              style={[styles.icon, { tintColor: C.icon }]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 팝업 (색상만 교체) */}
      {isPopupVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setIsPopupVisible(false)}
          style={styles.popupOverlay}
        >
          <View style={[styles.popup, { backgroundColor: C.popupBg }]}>
            <TouchableOpacity
              style={styles.popupItem}
              onPress={() => {
                setIsPopupVisible(false);
                router.push('/(auth)/changePassword');
              }}
            >
              <Text style={[styles.popupText, { color: C.text }]}>비밀번호 재설정</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* 프로필 섹션 (레이아웃 그대로, 색만) */}
      <View style={styles.profileSection}>
        <Image source={require('../../assets/images/my.png')} style={styles.profileImage} />
        <View>
          <Text style={[styles.name, { color: C.text }]}>{userInfo.name}</Text>
          <Text style={[styles.email, { color: C.subText }]}>{userInfo.email}</Text>
        </View>
      </View>

      {/* 포인트 박스(배경/텍스트 색 통일) */}
      <View style={[styles.pointBox, { backgroundColor: C.surface }]}>
        <Text style={[styles.pointText, { color: C.green }]}>P</Text>
        <Text style={[styles.pointValue, { color: C.text }]}>15원</Text>
      </View>

      {/* 섹션들 (색만 통일) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.subText }]}>적립내역</Text>
        <Text style={[styles.sectionContent, { color: C.text }]}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
        <Text style={[styles.sectionContent, { color: C.text }]}>광고 시청 - 5P</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.subText }]}>검색내역</Text>
        <Text style={[styles.sectionContent, { color: C.text }]}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.subText }]}>분리배출 활동내역</Text>
        <Text style={[styles.sectionContent, { color: C.text }]}>캔류, 플라스틱, 유리</Text>
      </View>

      {/* 구분선 색만 바꿈 */}
      <View style={[styles.divider, { borderTopColor: C.divider }]} />

      {/* 도움말 (색만 통일) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.subText }]}>도움말</Text>
        <TouchableOpacity style={styles.helpItem}>
          <Image
            source={require('../../assets/images/per.png')}
            style={[styles.helpIcon, { tintColor: C.icon }]}
          />
          <Text style={[styles.helpText, { color: C.text }]}>개인정보 처리방침</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpItem}>
          <Image
            source={require('../../assets/images/ser.png')}
            style={[styles.helpIcon, { tintColor: C.icon }]}
          />
          <Text style={[styles.helpText, { color: C.text }]}>서비스 이용약관</Text>
        </TouchableOpacity>
        <View style={styles.helpItem}>
          <Image
            source={require('../../assets/images/ver.png')}
            style={[styles.helpIcon, { tintColor: C.helpDisabled }]}
          />
          <Text style={[styles.helpText, { color: C.helpDisabled }]}>버전 정보 v2.293.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  icons: { flexDirection: 'row', gap: 12 },
  icon: { width: 24, height: 24, resizeMode: 'contain' },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  profileImage: { width: 48, height: 48, resizeMode: 'contain' },
  name: { fontWeight: 'bold', fontSize: 16 },
  email: { fontSize: 14 },

  pointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    borderRadius: 8,
    padding: 16,
  },
  pointText: { fontWeight: 'bold', fontSize: 16, marginRight: 8 },
  pointValue: { fontSize: 16 },

  section: { marginTop: 24 },
  sectionTitle: { fontSize: 14, marginBottom: 4 },
  sectionContent: { fontSize: 14, marginBottom: 4 },

  divider: { borderTopWidth: 1, marginTop: 24 },

  helpItem: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  helpIcon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  helpText: { fontSize: 14 },

  // 팝업 레이어/카드 (위치/레이아웃 동일, 색만 위에서 바인딩)
  popupOverlay: {
    position: 'absolute',
    top: 60,
    right: 24,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  popup: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    // 기존 그림자 유지
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupItem: { paddingVertical: 6 },
  popupText: { fontSize: 14 },
});
