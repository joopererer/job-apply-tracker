import os
from PIL import Image

def generate_icons():
    logo_path = 'logo.jpg'
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"Missing {logo_path}")

    img = Image.open(logo_path)
    # Convert to RGBA for clean alpha-compatible PNG export
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    min_dim = min(width, height)

    # Center crop if not perfectly square
    if width != height:
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img = img.crop((left, top, right, bottom))

    targets = [
        ('extension/icons/icon16.png', 16),
        ('extension/icons/icon32.png', 32),
        ('extension/icons/icon48.png', 48),
        ('extension/icons/icon128.png', 128),
        ('public/icons/icon-192.png', 192),
        ('public/icons/icon-512.png', 512),
        ('public/apple-touch-icon.png', 180),
    ]

    for rel_path, size in targets:
        os.makedirs(os.path.dirname(rel_path), exist_ok=True)
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(rel_path, format='PNG', optimize=True)
        print(f"Generated {rel_path} ({size}x{size})")

if __name__ == '__main__':
    generate_icons()

