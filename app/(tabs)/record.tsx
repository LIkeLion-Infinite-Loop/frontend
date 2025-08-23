import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

type Disposal = {
  history_id?: number; // 중복/undefined일 수 있음
  name: string;
  quantity: number;
  category: string;
  created_at: string;
  guide_page_url?: string;
  icon?: string;
  /** 로컬 유니크 키 */
  _uid: string;
};

const ICONS: Record<string, any> = {
  CAN: require("../../assets/images/canRe.png"),
  PLASTIC: require("../../assets/images/plaRe.png"),
  PAPER: require("../../assets/images/plaRe.png"), // 아이콘 있으면 교체
  ETC: require("../../assets/images/plaRe.png"),
};

const BANNER = require("../../assets/images/treeshop.png");

export default function RecordScreen() {
  const [items, setItems] = useState<Disposal[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // _uid로 관리

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/disposals");
        const list = (res.data?.items ?? []) as Omit<Disposal, "_uid">[];

        // 각 아이템에 안정적인 로컬 키 부여
        const withUid: Disposal[] = list.map((it, idx) => ({
          ...it,
          _uid: `${it.history_id ?? "na"}-${idx}-${it.name}-${it.created_at}`,
        }));

        setItems(withUid);
      } catch (e) {
        console.log("❌ 기록 불러오기 실패:", e);
        Alert.alert("불러오기 실패", "기록 목록을 가져오지 못했어요.");
      }
    })();
  }, []);

  const allSelected = useMemo(
    () => items.length > 0 && selected.size === items.length,
    [items, selected]
  );

  const toggleOne = (_uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(_uid)) next.delete(_uid);
      else next.add(_uid);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i._uid)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;

    const targetUids = Array.from(selected);
    // UI 낙관적 업데이트
    setItems((prev) => prev.filter((it) => !selected.has(it._uid)));
    setSelected(new Set());

    // 서버에 history_id 기반 삭제가 있다면 시도 (없으면 조용히 패스)
    try {
      await Promise.allSettled(
        items
          .filter((it) => targetUids.includes(it._uid))
          .map((it) =>
            it.history_id != null
              ? api.delete?.(`/api/disposals/${it.history_id}`)
              : Promise.resolve()
          )
      );
    } catch {}
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (!isNaN(d.getTime()))
      return d.toLocaleDateString("ko-KR").replace(/\s/g, "");
    const m = iso?.slice(0, 10)?.split("-") ?? [];
    if (m.length === 3) return `${m[0]}.${m[1]}.${m[2]}`;
    return "날짜 없음";
  };

  const renderItem = ({
    item,
  }: {
    item: Disposal;
    index: number;
  }) => {
    const checked = selected.has(item._uid);
    const iconSource =
      ICONS[item.category?.toUpperCase?.() || ""] ??
      ICONS[item.icon?.toUpperCase?.() || ""] ??
      ICONS["PLASTIC"];

    return (
      <TouchableOpacity
        onPress={() => toggleOne(item._uid)}
        activeOpacity={0.8}
        style={styles.rowTouch}
      >
        <View style={styles.row}>
          <View style={styles.leftIconWrap}>
            <Image source={iconSource} style={styles.recycleIcon} contentFit="contain" />
            <Text style={styles.iconLabel}>
              {item.category?.toUpperCase?.() ?? "ETC"}
            </Text>
          </View>

          <View style={styles.midTexts}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
          </View>

          <View style={styles.rightCheck}>
            <MaterialCommunityIcons
              name={checked ? "check-circle" : "circle-outline"}
              size={26}
              color={checked ? "#06D16E" : "#D8D8D8"}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>이전 분리수거 항목</Text>
      <View style={styles.titleDivider} />

      <FlatList
        data={items}
        keyExtractor={(it) => it._uid} // 고유 로컬 키
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={toggleAll} style={styles.actionBtn}>
          <Text style={styles.actionText}>전체 선택</Text>
          <View style={styles.actionUnderline} />
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteSelected} style={styles.actionBtn}>
          <Text style={styles.actionText}>선택 삭제</Text>
          <View style={styles.actionUnderline} />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerWrap}>
        <Image source={BANNER} style={styles.bannerImg} contentFit="cover" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7F9",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
    paddingLeft: 2,
  },
  titleDivider: {
    height: 2,
    backgroundColor: "#06D16E",
    opacity: 0.9,
    borderRadius: 2,
    marginBottom: 12,
  },
  listContent: { paddingTop: 8, paddingBottom: 20 },
  rowTouch: { borderRadius: 18, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  leftIconWrap: { width: 60, alignItems: "center", marginRight: 10 },
  recycleIcon: { width: 40, height: 40, marginBottom: 4 },
  iconLabel: { fontSize: 11, color: "#11A560", fontWeight: "800" },
  midTexts: { flex: 1, paddingRight: 10 },
  itemName: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 4 },
  itemDate: { fontSize: 15, color: "#2C2C2C", opacity: 0.8 },
  rightCheck: { width: 32, alignItems: "flex-end", justifyContent: "center" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionBtn: { alignItems: "center", minWidth: 120 },
  actionText: { fontSize: 18, fontWeight: "800", color: "#222", marginBottom: 6 },
  actionUnderline: { width: 86, height: 2, backgroundColor: "#E6EAEF" },
  bannerWrap: { marginTop: 8, marginBottom: 20 },
  bannerImg: { width: "100%", height: 120, borderRadius: 20 },
});