import * as XLSX from 'xlsx';
import { getStorageData, STORAGE_KEYS } from './storage';

export const EXCEL_FILE_HANDLE_KEY = 'cds_excel_file_handle';

export async function getExcelHandle() {
    // This requires user interaction to initiate first time, but we can store handle in indexedDB (not localStorage)
    // For simplicity in MVP, we might just trigger export or ask user to select file.
}

export async function exportToExcel() {
    const practice = await getStorageData(STORAGE_KEYS.PRACTICE);
    const mocks = await getStorageData(STORAGE_KEYS.MOCKS);
    const vocab = await getStorageData(STORAGE_KEYS.VOCAB);

    const wb = XLSX.utils.book_new();

    const practiceWS = XLSX.utils.json_to_sheet(practice);
    XLSX.utils.book_append_sheet(wb, practiceWS, "Practice");

    const mocksWS = XLSX.utils.json_to_sheet(mocks);
    XLSX.utils.book_append_sheet(wb, mocksWS, "Mocks");

    const vocabWS = XLSX.utils.json_to_sheet(vocab);
    XLSX.utils.book_append_sheet(wb, vocabWS, "Vocabulary");

    // In a real local file scenario, we use showSaveFilePicker if supported
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: 'CDS_Tracker_Data.xlsx',
            types: [{
                description: 'Excel File',
                accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
            }]
        });

        const writable = await handle.createWritable();
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        await writable.write(buf);
        await writable.close();
        return true;
    } catch (err) {
        console.error('Excel Export Failed:', err);
        return false;
    }
}
