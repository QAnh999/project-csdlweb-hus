import csv
from datetime import datetime
import random
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    'THD': 11, 'UIH': 12, 'VCA': 13
}

# Aircraft mapping based on your new aircraft data
aircraft_configs = {
    'vj': [1, 2],      # Vietjet: A320, A321
    'vna': [3, 4, 5],  # Vietnam Airlines: A321, A350, B787
    'qh': [6, 7],      # Bamboo Airways: A320, A321
    'vta': [8],        # Vietravel Airlines: A321
    'bl': [9]          # Pacific Airlines: A320
}

# Aircraft details for capacity calculation
aircraft_details = {
    1: {'economy': 180, 'business': 0, 'first': 0},
    2: {'economy': 220, 'business': 0, 'first': 0},
    3: {'economy': 180, 'business': 16, 'first': 0},
    4: {'economy': 220, 'business': 20, 'first': 8},
    5: {'economy': 246, 'business': 28, 'first': 8},
    6: {'economy': 162, 'business': 8, 'first': 0},
    7: {'economy': 184, 'business': 8, 'first': 0},
    8: {'economy': 200, 'business': 8, 'first': 0},
    9: {'economy': 180, 'business': 0, 'first': 0}
}

# Fake data for gates and terminals
airport_terminals = {
    'HAN': ['T1', 'T2'], 'SGN': ['T1', 'T2'], 'DAD': ['T1', 'T2'],
    'CXR': ['T1'], 'PQC': ['T1'], 'DLI': ['T1'], 'HPH': ['T1'],
    'VII': ['T1'], 'VCL': ['T1'], 'HUI': ['T1'], 'THD': ['T1'], 'UIH': ['T1'], 'VCA': ['T1']
}

def extract_iata_code(airport_string):
    """Extract IATA code from airport string"""
    try:
        if '(' in airport_string:
            return airport_string.split('(')[-1].replace(')', '').strip()
        return airport_string.strip()
    except:
        return airport_string

def parse_datetime_from_processed(datetime_str):
    """Parse datetime from already processed CSV (format: 2026-04-01 04:50:00)"""
    try:
        return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        logger.error(f"Error parsing datetime '{datetime_str}': {e}")
        return None

def calculate_duration(dep_dt, arr_dt):
    """Calculate flight duration in minutes"""
    if arr_dt < dep_dt:
        # Nếu arrival < departure, có thể là chuyến bay qua đêm
        # Trong data đã processed, điều này đã được fix nên không cần xử lý
        pass
    
    duration = int((arr_dt - dep_dt).total_seconds() / 60)
    return duration

def generate_gate_and_terminal(dep_iata):
    """Generate random gate and terminal"""
    available_terminals = airport_terminals.get(dep_iata, ['T1'])
    terminal = random.choice(available_terminals)
    
    if terminal == 'T1':
        gate = random.choice(['A1', 'A2', 'A3', 'B1', 'B2', 'B3'])
    elif terminal == 'T2':
        gate = random.choice(['C1', 'C2', 'C3', 'D1', 'D2', 'D3'])
    else:
        gate = random.choice(['E1', 'E2', 'F1', 'F2'])
    
    return gate, terminal

def select_aircraft(airline_code):
    """Select random aircraft for airline"""
    available_aircrafts = aircraft_configs[airline_code]
    return random.choice(available_aircrafts)

