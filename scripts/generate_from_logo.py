import os
from PIL import Image, ImageDraw

def create_rounded_mask(size: int, radius_ratio: float = 0.19, supersample: int = 4) -> Image.Image:
    """Create a silky-smooth antialiased rounded rectangle alpha mask via supersampling."""
    ss_size = size * supersample
    ss_radius = int(ss_size * radius_ratio)
    mask = Image.new('L', (ss_size, ss_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, ss_size - 1, ss_size - 1), radius=ss_radius, fill=255)
    return mask.resize((size, size), Image.Resampling.LANCZOS)

def generate_icons(source_path: str = 'logo-raw.jpg'):
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")

    img = Image.open(source_path).convert('RGBA')
    width, height = img.size
    min_dim = min(width, height)

    # Center crop to square
    if width != height:
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))

    # Apply smooth 19% rounded-corner alpha mask at high resolution
    mask = create_rounded_mask(min_dim, radius_ratio=0.19, supersample=2)
    img.putalpha(mask)

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
