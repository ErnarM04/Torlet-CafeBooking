# Admin Side Documentation

## Назначение
Админская сторона предназначена для сотрудников/администраторов кафе: управление данными заведений, столами, слотами, бронями, клиентами и аналитикой.

## Основные маршруты
- `/admin/login` — вход персонала
- `/admin/dashboard` — обзор метрик и последних броней
- `/admin/restaurants` — CRUD ресторанов
- `/admin/locations` — CRUD локаций
- `/admin/tables` — CRUD столов + визуальный конструктор схемы
- `/admin/time-slots` — CRUD временных слотов
- `/admin/bookings` — управление статусами броней
- `/admin/customers` — список клиентов (ограничен ресторанами админа)
- `/admin/analytics` — аналитика по бронированиям
- `/admin/profile` — профиль сотрудника

## Ключевые функции
- Аутентификация персонала
- Soft-delete (деактивация) сущностей вместо физического удаления
- Управление статусами брони: confirm/seat/complete/no_show/cancel
- Назначение брони на себя (`assign_me`)
- Обновление клиентских данных (loyalty/preferences)
- Визуальный конструктор столов:
  - drag & drop позиции
  - resize/rotate мышью через handles
  - подпись стола центрируется автоматически
- Фильтрация клиентов: видны только те, кто бронировал в ресторанах, привязанных к staff-профилю

## Доступ и фильтрация данных
- Доступ к staff API: только пользователи с `is_staff` или `RestaurantStaff`.
- Для клиентов staff-вид:
  - `GET /api/staff/customers/` возвращает только клиентов с бронями в `RestaurantStaff.restaurants`.
  - если рестораны не назначены, список пуст.

## Интеграция с API (основное)
- `GET /api/staff/bookings/`
- `POST /api/staff/bookings/:id/confirm/`
- `POST /api/staff/bookings/:id/seat/`
- `POST /api/staff/bookings/:id/complete/`
- `POST /api/staff/bookings/:id/no_show/`
- `POST /api/staff/bookings/:id/cancel/`
- `POST /api/staff/bookings/:id/assign_me/`
- `GET /api/staff/customers/`
- `PATCH /api/staff/customers/:user_id/`
- CRUD:
  - `/api/cafes/restaurants/`
  - `/api/cafes/locations/`
  - `/api/cafes/tables/`
  - `/api/cafes/time-slots/`

## Модель прав владельца ресторана
`RestaurantStaff` содержит связь с ресторанами:
- поле `restaurants` (ManyToMany к `cafes.Restaurant`)
- используется для ограничения клиентского списка и может расширяться для ограничения броней/аналитики

## Локализация
Поддерживаются `en`, `ru`, `kk`.  
Ключевые админ-страницы, навигация, аналитика и профиль переведены.

## Известные ограничения
- Заказы/POS пока представлены как заглушка.
- Часть текстов в редких вспомогательных UI может требовать дополнительной локализации.
- WhatsApp/SMS пока в dev-режиме подтверждения (без реальной отправки у провайдера).

