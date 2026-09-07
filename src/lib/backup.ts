import * as Contacts from "expo-contacts/legacy";
import { Contact as ModernContact } from "expo-contacts";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { countPhoneNumbers, readAllContacts } from "./contacts";

const BACKUP_DIR = new Directory(Paths.document, "prefixfix-backups");
const BACKUP_META_KEY = "prefixfix.latestBackup";

export interface BackupInfo {
  uri: string;
  createdAt: string;
  contactCount: number;
  numberCount: number;
}

export interface RestoreResult {
  updated: number;
  added: number;
  failed: number;
}

interface BackupPayload {
  app: string;
  version: number;
  exportedAt: string;
  contacts: Contacts.ExistingContact[];
}

export async function createBackup(): Promise<BackupInfo> {
  const contacts = await readAllContacts();

  const payload: BackupPayload = {
    app: "PrefixFix",
    version: 1,
    exportedAt: new Date().toISOString(),
    contacts,
  };

  BACKUP_DIR.create({ idempotent: true, intermediates: true });

  const file = new File(
    BACKUP_DIR,
    `prefixfix-backup-${Date.now()}.json`
  );

  file.create({ overwrite: true });
  file.write(JSON.stringify(payload));

  const info: BackupInfo = {
    uri: file.uri,
    createdAt: payload.exportedAt,
    contactCount: contacts.length,
    numberCount: countPhoneNumbers(contacts),
  };

  await AsyncStorage.setItem(
    BACKUP_META_KEY,
    JSON.stringify(info)
  );

  return info;
}

export async function getLatestBackup(): Promise<BackupInfo | null> {
  const raw = await AsyncStorage.getItem(BACKUP_META_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as BackupInfo;
  } catch {
    return null;
  }
}

/**
 * Restore phone numbers from a PrefixFix backup.
 *
 * Existing contacts are matched by contact ID.
 * Their current phone records are matched by phone ID and restored
 * to the number stored in the backup.
 *
 * Contacts that no longer exist are recreated from the backup.
 */
export async function restoreFromBackup(
  uri: string
): Promise<RestoreResult> {
  const file = new File(uri);

  if (!file.exists) {
    throw new Error("Backup file not found.");
  }

  const raw = await file.text();

  let payload: BackupPayload;

  try {
    payload = JSON.parse(raw) as BackupPayload;
  } catch {
    throw new Error("That file is not a valid PrefixFix backup.");
  }

  if (
    payload.app !== "PrefixFix" ||
    !Array.isArray(payload.contacts)
  ) {
    throw new Error("That file is not a valid PrefixFix backup.");
  }

  let updated = 0;
  let added = 0;
  let failed = 0;

  for (const backupContact of payload.contacts) {
    try {
      if (!backupContact.id) {
        failed += 1;
        continue;
      }

      const existing = await Contacts.getContactByIdAsync(
        backupContact.id
      );

      if (existing) {
        const modernContact = new ModernContact(
          backupContact.id
        );

        const currentPhones = await modernContact.getPhones();

        const backupPhones = backupContact.phoneNumbers ?? [];

        let changed = false;

        for (const backupPhone of backupPhones) {
          if (!backupPhone.id || !backupPhone.number) {
            continue;
          }

          const currentPhone = currentPhones.find(
            (phone) => phone.id === backupPhone.id
          );

          if (!currentPhone) {
            continue;
          }

          if (currentPhone.number !== backupPhone.number) {
            currentPhone.number = backupPhone.number;

            await modernContact.updatePhone(currentPhone);

            changed = true;
          }
        }

        if (changed) {
          updated += 1;
        }

        continue;
      }

      const { id: _id, ...fresh } = backupContact;

      await Contacts.addContactAsync(
        fresh as Contacts.Contact
      );

      added += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    updated,
    added,
    failed,
  };
}

export async function shareBackup(uri: string): Promise<void> {
  const file = new File(uri);

  if (!file.exists) {
    throw new Error("Backup file no longer exists.");
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "PrefixFix backup",
    UTI: "public.json",
  });
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0].uri;
}
