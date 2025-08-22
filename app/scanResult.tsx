// app/scanResult.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Item = { id: string; name: string; quantity: number; material: 'CAN' | 'PLASTIC' | string };

export default function ScanResultScreen() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const initialItems: Item[] = useMemo(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((v: any, idx: number) => ({
          id: String(v.id ?? idx),
          name: String(v.name ?? '제품'),
          quantity: Number(v.quantity ?? 1),
          material: String(v.material ?? 'ETC'),
        }));
      } catch {
        /* fallthrough */
      }
    }
    return [
      { id: '1', name: '펩시 제로 콜라 355ml', quantity: 1, material: 'CAN' },
      { id: '2', name: '제주 삼다수 500ml', quantity: 2, material: 'PLASTIC' },
      { id: '3', name: '코카콜라 250ml', quantity: 1, material: 'CAN' },
    ];
  }, [data]);

  const [items, setItems] = useState<Item[]>(initialItems);

  // ===== 팝업 상태 =====
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [formName, setFormName] = useState('');
  const [formQty, setFormQty] = useState<string>('1');
  const [formMat, setFormMat] = useState<'CAN' | 'PLASTIC'>('PLASTIC');

  // 상단 합계
  const { canCount, plasticCount } = useMemo(() => {
    let can = 0, plastic = 0;
    for (const it of items) {
      if (it.material?.toUpperCase() === 'CAN') can += it.quantity ?? 0;
      if (it.material?.toUpperCase() === 'PLASTIC') plastic += it.quantity ?? 0;
    }
    return { canCount: can, plasticCount: plastic };
  }, [items]);

  // 팝업 열기
  const openEditModal = (index: number) => {
    setEditingIndex(index);
    if (index >= 0) {
      const target = items[index];
      setFormName(target?.name ?? '');
      setFormQty(String(target?.quantity ?? 1));
      setFormMat((target?.material?.toUpperCase() as 'CAN' | 'PLASTIC') ?? 'PLASTIC');
    } else {
      setFormName('');
      setFormQty('1');
      setFormMat('PLASTIC');
    }
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const saveModal = () => {
    const qty = Math.max(1, Number.isFinite(Number(formQty)) ? Number(formQty) : 1);
    const trimmed = formName.trim();
    const nextItem: Item = {
      id: editingIndex >= 0 ? items[editingIndex].id : String(Date.now()),
      name: trimmed.length ? trimmed : '제품',
      quantity: qty,
      material: formMat,
    };

    setItems((prev) => {
      if (editingIndex >= 0) {
        const clone = [...prev];
        clone[editingIndex] = nextItem;
        return clone;
      } else {
        return [...prev, nextItem];
      }
    });

    setModalVisible(false);
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const isCan = item.material?.toUpperCase() === 'CAN';
    const isPlastic = item.material?.toUpperCase() === 'PLASTIC';

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>{item.name}</Text>

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
              <Text style={styles.tagText}>
                {isCan ? 'CAN' : isPlastic ? 'PLASTIC' : item.material}
              </Text>
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

  return (
    <View style={styles.screen}>
      {/* 타이틀 */}
      <Text style={styles.title}>인식한 제품</Text>

      {/* 상단 카테고리 합계 배지 */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBadge}>
          <Image source={require('@/assets/images/canRe.png')} style={styles.summaryIcon} />
          <Text style={styles.summaryLabel}>CAN</Text>
          <Text style={styles.summaryCount}>× {canCount}</Text>
        </View>
        <View style={styles.summaryBadge}>
          <Image source={require('@/assets/images/plaRe.png')} style={styles.summaryIcon} />
          <Text style={styles.summaryLabel}>PLASTIC</Text>
          <Text style={styles.summaryCount}>× {plasticCount}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      {/* 제품 카드 리스트 */}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80, gap: 12 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 추가 버튼 (좀 위로) */}
      <TouchableOpacity style={styles.addBtn} onPress={() => openEditModal(-1)}>
        <Text style={styles.addText}>추가하기</Text>
      </TouchableOpacity>

      {/* ===== 팝업(추가/수정) ===== */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalCenter}
            pointerEvents="box-none"
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>{editingIndex >= 0 ? '수정하기' : '추가하기'}</Text>

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
                  <Picker selectedValue={formMat} onValueChange={(v) => setFormMat(v)} dropdownIconColor="#2B2F33">
                    <Picker.Item label="플라스틱" value="PLASTIC" />
                    <Picker.Item label="캔" value="CAN" />
                  </Picker>
                </View>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={closeModal}>
                  <Text style={[styles.modalBtnText, { color: '#06A85A' }]}>취소하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveModal}>
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                    {editingIndex >= 0 ? '저장하기' : '추가하기'}
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
  screen: { flex: 1, backgroundColor: '#F6F7F9', paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 12 },

  summaryRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 8 },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAFBF2',
    borderColor: '#06D16E',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  // ✅ 아이콘 크게
  summaryIcon: { width: 28, height: 28, resizeMode: 'contain' },
  summaryLabel: { fontSize: 12, color: '#06A85A', fontWeight: '700' },
  summaryCount: { fontSize: 12, color: '#0B8F53', fontWeight: '700' },

  separator: { height: 2, backgroundColor: '#06D16E', opacity: 0.7, marginVertical: 8, borderRadius: 2 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 6 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaLabel: { fontSize: 12, color: '#666' },
  qtyWrap: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingRight: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E4E6EA',
  },
  qtyValue: { fontSize: 14, color: '#111', fontWeight: '700' },

  tag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  tagCan: { backgroundColor: '#3FB765' },
  tagPlastic: { backgroundColor: '#2F8DE4' },
  tagEtc: { backgroundColor: '#999' },

  // ✅ 버튼을 위로 띄움 + 여유 패딩은 FlatList 쪽에 넣음
  addBtn: {
    marginTop: 6,
    marginBottom: 32,
    alignSelf: 'center',
    backgroundColor: '#06D16E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // ===== 팝업 스타일 =====
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCenter: { flex: 1, justifyContent: 'center', paddingHorizontal: 18 },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },

  inputLabel: { fontSize: 12, color: '#5E646A', fontWeight: '600' },
  input: {
    backgroundColor: '#F2F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1D2125',
  },
  pickerWrap: {
    backgroundColor: '#F2F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },

  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnGhost: { backgroundColor: '#EAFBF2', borderWidth: 1, borderColor: '#06D16E' },
  modalBtnPrimary: { backgroundColor: '#06D16E' },
  modalBtnText: { fontSize: 15, fontWeight: '800' },
});