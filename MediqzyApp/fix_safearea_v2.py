import os
import re

root_dir = r'c:\Mediqzt-App\MediqzyApp\assests\Screens'

# Regex for the tag with forceInset, handling nested braces
force_inset_pattern = re.compile(r'forceInset=\{\{?[^}]*\}?\}')

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
            
            # Clean up double brackets first if they exist from previous run
            new_content = content.replace("}}>", ">")
            
            # Remove forceInset
            new_content = force_inset_pattern.sub('', new_content)
            
            # Clean up extra spaces
            new_content = new_content.replace('  >', '>')
            
            if new_content != content:
                print(f"Updating: {file_path}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_updated += 1

print(f"Total files updated: {files_updated}")
