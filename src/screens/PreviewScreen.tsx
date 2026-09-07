import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useApp } from "../state/AppContext";
import { contactDisplayName, type ContactMatch } from "../lib/contacts";
import { Card, OperatorBadge, PrimaryButton, Screen } from "../components/ui";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Preview">;

function MatchRow({
  match,
  expanded,
  onToggle,
}: {
  match: ContactMatch;
  expanded: boolean;
  onToggle: () => void;
}) {
  const name = contactDisplayName(match.contact);

  return (
    <Card style={styles.row}>
      <Pressable onPress={onToggle} style={styles.rowHeader}>
        <View style={styles.rowHeaderText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.rowCount}>
            {match.changes.length} number{match.changes.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "?" : "?"}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.changes}>
          {match.changes.map((change) => (
            <View key={change.phoneId} style={styles.changeRow}>
              <View style={styles.changeNumbers}>
                <Text style={styles.oldNumber} numberOfLines={1}>
                  {change.original}
                </Text>
                <Text style={styles.arrow}>?</Text>
                <Text style={styles.newNumber} numberOfLines={1}>
                  {change.updated}
                </Text>
              </View>

              <OperatorBadge operator={change.rule.operator} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function PreviewScreen({ navigation }: Props) {
  const {
    matches,
    totalContacts,
    totalNumbersToUpdate,
    scanning,
    scanError,
    scan,
    applying,
    apply,
    appliedAt,
  } = useApp();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const onApply = useCallback(async () => {
    const result = await apply();

    navigation.replace("Success", {
      contactsUpdated: result.contactsUpdated,
      numbersUpdated: result.numbersUpdated,
      contactsFailed: result.contactsFailed,
    });
  }, [apply, navigation]);

  if (scanning) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Scanning contacts…</Text>
      </Screen>
    );
  }

  if (scanError) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.error}>{scanError}</Text>
        <PrimaryButton title="Try again" onPress={scan} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts ready</Text>

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          hitSlop={10}
        >
          <Text style={styles.gear}>??</Text>
        </Pressable>
      </View>

      {matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emoji}>??</Text>
          <Text style={styles.emptyTitle}>Nothing to update</Text>

          <Text style={styles.emptyBody}>
            We scanned {totalContacts} contacts. None of their numbers match
            the migration rules — they may already be in the new 9-digit
            format. Check the rules in Settings if you think something is
            missing.
          </Text>

          <PrimaryButton
            title="Scan again"
            onPress={scan}
            variant="secondary"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryBig}>{totalNumbersToUpdate}</Text>

            <Text style={styles.summaryText}>
              {totalNumbersToUpdate === 1
                ? "number will be updated"
                : "numbers will be updated"}{" "}
              in {matches.length}{" "}
              {matches.length === 1 ? "contact" : "contacts"} (of{" "}
              {totalContacts} scanned). Nothing is changed yet.
            </Text>
          </View>

          <FlatList
            data={matches}
            keyExtractor={(m) => m.contact.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MatchRow
                match={item}
                expanded={expandedIds.has(item.contact.id)}
                onToggle={() => toggle(item.contact.id)}
              />
            )}
          />

          <View style={styles.cta}>
            <PrimaryButton
              title={`Update ${matches.length} ${
                matches.length === 1 ? "contact" : "contacts"
              } for free`}
              onPress={onApply}
              loading={applying}
            />

            <Text style={styles.freeNote}>
              Free update. A backup is made automatically before any changes.
            </Text>
          </View>
        </>
      )}

      {appliedAt ? (
        <Text style={styles.appliedNote}>
          Last updated on this device:{" "}
          {new Date(appliedAt).toLocaleDateString()}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  centerText: {
    color: colors.muted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  gear: {
    fontSize: 20,
    color: colors.muted,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryBig: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.primary,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  row: {
    padding: 12,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowHeaderText: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  rowCount: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 14,
    color: colors.muted,
  },
  changes: {
    marginTop: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  changeRow: {
    gap: 4,
  },
  changeNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  oldNumber: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  arrow: {
    color: colors.muted,
    fontSize: 12,
  },
  newNumber: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  cta: {
    padding: 20,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  freeNote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  appliedNote: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
    paddingBottom: 8,
  },
  emoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
});


