import pandas as pd
from datetime import datetime, timedelta

# read raw data
df = pd.read_csv('flight.csv')

# convert string to datetime
def parse_datetime(date_str):
    try:
        return datetime.strptime(date_str, "%H:%M:%S %d/%m/%Y")
    except:
        return pd.NaT

# shift year to 2026 and fix overnight flights
def shift_year(dep_str, arr_str):
    dep_dt = parse_datetime(dep_str)
    arr_dt = parse_datetime(arr_str)
    
    if pd.notnull(dep_dt):
        dep_dt = dep_dt.replace(year=2026)
    if pd.notnull(arr_dt):
        arr_dt = arr_dt.replace(year=2026)
    
    if pd.notnull(dep_dt) and pd.notnull(arr_dt) and arr_dt < dep_dt:
        arr_dt += timedelta(days=1)
    
    return dep_dt, arr_dt

# apply conversion
df[['f_time_from', 'f_time_to']] = df.apply(
    lambda row: shift_year(row['f_time_from'], row['f_time_to']), axis=1, result_type='expand'
)

# filter data from start_date to end_date
start_date = datetime(2026, 4, 1)
end_date = datetime(2026, 5, 4)
mask = (df['f_time_from'] >= start_date) & (df['f_time_to'] <= end_date)
df_filtered = df[mask].copy()

# extract date
df_filtered['date'] = df_filtered['f_time_from'].dt.date

# randomly sample 3 flights per day
df_sample = (
    df_filtered.groupby('date', group_keys=False)
    .apply(lambda x: x.sample(n=min(3, len(x)), random_state=42))
    .reset_index(drop=True)
)

# save to new csv file
df_sample.to_csv('flights_sample_102.csv', index=False, encoding='utf-8')
