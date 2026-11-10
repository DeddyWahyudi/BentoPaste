# Efek Visual Antigravity pada Interactive Bento Grid

Menghadirkan pengalaman visual imersif bergaya **Google Antigravity** pada area Interactive Bento Grid melalui kanvas medan partikel biru-indigo menyatu di latar belakang yang bereaksi terhadap tarikan gravitasi dan pusaran kursor secara *real-time*, dipadukan dengan permukaan kartu Bento kaca transparan (*ultra-translucent obsidian glass*).

## User Review & Critical Decisions

> [!IMPORTANT]
> Pilihan desain berikut telah dikonfirmasi berdasarkan preferensi Anda dan siap diimplementasikan setelah Anda menyetujui rencana ini:

- **Confirmed Decision 1 (Penempatan Efek)**: Kanvas partikel menyatu secara utuh di belakang seluruh tabel/area Bento Grid, dengan kartu-kartu Bento dibuat transparan berlapis kaca (*frosted obsidian glass*) sehingga pergerakan partikel di bawahnya terlihat menembus antar kartu.
- **Confirmed Decision 2 (Interaksi Fisika Kursor)**: Efek gravitasi radial aktif — partikel titik/kapsul biru-indigo secara halus tertarik mendekati titik pusat kursor, membentuk pusaran kosmik (*vortex*) dengan orientasi sudut partikel yang mengarah ke pusat gravitasi kursor, lalu kembali melayang tenang saat kursor meninggalkan area Bento Grid.

## 1. Overview & Core Concept

- **What It Does**: Mengubah kontainer Bento Grid menjadi bidang antariksa gelap (`#040407`) yang memiliki lapisan kanvas partikel HTML5 60fps di latar belakangnya. Ratusan partikel kapsul/titik mikro berwarna elektrik biru, indigo, dan violet tersusun dalam pola cincin radial yang hidup dan merespons posisi kursor dengan fisika pegas (*spring-damped radial gravity & orbital swirl*).
- **Target Audience / Persona**: Pengguna QuickClip yang menginginkan tampilan *workspace* modern, futuristik, dan responsif ala Google Antigravity tanpa mengorbankan keterbacaan teks catatan maupun kecepatan salin 1-klik / tombol angka `[1-9]`.
- **Key Value**: Memberikan kedalaman visual kelas produksi pada fokus elemen Bento Grid sekaligus menjaga seluruh fungsi kustomisasi kartu (tambah kartu, lepas kartu `[✕]`, reset susunan, dan salin instan) tetap tajam dan berkinerja tinggi.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Kondisi Idle (Tanpa Kursor)**: Saat kursor berada di luar area Bento Grid, medan partikel bergerak perlahan dalam orbit radial konsentris yang tenang mengelilingi pusat Bento Grid seperti pusaran galaksi lembut.
  2. **Interaksi Hover & Gravitasi Kursor**: Saat pengguna menggerakkan mouse di atas Bento Grid, pusat gravitasi pusaran berpindah secara mulus (*interpolasi lerping*) mengikuti posisi kursor. Partikel-partikel di sekitarnya tertarik mendekat, memanjang sedikit membentuk kapsul arah radial (*directional vector streaks*) seperti tampilan Google Antigravity, dan berpendar lebih terang di dekat kursor.
  3. **Interaksi Kartu Bento Transparan**: Setiap kartu di atas kanvas memiliki latar kaca gelap semi-transparan (`bg-black/45 backdrop-blur-[6px]`) dengan bingkai mikro bercahaya yang memantulkan pendaran biru-indigo ketika kursor berada di dekatnya, sementara teks judul dan isi catatan tetap kontras tinggi (WCAG AA) dan mudah dibaca.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Deep-Space Orbital Precision (terinspirasi langsung dari referensi visual Google Antigravity).
  - *Color Palette & Mood*:
    - Kanvas Dasar Bento: `#030306` hingga `#09090b` (Pitch Obsidian).
    - Partikel Antigravity: Spektrum biru elektrik (`#3B82F6`), indigo terang (`#6366F1`), biru langit redup (`#60A5FA`), dan aksen ungu kosmik (`#8B5CF6`).
    - Permukaan Kartu Bento: `rgba(10, 10, 16, 0.48)` dengan *border* `rgba(255, 255, 255, 0.12)` dan sorotan *hover* `rgba(99, 102, 241, 0.45)`.
  - *Typography & Hierarchy*: Mempertahankan hierarki `Plus Jakarta Sans` untuk judul kartu dan `JetBrains Mono` (`tabular-nums`) untuk badge `Slot [1-9]` serta penghitung salinan.
