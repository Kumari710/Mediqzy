import os
import re

root_dir = r'c:\Mediqzt-App\MediqzyApp\assests\Screens'

# Regex for the import
import_pattern = re.compile(r"import\s+SafeAreaView\s+from\s+['\"]react-native-safe-area-view['\"];")
# Regex for the component tag with forceInset
force_inset_pattern = re.compile(r'<SafeAreaView([^>]*)\s+forceInset=\{[^}]*\}')

files_updated = 0

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.js'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                continue
            
            new_content = content
            
            # 1. Update Import
            if "react-native-safe-area-view" in new_content:
                new_content = import_pattern.sub("import { SafeAreaView } from 'react-native-safe-area-context';", new_content)
            
            # 2. Remove forceInset
            if "forceInset" in new_content:
                new_content = force_inset_pattern.sub(r'<SafeAreaView\1', new_content)
            
            if new_content != content:
                print(f"Updating: {file_path}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_updated += 1

print(f"Total files updated: {files_updated}")
