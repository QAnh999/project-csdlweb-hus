from decimal import Decimal, ROUND_HALF_UP


def calculate_total(flight, seat_class, passengers, seats, luggage_weight_per_passenger=None):
    base_price_map = {
        "economy": Decimal(str(flight.base_price_economy)),
        "business": Decimal(str(flight.base_price_business or 0)),
        "first": Decimal(str(flight.base_price_first or 0))
    }
    
    base_price = base_price_map.get(seat_class.lower())
    if not base_price:
        raise ValueError("Invalid seat class")

    base_free_weight = Decimal(str(flight.free_luggage_weight or 20))
    free_weight_adjustment = {
        "economy": Decimal("1.0"),
        "business": Decimal("1.5"),
        "first": Decimal("2.0")
    }
    adjustment = free_weight_adjustment.get(seat_class.lower(), Decimal("1.0"))
    free_luggage_weight = base_free_weight * adjustment
    
    luggage_fee_per_kg = Decimal(str(flight.luggage_fee_per_kg or 0))
    overweight_fee_per_kg = Decimal(str(flight.overweight_fee_per_kg or 0))

    seated_passengers = [p for p in passengers if getattr(p, "type", "adult") != "infant"]
    if luggage_weight_per_passenger:
        if len(luggage_weight_per_passenger) != len(seated_passengers):
            raise ValueError("Luggage weights mismatch")
        luggage_weights = [Decimal(str(w)) for w in luggage_weight_per_passenger]
    else:
        luggage_weights = [Decimal("0")] * len(seated_passengers)

    base_fare_per_passenger = []
    seat_surcharge_per_passenger = []
    luggage_surcharge_per_passenger = []
    tax_per_passenger = []
    total_per_passenger = []

    seat_index = 0
    for p in passengers:
        p_type = getattr(p, "passenger_type", "adult")
        if p_type == "adult":
            price = base_price
        elif p_type == "child":
            price = (base_price * Decimal(str(0.8))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif p_type == "infant":
            price = (base_price * Decimal(str(0.1))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            raise ValueError(f"Unknown passenger type: {p_type}")

        if p_type != "infant":
            seat_surcharge = getattr(seats[seat_index].seat, "price_surcharge", Decimal("0"))
            luggage_weight = luggage_weights[seat_index]
            luggage_surcharge = Decimal("0")
            if luggage_weight > free_luggage_weight:
                excess_weight = luggage_weight - free_luggage_weight
                luggage_surcharge = excess_weight * max(overweight_fee_per_kg, luggage_fee_per_kg)
            seat_index += 1
        else:
            seat_surcharge = Decimal("0")
            luggage_surcharge = Decimal("0")

        tax = (price * Decimal("0.1")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total = price + seat_surcharge + luggage_surcharge + tax

        base_fare_per_passenger.append(price)
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
