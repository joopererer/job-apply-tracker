import os
from PIL import Image
import numpy as np
from scipy import ndimage

def generate_icons(source_path='logo.jpg'):
    """
    Crops the blue logo tightly to remove outer white borders/padding,
    smooths outer corner transparency, and exports icons at standard sizes.
    """
    if os.path.exists(source_path):
        img = Image.open(source_path).convert('RGBA')
    elif os.path.exists('public/icons/icon-512.png'):
        img = Image.open('public/icons/icon-512.png').convert('RGBA')
    else:
        raise FileNotFoundError("No source icon found.")

    arr = np.array(img, dtype=np.float32)

    # Detect outer white connected to corners
    is_white = (arr[:, :, 0] > 235) & (arr[:, :, 1] > 235) & (arr[:, :, 2] > 235)
    labeled, _ = ndimage.label(is_white)
    h, w = arr.shape[:2]
    corners = [labeled[0, 0], labeled[0, w - 1], labeled[h - 1, 0], labeled[h - 1, w - 1]]
    outer_labels = set(c for c in corners if c > 0)
    outer_white = np.isin(labeled, list(outer_labels))

    # Tightly crop to the non-white bounding box
    icon_mask = ~outer_white
    coords = np.argwhere(icon_mask)
    min_y, min_x = coords.min(axis=0)
    max_y, max_x = coords.max(axis=0)

    crop = arr[min_y:max_y + 1, min_x:max_x + 1].copy()

    # Re-evaluate outer white on cropped corners
    is_white_crop = (crop[:, :, 0] > 235) & (crop[:, :, 1] > 235) & (crop[:, :, 2] > 235)
    labeled_crop, _ = ndimage.label(is_white_crop)
    ch, cw = crop.shape[:2]
    crop_corners = [labeled_crop[0, 0], labeled_crop[0, cw - 1], labeled_crop[ch - 1, 0], labeled_crop[ch - 1, cw - 1]]
    crop_outer_labels = set(c for c in crop_corners if c > 0)
    crop_outer_white = np.isin(labeled_crop, list(crop_outer_labels))

    # Make outer corners transparent with smooth gaussian antialiasing
    mask = (~crop_outer_white).astype(np.float32)
    smoothed_mask = ndimage.gaussian_filter(mask, sigma=0.8)
    crop[:, :, 3] = np.clip(smoothed_mask * 255.0, 0, 255)

    master = Image.fromarray(crop.astype(np.uint8), mode='RGBA')

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
        resized = master.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(rel_path, format='PNG', optimize=True)
        print(f"Generated {rel_path} ({size}x{size})")

if __name__ == '__main__':
    generate_icons()
