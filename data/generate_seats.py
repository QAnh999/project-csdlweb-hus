import random

# Cấu hình danh sách id_aircraft
aircraft_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Layout và seat type
seat_type_map_6 = {
    'A': 'window',
    'B': 'aisle', 
    'C': 'middle',
    'D': 'middle',
    'E': 'aisle',
    'F': 'window'
}

seat_type_map_4 = {
    'A': 'window',
    'B': 'aisle', 
    'C': 'aisle',
    'D': 'window'
}

seat_letters_6 = ['A', 'B', 'C', 'D', 'E', 'F']
seat_letters_4 = ['A', 'B', 'C', 'D']

def gen_all_seats(id_aircraft):
    seats = []
    
    # Capacity của từng máy bay (dựa trên dữ liệu của bạn)
    capacity_config = {
        1: {'economy': 180, 'business': 0, 'first': 0},     # Vietjet A320
        2: {'economy': 220, 'business': 0, 'first': 0},     # Vietjet A321
        3: {'economy': 180, 'business': 16, 'first': 0},    # VNA A321
        4: {'economy': 220, 'business': 20, 'first': 8},    # VNA A350
        5: {'economy': 246, 'business': 28, 'first': 8},    # VNA Boeing 787
        6: {'economy': 162, 'business': 8, 'first': 0},     # Bamboo A320
        7: {'economy': 184, 'business': 8, 'first': 0},     # Bamboo A321
        8: {'economy': 200, 'business': 8, 'first': 0},     # Vietravel A321
        9: {'economy': 180, 'business': 0, 'first': 0}      # Pacific A320
    }
    
    config = capacity_config[id_aircraft]
    current_row = 1
    
    # 1. Tạo First Class (4 ghế/hàng)
    if config['first'] > 0:
        first_rows = (config['first'] + 3) // 4  # Làm tròn lên
        for row in range(current_row, current_row + first_rows):
            for letter in seat_letters_4:
                if len(seats) < config['first']:
                    seat_number = f"{row}{letter}"
                    seats.append((id_aircraft, seat_number, 'first', seat_type_map_4[letter]))
        current_row += first_rows
    
    # 2. Tạo Business Class (4 ghế/hàng)
    if config['business'] > 0:
        business_rows = (config['business'] + 3) // 4  # Làm tròn lên
        for row in range(current_row, current_row + business_rows):
            for letter in seat_letters_4:
                business_created = len([s for s in seats if s[2] == 'business'])
                if business_created < config['business']:
                    seat_number = f"{row}{letter}"
                    seats.append((id_aircraft, seat_number, 'business', seat_type_map_4[letter]))
        current_row += business_rows
    
    # 3. Tạo Economy Class (6 ghế/hàng)
    economy_created = 0
    economy_total = config['economy']
    
    while economy_created < economy_total:
        for letter in seat_letters_6:
            if economy_created < economy_total:
                seat_number = f"{current_row}{letter}"
                seats.append((id_aircraft, seat_number, 'economy', seat_type_map_6[letter]))
                economy_created += 1
        current_row += 1
    
    return seats

# Sinh INSERTs và lưu vào file
with open('seats_all_aircrafts.sql', 'w', encoding='utf-8') as f:
    all_seats = []
    
    for aid in aircraft_ids:
        seats = gen_all_seats(aid)
        all_seats.extend(seats)
        print(f"✅ Máy bay {aid}: {len(seats)} ghế")
    
    # Tạo một lệnh INSERT duy nhất
    f.write("INSERT INTO Seats (id_aircraft, seat_number, seat_class, seat_type, is_available) VALUES\n")
    
    value_lines = []
    for seat in all_seats:
        id_aircraft, seat_number, seat_class, seat_type = seat
        value_lines.append(f"({id_aircraft}, '{seat_number}', '{seat_class}', '{seat_type}', TRUE)")
    
    f.write(",\n".join(value_lines))
    f.write(";\n")
    
    print(f"\n🎉 Đã tạo file seats_all_aircrafts.sql với {len(all_seats)} ghế")

# Hiển thị thống kê
print("\n--- THỐNG KÊ ---")
for aid in aircraft_ids:
    seats = gen_all_seats(aid)
    economy = len([s for s in seats if s[2] == 'economy'])
    business = len([s for s in seats if s[2] == 'business'])
    first = len([s for s in seats if s[2] == 'first'])
    print(f"Máy bay {aid}: {len(seats)} ghế (E:{economy} B:{business} F:{first})")