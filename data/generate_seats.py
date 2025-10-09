import random

# Cấu hình danh sách id_aircraft
aircraft_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Layout và seat type
seat_type_map = {
    'A': 'window',
    'B': 'aisle', 
    'C': 'middle',
    'D': 'middle',
    'E': 'aisle',
    'F': 'window'
}

seat_letters = ['A', 'B', 'C', 'D', 'E', 'F']

def gen_demo_seats(id_aircraft):
    seats = []
    
    # Phân loại máy bay - THỰC TẾ
    if id_aircraft in [4, 5]:  # VNA A350 và Boeing 787 - CÓ first class
        # 2 first + 3 business + 6 economy = 11 ghế
        class_config = [('first', 2), ('business', 3), ('economy', 6)]
    elif id_aircraft in [3, 7, 8]:  # Các A321 - CÓ business class
        # 4 business + 7 economy = 11 ghế
        class_config = [('business', 4), ('economy', 7)]
    else:  # Các máy bay còn lại - CHỈ economy
        # 11 economy = 11 ghế
        class_config = [('economy', 11)]
    
    # Tạo 11 ghế rải đều từ hàng 1-30
    all_rows = list(range(1, 31))
    selected_rows = sorted(random.sample(all_rows, 11))
    
    seat_idx = 0
    for seat_class, count in class_config:
        for i in range(count):
            row = selected_rows[seat_idx]
            letter = seat_letters[seat_idx % 6]
            seats.append((id_aircraft, f"{row}{letter}", seat_class, seat_type_map[letter]))
            seat_idx += 1
    
    return seats

# Sinh INSERTs và lưu vào file
with open('seats_final_99.sql', 'w', encoding='utf-8') as f:
    all_seats = []
    
    for aid in aircraft_ids:
        seats = gen_demo_seats(aid)
        all_seats.extend(seats)
    
    # Tạo một lệnh INSERT duy nhất
    f.write("INSERT INTO Seats (id_aircraft, seat_number, seat_class, seat_type, is_available) VALUES\n")
    
    value_lines = []
    for seat in all_seats:
        id_aircraft, seat_number, seat_class, seat_type = seat
        value_lines.append(f"({id_aircraft}, '{seat_number}', '{seat_class}', '{seat_type}', TRUE)")
    
    f.write(",\n".join(value_lines))
    f.write(";\n")
    