"""Aggregate dashboard + analytics metrics from the same data sources as the admin UI."""

from __future__ import annotations

import re
from collections import Counter
from datetime import date, timedelta

from django.db.models import Count
from django.utils import timezone

from cafes.models import Location, Restaurant, Table

from .models import Booking

RANGE_DAYS = 30


def _hour_from_time(value) -> int | None:
    if value is None:
        return None
    match = re.match(r"^(\d{1,2})", str(value))
    return int(match.group(1)) if match else None


def _booking_rows():
    return list(
        Booking.objects.values(
            "booking_date",
            "booking_time",
            "table_id",
            "customer_id",
            "status",
            "number_of_guests",
        )
    )


def build_staff_metrics_snapshot() -> dict:
    today = timezone.localdate()
    window_start = today - timedelta(days=RANGE_DAYS)

    rows = _booking_rows()
    total = len(rows)

    by_status = Counter(r["status"] or "unknown" for r in rows)
    pending = by_status.get("pending", 0)

    in_range = [
        r
        for r in rows
        if r["booking_date"] and window_start <= r["booking_date"] <= today
    ]

    by_hour = [0] * 24
    for r in in_range:
        h = _hour_from_time(r["booking_time"])
        if h is not None and 0 <= h < 24:
            by_hour[h] += 1

    peak_hour = max(range(24), key=lambda h: by_hour[h]) if in_range else None
    peak_count = by_hour[peak_hour] if peak_hour is not None else 0

    by_date: dict[date, int] = {}
    for r in in_range:
        by_date[r["booking_date"]] = by_date.get(r["booking_date"], 0) + 1

    line_last_days = []
    for offset in range(6, -1, -1):
        d = today - timedelta(days=offset)
        line_last_days.append(
            {"date": d.isoformat(), "bookings": by_date.get(d, 0)}
        )

    with_table = sum(1 for r in rows if r["table_id"])
    table_share_pct = round((with_table / total) * 100) if total else 0

    per_customer: dict = {}
    for r in rows:
        cid = r["customer_id"]
        if cid is None:
            continue
        per_customer[cid] = per_customer.get(cid, 0) + 1
    unique_customers = len(per_customer)
    repeat_customers = sum(1 for n in per_customer.values() if n > 1)
    repeat_pct = round((repeat_customers / unique_customers) * 100) if unique_customers else 0

    weekend = sum(
        1
        for r in in_range
        if r["booking_date"] and r["booking_date"].weekday() >= 5
    )
    lunch = sum(
        1
        for r in in_range
        if _hour_from_time(r["booking_time"]) is not None
        and 12 <= _hour_from_time(r["booking_time"]) < 14
    )

    status_in_range = Counter(r["status"] for r in in_range)
    guests_in_range = [r["number_of_guests"] for r in in_range if r["number_of_guests"]]
    avg_guests = (
        round(sum(guests_in_range) / len(guests_in_range), 1) if guests_in_range else 0
    )

    table_bookings = (
        Booking.objects.filter(table_id__isnull=False)
        .values("table__table_number")
        .annotate(c=Count("booking_id"))
        .order_by("-c")[:5]
    )
    top_tables = [
        {"table": row["table__table_number"], "bookings": row["c"]}
        for row in table_bookings
    ]

    return {
        "as_of": today.isoformat(),
        "range_days": RANGE_DAYS,
        "has_finance_data": False,
        "dashboard": {
            "restaurants": Restaurant.objects.count(),
            "locations": Location.objects.count(),
            "tables": Table.objects.count(),
            "bookings_total": total,
            "pending": pending,
            "by_status": dict(by_status),
            "last_7_days": line_last_days,
        },
        "analytics": {
            "bookings_in_window": len(in_range),
            "avg_per_day": round(len(in_range) / max(RANGE_DAYS, 1), 1),
            "peak_hour": f"{peak_hour}:00" if peak_hour is not None and peak_count else None,
            "peak_hour_bookings": peak_count,
            "table_assignment_pct": table_share_pct,
            "repeat_customer_pct": repeat_pct,
            "unique_customers": unique_customers,
            "repeat_customers": repeat_customers,
            "weekend_bookings": weekend,
            "lunch_bookings": lunch,
            "completed_in_window": status_in_range.get("completed", 0),
            "cancelled_in_window": status_in_range.get("cancelled", 0),
            "no_show_in_window": status_in_range.get("no_show", 0),
            "avg_guests_per_booking": avg_guests,
            "top_tables": top_tables,
        },
    }
