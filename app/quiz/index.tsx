// app/(tabs)/index.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

let treeImg: any;
try { treeImg = require("../../assets/images/tree_logo.png"); } catch {}

export default function HomeTab() {
  return (
    <SafeAreaView style={st.safe}>
      <View style={st.heroWrap}>
        {treeImg ? (
          <Image source={treeImg} style={st.hero} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 64 }}>🌳</Text>
        )}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={st.title}>환영합니다!</Text>
        <Text style={st.sub}>아래 버튼을 눌러 오늘의 퀴즈에 도전하세요.</Text>

        <TouchableOpacity
          style={st.primaryBtn}
          onPress={() => router.push("/(tabs)/quiz")}
        >
          <Text style={st.primaryBtnText}>퀴즈 풀기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  heroWrap: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  hero: { width: 160, height: 160 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6, color: "#111827" },
  sub: { color: "#6b7280", marginBottom: 16 },
  primaryBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});