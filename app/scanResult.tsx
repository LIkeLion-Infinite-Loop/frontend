import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

type ApiItem = {
  item_id: number;
  name: string;
  quantity: number;
  category: string; // "CAN" | "PLASTIC" | ...
  guide_page_url?: string;
};

type Item = {
  id: number;
  name: string;
  quantity: number;
  category: string;
  guide_page_url?: string;
};

const BUILTIN_CATEGORIES = [
  "PLASTIC",
  "CAN",
  "PAPER",
  "GLASS",
  "VINYL",
  "PAPER_PACK",
  "FOOD",
  "ETC",
] as const;

export default function ScanResultScreen() {
  const { receiptId } = useLocalSearchParams<{ receiptId: string }>();
  const rid = Number(receiptId);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ====== 팝업 상태 ======
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // -1: 추가
  const [formName, setFormName] = useState("");
  const [formQty, setFormQty] = useState<string>("1");
  const [formCat, setFormCat] = useState<string>("PLASTIC"); // 기본값
  const [formCatMode, setFormCatMode] = useState<"PICK" | "CUSTOM">("PICK");
  const [formCatCustom, setFormCatCustom] = useState("");

  const normalized = (s?: string) => (s || "").trim().toUpperCase();

  /** 상단 합계 */
  const { canCount, plasticCount } = useMemo(() => {
    let can = 0;
    let plastic = 0;
    for (const it of items) {
      const cat = normalized(it.category);
      if (cat === "CAN") can += it.quantity;
      if (cat === "PLASTIC") plastic += it.quantity;
    }
    return { canCount: can, plasticCount: plastic };
  }, [items]);

  /** 색상 태그 */
  const tagStyleFor = (cat: string) => {
    const c = normalized(cat);
    if (c === "CAN") return styles.tagCan;
    if (c === "PLASTIC") return styles.tagPlastic;
    if (c === "PAPER") return styles.tagPaper;
    if (c === "GLASS") return styles.tagGlass;
    if (c === "VINYL") return styles.tagVinyl;
    if (c === "FOOD") return styles.tagFood;
    if (c === "PAPER_PACK") return styles.tagPack;
    return styles.tagEtc;
    // ETC or custom
  };

  /** 데이터 가져오기 */
  const loadItems = useCallback(async () => {
    if (!rid || Number.isNaN(rid)) {
      Alert.alert("오류", "receiptId가 없습니다.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/receipts/${rid}/items`);
      const list: ApiItem[] = res.data?.items ?? [];
      setItems(
        list.map((v) => ({
          id: v.item_id,
          name: v.name,
          quantity: v.quantity,
          category: v.category,
          guide_page_url: v.guide_page_url,
        }))
      );
    } catch (e: any) {
      console.log("[ERR] /items", e?.response?.data || e?.message);
      Alert.alert("불러오기 실패", "인식 결과를 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [rid]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  /** 팝업 열기 */
  const openEditModal = (index: number) => {
    setEditingIndex(index);
    if (index >= 0) {
      const t = items[index];
      setFormName(t?.name ?? "");
      setFormQty(String(t?.quantity ?? 1));
      const cat = normalized(t?.category) as string;
      if (BUILTIN_CATEGORIES.includes(cat as any)) {
        setFormCatMode("PICK");
        setFormCat(cat);
        setFormCatCustom("");
      } else {
        setFormCatMode("CUSTOM");
        setFormCat("ETC");
        setFormCatCustom(t?.category ?? "");
      }
    } else {
      setFormName("");
      setFormQty("1");
      setFormCatMode("PICK");
      setFormCat("PLASTIC");
      setFormCatCustom("");
    }
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  /** 저장(추가/수정) */
  const saveModal = async () => {
    const qty = Math.max(1, Number.isFinite(Number(formQty)) ? Number(formQty) : 1);
    const name = formName.trim() || "제품";
    const category =
      formCatMode === "CUSTOM"
        ? normalized(formCatCustom) || "ETC"
        : normalized(formCat);

    try {
      setBusy(true);
      if (editingIndex >= 0) {
        const target = items[editingIndex];
        await api.patch(`/api/receipts/${rid}/items/${target.id}`, {
          name,
          quantity: qty,
          category,
        });
      } else {
        await api.post(`/api/receipts/${rid}/items`, {
          name,
          quantity: qty,
          category,
        });
      }
      await loadItems();
      setModalVisible(false);
    } catch (e: any) {
      console.log("❌ save error", e?.response?.data || e?.message);
      Alert.alert("실패", "항목 저장 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  /** 삭제 */
  const removeItem = async (index: number) => {
    const target = items[index];
    if (!target) return;
    try {
      setBusy(true);
      await api.delete(`/api/receipts/${rid}/items/${target.id}`);
      await loadItems();
    } catch (e: any) {
      console.log("❌ delete error", e?.response?.data || e?.message);
      Alert.alert("실패", "항목 삭제 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  /** 확정(기록 반영) */
  const confirmItems = async () => {
    try {
      setBusy(true);
      const selectedIds = items.map((it) => it.id);
      await api.post(`/api/receipts/${rid}/confirm`, {
        selected_item_ids: selectedIds,
      });
      Alert.alert("완료", "기록에 반영되었습니다.");
      router.push("/(tabs)/record");
    } catch (e: any) {
      console.log("❌ confirm error", e?.response?.data || e?.message);
      Alert.alert("실패", "확정 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.qtyWrap}>
              <Text style={styles.metaLabel}>수량</Text>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
            </View>

            <View style={[styles.tag, tagStyleFor(item.category)]}>
              <Text style={styles.tagText}>{normalized(item.category)}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => openEditModal(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#2E2E2E" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("삭제", "이 항목을 삭제할까요?", [
                { text: "취소", style: "cancel" },
                { text: "삭제", style: "destructive", onPress: () => removeItem(index) },
              ])
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#B3261E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "인식한 제품" }} />

      {/* 상단 요약 */}
      <Text style={styles.title}>인식한 제품</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryBadge}>
          <MaterialCommunityIcons name="recycle-variant" size={18} />
          <Text style={styles.summaryLabel}>CAN</Text>
          <Text style={styles.summaryCount}>× {canCount}</Text>
        </View>
        <View style={styles.summaryBadge}>
          <MaterialCommunityIcons name="recycle-variant" size={18} />
          <Text style={styles.summaryLabel}>PLASTIC</Text>
          <Text style={styles.summaryCount}>× {plasticCount}</Text>
        </View>
      </View>
      <View style={styles.separator} />

      {/* 본문 */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#666" }}>불러오는 중…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ paddingVertical: 8, gap: 12 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ paddingTop: 60, alignItems: "center" }}>
              <Text style={{ color: "#666" }}>표시할 항목이 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* 하단 버튼들 */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={[styles.bottomBtn, styles.bottomGhost]} onPress={() => openEditModal(-1)}>
          <Text style={[styles.bottomText, { color: "#06A85A" }]}>추가하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomBtn, styles.bottomPrimary]}
          onPress={confirmItems}
          disabled={busy || items.length === 0}
        >
          <Text style={[styles.bottomText, { color: "#fff" }]}>확정하기</Text>
        </TouchableOpacity>
      </View>

      {/* ===== 팝업(추가/수정) ===== */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCenter}
            pointerEvents="box-none"
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>{editingIndex >= 0 ? "수정하기" : "추가하기"}</Text>

              <View style={{ gap: 10 }}>
                <Text style={styles.inputLabel}>제품명</Text>
                <TextInput
                  placeholder="예: 제주 삼다수 500ml"
                  value={formName}
                  onChangeText={setFormName}
                  style={styles.input}
                  placeholderTextColor="#9BA1A6"
                />

                <Text style={styles.inputLabel}>수량</Text>
                <TextInput
                  placeholder="1"
                  keyboardType="number-pad"
                  value={formQty}
                  onChangeText={setFormQty}
                  style={styles.input}
                  placeholderTextColor="#9BA1A6"
                />

                <Text style={styles.inputLabel}>카테고리</Text>

                {/* 선택/직접입력 토글 */}
                <View style={styles.catToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.catToggleBtn,
                      formCatMode === "PICK" && styles.catToggleBtnActive,
                    ]}
                    onPress={() => setFormCatMode("PICK")}
                  >
                    <Text
                      style={[
                        styles.catToggleText,
                        formCatMode === "PICK" ? styles.catToggleTextActive : null,
                      ]}
                    >
                      선택
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.catToggleBtn,
                      formCatMode === "CUSTOM" && styles.catToggleBtnActive,
                    ]}
                    onPress={() => setFormCatMode("CUSTOM")}
                  >
                    <Text
                      style={[
                        styles.catToggleText,
                        formCatMode === "CUSTOM" ? styles.catToggleTextActive : null,
                      ]}
                    >
                      직접입력
                    </Text>
                  </TouchableOpacity>
                </View>

                {formCatMode === "PICK" ? (
                  <View style={styles.pickerWrap}>
                    <Picker selectedValue={formCat} onValueChange={(v) => setFormCat(String(v))}>
                      {BUILTIN_CATEGORIES.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <TextInput
                    placeholder="예: PAPER"
                    value={formCatCustom}
                    onChangeText={setFormCatCustom}
                    autoCapitalize="characters"
                    style={styles.input}
                    placeholderTextColor="#9BA1A6"
                  />
                )}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={closeModal}>
                  <Text style={[styles.modalBtnText, { color: "#06A85A" }]}>취소하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={saveModal}
                  disabled={busy}
                >
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    {editingIndex >= 0 ? "저장하기" : "추가하기"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7F9", paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#222", marginBottom: 12 },

  summaryRow: { flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 8 },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAFBF2",
    borderColor: "#06D16E",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  summaryLabel: { fontSize: 12, color: "#06A85A", fontWeight: "700" },
  summaryCount: { fontSize: 12, color: "#0B8F53", fontWeight: "700" },

  separator: { height: 2, backgroundColor: "#06D16E", opacity: 0.7, marginVertical: 8, borderRadius: 2 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#222", marginBottom: 6 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaLabel: { fontSize: 12, color: "#666" },
  qtyWrap: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingRight: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "#E4E6EA",
  },
  qtyValue: { fontSize: 14, color: "#111", fontWeight: "700" },

  tag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  tagText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  tagCan: { backgroundColor: "#3FB765" },
  tagPlastic: { backgroundColor: "#2F8DE4" },
  tagPaper: { backgroundColor: "#7B6CF6" },
  tagGlass: { backgroundColor: "#62B1A8" },
  tagVinyl: { backgroundColor: "#00897B" },
  tagFood: { backgroundColor: "#C67C4E" },
  tagPack: { backgroundColor: "#9C27B0" },
  tagEtc: { backgroundColor: "#999" },

  bottomRow: { flexDirection: "row", gap: 12, paddingBottom: 14, paddingTop: 6 },
  bottomBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  bottomGhost: { backgroundColor: "#EAFBF2", borderWidth: 1, borderColor: "#06D16E" },
  bottomPrimary: { backgroundColor: "#06D16E" },
  bottomText: { fontSize: 16, fontWeight: "800" },

  // ===== 팝업 스타일 =====
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCenter: { flex: 1, justifyContent: "center", paddingHorizontal: 18 },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 12 },

  inputLabel: { fontSize: 12, color: "#5E646A", fontWeight: "600" },
  input: {
    backgroundColor: "#F2F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1D2125",
  },
  pickerWrap: { backgroundColor: "#F2F4F6", borderRadius: 8, overflow: "hidden" },

  catToggleRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  catToggleBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFEFD9",
    backgroundColor: "#F3FCF7",
    paddingVertical: 10,
    alignItems: "center",
  },
  catToggleBtnActive: { borderColor: "#06D16E", backgroundColor: "#EAFBF2" },
  catToggleText: { fontSize: 13, color: "#5A6A63", fontWeight: "700" },
  catToggleTextActive: { color: "#068B53" },

  modalBtnRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 18 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalBtnGhost: { backgroundColor: "#EAFBF2", borderWidth: 1, borderColor: "#06D16E" },
  modalBtnPrimary: { backgroundColor: "#06D16E" },
  modalBtnText: { fontSize: 15, fontWeight: "800" },
});