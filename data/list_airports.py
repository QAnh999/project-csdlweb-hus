import pandas as pd

# read csv
df = pd.read_csv("flights_sample_102.csv")

# get unique airports from both columns (dep and arr)
airports = pd.concat([df['airport_from'], df['airport_to']]).drop_duplicates().sort_values()

# print result
count = 0
print("Airports in dataset")
for airport in airports:
    count += 1
    print(airport)
print(f"There are totally {count} airports")