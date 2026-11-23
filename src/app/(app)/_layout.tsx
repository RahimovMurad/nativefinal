import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { Image, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';

import { useAppTheme, useAuth } from '@/context';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const router = useRouter();

  const initials = (user?.fullName ?? 'TM')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.drawerWrap, { backgroundColor: colors.surface }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollWrap}
      >
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.border,
            },
          ]}
        >
          {user?.avatarUri ? (
            <Image
              source={{ uri: user.avatarUri }}
              style={styles.avatarImg}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <Text
            variant="titleMedium"
            style={[styles.userName, { color: colors.navy }]}
            numberOfLines={1}
          >
            {user?.fullName ?? 'Səyahətçi'}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: colors.muted }}
            numberOfLines={1}
          >
            {user?.email ?? ''}
          </Text>
        </View>

        <DrawerItemList {...props} />

        <Divider style={styles.divider} />

        <DrawerItem
          label="Axtarış"
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="magnify"
              color={colors.navy}
              size={size}
            />
          )}
          labelStyle={{ color: colors.navy, fontWeight: '600' }}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/search');
          }}
        />

        <DrawerItem
          label="Yeni Səyahət Planla"
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="plus-circle-outline"
              color={colors.primaryText}
              size={size}
            />
          )}
          labelStyle={{ color: colors.primaryText, fontWeight: '700' }}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/trip/create');
          }}
        />

        <DrawerItem
          label={isDark ? 'Açıq Rejim (Light)' : 'Qaranlıq Rejim (Dark)'}
          icon={({ size }) => (
            <MaterialCommunityIcons
              name={isDark ? 'white-balance-sunny' : 'weather-night'}
              color={isDark ? colors.warning : colors.navy}
              size={size}
            />
          )}
          labelStyle={{ color: colors.navy, fontWeight: '600' }}
          onPress={() => {
            toggleTheme();
          }}
        />
      </DrawerContentScrollView>

      <View
        style={[styles.drawerFooter, { borderTopColor: colors.border }]}
      >
        <DrawerItem
          label="Hesabdan Çıxış"
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="logout"
              color={colors.danger}
              size={size}
            />
          )}
          labelStyle={{ color: colors.danger, fontWeight: '700' }}
          onPress={async () => {
            props.navigation.closeDrawer();
            await signOut();
          }}
        />
      </View>
    </View>
  );
}

export default function AppDrawerLayout() {
  const { colors } = useAppTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerActiveTintColor: colors.primaryText,
        drawerInactiveTintColor: colors.navy,
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 290,
        },
        drawerLabelStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Əsas Səhifə',
          drawerIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="compass-outline"
              size={size}
              color={focused ? colors.primaryText : colors.navy}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="journal/index"
        options={{
          title: 'Səyahət Jurnalı',
          drawerIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={size}
              color={focused ? colors.primaryText : colors.navy}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          drawerIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size}
              color={focused ? colors.primaryText : colors.navy}
            />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerWrap: {
    flex: 1,
  },
  scrollWrap: {
    paddingTop: 12,
  },
  profileHeader: {
    marginHorizontal: 12,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 999,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userName: {
    fontWeight: '700',
  },
  divider: {
    marginVertical: 10,
    marginHorizontal: 14,
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingVertical: 6,
  },
});
