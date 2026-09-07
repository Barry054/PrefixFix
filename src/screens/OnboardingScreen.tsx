import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useApp } from "../state/AppContext";
import { hasContactsPermission, requestContactsPermission } from "../lib/contacts";
import { Card, PrimaryButton, Screen, TextButton } from "../components/ui";
import { colors } from "../theme";
import { MIGRATION_DATE, OLD_FORMAT_DEADLINE } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const { scan, scanning, scanError } = useApp();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [asking, setAsking] = useState(false);

  const goToPreview = useCallback(() => {
    navigation.replace("Preview");
  }, [navigation]);

  const runScan = useCallback(async () => {
    await scan();
    goToPreview();
  }, [scan, goToPreview]);

  useEffect(() => {
    (async () => {
      if (await hasContactsPermission()) {
        runScan();
      }
    })();
  }, [runScan]);

  const onContinue = useCallback(async () => {
    setAsking(true);
    setPermissionDenied(false);

    try {
      const granted = await requestContactsPermission();

      if (granted) {
        await runScan();
      } else {
        setPermissionDenied(true);
      }
    } finally {
      setAsking(false);
    }
  }, [runScan]);

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.hero}>
          <Text style={styles.logo}>PrefixFix</Text>
          <Text style={styles.tagline}>
            The Gambia goes 9-digit on {MIGRATION_DATE}. Update your contacts in one tap.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.stepTitle}>1 · Give permission</Text>
          <Text style={styles.stepBody}>
            PrefixFix needs access to your contacts so it can find numbers that need updating.
          </Text>

          <Text style={styles.stepTitle}>2 · Preview</Text>
          <Text style={styles.stepBody}>
            We show you exactly which numbers will change before anything is modified.
          </Text>

          <Text style={styles.stepTitle}>3 · Update for free</Text>
          <Text style={styles.stepBody}>
            Update your eligible contacts to the new 9-digit format. PrefixFix is completely free.
            account is required.
          </Text>
        </Card>

        <View style={styles.actions}>
          {scanning ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Reading your contacts…</Text>
            </View>
          ) : scanError ? (
            <View>
              <Text style={styles.error}>{scanError}</Text>
              <PrimaryButton title="Try again" onPress={runScan} />
            </View>
          ) : permissionDenied ? (
            <View>
              <Text style={styles.error}>
                PrefixFix needs contact access to find and update your numbers.
              </Text>
              <PrimaryButton
                title="Open device settings"
                onPress={() => Linking.openSettings()}
              />
              <View style={styles.retryRow}>
                <TextButton title="I've enabled it — continue" onPress={onContinue} />
              </View>
            </View>
          ) : (
            <View>
              <PrimaryButton
                title="Continue"
                onPress={onContinue}
                loading={asking}
              />

              <Pressable
                onPress={() => navigation.navigate("Settings")}
                style={styles.settingsLink}
              >
                <Text style={styles.settingsText}>Settings</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.footnote}>
          Old 7-digit numbers work until {OLD_FORMAT_DEADLINE}, then stop. Gamtel/Gamcel numbers
          are not migrating yet.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 28 },
  logo: { fontSize: 34, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  card: { gap: 4 },
  stepTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 8 },
  stepBody: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  actions: { marginTop: 24 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: { color: colors.muted, fontSize: 14 },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  retryRow: { alignItems: "center", marginTop: 12 },
  settingsLink: { alignItems: "center", marginTop: 14 },
  settingsText: { color: colors.muted, fontSize: 14, textDecorationLine: "underline" },
  footnote: {
    marginTop: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 17,
  },
});
