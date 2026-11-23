import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';

import {
  AppHeader,
  BarChart,
  FormField,
  StatCard,
} from '@/components';
import { useAppTheme, useAuth, useTripsContext } from '@/context';
import { useImagePicker } from '@/hooks';
import { moneyCompact } from '@/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, updateProfile, signOut } = useAuth();
  const { stats, refreshStats } = useTripsContext();
  const { pickFromGallery, takePhoto, isPicking } = useImagePicker();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  const initials = (user?.fullName ?? 'TM')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleChangeAvatar = () => {
    Alert.alert('Profil Şəkli', 'Foto mənbəyini seçin', [
      {
        text: 'Qalereyadan seç',
        onPress: async () => {
          const uri = await pickFromGallery();
          if (uri) await updateProfile({ avatarUri: uri });
        },
      },
      {
        text: 'Kamera ilə çək',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) await updateProfile({ avatarUri: uri });
        },
      },
      { text: 'Ləğv et', style: 'cancel' },
    ]);
  };

  const openEditProfile = () => {
    setFullName(user?.fullName ?? '');
    setBio(user?.bio ?? '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (fullName.trim().length < 2) {
      Alert.alert('Xəta', 'Ad ən azı 2 simvol olmalıdır.');
      return;
    }
    await updateProfile({ fullName, bio });
    setEditModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Profil"
        subtitle="Şəxsi məlumatlar və səyahət statistikası"
        showDrawer
        rightIcon="cog-outline"
        onRightPress={() => router.push('/(app)/settings')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={handleChangeAvatar}
            disabled={isPicking}
            style={styles.avatarWrap}
          >
            {user?.avatarUri ? (
              <Image
                source={{ uri: user.avatarUri }}
                style={styles.avatarImg}
              />
            ) : (
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View
              style={[
                styles.cameraBadge,
                { backgroundColor: colors.primary, borderColor: colors.surface },
              ]}
            >
              <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text
            variant="titleLarge"
            style={[styles.userName, { color: colors.navy }]}
          >
            {user?.fullName ?? 'İstifadəçi'}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {user?.email ?? ''}
          </Text>
          {user?.bio ? (
            <Text
              variant="bodyMedium"
              style={[styles.bio, { color: colors.muted }]}
            >
              {user.bio}
            </Text>
          ) : null}

          <View style={styles.profileBtns}>
            <Button
              mode="outlined"
              icon="pencil-outline"
              textColor={colors.primaryText}
              onPress={openEditProfile}
              style={[styles.profileBtn, { borderColor: colors.border }]}
            >
              Profili Düzəlt
            </Button>
            <Button
              mode="contained-tonal"
              icon="image-edit-outline"
              onPress={handleChangeAvatar}
              loading={isPicking}
              style={styles.profileBtn}
            >
              Şəkli Dəyiş
            </Button>
          </View>
        </View>

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: colors.navy }]}
        >
          Səyahət Statistikası
        </Text>

        <View style={styles.statsGrid}>
          <StatCard
            label="Səyahətlər"
            value={String(stats.tripCount)}
            icon="airplane"
            accent={colors.primaryText}
          />
          <StatCard
            label="Sevimlilər"
            value={String(stats.favoriteCount)}
            icon="heart"
            accent={colors.danger}
          />
          <StatCard
            label="Ümumi Büdcə"
            value={moneyCompact(stats.totalBudget)}
            icon="wallet"
            accent={colors.success}
          />
          <StatCard
            label="Xərclənən"
            value={moneyCompact(stats.totalSpent)}
            icon="cash-multiple"
            accent={colors.warning}
          />
        </View>

        <BarChart
          title="Kateqoriyalar üzrə Ümumi Xərclər"
          points={stats.categoryExpenses}
        />

        <View
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Button
            mode="outlined"
            icon="book-open-page-variant-outline"
            textColor={colors.primaryText}
            onPress={() => router.push('/(app)/journal')}
            style={[styles.quickBtn, { borderColor: colors.border }]}
          >
            Səyahət Jurnalım ({stats.journalCount} qeyd)
          </Button>
          <Button
            mode="outlined"
            icon="cog-outline"
            textColor={colors.primaryText}
            onPress={() => router.push('/(app)/settings')}
            style={[styles.quickBtn, { borderColor: colors.border }]}
          >
            Görünüş və Sistem Ayarları
          </Button>
          <Button
            mode="contained"
            icon="logout"
            buttonColor={colors.danger}
            textColor="#FFFFFF"
            onPress={signOut}
            style={styles.quickBtn}
          >
            Çıxış Et
          </Button>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              variant="titleMedium"
              style={{ color: colors.navy, fontWeight: '700', marginBottom: 14 }}
            >
              Profili Redaktə Et
            </Text>

            <FormField
              label="Ad və Soyad"
              value={fullName}
              onChangeText={setFullName}
            />
            <FormField
              label="Haqqında"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button mode="text" onPress={() => setEditModalVisible(false)}>
                Ləğv et
              </Button>
              <Button mode="contained" onPress={handleSaveProfile}>
                Yadda saxla
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 34,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 999,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontWeight: '800',
  },
  bio: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  profileBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  profileBtn: {
    flex: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  quickBtn: {
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
});