def process_flight_row(row):
    """Process a single flight row and return SQL values string"""
    try:
        # Extract basic information
        flight_number = row['f_code'].strip()
        airline_code = row['code'].lower()
        
        if airline_code not in airline_map:
            logger.warning(f"Unknown airline code: {airline_code}")
            return None
            
        airline_id = airline_map[airline_code]
        
        # Extract airport IDs
        dep_iata = extract_iata_code(row['airport_from'])
        arr_iata = extract_iata_code(row['airport_to'])
        
        if dep_iata not in airport_map or arr_iata not in airport_map:
            logger.warning(f"Unknown airport: {dep_iata} -> {arr_iata}")
            return None
            
        dep_airport = airport_map[dep_iata]
        arr_airport = airport_map[arr_iata]
        
        # Select aircraft
        aircraft_id = select_aircraft(airline_code)
        aircraft_capacity = aircraft_details[aircraft_id]
        
        # Parse datetime from processed data (định dạng mới)
        dep_dt = parse_datetime_from_processed(row['f_time_from'])
        arr_dt = parse_datetime_from_processed(row['f_time_to'])
        
        if not dep_dt or not arr_dt:
            logger.warning(f"Invalid datetime: {row['f_time_from']} -> {row['f_time_to']}")
            return None
        
        # Calculate duration
        duration = calculate_duration(dep_dt, arr_dt)
        if duration <= 0:
            logger.warning(f"Invalid duration {duration} minutes for flight {flight_number}")
            return None

        # Pricing
        try:
            base_price = int(float(row['f_price']))
            if base_price <= 0:
                logger.warning(f"Invalid price: {base_price}")
                return None
        except (ValueError, TypeError) as e:
            logger.warning(f"Could not parse price '{row['f_price']}': {e}")
            return None
            
        # Determine prices based on aircraft configuration
        total_seats = aircraft_capacity['economy'] + aircraft_capacity['business'] + aircraft_capacity['first']
        available_economy = aircraft_capacity['economy']
        available_business = aircraft_capacity['business']
        available_first = aircraft_capacity['first']
        
        business_price = int(base_price * 1.5) if aircraft_capacity['business'] > 0 else 'NULL'
        first_price = int(base_price * 2.0) if aircraft_capacity['first'] > 0 else 'NULL'
        
        # Generate gate and terminal
        gate, terminal = generate_gate_and_terminal(dep_iata)
        
        # Format datetime for SQL (giữ nguyên vì đã đúng format)
        dep_datetime_str = dep_dt.strftime("%Y-%m-%d %H:%M:%S")
        arr_datetime_str = arr_dt.strftime("%Y-%m-%d %H:%M:%S")
        
        # Create value row
        value_row = f"('{flight_number}', {airline_id}, {aircraft_id}, {dep_airport}, {arr_airport}, '{dep_datetime_str}', '{arr_datetime_str}', {duration}, {base_price}, {business_price}, {first_price}, 50000, 20, 70000, {total_seats}, {available_economy}, {available_business}, {available_first}, 'scheduled', '{gate}', '{terminal}')"
        
        return value_row
        
    except Exception as e:
        logger.error(f"Error processing row: {e}")
        logger.error(f"Row data: {row}")
        return None

def generate_flights_sql(input_file, output_file, batch_size=1000):
    """Generate SQL insert statements in batches"""
    successful_records = 0
    failed_records = 0
    batch_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        with open(output_file, 'w', encoding='utf-8') as sqlfile:
            # Write header for first batch
            header = """INSERT INTO Flights (
    flight_number, id_airline, id_aircraft, dep_airport, arr_airport, 
    dep_datetime, arr_datetime, duration_minutes,
    base_price_economy, base_price_business, base_price_first,
    luggage_fee_per_kg, free_luggage_weight, overweight_fee_per_kg,
    total_seats, available_seats_economy, available_seats_business, available_seats_first,
    status, gate, terminal
) VALUES
"""
            sqlfile.write(header)
            
            batch_values = []
            
            for row in reader:
                value_row = process_flight_row(row)
                
                if value_row:
                    batch_values.append(value_row)
                    successful_records += 1
                else:
                    failed_records += 1
                
                # Write batch when reached batch size
                if len(batch_values) >= batch_size:
                    sqlfile.write(",\n".join(batch_values))
                    sqlfile.write(";\n\n")  # End current batch
                    
                    batch_count += 1
                    logger.info(f"Written batch {batch_count} with {len(batch_values)} records")
                    
                    # Start new batch
                    batch_values = []
                    sqlfile.write(header)
            
            # Write remaining records
            if batch_values:
                sqlfile.write(",\n".join(batch_values))
                sqlfile.write(";")
                batch_count += 1
                logger.info(f"Written final batch {batch_count} with {len(batch_values)} records")
    
    logger.info(f"✅ Successfully processed {successful_records} records")
    logger.info(f"❌ Failed records: {failed_records}")
    logger.info(f"📁 Saved to: {output_file}")
    logger.info(f"📦 Total batches: {batch_count}")

if __name__ == "__main__":
    # Sử dụng file đã được xử lý thay vì file gốc
    input_csv = "flights_processed.csv"  # File đã được process_data.py xử lý
    output_sql = "flights_complete.sql"
    
    logger.info("Starting flight data processing from PROCESSED file...")
    generate_flights_sql(input_csv, output_sql, batch_size=1000)