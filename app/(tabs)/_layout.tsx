import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,   // 탭 내에서 헤더를 숨김
      }}
    />
  );
}
