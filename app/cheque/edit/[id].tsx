import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ChequeForm } from '@/components/forms/ChequeForm';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { Cheque, ChequeInput } from '@/core/types/cheque';
import { getChequeById, updateCheque } from '@/features/cheques/repository';

export default function EditChequeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cheque, setCheque] = useState<Cheque | null>(null);

  useEffect(() => {
    const loadCheque = async () => {
      if (!id) {
        return;
      }

      const nextCheque = await getChequeById(Number(id));
      setCheque(nextCheque);
    };

    void loadCheque();
  }, [id]);

  const handleSubmit = async (values: ChequeInput) => {
    if (!id) {
      return;
    }

    try {
      await updateCheque(Number(id), values);
      router.replace(`/cheque/${id}`);
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour le chèque.");
    }
  };

  return (
    <Screen scrollable>
      <ThemedText type="title">Modifier le chèque</ThemedText>
      <ThemedText>Mettez à jour les informations et resynchronisez la notification locale.</ThemedText>
      {cheque ? <ChequeForm submitLabel="Mettre à jour" initialValues={cheque} onSubmit={handleSubmit} /> : null}
    </Screen>
  );
}
