import { Image } from 'expo-image';
import React, { memo } from 'react';
import {
  StyleSheet as RNStyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  View,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// (선택) expo-blur / expo-linear-gradient가 있으면 자동 사용
let BlurView: any = null;
let LinearGradient: any = null;
try { BlurView = require('expo-blur').BlurView; } catch {}
try { LinearGradient = require('expo-linear-gradient').LinearGradient; } catch {}

interface CategoryItemProps {
  name: string;
  koreanName: string;
  icon: any;               // require(...) 또는 { uri: ... }
  onPress: (categoryName: string) => void;
  style?: ViewStyle;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  name,
  koreanName,
  icon,
  onPress,
  style,
}) => {
  const { isDarkMode } = useTheme();

  // 배경은 전체 회색(#F3F4F6) 톤에 맞추고, 카드는 유리처럼 반투명
  const GLASS_BG   = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.22)';
  const BORDER_COL = isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.35)';
  const LABEL_COL  = isDarkMode ? '#E6E6E6' : '#111827';

  // 인터랙션(유리 눌림 느낌: 살짝 들어가게)
  const scale = useSharedValue(1);
  const press = useSharedValue(0);

  const onPressIn  = () => { scale.value = withTiming(0.98, { duration: 120 }); press.value = withTiming(1, { duration: 120 }); };
  const onPressOut = () => { scale.value = withTiming(1,    { duration: 150 }); press.value = withTiming(0, { duration: 150 }); };

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    // iOS shadow 강도/Android elevation을 살짝 조절
    shadowOpacity: 0.08 + press.value * 0.02,
    elevation: 5 + press.value * 1,
  }));

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress(name)}
      activeOpacity={0.92}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Animated.View style={[styles.shadowWrap, style, anim]}>
        {/* 유리 카드 */}
        {BlurView ? (
          <BlurView
            intensity={isDarkMode ? 30 : 45}
            tint={isDarkMode ? 'dark' : 'light'}
            style={[styles.card, { backgroundColor: GLASS_BG }]}
          >
            <GlassDecor BORDER_COL={BORDER_COL} isDarkMode={isDarkMode} />
            <Image source={icon} style={styles.icon} contentFit="contain" />
            <Text style={[styles.name, { color: LABEL_COL }]} numberOfLines={1}>
              {koreanName || name}
            </Text>
          </BlurView>
        ) : (
          <View style={[styles.card, { backgroundColor: GLASS_BG }]}>
            <GlassDecor BORDER_COL={BORDER_COL} isDarkMode={isDarkMode} />
            <Image source={icon} style={styles.icon} contentFit="contain" />
            <Text style={[styles.name, { color: LABEL_COL }]} numberOfLines={1}>
              {koreanName || name}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

/** 유리 느낌을 위한 장식(헤어라인 보더 + 상단 하이라이트) */
function GlassDecor({
  BORDER_COL,
  isDarkMode,
}: {
  BORDER_COL: string;
  isDarkMode: boolean;
}) {
  return (
    <>
      {/* 헤어라인(유리 가장자리) */}
      <View
        pointerEvents="none"
        style={[
          RNStyleSheet.absoluteFillObject,
          { borderRadius: 18, borderWidth: 1, borderColor: BORDER_COL },
        ]}
      />

      {/* 상단 하이라이트(유리 광택) */}
      {LinearGradient ? (
        <LinearGradient
          colors={
            isDarkMode
              ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)', 'transparent']
              : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.18)', 'transparent']
          }
          start={{ x: 0.15, y: 0.0 }}
          end={{ x: 0.85, y: 0.9 }}
          pointerEvents="none"
          style={styles.shine}
        />
      ) : (
        <View
          pointerEvents="none"
          style={[styles.shine, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
        />
      )}
    </>
  );
}

const styles = RNStyleSheet.create({
  shadowWrap: {
    // 그림자(카드 외곽) — iOS/Android 공통
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 18,
    overflow: 'hidden', // 유리 내용 잘림 방지
  },
  card: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    padding: 8,
  },
  icon: {
    width: '70%',
    height: '70%',
    marginBottom: 8,
  },
  name: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'NotoSansKRBold',
  },
  shine: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    height: '55%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.9,
  },
});

export default memo(CategoryItem);
