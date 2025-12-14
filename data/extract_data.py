import pandas as pd
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_flight_data():
    """Xử lý toàn bộ dữ liệu flight từ file CSV"""
    
    # Đọc dữ liệu raw
    logger.info("Đang đọc file flight.csv...")
    df = pd.read_csv('flight.csv')
    logger.info(f"Đọc thành công {len(df)} bản ghi")
    
    # Fix các vấn đề về airline code
    df = fix_airline_codes(df)
    
    # Chuyển đổi datetime
    df = convert_datetime(df)
    
    # Lọc dữ liệu theo khoảng thời gian mong muốn
    df_filtered = filter_by_date_range(df)
    
    # Lưu kết quả
    output_file = 'flights_processed.csv'
    df_filtered.to_csv(output_file, index=False, encoding='utf-8')
    
    # Thống kê
    logger.info(f"Đã xử lý và lưu {len(df_filtered)} bản ghi vào {output_file}")
    print_summary(df_filtered)
    
    return df_filtered

def fix_airline_codes(df):
    """Fix các vấn đề về mã hãng hàng không"""
    logger.info("Đang fix các vấn đề về airline codes...")
    
    # Fix Pacific Airlines (code_name là "Pacific Airlines" nhưng code là "vna")
    pacific_mask = (df['code'] == 'vna') & (df['code_name'] == 'Pacific Airlines')
    df.loc[pacific_mask, 'code'] = 'bl'
    df.loc[pacific_mask, 'code_name'] = 'Pacific Airlines'
    
    # Fix Vietravel Airlines (f_code có dấu cách)
    vietravel_mask = df['code'] == 'vta'
    df.loc[vietravel_mask, 'f_code'] = df.loc[vietravel_mask, 'f_code'].str.replace(' ', '')
    
    # Log số lượng bản ghi đã fix
    pacific_fixed = pacific_mask.sum()
    vietravel_fixed = vietravel_mask.sum()
    
    logger.info(f"Đã fix {pacific_fixed} bản ghi Pacific Airlines")
    logger.info(f"Đã fix {vietravel_fixed} bản ghi Vietravel Airlines")
    
    return df

def convert_datetime(df):
    """Chuyển đổi chuỗi thời gian sang datetime object"""
    logger.info("Đang chuyển đổi datetime...")
    
    def parse_datetime(date_str):
        try:
            return datetime.strptime(date_str, "%H:%M:%S %d/%m/%Y")
        except:
            return pd.NaT
    
    def shift_year_and_fix_overnight(dep_str, arr_str):
        """Chuyển năm sang 2026 và fix các chuyến bay qua đêm"""
        dep_dt = parse_datetime(dep_str)
        arr_dt = parse_datetime(arr_str)
        
        if pd.notnull(dep_dt):
            dep_dt = dep_dt.replace(year=2026)
        if pd.notnull(arr_dt):
            arr_dt = arr_dt.replace(year=2026)
        
        # Fix chuyến bay qua đêm (arrival < departure)
        if pd.notnull(dep_dt) and pd.notnull(arr_dt) and arr_dt < dep_dt:
            arr_dt += timedelta(days=1)
        
        return dep_dt, arr_dt
    
    # Áp dụng chuyển đổi
    datetime_results = df.apply(
        lambda row: shift_year_and_fix_overnight(row['f_time_from'], row['f_time_to']), 
        axis=1, 
        result_type='expand'
    )
    
    df['f_time_from'] = datetime_results[0]
    df['f_time_to'] = datetime_results[1]
    
    # Đếm số bản ghi bị lỗi datetime
    datetime_errors = df['f_time_from'].isna().sum() + df['f_time_to'].isna().sum()
    if datetime_errors > 0:
        logger.warning(f"Có {datetime_errors} bản ghi bị lỗi datetime")
    
    return df

def filter_by_date_range(df, start_date=None, end_date=None):
    """Lọc dữ liệu theo khoảng thời gian"""
    
    # Mặc định lọc từ 1/4/2026 đến 4/5/2026
    if start_date is None:
        start_date = datetime(2026, 4, 1)
    if end_date is None:
        end_date = datetime(2026, 5, 4)
    
    logger.info(f"Lọc dữ liệu từ {start_date.date()} đến {end_date.date()}")
    
    # Lọc theo khoảng thời gian
    mask = (df['f_time_from'] >= start_date) & (df['f_time_to'] <= end_date)
    df_filtered = df[mask].copy()
    
    logger.info(f"Sau khi lọc còn {len(df_filtered)} bản ghi")
    
    return df_filtered

def print_summary(df):
    """In thống kê về dữ liệu đã xử lý"""
    print("\n" + "="*50)
    print("THỐNG KÊ DỮ LIỆU ĐÃ XỬ LÝ")
    print("="*50)
    
    # Thống kê theo hãng hàng không
    airline_stats = df['code_name'].value_counts()
    print("\nSố chuyến bay theo hãng:")
    for airline, count in airline_stats.items():
        print(f"  {airline}: {count} chuyến")
    
    # Thống kê theo ngày (từ f_time_from)
    date_stats = df['f_time_from'].dt.date.value_counts().sort_index()
    print(f"\nTổng số ngày có chuyến bay: {len(date_stats)}")
    if len(date_stats) > 0:
        print(f"Ngày có nhiều chuyến bay nhất: {date_stats.idxmax()} ({date_stats.max()} chuyến)")
        print(f"Ngày có ít chuyến bay nhất: {date_stats.idxmin()} ({date_stats.min()} chuyến)")
    
    # Thống kê theo sân bay
    print("\nSân bay phổ biến:")
    dep_airports = df['airport_from'].value_counts().head(5)
    arr_airports = df['airport_to'].value_counts().head(5)
    
    print("  Điểm đi:")
    for airport, count in dep_airports.items():
        print(f"    {airport}: {count}")
    
    print("  Điểm đến:")
    for airport, count in arr_airports.items():
        print(f"    {airport}: {count}")
    
    # Thống kê giá
    print(f"\nThống kê giá:")
    print(f"  Giá trung bình: {df['f_price'].mean():,.0f} VND")
    print(f"  Giá cao nhất: {df['f_price'].max():,.0f} VND")
    print(f"  Giá thấp nhất: {df['f_price'].min():,.0f} VND")
    
    print("="*50)

if __name__ == "__main__":
    try:
        processed_data = process_flight_data()
        logger.info("Xử lý dữ liệu hoàn tất!")
    except Exception as e:
        logger.error(f"Lỗi khi xử lý dữ liệu: {e}")
        raise