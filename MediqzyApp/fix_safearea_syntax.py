import os
import re

root_dir = r'c:\Mediqzt-App\MediqzyApp\assests\Screens'

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
            
            # Fix the missing closing brace in <SafeAreaView style={styles.container>
            # It should be <SafeAreaView style={styles.container}>
            new_content = re.sub(r'<SafeAreaView style=\{styles\.container>', r'<SafeAreaView style={styles.container}>', new_content)
            
            # General fix for style prop missing closing brace or extra braces
            new_content = new_content.replace("styles.container>","styles.container}>")
            new_content = new_content.replace("styles.container}}>","styles.container}>")
            new_content = new_content.replace("styles.container}}>","styles.container}>") # run twice just in case
            
            if new_content != content:
                print(f"Updating: {file_path}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_updated += 1

print(f"Total files updated: {files_updated}")
