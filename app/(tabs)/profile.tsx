import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppNavigationProp } from '../../types/navigation.d';

export default function ProfileScreen() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  const navigation = useNavigation<AppNavigationProp>();

  // ✅ 로그아웃 함수
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userInfo');
      Alert.alert('로그아웃 되었습니다.');
      router.replace('/login'); // 뒤로가기 방지
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.icons}>
          {/* ✅ 로그아웃 버튼 */}
          <TouchableOpacity onPress={handleLogout}>
            <Image source={require('../../assets/images/logout.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsPopupVisible(!isPopupVisible)}>
            <Image source={require('../../assets/images/set.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {isPopupVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setIsPopupVisible(false)}
          style={styles.popupOverlay}
        >
          <View style={styles.popup}>
            <TouchableOpacity
              style={styles.popupItem}
              onPress={() => {
                setIsPopupVisible(false);
                navigation.navigate('(auth)', { screen: 'changePassword' });
              }}
            >
              <Text style={styles.popupText}>비밀번호 재설정</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.profileSection}>
        <Image source={require('../../assets/images/my.png')} style={styles.profileImage} />
        <View>
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
        </View>
      </View>

      <View style={styles.pointBox}>
        <Text style={styles.pointText}>P</Text>
        <Text style={styles.pointValue}>15원</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>적립내역</Text>
        <Text style={styles.sectionContent}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
        <Text style={styles.sectionContent}>광고 시청 - 5P</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>검색내역</Text>
        <Text style={styles.sectionContent}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>분리배출 활동내역</Text>
        <Text style={styles.sectionContent}>캔류, 플라스틱, 유리</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>도움말</Text>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/per.png')} style={styles.helpIcon} />
          <Text style={styles.helpText}>개인정보 처리방침</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/ser.png')} style={styles.helpIcon} />
          <Text style={styles.helpText}>서비스 이용약관</Text>
        </TouchableOpacity>
        <View style={styles.helpItem}>
          <Image source={require('../../assets/images/ver.png')} style={styles.helpIcon} />
          <Text style={[styles.helpText, { color: '#B0B0B0' }]}>버전 정보 v2.293.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  email: { fontSize: 14, color: '#555' },
  pointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 16,
  },
  pointText: { color: '#05D16E', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
  pointValue: { fontSize: 16 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#999', fontSize: 14, marginBottom: 4 },
  sectionContent: { fontSize: 14, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 24 },
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
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupItem: { paddingVertical: 6 },
  popupText: { fontSize: 14, color: '#333' },
});