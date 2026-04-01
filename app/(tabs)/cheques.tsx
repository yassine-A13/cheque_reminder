import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ChequeCard } from '@/components/ChequeCard';
import { EmptyState } from '@/components/EmptyState';
import { FilterChip } from '@/components/FilterChip';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { SortPicker } from '@/components/SortPicker';
import { ThemedText } from '@/components/ThemedText';
import { Cheque, ChequeFilterStatus, ChequeSortField, SortDirection } from '@/core/types/cheque';
import { listCheques } from '@/features/cheques/repository';
import { useAppTheme } from '@/providers/ThemeProvider';

const statuses: Array<ChequeFilterStatus> = ['Tous', 'En cours', 'Encaissé', 'Annulé', 'Expiré'];
const sortOptions: Array<{ label: string; value: ChequeSortField }> = [
  { label: "Date d'échéance", value: 'dueDate' },
  { label: "Date d'émission", value: 'issueDate' },
  { label: 'Montant', value: 'amount' },
];

export default function ChequesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ChequeFilterStatus>('Tous');
  const [sortBy, setSortBy] = useState<ChequeSortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const next = await listCheques({
        search,
        status,
        sortBy,
        sortDirection,
      });

      setCheques(next);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortDirection, status]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const content = useMemo(() => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }

    if (!cheques.length) {
      return (
        <EmptyState
          title="Aucun résultat"
          description="Aucun chèque ne correspond aux filtres sélectionnés."
          actionLabel="Créer un chèque"
          onAction={() => router.push('/cheque/new')}
        />
      );
    }

    return (
      <View style={styles.list}>
        {cheques.map((cheque) => (
          <ChequeCard key={cheque.id} cheque={cheque} onPress={() => router.push(`/cheque/${cheque.id}`)} />
        ))}
      </View>
    );
  }, [cheques, colors.primary, loading, router]);

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="title">Liste des chèques</ThemedText>
          <ThemedText>Recherchez, filtrez et triez vos chèques localement.</ThemedText>
        </View>
        <AppButton label="Ajouter" compact onPress={() => router.push('/cheque/new')} />
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher par bénéficiaire ou numéro"
        onSubmit={loadData}
      />

      <View style={styles.filters}>
        {statuses.map((item) => (
          <FilterChip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />
        ))}
      </View>

      <SortPicker
        options={sortOptions}
        selected={sortBy}
        direction={sortDirection}
        onChange={setSortBy}
        onToggleDirection={setSortDirection}
      />
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  list: {
    gap: 12,
  },
});
