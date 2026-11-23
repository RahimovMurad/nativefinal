# TripMate — Travel Planner & Explore

React Native (Expo SDK 58 + TypeScript + Expo Router) üzərində qurulmuş final layihə tətbiqi.

Layihənin arxitektura və kod strukturu [`Elvin1999/BizmanApp-morning`](https://github.com/Elvin1999/BizmanApp-morning) modelinə uyğun şəkildə (`src/` əsaslı qovluq quruluşu, `@/*` aliası, `Expo Router`, `React Native Paper`, `SQLite` repository qatı, `AsyncStorage`, `SecureStore`, `Context` və modul komponentlər) genişləndirilmiş və domenlər üzrə detallı bölünmüşdür.

---

## Demo Giriş Məlumatları

- **Email:** `admin@tripmate.az`
- **Şifrə:** `admin123`
- *(Login ekranında **"Demo hesabını doldur"** düyməsi ilə avtomatik doldurula bilər, həmçinin yeni hesab yarada bilərsiniz.)*

---

## Qovluq Strukturu (`src/`)

```text
src/
├── app/                         # Expo Router fayl-əsaslı naviqasiya (Stack + Drawer + Tabs)
│   ├── _layout.tsx              # Root Stack, SQLite init, Theme/Auth/Favorites/Trip Provider-lər
│   ├── onboarding.tsx           # Animasiyalı Splash / 3-səhifəli Onboarding
│   ├── login.tsx                # Giriş ekranı (validasiya + demo hesab)
│   ├── register.tsx             # Qeydiyyat ekranı
│   ├── +not-found.tsx           # 404 səhifəsi
│   ├── search.tsx               # Canlı debounced axtarış, filtr və son axtarış tarixçəsi
│   ├── (app)/                   # Drawer Navigator
│   │   ├── _layout.tsx          # Custom Drawer menyu
│   │   ├── (tabs)/              # Bottom Tabs (Explore, Map, My Trips, Favorites, Profile)
│   │   ├── journal/index.tsx    # Səyahət Jurnalı (Image Picker + SQLite)
│   │   └── settings.tsx         # Dark/Light Mode və hesab seçimləri
│   ├── destination/[id].tsx     # Dinamik məkan detalları + Open-Meteo canlı hava məlumatı
│   └── trip/
│       ├── create.tsx           # Yeni səyahət yaratmaq (tarix və büdcə validasiyası)
│       ├── edit/[id].tsx        # Səyahət redaktəsi və silinməsi
│       ├── [id].tsx             # Səyahət icmalı və lokal xatırlatma
│       └── [id]/
│           ├── itinerary.tsx    # SectionList ilə günlər üzrə plan
│           ├── activity-form.tsx# Fəaliyyət əlavə etmə / redaktə
│           └── expenses.tsx     # Büdcə analitikası, BarChart və SQLite xərclər
├── components/                  # Təkrar istifadə olunan UI komponentləri (kateqoriyalar üzrə)
│   ├── cards/                   # StatCard, DestinationCard, PlaceCard, TripCard, ActivityItemCard, ExpenseItemCard, JournalEntryCard
│   ├── charts/                  # BarChart, BudgetProgressCard
│   ├── common/                  # AppHeader, SearchBar, CategoryChips, EmptyState, ErrorState, LoadingState, OfflineBanner
│   ├── forms/                   # FormField, DateInputModal
│   ├── map/                     # InteractiveMapView, MapMarkerDetailSheet
│   ├── modals/                  # ConfirmModal, ReminderModal
│   └── ui/                      # Baza UI komponentləri
├── config/                      # Tətbiq və REST API konfiqurasiyası
├── constants/                   # Kateqoriyalar, storage açarları, tema sabitləri, ilkin dataset
├── context/                     # ThemeContext, AuthContext, FavoritesContext, TripContext
├── database/                    # SQLite (WAL + FK) və domain repository-lər
│   ├── database.ts              # Singleton getDatabase() və schema/seed
│   └── repositories/            # user, destination, trip, activity, expense, favorite, journal repository-lər
├── hooks/                       # Custom hook-lar (useDebounce, useDestinations, useTrips, useLocationPermission, useImagePicker)
├── services/                    # Xarici servislər
│   ├── api/                     # httpClient, destinationService (Open-Meteo + cache), tripApiService
│   ├── device/                  # locationService (expo-location), notificationService (expo-notifications)
│   └── storage/                 # secureStoreService (expo-secure-store), asyncStorageService
├── theme/                       # Light/Dark palitralar, tipografiya və Paper tema konfiqurasiyası
├── types/                       # TypeScript modelləri, API DTO-ları, form və naviqasiya tipləri
├── utils/                       # Formatlaşdırma, tarix və büdcə hesablama funksiyaları
└── validators/                  # Auth, Trip/Activity, Expense/Journal form validatorları
```

---

## Əsas Funksionallıqlar

- **Navigation (Expo Router):** Root Stack (`Stack.Protected` ilə Auth/Onboarding qorunması) + Custom Drawer + 5 Bottom Tab + Dinamik Stack Detail ekranları (`[id]`) + `+not-found`.
- **REST API + Offline Keş:** `Open-Meteo` canlı hava məlumatı API-si, pagination, pull-to-refresh və `AsyncStorage` offline keşi.
- **SQLite Persistence (`expo-sqlite`):** 8 cədvəlli (`users`, `destinations`, `places`, `trips`, `activities`, `expenses`, `favorites`, `journal_entries`) relational baza, tam CRUD əməliyyatları və tətbiq bağlanıb açılanda vəziyyətin bərpası.
- **Təhlükəsiz Sessiya:** Auth tokenlərin `expo-secure-store` (webdə `AsyncStorage` fallback) ilə saxlanması.
- **Cihaz API-ləri:** `expo-image-picker` (profil şəkli və səyahət jurnalı fotoları), `expo-location` (xəritədə canlı GPS mövqeyi və məsafə hesablanması), `expo-notifications` (səyahət xatırlatması), `KeyboardAvoidingView` və icazə rəddi halının idarə edilməsi.
- **UI/UX:** Light/Dark Mode, animasiyalı Onboarding logosu, animasiyalı büdcə irəliləyiş çubuğu (`BudgetProgressCard`), `BarChart` xərc qrafiki, `SectionList` günlük marşrut, `FlatList`, `Modal`, `Switch`, `ActivityIndicator`.

---

## İşə Salma Təlimatı

1. Asılılıqları yükləyin:
   ```bash
   npm install
   ```
2. Layihəni başladın:
   ```bash
   npx expo start
   ```
3. Yoxlama əmrləri:
   ```bash
   npm run typecheck
   npm run web
   ```
