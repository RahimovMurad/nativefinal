import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, useAuth } from '@/context';

type Slide = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badge: string;
  title: string;
  description: string;
  accent: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'earth',
    badge: 'EXPLORE',
    title: 'Dünyanı və Azərbaycanı Kəşf Et',
    description:
      'Bakıdan Kyotoya, Şuşadan Romaya qədər seçilmiş şəhərlər, turistik məkanlar və canlı ölkə məlumatlarını araşdır.',
    accent: '#2563EB',
  },
  {
    icon: 'calendar-check-outline',
    badge: 'PLAN',
    title: 'Günlər Üzrə Marşrut Tərtib Et',
    description:
      'Səyahət tarixlərini seç, hər gün üçün saatlıq fəaliyyətlər əlavə et və xəritədə məsafələri ölç.',
    accent: '#10B981',
  },
  {
    icon: 'wallet-outline',
    badge: 'REMEMBER',
    title: 'Büdcəni İzlə, Xatirələri Saxla',
    description:
      'Xərcləri kateqoriyalar üzrə qrafiklərlə izlə, fotolu səyahət jurnalı yarat və offline rejimdə belə planlarına bax.',
    accent: '#8B5CF6',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const { colors } = useAppTheme();

  const [step, setStep] = useState(0);
  const pulseScale = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 0.94,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseScale]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [step, fadeAnim]);

  const current = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await completeOnboarding();
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="airplane" size={16} color="#FFFFFF" />
          </View>
          <Text
            variant="titleMedium"
            style={[styles.brandName, { color: colors.navy }]}
          >
            TripMate
          </Text>
        </View>

        <Pressable onPress={completeOnboarding} hitSlop={8}>
          <Text style={[styles.skipText, { color: colors.muted }]}>Keç</Text>
        </Pressable>
      </View>

      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.heroCircle,
            {
              backgroundColor: `${current.accent}1A`,
              borderColor: `${current.accent}40`,
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <View
            style={[styles.innerCircle, { backgroundColor: current.accent }]}
          >
            <MaterialCommunityIcons
              name={current.icon}
              size={64}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.badgePill,
              { backgroundColor: `${current.accent}18` },
            ]}
          >
            <Text style={[styles.badgeText, { color: current.accent }]}>
              {current.badge}
            </Text>
          </View>

          <Text
            variant="headlineMedium"
            style={[styles.title, { color: colors.navy }]}
          >
            {current.title}
          </Text>

          <Text
            variant="bodyLarge"
            style={[styles.desc, { color: colors.muted }]}
          >
            {current.description}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((s, index) => {
            const active = index === step;
            return (
              <Pressable
                key={s.badge}
                onPress={() => setStep(index)}
                style={[
                  styles.dot,
                  {
                    width: active ? 26 : 8,
                    backgroundColor: active ? current.accent : colors.border,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleNext}
          buttonColor={current.accent}
          contentStyle={styles.ctaContent}
          style={styles.ctaBtn}
        >
          {isLast ? 'Səyahətə Başla' : 'Növbəti'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniLogo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontWeight: '800',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCircle: {
    width: 196,
    height: 196,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  innerCircle: {
    width: 132,
    height: 132,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCard: {
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    gap: 20,
    paddingBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  ctaBtn: {
    borderRadius: 14,
  },
  ctaContent: {
    paddingVertical: 6,
  },
});
