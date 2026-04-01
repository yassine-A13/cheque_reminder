import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { Cheque } from '@/core/types/cheque';
import { listCheques, replaceAllCheques } from '@/features/cheques/repository';

type BackupPayload = {
  exportedAt: string;
  cheques: Cheque[];
};

export async function exportBackupJson() {
  const cheques = await listCheques({ sortBy: 'createdAt', sortDirection: 'asc' });
  const payload: BackupPayload = {
    exportedAt: new Date().toISOString(),
    cheques,
  };
  const fileUri = `${FileSystem.cacheDirectory}cheques-backup-${Date.now()}.json`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Partager la sauvegarde JSON',
    UTI: 'public.json',
  });
}

export async function restoreBackupJson() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets.length) {
    return false;
  }

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const parsed = JSON.parse(content) as BackupPayload;

  if (!Array.isArray(parsed.cheques)) {
    throw new Error('Invalid backup file');
  }

  await replaceAllCheques(parsed.cheques);
  return true;
}
