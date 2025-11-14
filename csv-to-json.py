import csv
import json
import argparse

parser = argparse.ArgumentParser(description='Convert CSV to JSON.')
parser.add_argument('input_csv', help='Input CSV file path')
parser.add_argument('output_json', help='Output JSON file path')
args = parser.parse_args()

def csv_to_json(input_csv, output_json):
    data = {}

    try:
        with open(input_csv, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            for row in csv_reader:
                manufacturer = row['Manufacturer']
                weapon_type = row['Type']
                
                part = {
                    'ID': row['ID'],
                    'Part Type': row['Part Type'],
                    'String': row['String'],
                    'Stats': row['Stats']
                }
                
                if manufacturer not in data:
                    data[manufacturer] = {}
                    
                if weapon_type not in data[manufacturer]:
                    data[manufacturer][weapon_type] = []
                    
                data[manufacturer][weapon_type].append(part)

        with open(output_json, mode='w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4) 
            
        # Print summary
        total_parts = sum(len(parts) for manufacturer in data.values() 
                         for parts in manufacturer.values())
        print(f"Conversion successful!")
        print(f"Processed {len(data)} manufacturers")
        print(f"Total parts converted: {total_parts}")
        print(f"Output saved to: {output_json}")
        
        # Print breakdown by manufacturer
        print("\nBreakdown:")
        for manufacturer, types in data.items():
            type_count = len(types)
            part_count = sum(len(parts) for parts in types.values())
            print(f"  {manufacturer}: {type_count} types, {part_count} parts")
        
    except FileNotFoundError:
        print(f"Error: The file {input_csv} was not found.")
    except KeyError as e:
        print(f"Error: Missing expected column in CSV: {e}")
        print("Please ensure the CSV file has the correct headers: 'Manufacturer', 'Type', 'ID', 'Part Type', 'String', 'Stats'.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        
if __name__ == '__main__':
    csv_to_json(args.input_csv, args.output_json)