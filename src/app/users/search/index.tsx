import React, {
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Chip, Searchbar, Text, Snackbar } from 'react-native-paper';
import { AuthContext } from '@/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';   // ← import useFocusEffect
import { axiosBase } from '@/services/BaseService';
import { useChat } from '@/context/ChatContext';

import {
  OCCUPATION_DATA,
  COLLEGE_DATA,
  MATRICULATION_YEAR_DATA,
} from '@/data';
import geoData from '@/data/geoDataSorted';

type UserItem = { _id: string; firstName?: string; lastName?: string; matriculationYear?: string | number; };
type Params = { search?: string; college?: string; matriculationYear?: string | number; occupation?: string; location?: string; city?: string; workStatus?: string; };

const WORK_STATUS_OPTS = [
  'available full-time',
  'available part-time',
  'available contract',
  'not available',
];
const filtersList: (keyof Params)[] = ['college','matriculationYear','occupation','location','city','workStatus'];

export default function UserSearch() {
  const { auth } = useContext(AuthContext);
  const { getOrCreate } = useChat();
  const router = useRouter();

  /* UI state */
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Params>({});
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack]   = useState<string | null>(null);

  /* modal */
  const [filterKey, setFilterKey] = useState<keyof Params | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  /* modal options */
  const modalOptions = useMemo<string[]>(() => {
    if (!filterKey) return [];
    switch (filterKey) {
      case 'college':          return COLLEGE_DATA.map(c => c.name);
      case 'matriculationYear':return MATRICULATION_YEAR_DATA.map(String);
      case 'occupation':       return OCCUPATION_DATA.map(o => o.name);
      case 'location':         return Object.keys(geoData);
      case 'city':             return geoData[filters.location as keyof typeof geoData] || [];
      case 'workStatus':       return WORK_STATUS_OPTS;
      default:                 return [];
    }
  }, [filterKey, filters.location]);

  /** GET /users/query */
  const runSearch = useCallback(async () => {
    if (!auth?.accessToken) return;
    setLoading(true);

    // build qs from filters + query
    const qs = new URLSearchParams();
    Object.entries({ ...filters, search: query.trim() || undefined })
      .filter(([, v]) => v)
      .forEach(([k, v]) => qs.append(k, String(v)));

    // if no qs at all => get all
    if (!qs.has('search') && qs.toString() === '') {
      qs.append('search', 'all');
    }

    try {
      const { data } = await axiosBase.get(`/users/query?${qs}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [auth.accessToken, filters, query]);

  // 1) On first mount
  useEffect(() => {
    runSearch();
  }, [runSearch]);

  // 2) Every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      runSearch();
    }, [runSearch])
  );

  /** POST /chats/private → navigate to chat */
const startChat = async (partnerId: string, name: string) => {
  try {
    const chatId = await getOrCreate(partnerId, name);
    router.push(`/chats/${chatId}`);
  } catch (err: any) {
    console.error(err);
    setSnack('Could not start chat. Please try again.');
  }
};


  return (
    <View style={{ flex: 1 }}>
      {/* search box */}
      <Searchbar
        placeholder="Search users"
        value={query}
        onChangeText={setQuery}
        onIconPress={runSearch}
        onSubmitEditing={runSearch}
        style={{ margin: 12 }}
      />

      {/* filter chips */}
      <View style={styles.chipRow}>
        {filtersList.map((k) => (
          <Chip
            key={k}
            onPress={() => {
              setFilterKey(k);
              setFilterSearch('');
            }}
            selected={!!filters[k]}
            style={styles.chip}
          >
            {filters[k] ? `${k}:${filters[k]}` : k}
          </Chip>
        ))}
        {Object.keys(filters).length > 0 && (
          <Chip icon="close" style={styles.chip} onPress={() => setFilters({})}>
            reset
          </Chip>
        )}
      </View>

      {/* results */}
      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={users}
            keyExtractor={(u) => u._id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => (
       <Pressable
    android_ripple={{ color: '#D6E4FF' }}             // Android ripple
    style={({ pressed }) => [
      styles.row,
      pressed && styles.rowPressed,                    // iOS highlight
    ]}
    onPress={() => startChat(item._id, `${item.firstName} ${item.lastName}`)}>
                <View style={styles.avatarPlaceholder} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">
                    {item.firstName} {item.lastName}
                  </Text>
                  {item.matriculationYear && (
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      Year {item.matriculationYear}
                    </Text>
                  )}
                </View>
                <Text style={{ color: '#0066CC' }}>Chat</Text>
              </Pressable>
            )}
          />
        )
      }

      {/* filter modal (bottom sheet) */}
      <Modal animationType="slide" transparent visible={filterKey !== null}>
        <Pressable style={styles.backdrop} onPress={() => setFilterKey(null)} />

        <View style={styles.sheet}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            {filterKey}
          </Text>

          <TextInput
            placeholder="Type to filter…"
            value={filterSearch}
            onChangeText={setFilterSearch}
            style={styles.search}
          />

          <FlatList
            data={modalOptions.filter((v) =>
              v.toLowerCase().includes(filterSearch.toLowerCase()),
            )}
            keyExtractor={(v) => v}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.optionRow,
                  filters[filterKey as keyof Params] === item && { backgroundColor: '#EEE' },
                ]}
                onPress={() => {
                  if (filterKey) {
                    setFilters(f => ({ ...f, [filterKey]: item }));
                    setFilterKey(null);
                  }
                }}
              >
                <Text>{item}</Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6 },
  chip:     { marginVertical: 4 },
  row:      { flexDirection: 'row', padding: 12, alignItems: 'center' },
  rowPressed: { backgroundColor: '#F0F6FF' },  
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#AAA', marginRight: 12 },
  sep:      { height: 1, backgroundColor: '#EEE', marginLeft: 72 },
  backdrop: { flex: 1, backgroundColor: '#0006' },
  sheet:    { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '80%', backgroundColor: '#FFF', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 16 },
  search:   { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 8, marginBottom: 8 },
  optionRow:{ padding: 12 },
});
