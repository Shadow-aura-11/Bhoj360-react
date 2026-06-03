# Bhoj360 — Conversion to PHP + Laravel Plan
### (Full Stack — No React, No JavaScript Framework)

> **Project:** Restaurant Agency Management System (Bhoj360)
> **From:** Node.js (Express) + React/Vite + SQLite (Microservices Architecture)
> **To:** PHP 8.2+ / Laravel 11 + MySQL + **Blade + Livewire 3 + Alpine.js**
> **Saved As:** `Conversion to PHP Plan`
> **Last Updated:** 2026-06-02

---

## 1. Current Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                  CURRENT STACK (Node.js)                     │
│                                                              │
│  React/Vite SPA (15+ pages, React Router)                    │
│       ↓ HTTP/Axios + Socket.IO (WebSocket)                   │
│  Gateway (Express :4000) ← Reverse Proxy                    │
│       ↓ /api/*              ↓ /r/:restaurantId/*             │
│  Agency Core             Restaurant Microservices            │
│  (Express :3000)         (Express :3100, :3101, ...)         │
│       ↓                         ↓                           │
│  JSON flat files            SQLite DB per restaurant         │
│  (registry, config,         (db.sqlite)                      │
│   inquiries, blogs)                                          │
└──────────────────────────────────────────────────────────────┘
```

### Current Frontend Pages Inventory

| Page / Component | Type | Description |
|-----------------|------|-------------|
| `LandingPage.jsx` | Marketing | SaaS homepage with hero, features, pricing |
| `AboutPage.jsx` | Marketing | About the company |
| `FeaturesPage.jsx` | Marketing | Detailed feature list |
| `ShowcasePage.jsx` | Marketing | Screenshots/demo showcase |
| `PricingPage.jsx` | Marketing | Subscription plans |
| `BlogPage.jsx` + `BlogPostPage.jsx` | Marketing | Blog listing + detail |
| `CareerPage.jsx` | Marketing | Job openings + application form |
| `PrivacyPolicyPage.jsx` | Marketing | Privacy policy |
| `TermsPage.jsx` | Marketing | Terms of service |
| `RefundPolicyPage.jsx` | Marketing | Cancellation/refund policy |
| `ContactPage.jsx` | Public | Contact form |
| `AgencyLogin.jsx` | Agency | 2FA login (email + OTP) |
| `AgencyDashboard.jsx` | Agency | Manage all restaurants, billing, inquiries |
| `Login.jsx` | Restaurant | PIN-based staff login |
| `AdminDashboard.jsx` | Restaurant Admin | Overview stats |
| `MenuManager.jsx` | Restaurant Admin | CRUD menu items + addons |
| `TablesManager.jsx` | Restaurant Admin | Tables + QR codes |
| `ReservationsManager.jsx` | Restaurant Admin | Reservations calendar |
| `StaffSettings.jsx` | Restaurant Admin | Settings (PIN, GST, printer, etc.) |
| `StaffManager.jsx` | Restaurant Admin | Add/remove staff |
| `Analytics.jsx` | Restaurant Admin | Revenue charts |
| `CustomerDirectory.jsx` | Restaurant Admin | Phone-based customer list |
| `CouponsManager.jsx` | Restaurant Admin | Coupon CRUD |
| `MoneyManager.jsx` | Restaurant Admin | Financial overview |
| `WaiterDashboard.jsx` | Restaurant Staff | Tables + order taking |
| `CounterDashboard.jsx` | Restaurant Staff | KDS (Kitchen Display System) |
| `CashierDashboard.jsx` | Restaurant Staff | Billing + payment settlement |
| `SelfOrder.jsx` | Customer (Public) | QR-based self-ordering |
| `CustomerDashboard.jsx` | Customer | Track order status |

---

## 2. Target Architecture (100% PHP Laravel)

```
┌──────────────────────────────────────────────────────────────┐
│               TARGET STACK (Full PHP Laravel)                │
│                                                              │
│  Blade Templates + Livewire 3 Components + Alpine.js         │
│       (Zero React, Zero Vue, Zero Inertia.js)                │
│       ↓ HTTP (form submissions + Livewire AJAX)              │
│  Laravel 11 Application (single monolith)                    │
│       ↓                                                      │
│  MySQL 8 (single DB, multi-tenant via restaurant_id)         │
│       ↓ Broadcasting                                         │
│  Laravel Reverb (WebSocket — for real-time order updates)    │
│       ↓                                                      │
│  Laravel Queue — Email jobs, async tasks                     │
│  Laravel Mail — Invoice, OTP, reminder emails                │
│  Laravel Storage — Image uploads                             │
│  Laravel Cache — OTP sessions                                │
└──────────────────────────────────────────────────────────────┘
```

### Why Blade + Livewire + Alpine.js?

| Requirement | Solution |
|------------|----------|
| Server-rendered HTML (SEO, fast load) | **Blade** templates |
| Reactive UI without page reload (order cards, menus, tables) | **Livewire 3** components |
| Small UI interactions (dropdowns, modals, toggles) | **Alpine.js** |
| Real-time updates (new orders, KDS) | **Livewire polling** + **Laravel Reverb** |
| QR self-ordering flow | Blade + Livewire public component |
| Charts & graphs (analytics) | **Chart.js** (CDN, minimal JS) |
| No build toolchain needed | Vite kept only for compiling Tailwind CSS |

> **No React. No Vue. No Inertia. No npm dependency for UI components.**

---

## 3. Technology Stack Decisions

| Concern | Choice | Replaces |
|---------|--------|---------|
| PHP Framework | **Laravel 11** | Node.js + Express |
| Database | **MySQL 8** | Per-restaurant SQLite files |
| HTML Templating | **Blade** | React JSX |
| Reactive Components | **Livewire 3** | React state + hooks |
| Micro-interactions | **Alpine.js** (CDN) | React event handlers |
| Real-time | **Laravel Reverb** + Livewire Echo | Socket.IO |
| Auth (Agency) | **Laravel Session + Cache** | Custom token store |
| Auth (Staff PIN) | **Laravel Session** | x-role + x-pin headers |
| CSS Framework | **Tailwind CSS v3** | Custom CSS (index.css) |
| Charts | **Chart.js** (CDN script tag) | Recharts (React) |
| QR Codes | **simplesoftwareio/simple-qrcode** | qrcode npm package |
| Email | **Laravel Mail** | nodemailer |
| File Uploads | **Laravel Storage** | fs.writeFileSync |
| Queue/Jobs | **Laravel Queue** (database) | Node child_process |
| Testing | **PestPHP** | Vitest |

---

## 4. Database Design (MySQL Multi-tenant)

### Agency-Level Tables

```sql
-- Agency configuration (replaces agency-config.json)
CREATE TABLE agency_settings (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    `key`       VARCHAR(255) UNIQUE NOT NULL,
    value       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- All registered restaurants (replaces registry.json + per-folder configs)
CREATE TABLE restaurants (
    id                   VARCHAR(20) PRIMARY KEY,   -- REST-XXXXXX
    name                 VARCHAR(255) NOT NULL,
    slug                 VARCHAR(255) UNIQUE NOT NULL,
    logo_url             TEXT,
    description          TEXT,
    location             VARCHAR(255),
    contact_email        VARCHAR(255),
    contact_phone        VARCHAR(20),
    login_theme_color    VARCHAR(20) DEFAULT '#fafaf9',
    logout_redirect_url  TEXT,
    google_review_url    TEXT,
    qr_theme             VARCHAR(50) DEFAULT 'classic',
    billing_gst          JSON,                       -- {gst_enabled, gst_percent, ...}
    active               BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subscription plans per restaurant (replaces JSON subscription{} field)
CREATE TABLE subscriptions (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id     VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    plan_name         VARCHAR(100) DEFAULT 'Bronze Plan',
    price             DECIMAL(10,2) DEFAULT 999.00,
    billing_cycle     ENUM('Monthly','Yearly') DEFAULT 'Monthly',
    status            ENUM('Trial','Active','Expired','Cancelled') DEFAULT 'Trial',
    start_date        DATE,
    next_billing_date DATE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment records (replaces JSON paymentHistory[] array)
CREATE TABLE payments (
    id              VARCHAR(20) PRIMARY KEY,         -- PAY-XXXXXX
    restaurant_id   VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    date            DATE,
    amount          DECIMAL(10,2),
    plan_name       VARCHAR(100),
    method          VARCHAR(50),
    transaction_id  VARCHAR(255),
    status          ENUM('Paid','Pending','Failed') DEFAULT 'Paid',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions (replaces inquiries.json)
CREATE TABLE inquiries (
    id          VARCHAR(20) PRIMARY KEY,             -- INQ-XXXXXX
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(20),
    company     VARCHAR(255),
    subject     VARCHAR(255) DEFAULT 'General Inquiry',
    message     TEXT,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts
CREATE TABLE blog_posts (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    title       VARCHAR(255),
    excerpt     TEXT,
    content     LONGTEXT,
    author      VARCHAR(255),
    published   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Career applications
CREATE TABLE applications (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(20),
    position    VARCHAR(255),
    message     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Restaurant-Level Tables (Multi-tenant)

```sql
-- Role PINs (replaces config.json pins{})
CREATE TABLE restaurant_pins (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id VARCHAR(20) UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    admin_pin     VARCHAR(255),
    waiter_pin    VARCHAR(255),
    counter_pin   VARCHAR(255),
    cashier_pin   VARCHAR(255),
    customer_pin  VARCHAR(255),
    printer_enabled BOOLEAN DEFAULT FALSE,
    printer_size  ENUM('58mm','80mm') DEFAULT '80mm'
);

-- Staff members
CREATE TABLE staff (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    username      VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          ENUM('admin','waiter','counter','cashier') NOT NULL,
    pin           VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, username)
);

-- Dining tables
CREATE TABLE dining_tables (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id    VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    number           VARCHAR(50) NOT NULL,
    capacity         INT DEFAULT 4,
    section          VARCHAR(100) DEFAULT 'Main',
    status           ENUM('available','pending','preparing','ready','occupied','reserved') DEFAULT 'available',
    qr_token         VARCHAR(255),
    qr_generated_at  TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, number)
);

-- Menu items
CREATE TABLE menu_items (
    id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id      VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    category           VARCHAR(100) NOT NULL,
    price              DECIMAL(10,2) NOT NULL,
    available          BOOLEAN DEFAULT TRUE,
    image_url          TEXT,
    image_placeholder  VARCHAR(50),
    sort_order         INT DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu item add-ons
CREATE TABLE menu_item_addons (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE coupons (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id     VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    code              VARCHAR(50) NOT NULL,
    discount_type     ENUM('percentage','flat') NOT NULL,
    value             DECIMAL(10,2) NOT NULL,
    min_order_amount  DECIMAL(10,2) DEFAULT 0,
    active            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, code)
);

-- Orders
CREATE TABLE orders (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id    VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id         BIGINT NULL REFERENCES dining_tables(id),
    table_number     VARCHAR(50),
    type             ENUM('dine-in','takeaway','delivery') DEFAULT 'dine-in',
    status           ENUM('pending','preparing','ready','served','paid','cancelled') DEFAULT 'pending',
    notes            TEXT,
    total            DECIMAL(10,2) DEFAULT 0,
    customer_phone   VARCHAR(20),
    customer_name    VARCHAR(255),
    waiter_name      VARCHAR(255),
    payment_method   VARCHAR(50),
    payment_status   ENUM('unpaid','paid') DEFAULT 'unpaid',
    cash_amount      DECIMAL(10,2) DEFAULT 0,
    online_amount    DECIMAL(10,2) DEFAULT 0,
    discount_amount  DECIMAL(10,2) DEFAULT 0,
    coupon_code      VARCHAR(50),
    settled_by       VARCHAR(255),
    settled_at       TIMESTAMP NULL,
    whatsapp_sent    BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NULL REFERENCES menu_items(id),
    item_name    VARCHAR(255) NOT NULL,
    quantity     INT DEFAULT 1,
    price        DECIMAL(10,2) NOT NULL,
    notes        TEXT,
    status       ENUM('pending','preparing','ready','served') DEFAULT 'pending',
    is_addon     BOOLEAN DEFAULT FALSE,
    addons_json  JSON,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE reservations (
    id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id      VARCHAR(20) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id           BIGINT NULL REFERENCES dining_tables(id),
    table_number       VARCHAR(50),
    customer_name      VARCHAR(255) NOT NULL,
    customer_phone     VARCHAR(20),
    customer_email     VARCHAR(255),
    party_size         INT NOT NULL,
    reservation_date   DATE NOT NULL,
    reservation_time   TIME NOT NULL,
    duration_minutes   INT DEFAULT 90,
    status             ENUM('confirmed','cancelled','completed') DEFAULT 'confirmed',
    notes              TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Laravel Application Structure

```
bhoj360-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Agency/
│   │   │   │   ├── AuthController.php           ← Login, OTP, logout, change password
│   │   │   │   ├── DashboardController.php      ← Show agency dashboard view
│   │   │   │   ├── RestaurantController.php     ← CRUD restaurants
│   │   │   │   ├── InquiryController.php        ← Read/delete inquiries
│   │   │   │   ├── SubscriptionController.php   ← Update plan
│   │   │   │   └── PaymentController.php        ← Add payment, send invoice
│   │   │   ├── Restaurant/
│   │   │   │   ├── AuthController.php           ← PIN login → session
│   │   │   │   ├── DashboardController.php      ← Admin overview page
│   │   │   │   ├── TableController.php          ← Tables CRUD
│   │   │   │   ├── MenuController.php           ← Menu CRUD + image upload
│   │   │   │   ├── OrderController.php          ← Create/status/settle orders
│   │   │   │   ├── ReservationController.php    ← Reservations CRUD
│   │   │   │   ├── StaffController.php          ← Staff management
│   │   │   │   ├── CouponController.php         ← Coupon CRUD
│   │   │   │   ├── AnalyticsController.php      ← Revenue/order stats
│   │   │   │   ├── CustomerController.php       ← Phone-based directory
│   │   │   │   ├── SettingsController.php       ← PIN, printer, GST settings
│   │   │   │   └── QrController.php             ← QR code image generation
│   │   │   └── Marketing/
│   │   │       ├── PageController.php           ← All static marketing pages
│   │   │       ├── BlogController.php           ← Blog listing + post detail
│   │   │       ├── ContactController.php        ← Contact form submission
│   │   │       └── CareerController.php         ← Career + application form
│   │   ├── Middleware/
│   │   │   ├── AgencyAuth.php                   ← Checks agency session token
│   │   │   ├── RestaurantStaffAuth.php          ← Checks staff PIN session
│   │   │   ├── RestaurantAdminAuth.php          ← Restricts to admin role only
│   │   │   └── SetRestaurant.php                ← Binds restaurant from URL slug
│   │   └── Requests/
│   │       ├── CreateRestaurantRequest.php
│   │       ├── StoreOrderRequest.php
│   │       ├── StoreReservationRequest.php
│   │       └── UpdateSubscriptionRequest.php
│   ├── Livewire/
│   │   ├── Agency/
│   │   │   ├── RestaurantList.php               ← Live-searchable restaurant list
│   │   │   ├── CreateRestaurantModal.php        ← Create restaurant form
│   │   │   ├── InquiryInbox.php                 ← Inquiries list + read/delete
│   │   │   └── AgencyStats.php                  ← Revenue cards auto-refresh
│   │   ├── Restaurant/
│   │   │   ├── TableGrid.php                    ← Live table map with status
│   │   │   ├── OrderBoard.php                   ← KDS order board (counter)
│   │   │   ├── WaiterBoard.php                  ← Waiter order management
│   │   │   ├── CashierBoard.php                 ← Cashier billing + settle
│   │   │   ├── MenuManager.php                  ← Menu CRUD with live preview
│   │   │   ├── ReservationManager.php           ← Reservation calendar
│   │   │   ├── StaffManager.php                 ← Staff CRUD
│   │   │   ├── CouponManager.php                ← Coupon CRUD
│   │   │   ├── CustomerDirectory.php            ← Customer search + listing
│   │   │   ├── AnalyticsBoard.php               ← Revenue charts (Chart.js)
│   │   │   └── MoneyManager.php                 ← Financial overview
│   │   └── Customer/
│   │       ├── SelfOrder.php                    ← QR self-ordering (public)
│   │       └── OrderStatus.php                  ← Customer order tracker
│   ├── Models/
│   │   ├── Restaurant.php
│   │   ├── Subscription.php
│   │   ├── Payment.php
│   │   ├── Inquiry.php
│   │   ├── BlogPost.php
│   │   ├── Application.php
│   │   ├── DiningTable.php
│   │   ├── MenuItem.php
│   │   ├── MenuItemAddon.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Reservation.php
│   │   ├── Staff.php
│   │   ├── Coupon.php
│   │   └── RestaurantPin.php
│   ├── Events/
│   │   ├── OrderCreated.php                     ← Broadcast on new order
│   │   ├── OrderStatusUpdated.php               ← Broadcast on status change
│   │   └── TableStatusChanged.php               ← Broadcast on table change
│   ├── Jobs/
│   │   ├── SendInvoiceEmail.php
│   │   └── SendPaymentReminder.php
│   ├── Mail/
│   │   ├── InvoiceMail.php
│   │   ├── PaymentReminderMail.php
│   │   └── OtpMail.php
│   └── Services/
│       ├── RestaurantFactory.php                ← Creates restaurant + seeds DB
│       ├── QrCodeService.php                    ← SHA-256 token + image gen
│       ├── AnalyticsService.php                 ← Revenue aggregation queries
│       └── TableStatusService.php               ← Auto-update table status
├── database/
│   ├── migrations/
│   │   ├── 2026_01_01_000001_create_restaurants_table.php
│   │   ├── 2026_01_01_000002_create_subscriptions_table.php
│   │   ├── 2026_01_01_000003_create_payments_table.php
│   │   ├── 2026_01_01_000004_create_inquiries_table.php
│   │   ├── 2026_01_01_000005_create_blog_posts_table.php
│   │   ├── 2026_01_01_000006_create_staff_table.php
│   │   ├── 2026_01_01_000007_create_restaurant_pins_table.php
│   │   ├── 2026_01_01_000008_create_dining_tables_table.php
│   │   ├── 2026_01_01_000009_create_menu_items_table.php
│   │   ├── 2026_01_01_000010_create_menu_item_addons_table.php
│   │   ├── 2026_01_01_000011_create_coupons_table.php
│   │   ├── 2026_01_01_000012_create_orders_table.php
│   │   ├── 2026_01_01_000013_create_order_items_table.php
│   │   └── 2026_01_01_000014_create_reservations_table.php
│   └── seeders/
│       ├── DefaultMenuSeeder.php                ← 16 default menu items
│       ├── DefaultTableSeeder.php               ← Indoor/Outdoor/VIP tables
│       └── AgencySettingsSeeder.php
├── routes/
│   ├── web.php                                  ← ALL routes (no api.php needed)
│   └── channels.php                             ← Reverb broadcast channels
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── marketing.blade.php              ← Public site layout (nav + footer)
│   │   │   ├── agency.blade.php                 ← Agency dashboard shell
│   │   │   ├── restaurant.blade.php             ← Per-restaurant app shell
│   │   │   └── staff.blade.php                  ← Minimal layout for staff panels
│   │   ├── marketing/
│   │   │   ├── landing.blade.php
│   │   │   ├── about.blade.php
│   │   │   ├── features.blade.php
│   │   │   ├── pricing.blade.php
│   │   │   ├── showcase.blade.php
│   │   │   ├── blog/
│   │   │   │   ├── index.blade.php
│   │   │   │   └── show.blade.php
│   │   │   ├── career.blade.php
│   │   │   ├── contact.blade.php
│   │   │   ├── privacy.blade.php
│   │   │   ├── terms.blade.php
│   │   │   └── refund.blade.php
│   │   ├── agency/
│   │   │   ├── login.blade.php
│   │   │   ├── otp.blade.php
│   │   │   └── dashboard.blade.php              ← Livewire components embedded
│   │   └── restaurant/
│   │       ├── login.blade.php                  ← PIN login page
│   │       ├── admin/
│   │       │   ├── dashboard.blade.php
│   │       │   ├── menu.blade.php
│   │       │   ├── tables.blade.php
│   │       │   ├── reservations.blade.php
│   │       │   ├── staff.blade.php
│   │       │   ├── settings.blade.php
│   │       │   ├── analytics.blade.php
│   │       │   ├── customers.blade.php
│   │       │   ├── coupons.blade.php
│   │       │   └── money.blade.php
│   │       ├── waiter.blade.php
│   │       ├── counter.blade.php
│   │       ├── cashier.blade.php
│   │       └── customer/
│   │           ├── menu.blade.php               ← QR self-order (public)
│   │           └── order-status.blade.php
│   ├── css/
│   │   └── app.css                              ← Tailwind CSS
│   └── js/
│       └── app.js                               ← Alpine.js + Echo + Chart.js
└── config/
    ├── broadcasting.php
    └── livewire.php
```

---

## 6. Livewire Component Mapping (React → Livewire)

| React Component | Livewire Component | Key Features |
|----------------|-------------------|--------------|
| `AgencyDashboard.jsx` | `Agency\RestaurantList` + `Agency\AgencyStats` | Search, filter, stats cards |
| `AdminDashboard.jsx` | `Restaurant\AnalyticsBoard` | Revenue, order counts |
| `MenuManager.jsx` | `Restaurant\MenuManager` | CRUD items, add-ons, image upload, drag-sort |
| `TablesManager.jsx` | `Restaurant\TableGrid` | Table map, QR print, bulk add |
| `ReservationsManager.jsx` | `Restaurant\ReservationManager` | Calendar grid, CRUD |
| `StaffManager.jsx` | `Restaurant\StaffManager` | Add/remove staff, role CRUD |
| `StaffSettings.jsx` | Blade form + `SettingsController` | PIN update, GST, printer |
| `CouponsManager.jsx` | `Restaurant\CouponManager` | CRUD coupons |
| `CustomerDirectory.jsx` | `Restaurant\CustomerDirectory` | Search by phone, order history |
| `Analytics.jsx` | `Restaurant\AnalyticsBoard` | Chart.js charts via Blade |
| `MoneyManager.jsx` | `Restaurant\MoneyManager` | Revenue breakdown |
| `WaiterDashboard.jsx` | `Restaurant\WaiterBoard` | Table map + order form |
| `CounterDashboard.jsx` | `Restaurant\OrderBoard` | KDS with live polling |
| `CashierDashboard.jsx` | `Restaurant\CashierBoard` | Settlement + receipt |
| `SelfOrder.jsx` | `Customer\SelfOrder` | Menu browse + cart + place order |
| `CustomerDashboard.jsx` | `Customer\OrderStatus` | Live order tracking |
| `InquiryInbox` (Agency) | `Agency\InquiryInbox` | Read/mark/delete inquiries |

---

## 7. Route Structure (web.php)

```php
// ── Marketing Routes ─────────────────────────────────────────
Route::get('/', [PageController::class, 'landing'])->name('home');
Route::get('/about', [PageController::class, 'about']);
Route::get('/features', [PageController::class, 'features']);
Route::get('/pricing', [PageController::class, 'pricing']);
Route::get('/showcase', [PageController::class, 'showcase']);
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);
Route::get('/career', [CareerController::class, 'index']);
Route::post('/career/apply', [CareerController::class, 'apply']);
Route::get('/contact', [ContactController::class, 'create']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/privacy', [PageController::class, 'privacy']);
Route::get('/terms', [PageController::class, 'terms']);
Route::get('/cancellation-refund', [PageController::class, 'refund']);

// ── Agency Auth ──────────────────────────────────────────────
Route::prefix('app')->name('agency.')->group(function () {
    Route::get('/login', [Agency\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [Agency\AuthController::class, 'login']);
    Route::get('/otp', [Agency\AuthController::class, 'showOtp'])->name('otp');
    Route::post('/otp', [Agency\AuthController::class, 'verifyOtp']);
    Route::post('/logout', [Agency\AuthController::class, 'logout'])->name('logout');

    // Protected agency dashboard
    Route::middleware('agency.auth')->group(function () {
        Route::get('/', [Agency\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('restaurants', Agency\RestaurantController::class);
        Route::put('restaurants/{id}/subscription', [Agency\SubscriptionController::class, 'update']);
        Route::post('restaurants/{id}/payments', [Agency\PaymentController::class, 'store']);
        Route::post('restaurants/{id}/send-invoice', [Agency\PaymentController::class, 'sendInvoice']);
        Route::post('restaurants/{id}/send-reminder', [Agency\PaymentController::class, 'sendReminder']);
        Route::get('inquiries', [Agency\InquiryController::class, 'index'])->name('inquiries');
        Route::patch('inquiries/{id}/read', [Agency\InquiryController::class, 'markRead']);
        Route::delete('inquiries/{id}', [Agency\InquiryController::class, 'destroy']);
    });
});

// ── Restaurant Routes (per-slug) ────────────────────────────
Route::prefix('r/{restaurant:slug}')->name('restaurant.')->middleware('set.restaurant')->group(function () {

    // Public: Login
    Route::get('/login', [Restaurant\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [Restaurant\AuthController::class, 'login']);
    Route::post('/logout', [Restaurant\AuthController::class, 'logout'])->name('logout');

    // Public: QR Self-Order
    Route::get('/menu', [Restaurant\MenuController::class, 'public'])->name('menu.public');
    Route::get('/order-status', [Restaurant\OrderController::class, 'customerStatus'])->name('order.status');

    // Admin routes
    Route::middleware('restaurant.admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [Restaurant\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('tables', Restaurant\TableController::class);
        Route::get('tables/{id}/qr', [Restaurant\QrController::class, 'generate'])->name('tables.qr');
        Route::post('tables/{id}/qr/regenerate', [Restaurant\QrController::class, 'regenerate']);
        Route::post('tables/bulk', [Restaurant\TableController::class, 'bulkCreate']);
        Route::resource('menu', Restaurant\MenuController::class);
        Route::post('menu/{id}/addons', [Restaurant\MenuController::class, 'storeAddon']);
        Route::delete('menu/addons/{id}', [Restaurant\MenuController::class, 'destroyAddon']);
        Route::post('menu/upload', [Restaurant\MenuController::class, 'uploadImage']);
        Route::resource('reservations', Restaurant\ReservationController::class);
        Route::resource('staff', Restaurant\StaffController::class);
        Route::resource('coupons', Restaurant\CouponController::class);
        Route::get('customers', [Restaurant\CustomerController::class, 'index'])->name('customers');
        Route::get('analytics', [Restaurant\AnalyticsController::class, 'index'])->name('analytics');
        Route::get('money', [Restaurant\AnalyticsController::class, 'money'])->name('money');
        Route::get('settings', [Restaurant\SettingsController::class, 'index'])->name('settings');
        Route::put('settings/pins', [Restaurant\SettingsController::class, 'updatePins']);
        Route::put('settings/printer', [Restaurant\SettingsController::class, 'updatePrinter']);
        Route::put('settings/gst', [Restaurant\SettingsController::class, 'updateGst']);
        Route::put('settings/profile', [Restaurant\SettingsController::class, 'updateProfile']);
    });

    // Staff routes (waiter, counter, cashier)
    Route::middleware('restaurant.staff')->group(function () {
        Route::get('/waiter', [Restaurant\OrderController::class, 'waiterView'])->name('waiter');
        Route::get('/counter', [Restaurant\OrderController::class, 'counterView'])->name('counter');
        Route::get('/cashier', [Restaurant\OrderController::class, 'cashierView'])->name('cashier');

        // Order API endpoints (used by Livewire via HTTP)
        Route::post('/orders', [Restaurant\OrderController::class, 'store']);
        Route::patch('/orders/{id}/status', [Restaurant\OrderController::class, 'updateStatus']);
        Route::patch('/orders/{id}/settle', [Restaurant\OrderController::class, 'settle']);
        Route::get('/orders', [Restaurant\OrderController::class, 'index']);
        Route::get('/tables', [Restaurant\TableController::class, 'index']);
    });
});
```

---

## 8. Real-time Strategy (Socket.IO → Livewire + Reverb)

### Approach: Livewire Polling + Optional Reverb Broadcasting

For dashboards that need live updates (KDS counter, waiter board, cashier):

```php
// Livewire component with polling
class OrderBoard extends Component
{
    // Poll every 3 seconds — replaces socket.on('order:updated')
    #[On('echo:restaurant.{restaurantId},OrderStatusUpdated')]
    public function refreshOrders(): void
    {
        $this->orders = Order::where('restaurant_id', $this->restaurantId)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->with('items')
            ->orderBy('created_at')
            ->get();
    }

    public function render()
    {
        return view('livewire.restaurant.order-board');
    }
}
```

**Blade template uses Livewire's `wire:poll`:**
```html
<div wire:poll.3000ms="refreshOrders">
    @foreach($orders as $order)
        <x-order-card :order="$order" />
    @endforeach
</div>
```

**For instant push (Reverb):**
```php
// Event broadcast on order change
broadcast(new OrderStatusUpdated($order))->toOthers();
```

```js
// app.js — Echo listener (Alpine.js)
window.Echo.private(`restaurant.${restaurantId}`)
    .listen('.OrderStatusUpdated', () => {
        Livewire.dispatch('refreshOrders');
    });
```

> **Strategy:** Use `wire:poll` as default (works without Reverb). Add Reverb for instant push as enhancement.

---

## 9. Authentication Mapping

### Agency Auth (2FA with OTP)

| Node.js | Laravel |
|---------|---------|
| In-memory `sessionTokenStore` Map | `session(['agency_token' => $token])` |
| In-memory `otpStore` Map | `Cache::put("agency_otp:{$sessionId}", $otp, 300)` |
| `crypto.pbkdf2Sync` | `Hash::make()` / `Hash::check()` (bcrypt) |
| Manual Bearer token validation | `AgencyAuth` middleware checks `session('agency_token')` |
| OTP sent via nodemailer | `Mail::to($email)->queue(new OtpMail($otp))` |

### Restaurant Staff Auth (PIN-based)

| Node.js | Laravel |
|---------|---------|
| `x-role` + `x-pin` request headers | POST form fields → session |
| Config JSON `pins{}` object | `restaurant_pins` DB table |
| Staff table direct lookup | `Staff::where(['restaurant_id', 'pin', 'role'])` |
| `sessionStorage` in browser | `session(['restaurant_role' => ..., 'staff_name' => ...])` |

---

## 10. Blade + Alpine.js UI Patterns

### Dropdowns and Modals (Alpine.js replaces React state)
```html
<!-- Replaces: const [showModal, setShowModal] = useState(false) -->
<div x-data="{ open: false }">
    <button @click="open = true">Add Menu Item</button>
    <div x-show="open" x-transition class="modal-overlay">
        <form wire:submit="createMenuItem">
            <!-- Livewire form fields -->
        </form>
    </div>
</div>
```

### Order Status Badge (Alpine.js replaces conditional rendering)
```html
<!-- Replaces: {status === 'pending' ? <Badge color="yellow"> : ...} -->
<span :class="{
    'bg-yellow-100 text-yellow-800': status === 'pending',
    'bg-blue-100 text-blue-800': status === 'preparing',
    'bg-green-100 text-green-800': status === 'ready',
    'bg-gray-100': status === 'paid'
}" x-text="status">
</span>
```

### Chart.js in Blade (replaces Recharts in React)
```html
<!-- resources/views/restaurant/admin/analytics.blade.php -->
<canvas id="revenueChart"></canvas>
<script>
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: @json($labels),
            datasets: [{ data: @json($data), label: 'Revenue (₹)' }]
        }
    });
</script>
```

---

## 11. Frontend Technology per Page

| Page | Blade | Livewire | Alpine.js | Chart.js |
|------|-------|----------|-----------|----------|
| Marketing pages (all) | ✅ | ❌ | ✅ (nav toggle, accordion) | ❌ |
| Agency Login / OTP | ✅ | ❌ | ✅ (form states) | ❌ |
| Agency Dashboard | ✅ | ✅ | ✅ | ✅ (revenue sparklines) |
| Restaurant Login (PIN) | ✅ | ❌ | ✅ (numpad UI) | ❌ |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ |
| Menu Manager | ✅ | ✅ | ✅ | ❌ |
| Tables Manager | ✅ | ✅ | ✅ | ❌ |
| Reservations | ✅ | ✅ | ✅ | ❌ |
| Staff Manager | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ (refresh) | ✅ | ✅ |
| Coupons | ✅ | ✅ | ✅ | ❌ |
| Customer Directory | ✅ | ✅ (search) | ✅ | ❌ |
| Money Manager | ✅ | ✅ | ✅ | ✅ |
| Waiter Board | ✅ | ✅ (poll) | ✅ | ❌ |
| Counter/KDS | ✅ | ✅ (poll) | ✅ | ❌ |
| Cashier Board | ✅ | ✅ (poll) | ✅ | ❌ |
| QR Self-Order | ✅ | ✅ (cart) | ✅ | ❌ |
| Customer Order Status | ✅ | ✅ (poll) | ✅ | ❌ |

---

## 12. File-by-File Conversion Reference

| Current File | Laravel Equivalent |
|-------------|-------------------|
| `agency-core/index.js` | `Agency/AuthController.php` + `Agency/RestaurantController.php` |
| `agency-core/restaurant-factory.js` | `App\Services\RestaurantFactory.php` |
| `agency-core/service-template.js` | All `Restaurant/*Controller.php` files |
| `agency-core/startup.js` | **Eliminated** — no processes to spawn |
| `gateway/index.js` | **Eliminated** — Laravel Router handles all routing |
| `restaurants/REST-*/config.json` | `restaurants` DB table |
| `restaurants/REST-*/db.sqlite` | MySQL multi-tenant tables |
| `frontend/src/App.jsx` | `routes/web.php` + Blade layouts |
| `frontend/src/api/client.js` | **Eliminated** — Livewire handles server calls |
| `frontend/src/pages/marketing/*.jsx` | `resources/views/marketing/*.blade.php` |
| `frontend/src/pages/AgencyDashboard.jsx` | `views/agency/dashboard.blade.php` + Livewire |
| `frontend/src/pages/AgencyLogin.jsx` | `views/agency/login.blade.php` |
| `frontend/src/pages/Login.jsx` | `views/restaurant/login.blade.php` |
| `frontend/src/pages/admin/MenuManager.jsx` | `Livewire\Restaurant\MenuManager.php` + view |
| `frontend/src/pages/admin/TablesManager.jsx` | `Livewire\Restaurant\TableGrid.php` + view |
| `frontend/src/pages/admin/Analytics.jsx` | `views/restaurant/admin/analytics.blade.php` |
| `frontend/src/pages/admin/StaffSettings.jsx` | `views/restaurant/admin/settings.blade.php` |
| `frontend/src/pages/waiter/WaiterDashboard.jsx` | `Livewire\Restaurant\WaiterBoard.php` + view |
| `frontend/src/pages/counter/CounterDashboard.jsx` | `Livewire\Restaurant\OrderBoard.php` + view |
| `frontend/src/pages/cashier/CashierDashboard.jsx` | `Livewire\Restaurant\CashierBoard.php` + view |
| `frontend/src/pages/customer/SelfOrder.jsx` | `Livewire\Customer\SelfOrder.php` + view |
| `frontend/src/components/shared/FloatingWhatsApp.jsx` | Blade partial `_whatsapp_btn.blade.php` |
| `frontend/src/hooks/useLanguage.js` | Blade `@lang()` helper + Laravel localization |

---

## 13. Implementation Phases

### Phase 1 — Foundation (Week 1)
- [ ] Create Laravel 11 project (`composer create-project laravel/laravel bhoj360`)
- [ ] Configure MySQL + `.env`
- [ ] Install packages:
  - `livewire/livewire` ^3
  - `laravel/reverb` ^1.0
  - `simplesoftwareio/simple-qrcode` ^4.2
- [ ] Install frontend tooling: Alpine.js (CDN), Tailwind CSS v3 (Vite)
- [ ] Create all database migrations
- [ ] Create all Eloquent models with relationships
- [ ] Set up middleware: `AgencyAuth`, `RestaurantStaffAuth`, `RestaurantAdminAuth`, `SetRestaurant`
- [ ] Create base Blade layouts: `marketing.blade.php`, `agency.blade.php`, `restaurant.blade.php`

---

### Phase 2 — Marketing Pages (Week 2)
- [ ] `landing.blade.php` — Hero, Features, How It Works, Testimonials, Pricing, CTA, Footer
- [ ] `about.blade.php`
- [ ] `features.blade.php`
- [ ] `pricing.blade.php`
- [ ] `showcase.blade.php`
- [ ] `blog/index.blade.php` + `blog/show.blade.php`
- [ ] `career.blade.php` + application form
- [ ] `contact.blade.php` + form → DB + email notification
- [ ] `privacy.blade.php`, `terms.blade.php`, `refund.blade.php`
- [ ] Design system: Tailwind config, color palette, fonts (Inter via Google Fonts)
- [ ] Floating WhatsApp button as Blade partial

---

### Phase 3 — Agency Module (Week 2-3)
- [ ] Agency login page (email + password → OTP flow)
- [ ] OTP verification page (6-digit form)
- [ ] `AgencyAuth` middleware + session management
- [ ] Agency dashboard view with Livewire `RestaurantList` (search + filter)
- [ ] Livewire `CreateRestaurantModal` (calls `RestaurantFactory::create()`)
- [ ] Restaurant detail modal/page (subscription, payment history)
- [ ] `Agency\SubscriptionController` — plan updates
- [ ] `Agency\PaymentController` — payment records + invoice email
- [ ] `Agency\InquiryController` + Livewire `InquiryInbox`
- [ ] `SendInvoiceEmail` queued job + Mailable

---

### Phase 4 — Restaurant Core Module (Week 3-4)
- [ ] Restaurant PIN login page (numpad UI with Alpine.js)
- [ ] `SetRestaurant` middleware (bind restaurant by slug)
- [ ] Session-based staff auth with role
- [ ] Admin: Dashboard overview (stats + recent orders)
- [ ] Admin: `MenuManager` Livewire (CRUD items, categories, add-ons, image upload)
- [ ] Admin: `TableGrid` Livewire (table map, QR generation, bulk add)
- [ ] Admin: `ReservationManager` Livewire (calendar grid, CRUD)
- [ ] Admin: `StaffManager` Livewire (add/delete staff, roles)
- [ ] Admin: Settings page (PIN form, GST, printer settings)
- [ ] Admin: `CouponManager` Livewire
- [ ] Admin: `CustomerDirectory` Livewire (phone search)
- [ ] Admin: Analytics (Chart.js charts for revenue, orders, top items)
- [ ] Admin: Money Manager (financial summary)

---

### Phase 5 — Staff Dashboards + Real-time (Week 4-5)
- [ ] `WaiterBoard` Livewire — table map + order form with item selection
- [ ] `OrderBoard` Livewire — KDS counter view, status buttons, `wire:poll.3s`
- [ ] `CashierBoard` Livewire — pending orders, settle, payment split
- [ ] Set up Laravel Reverb WebSocket server
- [ ] Broadcast events: `OrderCreated`, `OrderStatusUpdated`, `TableStatusChanged`
- [ ] Configure `channels.php` with private channels
- [ ] Connect Alpine.js Echo listeners → `Livewire.dispatch()` calls
- [ ] `TableStatusService` — auto-update table status on order change

---

### Phase 6 — QR Self-Order (Customer) (Week 5)
- [ ] Public route `/r/{restaurant}/menu?table=T1&token=xxx`
- [ ] `Customer\SelfOrder` Livewire:
  - Display menu by category
  - Cart management (add/remove/qty)
  - Place order (validates QR token)
  - Order confirmation with ID
- [ ] `Customer\OrderStatus` Livewire:
  - Poll order status every 5 seconds
  - Display progress (pending → preparing → ready → served)
- [ ] QR token validation logic (SHA-256 hash matching)
- [ ] `QrController` — generate QR PNG served as image response

---

### Phase 7 — Data Migration Script (Week 6)
- [ ] Write Artisan command `php artisan bhoj360:migrate-sqlite`
  - Loop through `restaurants/REST-*/config.json` → insert `restaurants` row
  - Loop through `restaurants/REST-*/db.sqlite` → import:
    - Tables → `dining_tables`
    - Menu items → `menu_items` + `menu_item_addons`
    - Orders → `orders` + `order_items`
    - Reservations → `reservations`
    - Staff → `staff`
    - Coupons → `coupons`
- [ ] Migrate `agency-config.json` → `agency_settings` table
- [ ] Migrate `inquiries.json` → `inquiries` table
- [ ] Verify data counts and integrity after migration

---

### Phase 8 — Testing + Deployment (Week 7)
- [ ] PHPUnit / PestPHP feature tests for all controllers
- [ ] Test Livewire components (using Livewire testing helpers)
- [ ] Test full order flow (self-order → waiter → counter → cashier)
- [ ] Test QR code generation and validation
- [ ] Test email queue jobs
- [ ] Deploy to server:
  - cPanel shared hosting OR VPS (Nginx + PHP-FPM 8.2)
  - MySQL 8 database setup
  - `php artisan storage:link`
  - `php artisan queue:work` via Supervisor
  - `php artisan reverb:start` via Supervisor (or polling only mode)
  - `npm run build` for Tailwind CSS

---

## 14. Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| React state management → server state | Livewire `$wire` properties auto-synced |
| Socket.IO real-time events | `wire:poll` (simple) + Laravel Reverb (instant push) |
| QR self-order cart without React | Livewire component with `$cart` array property |
| Chart.js without React wrapper | `@json()` in Blade + inline `<script>` |
| JWT/Axios API calls | No API layer — Livewire calls methods directly on server |
| Multi-restaurant routing | `{restaurant:slug}` URL binding + `SetRestaurant` middleware |
| PIN numpad UI | Alpine.js x-data with digit array, no framework needed |
| File uploads (base64 in React) | Livewire `WithFileUploads` trait + `$photo->store()` |
| `useLanguage` hook | Laravel `trans()` / `@lang()` + `lang/` JSON files |
| `FloatingWhatsApp` component | Pure HTML/CSS Blade partial with Alpine.js hover |

---

## 15. Package Requirements

### Composer (PHP)
```json
{
    "require": {
        "laravel/framework": "^11.0",
        "livewire/livewire": "^3.0",
        "laravel/reverb": "^1.0",
        "simplesoftwareio/simple-qrcode": "^4.2",
        "guzzlehttp/guzzle": "^7.0"
    },
    "require-dev": {
        "pestphp/pest": "^2.0",
        "pestphp/pest-plugin-livewire": "^2.0",
        "laravel/pint": "^1.0"
    }
}
```

### npm (CSS only — no UI framework)
```json
{
    "devDependencies": {
        "vite": "^5.0",
        "laravel-vite-plugin": "^1.0",
        "tailwindcss": "^3.4",
        "autoprefixer": "^10.0",
        "postcss": "^8.0"
    }
}
```

### CDN (loaded in Blade layouts — no npm install)
```html
<!-- Alpine.js -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<!-- Chart.js (only on analytics pages) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<!-- Laravel Echo + Pusher (only on staff dashboards) -->
<script src="https://js.pusher.com/8.2/pusher.min.js"></script>
<script src="/vendor/laravel-echo/echo.umd.js"></script>
```

---

## 16. Deployment Options (After Conversion)

| Platform | Notes |
|----------|-------|
| **Shared Hosting (cPanel/Plesk)** | ✅ Best for budget — runs PHP out of the box |
| **Hostinger / Namecheap** | ✅ PHP 8.2 supported, MySQL included |
| **DigitalOcean Droplet** | ✅ Full control (Nginx + PHP-FPM) |
| **Railway** | ✅ Docker, supports PHP |
| **GitHub Pages** | ❌ Static only — not possible |

---

## 17. Quick-Start Commands (When Ready to Execute)

```bash
# 1. Create Laravel project
composer create-project laravel/laravel bhoj360-laravel
cd bhoj360-laravel

# 2. Install PHP packages
composer require livewire/livewire laravel/reverb \
    simplesoftwareio/simple-qrcode

# 3. Install frontend tooling (CSS only)
npm install tailwindcss autoprefixer postcss laravel-vite-plugin vite
npx tailwindcss init -p

# 4. Publish Livewire + Reverb configs
php artisan livewire:publish --config
php artisan reverb:install

# 5. Configure .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=bhoj360
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_CONNECTION=reverb
CACHE_STORE=database
QUEUE_CONNECTION=database

# 6. Run migrations + seed
php artisan migrate --seed

# 7. Create storage symlink
php artisan storage:link

# 8. Start development
php artisan serve          # Laravel (port 8000)
php artisan reverb:start   # WebSocket server (port 8080)
php artisan queue:listen   # Queue worker
npm run dev                # Vite (Tailwind CSS)
```

---

> **Status:** ✅ Plan Updated — No React, No Inertia, No JavaScript Framework
> **Frontend Stack:** Blade + Livewire 3 + Alpine.js + Tailwind CSS
> **Estimated Total Time:** 7–8 weeks (1 developer)
> **Complexity:** High — Full stack rewrite + data migration
> **Hosting:** Any PHP shared host (cPanel/Hostinger) or VPS
