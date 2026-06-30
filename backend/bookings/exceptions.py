"""Booking domain exceptions."""


class BookingConflictError(Exception):
    """Raised when a table is no longer available for the requested slot."""

    def __init__(self, message='Selected table is already booked for this time.'):
        self.message = message
        super().__init__(message)
