// app/(tabs)/profile.tsx
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type PlanKey = 'free' | 'basic' | 'premium';

export default function ProfileScreen() {
  const { isDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  // 현재 구독 (예: 서버/스토리지 연동 가능)
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free');

  // 모달: 설정 / 요금제
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [plansVisible, setPlansVisible] = useState(false);

  // bottom sheet 애니메이션 (두 모달 공유)
  const sheetY = useRef(new Animated.Value(300)).current;
  const openSheet = useCallback(() => {
    sheetY.setValue(300);
    Animated.timing(sheetY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [sheetY]);
  const closeSheet = useCallback((after?: () => void) => {
    Animated.timing(sheetY, { toValue: 300, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      after && finished && after();
    });
  }, [sheetY]);

  // 컬러 팔레트
  const C = useMemo(() => ({
    bg: isDarkMode ? '#121212' : '#F3F4F6',
    surface: isDarkMode ? '#1F1F1F' : '#FFFFFF',
    text: isDarkMode ? '#E5E7EB' : '#111827',
    subText: isDarkMode ? '#9CA3AF' : '#6B7280',
    divider: isDarkMode ? '#262626' : '#E5E7EB',
    green: '#06D16E',
    icon: isDarkMode ? '#E5E7EB' : undefined,
    overlay: 'rgba(0,0,0,0.35)',
    border: isDarkMode ? '#2A2A2A' : '#E5E7EB',
    sheetBg: isDarkMode ? '#1F1F1F' : '#FFFFFF',
    pillBg: isDarkMode ? '#0F172A' : '#F8FAFC',
  }), [isDarkMode]);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userInfo']);
      Alert.alert('로그아웃 되었습니다.');
      router.replace('/login');
    } catch (e) {
      console.error(e);
      Alert.alert('⚠️ 로그아웃 실패', '잠시 후 다시 시도해주세요.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userInfo');
        if (stored) {
          const p = JSON.parse(stored);
          setUserInfo({ name: p?.name || '', email: p?.email || '' });
        }
      } catch (e) {
        console.log('유저 정보를 불러오지 못했습니다:', e);
      }
    })();
  }, []);

  // 현재 구독 배지/문구
  const currentPlanBadge = useMemo(() => {
    switch (currentPlan) {
      case 'basic': return { label: '베이직', color: '#2563EB' };
      case 'premium': return { label: '프리미엄', color: '#8B5CF6' };
      default: return { label: '무료', color: C.green };
    }
  }, [currentPlan, C.green]);

  // 요금제 정의
  const PLANS: Array<{
    key: PlanKey;
    title: string;
    price: string;
    features: string[];
    cta: string;
  }> = [
    {
      key: 'free',
      title: '무료',
      price: '₩0 /월',
      features: ['기본 검색', '분리배출 가이드 열람', '기록 30개 저장'],
      cta: '무료 이용 중',
    },
    {
      key: 'basic',
      title: '베이직',
      price: '₩2,900 /월',
      features: ['광고 제거', '기록 무제한', '카테고리 통계(최근 30일)'],
      cta: '베이직으로 전환',
    },
    {
      key: 'premium',
      title: '프리미엄',
      price: '₩5,900 /월',
      features: ['고급 통계 & 인사이트', '퀴즈 포인트 부스트', '우선 지원'],
      cta: '프리미엄으로 전환',
    },
  ];

  // 요금제 카드
  const PlanCard = ({ plan }: { plan: typeof PLANS[number] }) => {
    const active = plan.key === currentPlan;
    return (
      <View style={[styles.planCard, { backgroundColor: C.surface, borderColor: active ? currentPlanBadge.color : C.border }]}>
        <View style={styles.planHeaderRow}>
          <Text style={[styles.planTitle, { color: C.text }]}>{plan.title}</Text>
          {active && (
            <View style={[styles.badge, { backgroundColor: currentPlanBadge.color }]}>
              <Text style={styles.badgeText}>현재</Text>
            </View>
          )}
        </View>
        <Text style={[styles.planPrice, { color: C.text }]}>{plan.price}</Text>
        <View style={styles.features}>
          {plan.features.map((f, i) => (
            <View key={i} style={[styles.featurePill, { backgroundColor: C.pillBg, borderColor: C.border }]}>
              <Text style={[styles.featureText, { color: C.subText }]}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          disabled={active}
          onPress={() => {
            setCurrentPlan(plan.key);
            Alert.alert('구독 변경', `${plan.title} 요금제로 설정되었습니다.`);
          }}
          style={[
            styles.planCTA,
            { backgroundColor: active ? '#9CA3AF' : '#111827' },
          ]}
        >
          <Text style={styles.planCTAText}>{active ? '이용 중' : plan.cta}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: C.text }]}>마이페이지</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={handleLogout}>
              <Image source={require('../../assets/images/logout.png')} style={[styles.icon, { tintColor: C.icon }]} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(true);
                // 애니메이션은 Modal onShow에서 시작
              }}
            >
              <Image source={require('../../assets/images/set.png')} style={[styles.icon, { tintColor: C.icon }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 프로필 */}
        <View style={styles.profileRow}>
          <Image source={require('../../assets/images/my.png')} style={styles.profileImg} />
          <View>
            <Text style={[styles.name, { color: C.text }]}>{userInfo.name || '사용자'}</Text>
            <Text style={[styles.email, { color: C.subText }]}>{userInfo.email || '-'}</Text>
          </View>
        </View>

        {/* 현재 구독 카드 (누르면 요금제 모달) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPlansVisible(true)}
          style={[styles.currentPlanCard, { backgroundColor: C.surface, borderColor: C.border }]}
        >
          <View style={styles.currentPlanLeft}>
            <Text style={[styles.currentPlanLabel, { color: C.subText }]}>현재 구독</Text>
            <Text style={[styles.currentPlanName, { color: C.text }]}>{currentPlanBadge.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: currentPlanBadge.color }]}>
            <Text style={styles.badgeText}>변경</Text>
          </View>
        </TouchableOpacity>

        {/* 버전 정보 카드 (하단) */}
        <View style={[styles.versionCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Image source={require('../../assets/images/ver.png')} style={[styles.verIcon, { tintColor: C.subText }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.versionTitle, { color: C.subText }]}>버전 정보</Text>
            <Text style={[styles.versionValue, { color: C.text }]}>v2.293.0</Text>
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* ===== 설정 모달 ===== */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="none"
        onShow={openSheet}
        onRequestClose={() => closeSheet(() => setSettingsVisible(false))}
      >
        {/* 고정 오버레이 (배경은 따라 움직이지 않음) */}
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: C.overlay }]}
          onPress={() => closeSheet(() => setSettingsVisible(false))}
        />
        {/* 바텀 시트 */}
        <Animated.View style={[styles.modalSheet, { backgroundColor: C.sheetBg, borderColor: C.border, transform: [{ translateY: sheetY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: C.text }]}>설정</Text>
          <TouchableOpacity
            style={[styles.sheetBtn, { borderColor: C.border }]}
            onPress={() => {
              closeSheet(() => setSettingsVisible(false));
              router.push('/(auth)/changePassword');
            }}
          >
            <Text style={[styles.sheetBtnText, { color: C.text }]}>비밀번호 재설정</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetBtn, { borderColor: C.border }]}
            onPress={() => {
              closeSheet(() => setSettingsVisible(false));
              Alert.alert('문의', 'support@example.com 으로 연락주세요.');
            }}
          >
            <Text style={[styles.sheetBtnText, { color: C.text }]}>문의하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sheetClose, { backgroundColor: '#111827' }]}
            onPress={() => closeSheet(() => setSettingsVisible(false))}
          >
            <Text style={styles.sheetCloseText}>닫기</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* ===== 요금제 모달 ===== */}
      <Modal
        visible={plansVisible}
        transparent
        animationType="none"
        onShow={openSheet}
        onRequestClose={() => closeSheet(() => setPlansVisible(false))}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: C.overlay }]}
          onPress={() => closeSheet(() => setPlansVisible(false))}
        />
        <Animated.View style={[styles.modalSheet, { backgroundColor: C.sheetBg, borderColor: C.border, transform: [{ translateY: sheetY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: C.text }]}>요금제 선택</Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {PLANS.map((p) => (
              <PlanCard key={p.key} plan={p} />
            ))}

            <TouchableOpacity
              style={[styles.sheetClose, { backgroundColor: '#111827', marginTop: 4 }]}
              onPress={() => closeSheet(() => setPlansVisible(false))}
            >
              <Text style={styles.sheetCloseText}>닫기</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  iconRow: { flexDirection: 'row', gap: 12 },
  icon: { width: 24, height: 24, resizeMode: 'contain' },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 24, marginBottom: 8 },
  profileImg: { width: 52, height: 52, resizeMode: 'contain' },
  name: { fontSize: 17, fontWeight: '800' },
  email: { fontSize: 13 },

  currentPlanCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentPlanLeft: { gap: 4 },
  currentPlanLabel: { fontSize: 12, fontWeight: '700', opacity: 0.9 },
  currentPlanName: { fontSize: 18, fontWeight: '800' },

  badge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  versionCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verIcon: { width: 18, height: 18, resizeMode: 'contain' },
  versionTitle: { fontSize: 12, fontWeight: '700' },
  versionValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },

  // ===== 모달 공통 =====
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,           // ✅ 모바일 고려 상단 여백
    paddingHorizontal: 16,
    paddingBottom: 14,        // ✅ 하단 여백
    borderTopWidth: 1,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#9CA3AF',
    alignSelf: 'center', marginBottom: 10, opacity: 0.6,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },

  sheetBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  sheetBtnText: { fontSize: 15, fontWeight: '700' },

  sheetClose: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetCloseText: { color: '#fff', fontWeight: '800' },

  // ===== 요금제 카드 =====
  planCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  planHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planTitle: { fontSize: 16, fontWeight: '800' },
  planPrice: { fontSize: 14, fontWeight: '700', marginTop: 6, opacity: 0.9 },

  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  featurePill: {
    borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10,
  },
  featureText: { fontSize: 12, fontWeight: '700' },

  planCTA: {
    marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  planCTAText: { color: '#fff', fontWeight: '800' },
});