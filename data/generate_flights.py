import csv
from datetime import datetime
import random

# Mapping dictionaries
airline_map = {
    'vj': 1,   # Vietjet
    'vna': 2,  # Vietnam Airlines
    'qh': 3,   # Bamboo Airways
    'vta': 4,  # Vietravel Airlines
    'bl': 5    # Pacific Airlines
}

airport_map = {
    'HAN': 1, 'SGN': 2, 'DLI': 3, 'PQC': 4, 'DAD': 5,
    'CXR': 6, 'HPH': 7, 'VII': 8, 'VCL': 9, 'HUI': 10,
    'THD': 11, 'UIH': 12
}

# Aircraft mapping based on your new aircraft data
# Using aircraft IDs based on the order of insertion
aircraft_configs = {
    # Vietjet
    'vj': [
        {'id': 1, 'model': 'A320', 'economy': 180, 'business': 0, 'first': 0},
        {'id': 2, 'model': 'A321', 'economy': 220, 'business': 0, 'first': 0}
    ],
    # Vietnam Airlines
    'vna': [
        {'id': 3, 'model': 'A321', 'economy': 180, 'business': 16, 'first': 0},
        {'id': 4, 'model': 'A350', 'economy': 220, 'business': 20, 'first': 8},
        {'id': 5, 'model': 'Boeing 787', 'economy': 246, 'business': 28, 'first': 8}
    ],
    # Bamboo Airways
    'qh': [
        {'id': 6, 'model': 'A320', 'economy': 162, 'business': 8, 'first': 0},
        {'id': 7, 'model': 'A321', 'economy': 184, 'business': 8, 'first': 0}
    ],
    # Vietravel Airlines
    'vta': [
        {'id': 8, 'model': 'A321', 'economy': 200, 'business': 8, 'first': 0}
    ],
    # Pacific Airlines
    'bl': [
        {'id': 9, 'model': 'A320', 'economy': 180, 'business': 0, 'first': 0}
    ]
}

# Fake data for gates and terminals
airport_terminals = {
    'HAN': ['T1', 'T2'], 'SGN': ['T1', 'T2'], 'DAD': ['T1', 'T2'],
    'CXR': ['T1'], 'PQC': ['T1'], 'DLI': ['T1'], 'HPH': ['T1'],
    'VII': ['T1'], 'VCL': ['T1'], 'HUI': ['T1'], 'THD': ['T1'], 'UIH': ['T1']
}

def extract_iata_code(airport_string):
    return airport_string.split('(')[-1].replace(')', '').strip()

def calculate_duration(dep_datetime_str, arr_datetime_str):
    fmt = "%Y-%m-%d %H:%M:%S"
    dep_dt = datetime.strptime(dep_datetime_str, fmt)
    arr_dt = datetime.strptime(arr_datetime_str, fmt)
    
    if arr_dt < dep_dt:
        arr_dt = arr_dt.replace(year=arr_dt.year + 1)
    
    duration = int((arr_dt - dep_dt).total_seconds() / 60)
    return duration

def generate_gate_and_terminal(dep_iata):
    available_terminals = airport_terminals.get(dep_iata, ['T1'])
    terminal = random.choice(available_terminals)
    
    if terminal == 'T1':
        gate = random.choice(['A1', 'A2', 'A3', 'B1', 'B2', 'B3'])
    elif terminal == 'T2':
        gate = random.choice(['C1', 'C2', 'C3', 'D1', 'D2', 'D3'])
    else:
        gate = random.choice(['E1', 'E2', 'F1', 'F2'])
    
    return gate, terminal

def select_aircraft(airline_code, route_type):
    """Select appropriate aircraft based on airline and route type"""
    available_aircrafts = aircraft_configs[airline_code]
    
    if airline_code == 'vna' and route_type == 'international':
        # For Vietnam Airlines international routes, prefer wide-body aircraft
        wide_bodies = [ac for ac in available_aircrafts if ac['first'] > 0]
        if wide_bodies:
            return random.choice(wide_bodies)
    
    if airline_code == 'qh' and 'Buz Flex' in route_type:
        # For Bamboo Flex routes, use A321
        a321s = [ac for ac in available_aircrafts if ac['model'] == 'A321']
        if a321s:
            return a321s[0]
    
    # Default: random selection from available aircrafts
    return random.choice(available_aircrafts)

# Read and process CSV
value_rows = []

with open('flights_sample.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    
    for row in reader:
        try:
            # Extract basic information
            flight_number = row['f_code'].strip()
            airline_code = row['code'].lower()
            airline_id = airline_map[airline_code]
            
            # Extract airport IDs
            dep_iata = extract_iata_code(row['airport_from'])
            arr_iata = extract_iata_code(row['airport_to'])
            dep_airport = airport_map[dep_iata]
            arr_airport = airport_map[arr_iata]
            
            # Select appropriate aircraft
            route_type = row.get('type', '')
            aircraft = select_aircraft(airline_code, route_type)
            aircraft_id = aircraft['id']
            
            # Datetime information
            dep_datetime = row['f_time_from']
            arr_datetime = row['f_time_to']
            
            # Calculate duration
            duration = calculate_duration(dep_datetime, arr_datetime)
            
            # Pricing
            base_price = int(row['f_price'])
            
            # Determine prices based on aircraft configuration
            total_seats = aircraft['economy'] + aircraft['business'] + aircraft['first']
            available_economy = aircraft['economy']
            available_business = aircraft['business']
            available_first = aircraft['first']
            
            business_price = int(base_price * 1.5) if aircraft['business'] > 0 else 'NULL'
            first_price = int(base_price * 2.0) if aircraft['first'] > 0 else 'NULL'
            
            # Generate gate and terminal
            gate, terminal = generate_gate_and_terminal(dep_iata)
            
            # Create value row
            value_row = f"('{flight_number}', {airline_id}, {aircraft_id}, {dep_airport}, {arr_airport}, '{dep_datetime}', '{arr_datetime}', {duration}, {base_price}, {business_price}, {first_price}, 50000, 20, 70000, {total_seats}, {available_economy}, {available_business}, {available_first}, 'scheduled', '{gate}', '{terminal}')"
            value_rows.append(value_row)
            
        except Exception as e:
            print(f"Error processing row: {e}")
            continue

# Generate final SQL script
header = """INSERT INTO Flights (
    flight_number, id_airline, id_aircraft, dep_airport, arr_airport, 
    dep_datetime, arr_datetime, duration_minutes,
    base_price_economy, base_price_business, base_price_first,
    luggage_fee_per_kg, free_luggage_weight, overweight_fee_per_kg,
    total_seats, available_seats_economy, available_seats_business, available_seats_first,
    status, gate, terminal
) VALUES
"""

footer = ";"

final_sql = header.format(
    record_count=len(value_rows),
    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
)

final_sql += ",\n".join(value_rows)
final_sql += footer

# Print to console
print(final_sql)

# Save to file
with open('flights_insert_final.sql', 'w', encoding='utf-8') as f:
    f.write(final_sql)

print(f"\n✅ Successfully generated 1 INSERT statement with {len(value_rows)} records")
print("📁 Saved to: flights_insert_final.sql")