- **Interactive Feedback & Motion**:
  - Render loop menggunakan `requestAnimationFrame` dengan pembersihan otomatis dan dukungan `ResizeObserver` serta `devicePixelRatio` agar partikel tajam di layar Retina/HiDPI.
  - Mematuhi `prefers-reduced-motion` (jika diaktifkan pada sistem operasi, partikel ditampilkan dalam formasi radial statis yang elegan).

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Kanvas HTML5 2D Berbasis Vektor Radial vs. Elemen DOM CSS**
  - *Chosen Approach*: Menggunakan kanvas HTML5 2D khusus di lapisan latar belakang kontainer Bento Grid.
  - *Why*: Menggambar 350–450 partikel kapsul berorientasi sudut (*oriented pill/dash particles*) dengan kalkulasi jarak dan gravitasi kursor secara *real-time* di kanvas jauh lebih ringan (60fps stabil dengan beban CPU/GPU minimal) dibandingkan menganimasikan ratusan elemen DOM.
  - *Alternatives Considered*: Ratusan `<div>` dengan animasi CSS tidak dapat mengarahkan rotasi tiap titik secara presisi ke arah kursor dan akan membebani *layout engine* browser.
- **Decision 2: Tingkat Transparansi Kartu Bento (`SpotlightCard`)**
  - *Chosen Approach*: Menurunkan opasitas latar kartu Bento menjadi ~45% dengan `backdrop-blur` ringan (`backdrop-blur-[4px]`) khusus di dalam Bento Grid.
  - *Why*: Agar aliran partikel biru-indigo di kanvas belakang tetap terlihat jelas menembus sela-sela dan badan kartu, namun teks catatan di atas kartu tetap sangat jelas dibaca tanpa gangguan visual.

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       BentoGridShowcase Container                       │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │        Unified Antigravity Wrapper (Selected Grid Element)        │  │
│  │   • Tracks Mouse Coordinates (x, y) & Hover State                 │  │
│  │   • Deep Obsidian Container (#040408) + Subtle Outer Glow         │  │
│  │                                                                   │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │     Layer 0: Antigravity Particle Field Canvas (2D)       │   │  │
│  │   │   • Radial ring distribution of blue/indigo dash-dots     │   │  │
│  │   │   • Cursor gravity attraction + orbital tangential swirl  │   │  │
│  │   │   • Velocity-aligned capsule rendering (Antigravity look) │   │  │
│  │   └─────────────────────────────┬─────────────────────────────┘   │  │
│  │                                 │ Visual Underlay                 │  │
│  │                                 ▼                                 │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │     Layer 1: 3-Column Interactive Bento Grid (z-10)       │   │  │
│  │   │                                                           │   │  │
│  │   │  ┌─────────────────────────┐  ┌────────────────────────┐  │   │  │
│  │   │  │ Translucent Bento Card  │  │ Translucent Bento Card │  │   │  │
│  │   │  │ • Slot [1] Badge        │  │ • Slot [2..N] Badge    │  │   │  │
│  │   │  │ • [✕] Remove Handler    │  │ • [✕] Remove Handler   │  │   │  │
│  │   │  │ • 1-Click Copy Handler  │  │ • 1-Click Copy Handler │  │   │  │
│  │   │  └─────────────────────────┘  └────────────────────────┘  │   │  │
│  │   │  ┌─────────────────────────────────────────────────────┐  │   │  │
│  │   │  │          [+ Tambah Kartu Bento] Slot Card           │  │   │  │
│  │   │  └─────────────────────────────────────────────────────┘  │   │  │
│  │   └───────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Setiap partikel dalam kanvas menyimpan posisi dasar orbit `(baseRadius, baseAngle)`, posisi aktual `(x, y)`, kecepatan `(vx, vy)`, ukuran ketebalan, warna dari palet biru-indigo Antigravity, serta sudut orientasi menuju pusat gravitasi aktif.
  - Pusat gravitasi aktif `(attractorX, attractorY)` melakukan interpolasi halus menuju posisi kursor saat kursor berada di dalam Bento Grid, atau kembali ke titik tengah Bento Grid saat kursor keluar.
- **Interactive Component & State Mapping**:
  - `onMouseMove` pada pembungkus Bento Grid memperbarui koordinat target gravitasi secara langsung menggunakan `useRef` (tanpa memicu *re-render* React yang tidak perlu pada setiap piksel gerakan mouse).
  - Seluruh interaksi kartu di lapisan atas (`onCopy`, `onRemoveFromBento`, `setIsAddModalOpen`, dan `onResetBento`) tetap berfungsi penuh di atas kanvas (`pointer-events-none` pada kanvas latar).
