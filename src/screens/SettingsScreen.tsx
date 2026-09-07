import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useApp } from "../state/AppContext";
import { pickBackupFile, shareBackup } from "../lib/backup";
import type { MigrationRule } from "../lib/numbers";
import {
  Card,
  OperatorBadge,
  PrimaryButton,
  Screen,
  SectionTitle,
  TextButton,
} from "../components/ui";
import { colors } from "../theme";
import { MIGRATION_DATE, OLD_FORMAT_DEADLINE } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

function ListRow({
  title,
  subtitle,
  onPress,
  danger,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTitle,
            danger && { color: colors.danger },
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function RulesEditor() {
  const { rules, removeRule, addRule, resetRules } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [operator, setOperator] = useState("");
  const [oldPattern, setOldPattern] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [oldLength, setOldLength] = useState("7");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    if (!operator.trim()) {
      return setFormError("Operator name is required.");
    }

    if (!/^\d+$/.test(oldPattern)) {
      return setFormError("Old pattern must be digits only.");
    }

    if (!/^\d+$/.test(newPrefix)) {
      return setFormError("New prefix must be digits only.");
    }

    if (oldLength && !/^\d+$/.test(oldLength)) {
      return setFormError("Old length must be digits only.");
    }

    const rule: MigrationRule = {
      operator: operator.trim(),
      oldPattern,
      transformType: "prefix-prepend",
      newPrefix,
      oldLength: oldLength ? Number(oldLength) : undefined,
    };

    addRule(rule);

    setOperator("");
    setOldPattern("");
    setNewPrefix("");
    setOldLength("7");
    setFormError(null);
    setShowForm(false);
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset rules?",
      "Restore the default QCell / Comium / Africell rules. Custom rules you added will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetRules,
        },
      ]
    );
  };

  return (
    <Card>
      {rules.length === 0 ? (
        <Text style={styles.mutedText}>
          No rules — nothing will be updated. Add one below.
        </Text>
      ) : (
        rules.map((rule, i) => (
          <View
            key={`${rule.operator}-${i}`}
            style={styles.ruleRow}
          >
            <View style={styles.ruleInfo}>
              <OperatorBadge operator={rule.operator} />

              <Text style={styles.ruleText}>
                {rule.oldPattern}…{" ? "}
                <Text style={styles.ruleNew}>
                  {rule.newPrefix}
                  {rule.oldPattern}…
                </Text>
                {rule.oldLength
                  ? `  (${rule.oldLength} digits)`
                  : ""}
              </Text>
            </View>

            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert(
                  "Remove rule?",
                  `Stop updating numbers for ${rule.operator}?`,
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => removeRule(i),
                    },
                  ]
                )
              }
            >
              <Text style={styles.remove}>×</Text>
            </Pressable>
          </View>
        ))
      )}

      {showForm ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Operator (e.g. QCell)"
            value={operator}
            onChangeText={setOperator}
            autoCapitalize="words"
          />

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Old start (e.g. 5)"
              value={oldPattern}
              onChangeText={setOldPattern}
              keyboardType="number-pad"
            />

            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="New prefix (e.g. 83)"
              value={newPrefix}
              onChangeText={setNewPrefix}
              keyboardType="number-pad"
            />

            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Length"
              value={oldLength}
              onChangeText={setOldLength}
              keyboardType="number-pad"
            />
          </View>

          {formError ? (
            <Text style={styles.formError}>{formError}</Text>
          ) : null}

          <View style={styles.formActions}>
            <PrimaryButton
              title="Add rule"
              onPress={submit}
              style={styles.formButton}
            />

            <TextButton
              title="Cancel"
              onPress={() => setShowForm(false)}
            />
          </View>
        </View>
      ) : (
        <View style={styles.formActions}>
          <PrimaryButton
            title="Add rule"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={styles.formButton}
          />

          <TextButton
            title="Reset to defaults"
            onPress={confirmReset}
          />
        </View>
      )}
    </Card>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const {
    backup,
    createBackupNow,
    restore,
    lastRestore,
    totalContacts,
    rules,
  } = useApp();

  const [busy, setBusy] = useState(false);

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);

    try {
      await fn();
    } catch (e) {
      Alert.alert(
        "Something went wrong",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const onCreateBackup = () =>
    withBusy(async () => {
      const info = await createBackupNow();

      Alert.alert(
        "Backup created",
        `${info.contactCount} contacts backed up (${info.numberCount} phone numbers).`
      );
    });

  const onExportBackup = () => {
    if (!backup) {
      return onCreateBackup();
    }

    withBusy(() => shareBackup(backup.uri));
  };

  const onRestore = (uri: string) =>
    withBusy(async () => {
      const result = await restore(uri);

      Alert.alert(
        "Restore complete",
        `${result.updated} contacts restored in place, ${result.added} re-created${
          result.failed
            ? `, ${result.failed} failed`
            : ""
        }.`
      );
    });

  const onRestoreBackup = () => {
    if (!backup) {
      Alert.alert(
        "No backup yet",
        "Create a backup first, or import one from a file."
      );
      return;
    }

    Alert.alert(
      "Restore from backup?",
      "Contacts will be overwritten with the state saved in the backup. Nothing is deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => onRestore(backup.uri),
        },
      ]
    );
  };

  const onImportBackup = () =>
    withBusy(async () => {
      const uri = await pickBackupFile();

      if (uri) {
        await onRestore(uri);
      }
    });

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.header}>
          <TextButton
            title="‹ Back"
            onPress={() => navigation.goBack()}
          />

          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SectionTitle>Backup & Restore</SectionTitle>

          <Card style={styles.group}>
            <ListRow
              title="Create backup now"
              subtitle={
                backup
                  ? `Latest: ${new Date(
                      backup.createdAt
                    ).toLocaleString()} · ${
                      backup.contactCount
                    } contacts`
                  : "Save the current contact list before making changes"
              }
              onPress={onCreateBackup}
            />

            <ListRow
              title="Export backup file"
              subtitle="Share the JSON backup (email, Drive…)"
              onPress={onExportBackup}
            />

            <ListRow
              title="Restore from backup"
              subtitle="Return contacts to the saved state"
              onPress={onRestoreBackup}
              danger
            />

            <ListRow
              title="Import backup file"
              subtitle="Restore from a file from another device"
              onPress={onImportBackup}
            />
          </Card>

          {lastRestore ? (
            <Text style={styles.hint}>
              Last restore: {lastRestore.updated} updated,{" "}
              {lastRestore.added} re-created
              {lastRestore.failed
                ? `, ${lastRestore.failed} failed`
                : ""}
              .
            </Text>
          ) : null}

          <SectionTitle>Migration rules</SectionTitle>

          <Text style={styles.hint}>
            Rules decide which numbers are updated.{" "}
            {rules.length} rule
            {rules.length === 1 ? "" : "s"} active · changes
            apply on the next scan.
          </Text>

          <RulesEditor />

          <SectionTitle>About</SectionTitle>

          <Card>
            <Text style={styles.aboutText}>
              The Gambia's phone numbers move from 7 to 9
              digits on {MIGRATION_DATE}: the operator prefix
              is added in front of your existing number (QCell
              83, Africell 87, Comium 86). Both formats work
              until {OLD_FORMAT_DEADLINE}. Gamtel/Gamcel are
              not migrating yet.
            </Text>

            <Text style={styles.aboutText}>
              PrefixFix only rewrites numbers that match a rule
              — everything else is left exactly as it is.{" "}
              {totalContacts} contacts on this device.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  group: {
    padding: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  rowPressed: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 17,
  },
  chevron: {
    fontSize: 18,
    color: colors.muted,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ruleInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 13,
    color: colors.muted,
  },
  ruleNew: {
    color: colors.text,
    fontWeight: "700",
  },
  remove: {
    fontSize: 16,
    color: colors.danger,
    padding: 4,
  },
  form: {
    marginTop: 12,
    gap: 8,
  },
  formRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  inputSmall: {
    flex: 1,
  },
  formError: {
    color: colors.danger,
    fontSize: 12,
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginHorizontal: 4,
    marginBottom: 8,
    lineHeight: 17,
  },
  aboutText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginBottom: 8,
  },
});
