// types/navigation.d.ts
// 이 파일은 프로젝트의 루트 또는 src/types 폴더에 위치할 수 있습니다.

import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'; // 탭 네비게이터를 사용한다면 필요

// (auth) 그룹 내의 스크린들을 정의합니다.
// 이 타입은 (auth)/_layout.tsx에서 사용될 수 있습니다.
export type AuthGroupParamList = {
  changePassword: undefined;
  findId: undefined;
  login: undefined;
  resetPassword: undefined;
  setNewPassword: undefined;
  signup: undefined;
  success: undefined;
};

// (tabs) 그룹 내의 스크린들을 정의합니다.
// 이 타입은 (tabs)/_layout.tsx에서 사용될 수 있습니다.
export type TabsGroupParamList = {
  help: undefined;
  index: undefined; // 탭의 기본 스크린 (app/(tabs)/index.tsx)
  profile: undefined;
  scan: undefined;
  shop: undefined;
};

// RootStackParamList: 앱의 모든 최상위 스크린을 정의합니다.
// 그룹 라우트에는 'screen' 파라미터를 통해 내부 스크린으로 이동할 수 있음을 명시합니다.
export type RootStackParamList = {
  index: undefined; // app/index.tsx

  // ✅ (auth) 그룹으로 이동할 때, AuthGroupParamList 내의 스크린을 지정할 수 있도록 합니다.
  '(auth)': { screen: keyof AuthGroupParamList, params?: any } | undefined;

  // ✅ (tabs) 그룹으로 이동할 때, TabsGroupParamList 내의 스크린을 지정할 수 있도록 합니다.
  '(tabs)': { screen: keyof TabsGroupParamList, params?: any } | undefined;

  search: undefined; // app/search.tsx
  'scan-result/[barcode]': { barcode: string }; // app/scan-result/[barcode].tsx (매개변수 있음)
  '+not-found': undefined; // app/+not-found.tsx
  // 여기에 다른 최상위 라우트가 있다면 추가합니다.
};

// useNavigation 훅을 위한 타입 정의 (이전과 동일하며, RootStackParamList를 확장합니다.)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// 특정 스크린의 네비게이션 및 라우트 타입을 정의할 때 사용 (이전과 동일)
export type AppNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];

