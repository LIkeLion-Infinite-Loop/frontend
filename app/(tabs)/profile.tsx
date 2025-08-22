import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppNavigationProp } from '../../types/navigation.d';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function ProfileScreen() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  const navigation = useNavigation<AppNavigationProp>();

  // ✅ 로그아웃 함수
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userInfo');
      Alert.alert('로그아웃 되었습니다.');
      router.replace('/login');
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

  // 다크 모드에 따른 동적 스타일 변수
  const containerBackgroundColor = isDarkMode ? '#121212' : '#fff';
  const headerTitleColor = isDarkMode ? '#E0E0E0' : '#000';
  const iconTintColor = isDarkMode ? '#E0E0E0' : undefined; // 다크 모드 아이콘 색상
  const nameColor = isDarkMode ? '#E0E0E0' : '#000';
  const emailColor = isDarkMode ? '#BBBBBB' : '#555';
  const pointBoxBackgroundColor = isDarkMode ? '#1E1E1E' : '#F2F2F2';
  const pointTextColor = isDarkMode ? '#04c75a' : '#05D16E';
  const pointValueColor = isDarkMode ? '#E0E0E0' : '#000';
  const sectionTitleColor = isDarkMode ? '#BBBBBB' : '#999';
  const sectionContentColor = isDarkMode ? '#E0E0E0' : '#000';
  const dividerColor = isDarkMode ? '#282828' : '#eee';
  const helpTextColor = isDarkMode ? '#E0E0E0' : '#000';
  const helpTextDisabledColor = isDarkMode ? '#666666' : '#B0B0B0';
  const popupBackgroundColor = isDarkMode ? '#282828' : 'white';
  const popupTextColor = isDarkMode ? '#E0E0E0' : '#333';
  const popupShadowColor = isDarkMode ? '#000' : '#000';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: headerTitleColor }]}>마이페이지</Text>
        <View style={styles.icons}>
          {/* ✅ 로그아웃 버튼 */}
          <TouchableOpacity onPress={handleLogout}>
            <Image 
              source={require('../../assets/images/logout.png')} 
              style={[styles.icon, { tintColor: iconTintColor }]} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsPopupVisible(!isPopupVisible)}>
            <Image 
              source={require('../../assets/images/set.png')} 
              style={[styles.icon, { tintColor: iconTintColor }]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isPopupVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setIsPopupVisible(false)}
          style={styles.popupOverlay}
        >
          <View style={[styles.popup, { backgroundColor: popupBackgroundColor, shadowColor: popupShadowColor }]}>
            <TouchableOpacity
              style={styles.popupItem}
              onPress={() => {
                setIsPopupVisible(false);
                router.push('/(auth)/changePassword');
              }}
            >
              <Text style={[styles.popupText, { color: popupTextColor }]}>비밀번호 재설정</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.profileSection}>
        <Image source={require('../../assets/images/my.png')} style={styles.profileImage} />
        <View>
          <Text style={[styles.name, { color: nameColor }]}>{userInfo.name}</Text>
          <Text style={[styles.email, { color: emailColor }]}>{userInfo.email}</Text>
        </View>
      </View>

      <View style={[styles.pointBox, { backgroundColor: pointBoxBackgroundColor }]}>
        <Text style={[styles.pointText, { color: pointTextColor }]}>P</Text>
        <Text style={[styles.pointValue, { color: pointValueColor }]}>15원</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>적립내역</Text>
        <Text style={[styles.sectionContent, { color: sectionContentColor }]}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
        <Text style={[styles.sectionContent, { color: sectionContentColor }]}>광고 시청 - 5P</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>검색내역</Text>
        <Text style={[styles.sectionContent, { color: sectionContentColor }]}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>분리배출 활동내역</Text>
        <Text style={[styles.sectionContent, { color: sectionContentColor }]}>캔류, 플라스틱, 유리</Text>
      </View>

      <View style={[styles.divider, { borderTopColor: dividerColor }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>도움말</Text>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/per.png')} style={[styles.helpIcon, { tintColor: iconTintColor }]} />
          <Text style={[styles.helpText, { color: helpTextColor }]}>개인정보 처리방침</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/ser.png')} style={[styles.helpIcon, { tintColor: iconTintColor }]} />
          <Text style={[styles.helpText, { color: helpTextColor }]}>서비스 이용약관</Text>
        </TouchableOpacity>
        <View style={styles.helpItem}>
          <Image source={require('../../assets/images/ver.png')} style={[styles.helpIcon, { tintColor: helpTextDisabledColor }]} />
          <Text style={[styles.helpText, { color: helpTextDisabledColor }]}>버전 정보 v2.293.0</Text>
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
  popupOverlay: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 999,
  },
  popup: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupItem: { paddingVertical: 6 },
  popupText: { fontSize: 14 },
});