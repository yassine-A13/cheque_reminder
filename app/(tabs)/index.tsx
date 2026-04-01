import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ChequeCard } from '@/components/ChequeCard';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { ThemedText } from '@/components/ThemedText';
import { Cheque, DashboardStats } from '@/core/types/cheque';
import { getDashboardStats, listCheques } from '@/features/cheques/repository';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [nextStats, nextCheques] = await Promise.all([
        getDashboardStats(),
        listCheques({ sortBy: 'dueDate', sortDirection: 'asc' }),
      ]);

      setStats(nextStats);
      setUpcoming(nextCheques.filter((cheque) => cheque.status === 'En cours').slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  if (loading || !stats) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="title">Cheque Reminder</ThemedText>
          <ThemedText style={styles.subtitle}>
            Suivi local des chèques émis, rappels automatiques et exports.
          </ThemedText>
        </View>
        <AppButton label="Nouveau chèque" compact onPress={() => router.push('/cheque/new')} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total chèques" value={`${stats.totalCheques}`} accent="primary" />
        <StatCard label="Actifs" value={`${stats.activeCheques}`} accent="success" />
        <StatCard label="Sous 48h" value={`${stats.dueSoonCheques}`} accent="warning" />
        <StatCard label="Expirés" value={`${stats.expiredCheques}`} accent="danger" />
        <StatCard
          label="Montant total"
          value={stats.totalAmountFormatted}
          accent="neutral"
          style={styles.amountCard}
        />
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Échéances proches</ThemedText>
        <AppButton variant="ghost" compact label="Voir tout" onPress={() => router.push('/(tabs)/cheques')} />
      </View>

      {upcoming.length ? (
        <View style={styles.list}>
          {upcoming.map((cheque) => (
            <ChequeCard
              key={cheque.id}
              cheque={cheque}
              onPress={() => router.push(`/cheque/${cheque.id}`)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="Aucun chèque actif"
          description="Ajoutez un chèque pour commencer à suivre vos échéances."
          actionLabel="Créer un chèque"
          onAction={() => router.push('/cheque/new')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 24,
  },
  header: {
    gap: 14,
  },
  headerText: {
    gap: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountCard: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
});
