import os
import re

root_dir = r'C:\Mediqzt-App\MediqzyApp\assests'
images_dir = r'C:\Mediqzt-App\MediqzyApp\assests\images'

# Matches require(...) not preceded by // or inside /* ... */
# Simplified: ignore lines starting with optional whitespace and //
require_pattern = re.compile(r"require\(['\"](\.\.?/[^'\"]+)['\"]\)")

broken_count = 0

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.js'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            for line_no, line in enumerate(lines, 1):
                clean_line = line.strip()
                if clean_line.startswith('//') or clean_line.startswith('*'):
                    continue
                
                matches = require_pattern.findall(line)
                for rel_path in matches:
                    if rel_path.endswith('.png') or rel_path.endswith('.jpg') or rel_path.endswith('.jpeg'):
                        # Resolve path
                        abs_path = os.path.abspath(os.path.join(root, rel_path))
                        if not os.path.exists(abs_path):
                            print(f"BROKEN: {file_path}:{line_no}")
                            print(f"  Path: {rel_path}")
                            print(f"  Resolved: {abs_path}")
                            broken_count += 1

print(f"\nTotal broken active images: {broken_count}")
