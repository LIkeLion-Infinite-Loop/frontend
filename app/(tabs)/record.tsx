import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HistoryItem = {
  history_id: number;
  name: string;
  quantity: number;
  category: string;
  created_at: string;
  guide_page_url?: string;
  icon?: string;
};

const HIDDEN_KEY = 'hiddenHistoryIds';

export default function RecordScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHidden = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HIDDEN_KEY);
      setHiddenIds(raw ? JSON.parse(raw) : []);
    } catch {
      setHiddenIds([]);
    }
  }, []);

  const saveHidden = useCallback(async (ids: number[]) => {
    setHiddenIds(ids);
    await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/disposals');
      const raw: any[] = data?.items ?? [];

      // 정규화
      const normalized: HistoryItem[] = raw.map((v) => ({
        history_id: Number(v.history_id ?? v.id ?? Date.now() + Math.random()),
        name: String(v.name ?? '항목'),
        quantity: Number(v.quantity ?? 1),
        category: String(v.category ?? 'ETC'),
        created_at: String(v.created_at ?? new Date().toISOString()),
        guide_page_url: v.guide_page_url ? String(v.guide_page_url) : undefined,
        icon: v.icon ? String(v.icon) : undefined,
      }));

      // 중복 제거
      const seen = new Set<number>();
      const deduped = normalized.filter((it) => {
        if (seen.has(it.history_id)) return false;
        seen.add(it.history_id);
        return true;
      });

      // 숨김 필터
      const filtered = deduped.filter((it) => !hiddenIds.includes(it.history_id));

      setItems(filtered);
    } catch (e: any) {
      console.log('[ERR] 500 /api/disposals', e?.response?.data ?? e?.message);
      Alert.alert('오류', '기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [hiddenIds]);

  useEffect(() => {
    (async () => {
      await loadHidden();
    })();
  }, [loadHidden]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHidden();
    await fetchItems();
    setRefreshing(false);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hideSelected = async () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (ids.length === 0) {
      Alert.alert('알림', '숨길 항목을 하나 이상 선택해주세요.');
      return;
    }
    const next = Array.from(new Set([...hiddenIds, ...ids]));
    await saveHidden(next);
    // 리스트 즉시 반영
    setItems((prev) => prev.filter((it) => !next.includes(it.history_id)));
    setSelected({});
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const picked = !!selected[item.history_id];

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => toggleSelect(item.history_id)}>
        <View style={[styles.card, picked && styles.cardPicked]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            {picked && <MaterialCommunityIcons name="check-circle" size={18} color="#06D16E" />}
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.meta}>종류</Text>
            <Text style={styles.metaValue}>{item.category}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.meta}>수량</Text>
            <Text style={styles.metaValue}>{item.quantity}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.meta}>날짜</Text>
            <Text style={styles.metaValue}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>내 기록</Text>
        <TouchableOpacity onPress={hideSelected} style={styles.hideBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#B00020" />
          <Text style={styles.hideText}>삭제(숨김)</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10 }}>불러오는 중…</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(it) => String(it.history_id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>확정된 기록이 없습니다.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F7F9FB' },
  header: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1B1F23' },
  hideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE9EC',
    borderColor: '#FFC2C9',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  hideText: { color: '#B00020', fontWeight: '700' },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF1F4',
  },
  cardPicked: {
    borderColor: '#06D16E',
    borderWidth: 2,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },

  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  meta: { fontSize: 13, color: '#6B7280' },
  metaValue: { fontSize: 13, color: '#111', fontWeight: '700' },

  empty: { textAlign: 'center', color: '#6B7280', marginTop: 36 },
});