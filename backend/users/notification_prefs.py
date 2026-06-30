"""Notification preference defaults and helpers for customers and staff."""

CUSTOMER_NOTIFICATION_DEFAULTS = {
    "notifications_enabled": True,
    "in_app_enabled": True,
    "email_enabled": True,
    "sms_enabled": False,
    "browser_push_enabled": True,
    "promotions_enabled": True,
    "reminders_enabled": True,
}

STAFF_NOTIFICATION_DEFAULTS = {
    "notifications_enabled": True,
    "in_app_enabled": True,
    "email_enabled": True,
    "new_booking_alerts": True,
    "booking_confirmations": True,
    "daily_summary": False,
}

PROMOTION_KINDS = frozenset({"promotion", "marketing"})


def get_customer_notification_prefs(customer):
    stored = (customer.preferences or {}).get("notifications", {})
    return {**CUSTOMER_NOTIFICATION_DEFAULTS, **stored}


def set_customer_notification_prefs(customer, updates):
    allowed = CUSTOMER_NOTIFICATION_DEFAULTS.keys()
    current = get_customer_notification_prefs(customer)
    current.update({key: updates[key] for key in allowed if key in updates})
    preferences = dict(customer.preferences or {})
    preferences["notifications"] = current
    customer.preferences = preferences
    customer.save(update_fields=["preferences"])
    return current


def get_staff_notification_prefs(staff):
    stored = staff.notification_preferences or {}
    return {**STAFF_NOTIFICATION_DEFAULTS, **stored}


def set_staff_notification_prefs(staff, updates):
    allowed = STAFF_NOTIFICATION_DEFAULTS.keys()
    current = get_staff_notification_prefs(staff)
    current.update({key: updates[key] for key in allowed if key in updates})
    staff.notification_preferences = current
    staff.save(update_fields=["notification_preferences"])
    return current


def customer_allows_notification(*, customer, kind):
    prefs = get_customer_notification_prefs(customer)
    if not prefs["notifications_enabled"]:
        return {"in_app": False, "email": False, "sms": False}
    if kind in PROMOTION_KINDS and not prefs["promotions_enabled"]:
        return {"in_app": False, "email": False, "sms": False}
    if kind == "booking_reminder" and not prefs["reminders_enabled"]:
        return {"in_app": False, "email": False, "sms": False}
    return {
        "in_app": prefs["in_app_enabled"],
        "email": prefs["email_enabled"],
        "sms": prefs["sms_enabled"],
    }
