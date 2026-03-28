import os
import re

root_dir = r'c:\Mediqzt-App\MediqzyApp\assests\Screens'
# Match require('../images/...) where it should be ../../images/...
# Also match require("./../images/...) if it exists
pattern = re.compile(r"require\(['\"](\.\./images/[^'\"]+)['\"]\)|\srequire\(['\"](\.\./images/[^'\"]+)['\"]\)")

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
            
            # Simple string replacement for safety if regex is tricky
            new_content = content.replace("require('../images/", "require('../../images/")
            new_content = new_content.replace('require("../images/', 'require("../../images/')
            
            if new_content != content:
                print(f"Updating: {file_path}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_updated += 1

print(f"Total files updated: {files_updated}")
