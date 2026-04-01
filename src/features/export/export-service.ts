import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { listCheques } from '@/features/cheques/repository';
import { formatDisplayDate } from '@/utils/date';
import { formatAmount } from '@/utils/format';

function escapeCsvField(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function exportChequesCsv() {
  const cheques = await listCheques({ sortBy: 'dueDate', sortDirection: 'asc' });
  const rows = [
    ['Beneficiaire', 'Montant', 'NumeroCheque', 'Banque', 'DateEmission', 'DateEcheance', 'Statut', 'Note'],
    ...cheques.map((cheque) => [
      cheque.beneficiary,
      cheque.amount.toFixed(2),
      cheque.chequeNumber,
      cheque.bank ?? '',
      cheque.issueDate,
      cheque.dueDate,
      cheque.status,
      cheque.note ?? '',
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => escapeCsvField(String(cell))).join(',')).join('\n');
  const fileUri = `${FileSystem.cacheDirectory}cheques-${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Exporter les chèques en CSV',
    UTI: 'public.comma-separated-values-text',
  });
}

export async function exportChequesPdf() {
  const cheques = await listCheques({ sortBy: 'dueDate', sortDirection: 'asc' });
  const rows = cheques
    .map(
      (cheque) => `
        <tr>
          <td>${cheque.beneficiary}</td>
          <td>${formatAmount(cheque.amount)}</td>
          <td>${cheque.chequeNumber}</td>
          <td>${cheque.bank ?? '-'}</td>
          <td>${formatDisplayDate(cheque.issueDate)}</td>
          <td>${formatDisplayDate(cheque.dueDate)}</td>
          <td>${cheque.status}</td>
        </tr>
      `,
    )
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          p { color: #475569; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #e2e8f0; }
        </style>
      </head>
      <body>
        <h1>Cheque Reminder</h1>
        <p>Export du ${formatDisplayDate(new Date().toISOString(), true)}</p>
        <table>
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Montant</th>
              <th>N° chèque</th>
              <th>Banque</th>
              <th>Émission</th>
              <th>Échéance</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Exporter les chèques en PDF',
    UTI: '.pdf',
  });
}
