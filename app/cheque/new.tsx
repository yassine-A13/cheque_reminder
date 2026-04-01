import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ChequeForm } from '@/components/forms/ChequeForm';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ChequeInput } from '@/core/types/cheque';
import { createCheque } from '@/features/cheques/repository';

export default function NewChequeScreen() {
  const router = useRouter();

  const handleSubmit = async (values: ChequeInput) => {
    try {
      const cheque = await createCheque(values);
      router.replace(`/cheque/${cheque.id}`);
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer le chèque.");
    }
  };

  return (
    <Screen scrollable>
      <ThemedText type="title">Nouveau chèque</ThemedText>
      <ThemedText>Ajoutez un chèque et programmez automatiquement le rappel à 48 heures.</ThemedText>
      <ChequeForm submitLabel="Enregistrer" onSubmit={handleSubmit} />
    </Screen>
  );
}
