import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { api } from '@/lib/api';

type ServerItem = {
  item_id: number;
  name: string;
  quantity: number;
  category: string;
  guide_page_url?: string;
};

type Item = {
  item_id?: number; // 서버 id
  id?: string;      // 로컬 id
  name: string;
  quantity: number;
  category: string; // 표준화
};

export default function ScanResultScreen() {
  const { receiptId, data } = useLocalSearchParams<{ receiptId?: string; data?: string }>();

  // 1) param으로 받은 data로 즉시 표시
  const initialItems: Item[] = useMemo(() => {
    if (data) {
      try {
        const arr = JSON.parse(data) as ServerItem[];
        if (Array.isArray(arr)) {
          return arr.map((v, idx) => ({
            item_id: v.item_id,
            id: String(v.item_id ?? idx),
            name: v.name,
            quantity: v.quantity,
            category: (v.category || 'ETC').toUpperCase(),
          }));
        }
      } catch { /* ignore */ }
    }
    return [];
  }, [data]);

  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(false);        // 서버 최신화 로딩
  const [saving, setSaving] = useState(false);          // 확정 로딩

  // ===== 팝업 =====
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [formName, setFormName] = useState('');
  const [formQty, setFormQty] = useState('1');
  const [formCat, setFormCat] = useState<'CAN'|'PLASTIC'|'PAPER'|'GLASS'|'VINYL'|'ETC'>('PLASTIC');
  const [customCat, setCustomCat] = useState('');

  // 2) receiptId가 있으면 서버에서 최신 목록으로 덮어씀 (초기 렌더는 data, 이후 최신화)
  useEffect(() => {
    const fetchLatest = async () => {
      if (!receiptId) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/receipts/${receiptId}/items`);
        const arr: ServerItem[] = Array.isArray(res.data?.items) ? res.data.items : [];
        const mapped: Item[] = arr.map((v, idx) => ({
          item_id: v.item_id,
          id: String(v.item_id ?? idx),
          name: v.name,
          quantity: v.quantity,
          category: (v.category || 'ETC').toUpperCase(),
        }));
        setItems(mapped);
      } catch (e: any) {
        console.warn('목록 최신화 실패', e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [receiptId]);

  // 합계 배지
  const { canCount, plasticCount } = useMemo(() => {
    let can = 0, plastic = 0;
    for (const it of items) {
      const cat = it.category.toUpperCase();
      if (cat === 'CAN') can += it.quantity;
      if (cat === 'PLASTIC') plastic += it.quantity;
    }
    return { canCount: can, plasticCount: plastic };
  }, [items]);

  // 팝업 열기/저장
  const openEditModal = (index: number) => {
    setEditingIndex(index);
    if (index >= 0) {
      const t = items[index];
      setFormName(t.name);
      setFormQty(String(t.quantity));
      const base = t.category.toUpperCase();
      const known = ['CAN','PLASTIC','PAPER','GLASS','VINYL','ETC'] as const;
      setFormCat(known.includes(base as any) ? (base as any) : 'ETC');
      setCustomCat(!known.includes(base as any) ? base : '');
    } else {
      setFormName('');
      setFormQty('1');
      setFormCat('PLASTIC');
      setCustomCat('');
    }
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const saveModal = async () => {
    const qty = Math.max(1, Number.isFinite(Number(formQty)) ? Number(formQty) : 1);
    const name = formName.trim().length ? formName.trim() : '제품';
    const finalCat = (formCat === 'ETC' && customCat.trim()) ? customCat.trim().toUpperCase() : formCat;

    // 로컬 즉시 반영
    setItems(prev => {
      if (editingIndex >= 0) {
        const cp = [...prev];
        cp[editingIndex] = {
          ...(cp[editingIndex] || {}),
          name, quantity: qty, category: finalCat,
        };
        return cp;
      }
      return [...prev, { id: String(Date.now()), name, quantity: qty, category: finalCat }];
    });

    // 서버 반영 (receiptId 있을 때만)
    try {
      if (receiptId) {
        if (editingIndex >= 0) {
          const target = items[editingIndex];
          if (typeof target?.item_id === 'number') {
            await api.patch(`/api/receipts/${receiptId}/items/${target.item_id}`, {
              name, quantity: qty, category: finalCat,
            });
          } else {
            await api.post(`/api/receipts/${receiptId}/items`, {
              name, quantity: qty, category: finalCat,
            });
          }
        } else {
          await api.post(`/api/receipts/${receiptId}/items`, {
            name, quantity: qty, category: finalCat,
          });
        }
      }
    } catch (e: any) {
      console.warn('서버 반영 실패(추가/수정)', e?.response?.data || e?.message);
    }

    setModalVisible(false);
  };

  // 확정
  const confirmAll = async () => {
    if (!receiptId) {
      Alert.alert('오류', '영수증 ID가 없습니다.');
      return;
    }
    if (!items.length) return;

    try {
      setSaving(true);

      // 서버 id 없는 로컬 항목 먼저 추가
      for (const it of items) {
        if (typeof it.item_id !== 'number') {
          await api.post(`/api/receipts/${receiptId}/items`, {
            name: it.name,
            quantity: it.quantity,
            category: it.category,
          });
        }
      }

      // 전체 아이디 재조회 후 확정
      const listRes = await api.get(`/api/receipts/${receiptId}/items`);
      const allIds: number[] = (listRes.data?.items || []).map((v: any) => v.item_id);
      await api.post(`/api/receipts/${receiptId}/confirm`, {
        selected_item_ids: allIds,
      });

      Alert.alert('완료', '기록에 반영되었습니다.');
      router.replace('/(tabs)/record');
    } catch (e: any) {
      console.error('확정 실패', e?.response?.data || e?.message);
      Alert.alert('실패', e?.response?.data?.message || '확정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const cat = item.category.toUpperCase();
    const isCan = cat === 'CAN';
    const isPlastic = cat === 'PLASTIC';

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>{item.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.qtyWrap}>
              <Text style={styles.metaLabel}>수량</Text>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
            </View>

            <View style={[
              styles.tag,
              isCan && styles.tagCan,
              isPlastic && styles.tagPlastic,
              !isCan && !isPlastic && styles.tagEtc,
            ]}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => openEditModal(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="pencil" size={20} color="#2E2E2E" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
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

      {loading ? (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => String(it.item_id ?? it.id ?? `idx-${idx}`)}
          contentContainerStyle={{ paddingVertical: 8, gap: 12 }}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>항목이 없습니다. “추가하기”로 입력해주세요.</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 하단 버튼 */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.ctaBtn, items.length ? styles.ctaPrimary : styles.ctaDisabled]}
          onPress={confirmAll}
          disabled={!items.length || saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaPrimaryText}>확정하기</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ctaBtn, styles.ctaGhost]} onPress={() => openEditModal(-1)}>
          <Text style={styles.ctaGhostText}>추가하기</Text>
        </TouchableOpacity>
      </View>

      {/* 팝업 */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalCenter} pointerEvents="box-none">
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

                <Text style={styles.inputLabel}>재활용 타입</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={formCat} onValueChange={(v) => setFormCat(v)} dropdownIconColor="#2B2F33">
                    <Picker.Item label="플라스틱" value="PLASTIC" />
                    <Picker.Item label="캔" value="CAN" />
                    <Picker.Item label="종이" value="PAPER" />
                    <Picker.Item label="유리" value="GLASS" />
                    <Picker.Item label="비닐" value="VINYL" />
                    <Picker.Item label="기타(직접입력)" value="ETC" />
                  </Picker>
                </View>

                {formCat === 'ETC' && (
                  <>
                    <Text style={styles.inputLabel}>직접 입력</Text>
                    <TextInput
                      placeholder="예: CARTON, PAPER컵 등"
                      value={customCat}
                      onChangeText={setCustomCat}
                      style={styles.input}
                      placeholderTextColor="#9BA1A6"
                    />
                  </>
                )}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={closeModal}>
                  <Text style={[styles.modalBtnText, { color: '#06A85A' }]}>취소하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={saveModal}>
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>{editingIndex >= 0 ? '저장하기' : '추가하기'}</Text>
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
    gap: 6,
    backgroundColor: '#EAFBF2',
    borderColor: '#06D16E',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
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

  footerRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  ctaBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaPrimary: { backgroundColor: '#06D16E' },
  ctaDisabled: { backgroundColor: '#B8E8CF' },
  ctaGhost: { backgroundColor: '#EAFBF2', borderWidth: 1, borderColor: '#06D16E' },
  ctaPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ctaGhostText: { color: '#06A85A', fontSize: 16, fontWeight: '800' },

  // modal
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
  input: { backgroundColor: '#F2F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#1D2125' },
  pickerWrap: { backgroundColor: '#F2F4F6', borderRadius: 8, overflow: 'hidden' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalBtnGhost: { backgroundColor: '#EAFBF2', borderWidth: 1, borderColor: '#06D16E' },
  modalBtnPrimary: { backgroundColor: '#06D16E' },
  modalBtnText: { fontSize: 15, fontWeight: '800' },
});