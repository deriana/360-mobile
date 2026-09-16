import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PARTY_COLORS, PARTY_LOGOS, partyInitials } from '../data/legislative';
import { fonts } from '../theme';

export function PartyBadge({ party, size = 40 }: { party: string; size?: number }) {
  const logo = PARTY_LOGOS[party];
  const color = PARTY_COLORS[party] ?? '#64748B';

  if (logo) {
    return (
      <View
        style={[
          styles.logoWrap,
          { width: size, height: size, borderRadius: size * 0.22, padding: size * 0.08 },
        ]}
      >
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.32 }]} numberOfLines={1} adjustsFontSizeToFit>
        {partyInitials(party)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontFamily: fonts.extraBold },
  logoWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: '100%', height: '100%' },
});
