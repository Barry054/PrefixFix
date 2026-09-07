import * as Contacts from "expo-contacts/legacy";
import { Contact as ModernContact } from "expo-contacts";
import {
  matchNumber,
  type MigrationRule,
  type NumberChange,
} from "./numbers";

export interface PhoneChange extends NumberChange {
  phoneId: string;
}

export interface ContactMatch {
  contact: Contacts.ExistingContact;
  changes: PhoneChange[];
}

export function contactDisplayName(contact: Contacts.ExistingContact): string {
  if (contact.name?.trim()) return contact.name.trim();

  const parts = [
    contact.firstName?.trim(),
    contact.lastName?.trim(),
  ].filter(Boolean);

  if (parts.length) return parts.join(" ");

  if (contact.company?.trim()) return contact.company.trim();

  return "Unnamed contact";
}

export const SCAN_FIELDS: Contacts.FieldType[] = [
  Contacts.Fields.ID,
  Contacts.Fields.Name,
  Contacts.Fields.FirstName,
  Contacts.Fields.LastName,
  Contacts.Fields.Company,
  Contacts.Fields.PhoneNumbers,
];

export async function hasContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.getPermissionsAsync();
  return status === Contacts.PermissionStatus.GRANTED;
}

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === Contacts.PermissionStatus.GRANTED;
}

export async function readAllContacts(
  fields: Contacts.FieldType[] = SCAN_FIELDS
): Promise<Contacts.ExistingContact[]> {
  const allContacts: Contacts.ExistingContact[] = [];
  const pageSize = 500;
  let pageOffset = 0;

  while (true) {
    const response = await Contacts.getContactsAsync({
      fields,
      pageSize,
      pageOffset,
    });

    allContacts.push(...response.data);

    if (!response.hasNextPage) {
      break;
    }

    pageOffset += response.data.length;
  }

  return allContacts;
}

export function countPhoneNumbers(
  contacts: Contacts.ExistingContact[]
): number {
  return contacts.reduce(
    (total, contact) => total + (contact.phoneNumbers?.length ?? 0),
    0
  );
}

export async function scanContacts(
  rules: MigrationRule[]
): Promise<{
  contacts: ContactMatch[];
  totalContacts: number;
}> {
  const contacts = await readAllContacts(SCAN_FIELDS);
  const matches: ContactMatch[] = [];

  for (const contact of contacts) {
    const changes: PhoneChange[] = [];

    for (const phone of contact.phoneNumbers ?? []) {
      if (!phone.id || !phone.number) continue;

      const change = matchNumber(phone.number, rules);

      if (!change) continue;

      changes.push({
        ...change,
        phoneId: phone.id,
      });
    }

    if (changes.length > 0) {
      matches.push({
        contact,
        changes,
      });
    }
  }

  return {
    contacts: matches,
    totalContacts: contacts.length,
  };
}

/**
 * Update every matched phone number using the modern Expo Contacts API.
 *
 * A modern Contact instance is created directly from the contact ID.
 * This avoids fetching only a limited subset of contacts and avoids the
 * legacy updateContactAsync Android error.
 */
export async function applyChanges(matches: ContactMatch[]): Promise<{
  contactsUpdated: number;
  numbersUpdated: number;
  contactsFailed: number;
}> {
  let contactsUpdated = 0;
  let numbersUpdated = 0;
  let contactsFailed = 0;

  for (const match of matches) {
    if (!match.contact.id) {
      contactsFailed += 1;
      continue;
    }

    try {
      const modernContact = new ModernContact(match.contact.id);
      const phones = await modernContact.getPhones();

      let contactChanged = false;

      for (const phone of phones) {
        if (!phone.id) continue;

        const change = match.changes.find(
          (item) => item.phoneId === phone.id
        );

        if (!change) continue;

        if (phone.number === change.updated) continue;

        phone.number = change.updated;

        await modernContact.updatePhone(phone);

        numbersUpdated += 1;
        contactChanged = true;
      }

      if (contactChanged) {
        contactsUpdated += 1;
      }
    } catch (error) {
      contactsFailed += 1;

      console.warn(
        `PrefixFix could not update contact ${match.contact.id}:`,
        error
      );
    }
  }

  return {
    contactsUpdated,
    numbersUpdated,
    contactsFailed,
  };
}
