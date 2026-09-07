import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useApp } from "../state/AppContext";
import { Card, PrimaryButton, Screen, TextButton } from "../components/ui";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Success">;

export default function SuccessScreen({ navigation, route }: Props) {
  const { backup } = useApp();

  const {
    contactsUpdated,
    numbersUpdated,
    contactsFailed,
  } = route.params ?? {
    contactsUpdated: 0,
    numbersUpdated: 0,
    contactsFailed: 0,
  };

  const hasFailures = contactsFailed > 0;

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.check}>✓</Text>

        <Text style={styles.title}>
          {hasFailures ? "Update completed with warnings" : "Contacts updated!"}
        </Text>

        <Text style={styles.subtitle}>
          {numbersUpdated} number{numbersUpdated === 1 ? "" : "s"} updated across{" "}
          {contactsUpdated} contact{contactsUpdated === 1 ? "" : "s"} to the new
          9-digit format.
        </Text>

        {hasFailures && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {contactsFailed} contact{contactsFailed === 1 ? "" : "s"} could not be updated
            </Text>
            <Text style={styles.warningBody}>
              PrefixFix could not update these contacts. Your other successful
              updates were kept, and your original contacts are backed up.
            </Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Your original contacts are safe</Text>
          <Text style={styles.cardBody}>
            A full backup was created automatically before anything changed
            {backup ? ` (${new Date(backup.createdAt).toLocaleString()})` : ""}.
            You can restore it anytime from Settings — nothing is ever deleted.
          </Text>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            title="Backup & restore"
            onPress={() => navigation.navigate("Settings")}
          />
          <TextButton title="Done" onPress={() => navigation.popToTop()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  check: {
    fontSize: 56,
    fontWeight: "800",
    color: colors.success,
    backgroundColor: colors.primarySoft,
    width: 96,
    height: 96,
    textAlign: "center",
    lineHeight: 100,
    borderRadius: 48,
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginTop: 18,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  warningCard: {
    marginTop: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },
  warningBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginTop: 6,
  },
  card: {
    marginTop: 18,
    width: "100%",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginTop: 6,
  },
  actions: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
});

