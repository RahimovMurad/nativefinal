import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  DestinationCard,
  EmptyState,
  LoadingState,
} from '@/components';
import { useAppTheme, useFavorites } from '@/context';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { favoriteDestinations, isLoading, isFavorite, toggleFavorite } =
    useFavorites();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Sevimli Məkanlar"
        subtitle={`${favoriteDestinations.length} seçilmiş istiqamət`}
        showDrawer
      />

      {isLoading ? (
        <LoadingState label="Sevimlilər yüklənir..." />
      ) : (
        <FlatList
          data={favoriteDestinations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              isFavorite={isFavorite(item.id)}
              onPress={() =>
                router.push({
                  pathname: '/destination/[id]',
                  params: { id: String(item.id) },
                })
              }
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Sevimli məkan siyahısı boşdur"
              description="Kəşf et bölməsində bəyəndiyiniz məkanların ürək işarəsinə toxunaraq bura əlavə edin."
              actionLabel="Məkanları Kəşf Et"
              onAction={() => router.push('/(app)/(tabs)')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
});
