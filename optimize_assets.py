import os
import re
from PIL import Image

def convert_to_webp(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                file_name, _ = os.path.splitext(file)
                output_path = os.path.join(root, file_name + ".webp")
                
                try:
                    with Image.open(file_path) as img:
                        img.save(output_path, "WEBP", quality=80)
                        print(f"Converted {file} to WebP")
                except Exception as e:
                    print(f"Failed to convert {file}: {e}")

def minify_css(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Simple regex based minification
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL) # Remove comments
    content = re.sub(r'\s+', ' ', content) # Collapse whitespace
    content = re.sub(r'\s*([\{\};:,])\s*', r'\1', content) # Remove space around delimiters
    content = content.replace(';}', '}') # Remove last semicolon
    
    base, ext = os.path.splitext(file_path)
    min_path = base + ".min" + ext
    
    with open(min_path, 'w') as f:
        f.write(content)
    print(f"Minified CSS to {min_path}")

def minify_js(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Very basic minification (remove comments and whitespace)
    # Note: Regex JS minification is risky, checking for simple non-breaking changes
    content = re.sub(r'//.*', '', content) # Remove single line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL) # Remove multi line comments
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([=+\-*/\{\};,])\s*', r'\1', content)
    
    base, ext = os.path.splitext(file_path)
    min_path = base + ".min" + ext
    
    with open(min_path, 'w') as f:
        f.write(content)
    print(f"Minified JS to {min_path}")

# Run optimizations
convert_to_webp('assets')
minify_css('styles.css')
minify_js('script.js')
