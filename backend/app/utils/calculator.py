from decimal import Decimal

def calculate_total(flight, seat_class, passengers, seats):
    base_price = {
        "economy": flight.base_price_economy,
        "business": flight.base_price_business or Decimal("0"),
        "first": flight.base_price_first or Decimal("0")
    }[seat_class]

    base_fare_per_passenger = []
    seat_surcharge_per_passenger = []
    luggage_surcharge_per_passenger = []
    tax_per_passenger = []
    total_per_passenger = []

    for i, p in enumerate(passengers):
        seat = seats[i] if seats else None
        seat_surcharge = getattr(seat, "price_surcharge", Decimal("0")) if seat else Decimal("0")
        luggage_surcharge = Decimal("0")
        tax = base_price * Decimal("0.1")  

        total = base_price + seat_surcharge + luggage_surcharge + tax

        base_fare_per_passenger.append(base_price)
        seat_surcharge_per_passenger.append(seat_surcharge)
        luggage_surcharge_per_passenger.append(luggage_surcharge)
        tax_per_passenger.append(tax)
        total_per_passenger.append(total)

    total_amount = sum(total_per_passenger)
    tax_amount = sum(tax_per_passenger)

    return {
        "base_fare_per_passenger": base_fare_per_passenger,
        "seat_surcharge_per_passenger": seat_surcharge_per_passenger,
        "luggage_surcharge_per_passenger": luggage_surcharge_per_passenger,
        "tax_per_passenger": tax_per_passenger,
        "total_per_passenger": total_per_passenger,
        "total_amount": total_amount,
        "tax_amount": tax_amount
    }
