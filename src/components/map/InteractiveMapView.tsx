import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { Coordinates, Destination } from '@/types';

const TILE_SIZE = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 13;

type RegionPreset = {
  key: 'azerbaijan' | 'europe' | 'asia' | 'world';
  label: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

const REGION_PRESETS: RegionPreset[] = [
  {
    key: 'azerbaijan',
    label: 'Azərbaycan',
    latitude: 40.4,
    longitude: 48.4,
    zoom: 7,
  },
  {
    key: 'europe',
    label: 'Avropa',
    latitude: 45.5,
    longitude: 14.0,
    zoom: 4,
  },
  {
    key: 'asia',
    label: 'Asiya',
    latitude: 22.0,
    longitude: 112.0,
    zoom: 3,
  },
  {
    key: 'world',
    label: 'Dünya',
    latitude: 30.0,
    longitude: 45.0,
    zoom: 2,
  },
];

function clampLat(lat: number): number {
  return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function latLngToWorldPx(lat: number, lng: number, zoom: number) {
  const worldSize = TILE_SIZE * Math.pow(2, zoom);
  const sinLat = Math.sin((clampLat(lat) * Math.PI) / 180);
  const x = ((lng + 180) / 360) * worldSize;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldSize;
  return { x, y, worldSize };
}

function worldPxToLatLng(x: number, y: number, zoom: number): Coordinates {
  const worldSize = TILE_SIZE * Math.pow(2, zoom);
  const clampedY = Math.max(0, Math.min(worldSize, y));
  const lng = (x / worldSize) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * clampedY) / worldSize;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return {
    latitude: clampLat(lat),
    longitude: ((lng + 540) % 360) - 180,
  };
}

type FocusRequest = {
  latitude: number;
  longitude: number;
  zoom?: number;
  nonce: number;
};

type Props = {
  destinations: Destination[];
  selectedId: number | null;
  userCoords: Coordinates | null;
  focusRequest?: FocusRequest | null;
  onSelectDestination: (destination: Destination) => void;
  height?: number;
};

export function InteractiveMapView({
  destinations,
  selectedId,
  userCoords,
  focusRequest,
  onSelectDestination,
  height = 370,
}: Props) {
  const { colors, isDark } = useAppTheme();

  const [regionKey, setRegionKey] =
    useState<RegionPreset['key']>('azerbaijan');
  const [center, setCenter] = useState<Coordinates>({
    latitude: REGION_PRESETS[0].latitude,
    longitude: REGION_PRESETS[0].longitude,
  });
  const [zoom, setZoom] = useState<number>(REGION_PRESETS[0].zoom);
  const [canvasSize, setCanvasSize] = useState({ width: 340, height });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  centerRef.current = center;
  zoomRef.current = zoom;

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.55,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!focusRequest) return;
    setCenter({
      latitude: focusRequest.latitude,
      longitude: focusRequest.longitude,
    });
    if (focusRequest.zoom !== undefined) {
      setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, focusRequest.zoom)));
    }
  }, [focusRequest]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          const startPx = latLngToWorldPx(
            centerRef.current.latitude,
            centerRef.current.longitude,
            zoomRef.current
          );
          dragStartRef.current = { x: startPx.x, y: startPx.y };
        },
        onPanResponderMove: (_evt, gesture) => {
          if (!dragStartRef.current) return;
          const next = worldPxToLatLng(
            dragStartRef.current.x - gesture.dx,
            dragStartRef.current.y - gesture.dy,
            zoomRef.current
          );
          setCenter(next);
        },
        onPanResponderRelease: () => {
          dragStartRef.current = null;
        },
        onPanResponderTerminate: () => {
          dragStartRef.current = null;
        },
      }),
    []
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    if (width > 0 && h > 0) {
      setCanvasSize({ width, height: h });
    }
  };

  const centerWorld = useMemo(
    () => latLngToWorldPx(center.latitude, center.longitude, zoom),
    [center.latitude, center.longitude, zoom]
  );

  const topLeftX = centerWorld.x - canvasSize.width / 2;
  const topLeftY = centerWorld.y - canvasSize.height / 2;

  const tiles = useMemo(() => {
    const numTiles = Math.pow(2, zoom);
    const minTileX = Math.floor(topLeftX / TILE_SIZE);
    const maxTileX = Math.floor((topLeftX + canvasSize.width) / TILE_SIZE);
    const minTileY = Math.max(0, Math.floor(topLeftY / TILE_SIZE));
    const maxTileY = Math.min(
      numTiles - 1,
      Math.floor((topLeftY + canvasSize.height) / TILE_SIZE)
    );

    const servicePath = isDark
      ? 'Canvas/World_Dark_Gray_Base'
      : 'World_Street_Map';
    const result: {
      key: string;
      uri: string;
      left: number;
      top: number;
    }[] = [];

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      const wrappedX = ((tx % numTiles) + numTiles) % numTiles;
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        result.push({
          key: `${zoom}-${tx}-${ty}-${servicePath}`,
          uri: `https://server.arcgisonline.com/ArcGIS/rest/services/${servicePath}/MapServer/tile/${zoom}/${ty}/${wrappedX}`,
          left: tx * TILE_SIZE - topLeftX,
          top: ty * TILE_SIZE - topLeftY,
        });
      }
    }

    return result;
  }, [zoom, topLeftX, topLeftY, canvasSize.width, canvasSize.height, isDark]);

  const projectToScreen = (lat: number, lng: number) => {
    const pt = latLngToWorldPx(lat, lng, zoom);
    let dx = pt.x - centerWorld.x;
    // Handle horizontal world wrapping so nearest copy is shown
    if (dx > centerWorld.worldSize / 2) dx -= centerWorld.worldSize;
    if (dx < -centerWorld.worldSize / 2) dx += centerWorld.worldSize;

    const screenX = canvasSize.width / 2 + dx;
    const screenY = pt.y - topLeftY;
    const inView =
      screenX >= -24 &&
      screenX <= canvasSize.width + 24 &&
      screenY >= -24 &&
      screenY <= canvasSize.height + 24;

    return { x: screenX, y: screenY, inView };
  };

  const applyPreset = (preset: RegionPreset) => {
    setRegionKey(preset.key);
    setCenter({ latitude: preset.latitude, longitude: preset.longitude });
    setZoom(preset.zoom);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.presetRow}>
        {REGION_PRESETS.map((preset) => {
          const active = preset.key === regionKey;
          return (
            <Pressable
              key={preset.key}
              onPress={() => applyPreset(preset)}
              style={[
                styles.presetChip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : colors.navy,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        onLayout={handleLayout}
        {...panResponder.panHandlers}
        style={[
          styles.canvas,
          {
            height,
            backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
            borderColor: colors.border,
          },
        ]}
      >
        {/* Real Slippy Map Tiles */}
        {tiles.map((tile) => (
          <Image
            key={tile.key}
            source={{ uri: tile.uri }}
            style={[
              styles.tileImg,
              {
                left: tile.left,
                top: tile.top,
              },
            ]}
          />
        ))}

        {/* Coordinate HUD */}
        <View
          style={[
            styles.hudBadge,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="compass"
            size={14}
            color={colors.primaryText}
          />
          <Text style={[styles.hudText, { color: colors.navy }]}>
            {center.latitude.toFixed(2)}°, {center.longitude.toFixed(2)}° • Z{zoom}
          </Text>
        </View>

        {/* Zoom Controls */}
        <View
          style={[
            styles.zoomBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
            style={styles.zoomBtn}
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.navy} />
          </Pressable>
          <View
            style={[styles.zoomDivider, { backgroundColor: colors.border }]}
          />
          <Pressable
            onPress={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
            style={styles.zoomBtn}
          >
            <MaterialCommunityIcons
              name="minus"
              size={18}
              color={colors.navy}
            />
          </Pressable>
        </View>

        {/* User Live GPS Marker */}
        {userCoords
          ? (() => {
              const pt = projectToScreen(
                userCoords.latitude,
                userCoords.longitude
              );
              if (!pt.inView) return null;
              return (
                <View
                  pointerEvents="none"
                  style={[
                    styles.userMarkerWrap,
                    { left: pt.x - 16, top: pt.y - 16 },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.userPulse,
                      {
                        backgroundColor: `${colors.primary}45`,
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.userDot,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              );
            })()
          : null}

        {/* Destination Markers */}
        {destinations.map((dest) => {
          const pt = projectToScreen(dest.latitude, dest.longitude);
          if (!pt.inView) return null;
          const isSelected = dest.id === selectedId;

          return (
            <Pressable
              key={dest.id}
              onPress={() => {
                onSelectDestination(dest);
              }}
              style={[
                styles.pinWrap,
                {
                  left: pt.x - 28,
                  top: pt.y - 34,
                  zIndex: isSelected ? 20 : 10,
                },
              ]}
            >
              <View
                style={[
                  styles.pinBubble,
                  {
                    backgroundColor: isSelected ? colors.danger : colors.primary,
                    borderColor: '#FFFFFF',
                    transform: [{ scale: isSelected ? 1.15 : 1 }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
              <View
                style={[
                  styles.pinLabelBox,
                  {
                    backgroundColor: isSelected
                      ? '#0F172A'
                      : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pinLabel,
                    { color: isSelected ? '#FFFFFF' : colors.navy },
                  ]}
                  numberOfLines={1}
                >
                  {dest.name}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View
          pointerEvents="none"
          style={[
            styles.dragHint,
            { backgroundColor: 'rgba(15, 23, 42, 0.65)' },
          ]}
        >
          <Text style={styles.dragHintText}>Sürüşdür və böyüt • © Esri</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  canvas: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  tileImg: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  hudBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    zIndex: 30,
  },
  hudText: {
    fontSize: 11,
    fontWeight: '700',
  },
  zoomBox: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 30,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
  },
  userMarkerWrap: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
  userPulse: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 999,
  },
  userDot: {
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinWrap: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
  },
  pinBubble: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabelBox: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  dragHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 30,
  },
  dragHintText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '600',
  },
});
