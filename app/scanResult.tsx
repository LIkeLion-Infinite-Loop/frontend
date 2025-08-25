// app/scanResult.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
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

type Category = "ETC" | "CAN" | "PLASTIC" | "PAPER" | "GLASS" | "VINYL";
type Item = { item_id?: number; id: string; name: string; quantity: number; category: Category; guide_page_url?: string };

export default function ScanResultScreen() {
  // 스캔 화면에서 넘긴 params: { receiptId?: string, data?: string(JSON) }
  const { receiptId, data } = useLocalSearchParams<{ receiptId?: string; data?: string }>();

  const initialItems: Item[] = useMemo(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return (parsed as any[]).map((v, idx) => ({
          item_id: v.item_id ?? v.id,
          id: String(v.item_id ?? v.id ?? idx),
          name: String(v.name ?? "제품"),
          quantity: Number(v.quantity ?? 1),
          category: (String(v.category ?? "ETC").toUpperCase() as Category) ?? "ETC",
          guide_page_url: v.guide_page_url,
        }));
      } catch {
        // fallthrough to demo
      }
    }
    // 데모
    return [
      { id: "1", name: "펩시 제로 콜라 355ml", quantity: 1, category: "CAN" },
      { id: "2", name: "제주 삼다수 500ml", quantity: 2, category: "PLASTIC" },
    ];
  }, [data]);

  const [items, setItems] = useState<Item[]>(initialItems);

  // 상단 합계
  const { canCount, plasticCount } = useMemo(() => {
    let can = 0,
      plastic = 0;
    for (const it of items) {
      if (it.category === "CAN") can += it.quantity ?? 0;
      if (it.category === "PLASTIC") plastic += it.quantity ?? 0;
    }
    return { canCount: can, plasticCount: plastic };
  }, [items]);

  // ===== 팝업 상태 =====
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // -1: 추가
  const [formName, setFormName] = useState("");
  const [formQty, setFormQty] = useState<string>("1");
  const [formMat, setFormMat] = useState<Category>("PLASTIC"); // ✅ Category로 고정

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    if (index >= 0) {
      const t = items[index];
      setFormName(t?.name ?? "");
      setFormQty(String(t?.quantity ?? 1));
      setFormMat((t?.category as Category) ?? "ETC");
    } else {
      setFormName("");
      setFormQty("1");
      setFormMat("PLASTIC");
    }
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const saveModal = () => {
    const qty = Math.max(1, Number.isFinite(Number(formQty)) ? Number(formQty) : 1);
    const trimmed = formName.trim();
    const next: Item = {
      id: editingIndex >= 0 ? items[editingIndex].id : String(Date.now()),
      name: trimmed.length ? trimmed : "제품",
      quantity: qty,
      category: formMat,
    };

    setItems((prev) => {
      if (editingIndex >= 0) {
        const clone = [...prev];
        clone[editingIndex] = { ...clone[editingIndex], ...next };
        return clone;
      }
      return [...prev, next];
    });

    setModalVisible(false);
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const isCan = item.category === "CAN";
    const isPlastic = item.category === "PLASTIC";
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
            <View
              style={[
                styles.tag,
                isCan && styles.tagCan,
                isPlastic && styles.tagPlastic,
                !isCan && !isPlastic && styles.tagEtc,
              ]}
            >
              <Text style={styles.tagText}>{item.category}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => openEditModal(index)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#2E2E2E" />
        </TouchableOpacity>
      </View>
    );
  };

  const onConfirm = () => {
    if (!receiptId) {
      Alert.alert("알림", "receiptId가 없어 서버 저장을 생략합니다.");
      router.back();
      return;
    }
    // 실제 서버 confirm 연동이 필요하면 여기서 selected_ids 등을 전송하세요.
    Alert.alert("확정", "항목이 확정되었습니다.", [
      { text: "확인", onPress: () => router.replace("/(tabs)/record") },
    ]);
  };

  return (
    <View style={styles.screen}>
      {/* 타이틀 */}
      <Text style={styles.title}>인식한 제품</Text>

      {/* 합계 */}
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

      {/* 리스트 */}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingVertical: 8, gap: 12 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#6b7280", marginTop: 24 }}>
            항목이 없습니다. 아래 ‘추가하기’를 눌러 등록하세요.
          </Text>
        }
      />

      {/* 하단 버튼들 */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={[styles.footerBtn, styles.footerGhost]} onPress={() => openEditModal(-1)}>
          <Text style={[styles.footerBtnText, { color: "#06A85A" }]}>추가하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.footerPrimary]} onPress={onConfirm}>
          <Text style={[styles.footerBtnText, { color: "#fff" }]}>확정하기</Text>
        </TouchableOpacity>
      </View>

      {/* ===== 팝업 ===== */}
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
                <View style={styles.pickerWrap}>
                  {/* ⬇️ JSX에서 제네릭 쓰지 말고, onValueChange에서 단언 */}
                  <RNPicker
                    selectedValue={formMat}
                    onValueChange={(v) => setFormMat(v as Category)}
                    dropdownIconColor="#2B2F33"
                  >
                    <RNPicker.Item label="플라스틱" value="PLASTIC" />
                    <RNPicker.Item label="캔" value="CAN" />
                    <RNPicker.Item label="종이" value="PAPER" />
                    <RNPicker.Item label="유리" value="GLASS" />
                    <RNPicker.Item label="비닐" value="VINYL" />
                    <RNPicker.Item label="기타" value="ETC" />
                  </RNPicker>
                </View>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={closeModal}>
                  <Text style={[styles.modalBtnText, { color: "#06A85A" }]}>취소하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveModal}>
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
  tagEtc: { backgroundColor: "#999" },

  footerRow: { flexDirection: "row", gap: 12, marginVertical: 14 },
  footerBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  footerGhost: { backgroundColor: "#EAFBF2", borderWidth: 1, borderColor: "#06D16E" },
  footerPrimary: { backgroundColor: "#06D16E" },
  footerBtnText: { fontSize: 16, fontWeight: "800" },

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

  modalBtnRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 18 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalBtnGhost: { backgroundColor: "#EAFBF2", borderWidth: 1, borderColor: "#06D16E" },
  modalBtnPrimary: { backgroundColor: "#06D16E" },
  modalBtnText: { fontSize: 15, fontWeight: "800" },
});