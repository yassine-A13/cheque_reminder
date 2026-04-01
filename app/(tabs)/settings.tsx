import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SettingsCard } from '@/components/SettingsCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemeSelector } from '@/components/ThemeSelector';
import { exportBackupJson, restoreBackupJson } from '@/features/backup/backup-service';
import { exportChequesCsv, exportChequesPdf } from '@/features/export/export-service';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { preference, setPreference } = useAppTheme();
  const { biometricEnabled, biometricSupported, setBiometricEnabled, lock } = useAuth();

  const handlePdfExport = async () => {
    try {
      await exportChequesPdf();
    } catch {
      Alert.alert('Export PDF', "L'export PDF a échoué.");
    }
  };

  const handleCsvExport = async () => {
    try {
      await exportChequesCsv();
    } catch {
      Alert.alert('Export CSV', "L'export CSV a échoué.");
    }
  };

  const handleBackup = async () => {
    try {
      await exportBackupJson();
    } catch {
      Alert.alert('Sauvegarde', "La sauvegarde JSON a échoué.");
    }
  };

  const handleRestore = async () => {
    try {
      const restored = await restoreBackupJson();

      if (restored) {
        Alert.alert('Restauration', 'Les données ont été restaurées avec succès.');
      }
    } catch {
      Alert.alert('Restauration', "Impossible de restaurer le fichier sélectionné.");
    }
  };

  const handleBiometricToggle = async () => {
    if (!biometricSupported) {
      Alert.alert('Biométrie indisponible', 'Aucun capteur biométrique utilisable n’a été détecté.');
      return;
    }

    const success = await setBiometricEnabled(!biometricEnabled);

    if (!success && !biometricEnabled) {
      Alert.alert('Activation refusée', 'La biométrie n’a pas pu être activée.');
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Réglages</ThemedText>
        <ThemedText>Personnalisation, sécurité locale et sauvegardes hors ligne.</ThemedText>
      </View>

      <SettingsCard title="Apparence" description="Choisissez le thème qui convient à votre usage.">
        <ThemeSelector selected={preference} onChange={setPreference} />
      </SettingsCard>

      <SettingsCard title="Sécurité" description="Le PIN reste obligatoire. La biométrie sert de raccourci.">
        <View style={styles.actions}>
          <SettingsCard.Action
            label="Biométrie"
            value={biometricSupported ? (biometricEnabled ? 'Activée' : 'Désactivée') : 'Indisponible'}
            onPress={handleBiometricToggle}
          />
          <SettingsCard.Action label="Changer le PIN" value="Modifier" onPress={() => router.push('/change-pin')} />
          <SettingsCard.Action label="Verrouiller maintenant" value="PIN" onPress={lock} />
        </View>
      </SettingsCard>

      <SettingsCard title="Exports" description="Partagez vos chèques en PDF ou CSV directement depuis Android.">
        <View style={styles.actions}>
          <SettingsCard.Action label="Exporter en PDF" value="Partager" onPress={handlePdfExport} />
          <SettingsCard.Action label="Exporter en CSV" value="Partager" onPress={handleCsvExport} />
        </View>
      </SettingsCard>

      <SettingsCard title="Sauvegarde locale" description="Créez un fichier JSON ou restaurez une sauvegarde existante.">
        <View style={styles.actions}>
          <SettingsCard.Action label="Sauvegarder en JSON" value="Créer" onPress={handleBackup} />
          <SettingsCard.Action label="Restaurer depuis JSON" value="Importer" onPress={handleRestore} />
        </View>
      </SettingsCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  header: {
    gap: 8,
  },
  actions: {
    gap: 12,
  },
});
