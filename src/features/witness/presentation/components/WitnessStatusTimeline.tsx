import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { fonts, spacing } from '../../../../theme';
import { WitnessApplicationStatus } from '../../domain/witnessApplication';
import { getStepState, WITNESS_STEPS } from '../../domain/witnessSteps';

/** Timeline vertikal 5 langkah jalur saksi: selesai (centang), berjalan (titik), belum (abu-abu). */
export default function WitnessStatusTimeline({ status }: { status: WitnessApplicationStatus }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {WITNESS_STEPS.map((step, index) => {
        const state = getStepState(status, index);
        const isLast = index === WITNESS_STEPS.length - 1;
        const dotColor = state === 'done' ? colors.success : state === 'current' ? colors.primary : colors.border;

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: state === 'pending' ? colors.surface : dotColor, borderColor: dotColor },
                ]}
              >
                {state === 'done' ? <Feather name="check" size={11} color="#FFFFFF" /> : null}
              </View>
              {!isLast ? (
                <View style={[styles.line, { backgroundColor: state === 'done' ? colors.success : colors.border }]} />
              ) : null}
            </View>
            <View style={[styles.textCol, !isLast && { paddingBottom: spacing.md }]}>
              <Text
                style={[
                  styles.label,
                  {
                    color: state === 'pending' ? colors.textMuted : colors.text,
                    fontFamily: state === 'current' ? fonts.bold : fonts.semiBold,
                  },
                ]}
              >
                {step.label}
              </Text>
              {state === 'current' ? (
                <Text style={[styles.description, { color: colors.textMuted }]}>{step.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  rail: { alignItems: 'center', width: 20 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 2 },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 13, lineHeight: 18 },
  description: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16 },
});
