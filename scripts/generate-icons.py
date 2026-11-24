import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_master_icon(size=1024):
    # 2x supersampling for ultra smooth anti-aliased rendering
    render_size = size * 2
    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Gradient Rounded Rectangle Background
    # Draw linear gradient from top-left (#1e3a8a -> #2563eb) to bottom-right (#0284c7 -> #38bdf8)
    corner_radius = int(render_size * 0.22)
    
    # Create gradient mask and base
    grad_img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad_img)

    c_start = (30, 58, 138)    # #1e3a8a (Deep Blue)
    c_mid = (37, 99, 235)      # #2563eb (Royal Blue)
    c_end = (56, 189, 248)     # #38bdf8 (Sky Blue)

    for y in range(render_size):
        for x in range(0, render_size, 4):  # step for speed
            t = (x + y) / (2.0 * render_size)
            if t < 0.5:
                f = t * 2.0
                r = int(c_start[0] + (c_mid[0] - c_start[0]) * f)
                g = int(c_start[1] + (c_mid[1] - c_start[1]) * f)
                b = int(c_start[2] + (c_mid[2] - c_start[2]) * f)
            else:
                f = (t - 0.5) * 2.0
                r = int(c_mid[0] + (c_end[0] - c_mid[0]) * f)
                g = int(c_mid[1] + (c_end[1] - c_mid[1]) * f)
                b = int(c_mid[2] + (c_end[2] - c_mid[2]) * f)
            grad_draw.rectangle([x, y, x + 4, y + 1], fill=(r, g, b, 255))

    # Mask for rounded rectangle
    mask = Image.new("L", (render_size, render_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    padding = int(render_size * 0.02)
    mask_draw.rounded_rectangle(
        [padding, padding, render_size - padding, render_size - padding],
        radius=corner_radius,
        fill=255
    )

    img.paste(grad_img, (0, 0), mask)

    # 2. Draw subtle tech radar rings
    overlay = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    cx, cy = render_size // 2, render_size // 2

    # Radar rings
    r1 = int(render_size * 0.42)
    r2 = int(render_size * 0.32)
    r3 = int(render_size * 0.22)
    odraw.ellipse([cx - r1, cy - r1, cx + r1, cy + r1], outline=(255, 255, 255, 30), width=int(render_size * 0.008))
    odraw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], outline=(255, 255, 255, 45), width=int(render_size * 0.008))
    odraw.ellipse([cx - r3, cy - r3, cx + r3, cy + r3], outline=(56, 189, 248, 70), width=int(render_size * 0.012))

    # Radar sweep line (angled)
    sweep_angle = math.radians(-35)
    sw_x = cx + int(r1 * math.cos(sweep_angle))
    sw_y = cy + int(r1 * math.sin(sweep_angle))
    odraw.line([cx, cy, sw_x, sw_y], fill=(56, 189, 248, 90), width=int(render_size * 0.01))

    # 3. Modern Flat Briefcase Silhouette
    # Base briefcase: centered rounded rectangle
    bc_w = int(render_size * 0.58)
    bc_h = int(render_size * 0.44)
    bc_x1 = (render_size - bc_w) // 2
    bc_y1 = int(render_size * 0.40)
    bc_x2 = bc_x1 + bc_w
    bc_y2 = bc_y1 + bc_h
    bc_radius = int(render_size * 0.06)

    # Briefcase body glow/shadow
    odraw.rounded_rectangle(
        [bc_x1 - 4, bc_y1 - 4, bc_x2 + 4, bc_y2 + 4],
        radius=bc_radius + 4,
        fill=(15, 23, 42, 140)
    )

    # Briefcase body: deep navy fill with border
    odraw.rounded_rectangle(
        [bc_x1, bc_y1, bc_x2, bc_y2],
        radius=bc_radius,
        fill=(10, 19, 44, 235),
        outline=(255, 255, 255, 180),
        width=int(render_size * 0.012)
    )

    # Briefcase handle (top curve)
    h_w = int(render_size * 0.22)
    h_h = int(render_size * 0.10)
    h_x1 = (render_size - h_w) // 2
    h_y1 = bc_y1 - h_h
    h_x2 = h_x1 + h_w
    h_y2 = bc_y1 + int(render_size * 0.02)
    h_radius = int(render_size * 0.04)

    odraw.rounded_rectangle(
        [h_x1, h_y1, h_x2, h_y2],
        radius=h_radius,
        outline=(255, 255, 255, 220),
        width=int(render_size * 0.018)
    )
    # Mask out bottom part of handle inside briefcase
    odraw.rectangle([h_x1 + 4, bc_y1, h_x2 - 4, h_y2 + 4], fill=(10, 19, 44, 235))

    # 4. Stylized "FR" text + radar pulse / checkmark
    # Load default or standard font, or manually draw crisp geometric "FR"
    # Drawing geometric FR ensures identical rendering across all OS/environments:
    # "F":
    f_x = bc_x1 + int(bc_w * 0.20)
    f_y = bc_y1 + int(bc_h * 0.22)
    f_w = int(bc_w * 0.24)
    f_h = int(bc_h * 0.56)
    stroke = int(render_size * 0.026)

    # F vertical line
    odraw.rounded_rectangle([f_x, f_y, f_x + stroke, f_y + f_h], radius=stroke//2, fill=(255, 255, 255, 255))
    # F top horizontal
    odraw.rounded_rectangle([f_x, f_y, f_x + f_w, f_y + stroke], radius=stroke//2, fill=(255, 255, 255, 255))
    # F middle horizontal
    f_mid_y = f_y + int(f_h * 0.44)
    odraw.rounded_rectangle([f_x, f_mid_y, f_x + int(f_w * 0.8), f_mid_y + stroke], radius=stroke//2, fill=(255, 255, 255, 255))

    # "R":
    r_x = f_x + f_w + int(bc_w * 0.08)
    r_y = f_y
    r_w = int(bc_w * 0.25)
    r_h = f_h

    # R vertical line
    odraw.rounded_rectangle([r_x, r_y, r_x + stroke, r_y + r_h], radius=stroke//2, fill=(255, 255, 255, 255))
    # R top loop (D shape)
    r_loop_h = int(r_h * 0.52)
    odraw.rounded_rectangle([r_x, r_y, r_x + r_w, r_y + r_loop_h], radius=stroke, fill=(255, 255, 255, 255))
    odraw.rounded_rectangle([r_x + stroke, r_y + stroke, r_x + r_w - stroke, r_y + r_loop_h - stroke], radius=stroke//2, fill=(10, 19, 44, 255))
    # R diagonal leg
    r_leg_x1 = r_x + stroke
    r_leg_y1 = r_y + r_loop_h - (stroke // 2)
    r_leg_x2 = r_x + r_w
    r_leg_y2 = r_y + r_h
    odraw.line([r_leg_x1, r_leg_y1, r_leg_x2, r_leg_y2], fill=(255, 255, 255, 255), width=stroke)
    # Smooth leg end cap
    odraw.ellipse([r_leg_x2 - stroke//2, r_leg_y2 - stroke//2, r_leg_x2 + stroke//2, r_leg_y2 + stroke//2], fill=(255, 255, 255, 255))

    # 5. Vivid Radar Checkmark / Signal pulse at top-right
    # A sleek neon emerald checkmark (#34d399) or cyan radar ping at briefcase top right
    chk_cx = bc_x2 - int(render_size * 0.02)
    chk_cy = bc_y1 - int(render_size * 0.02)
    badge_r = int(render_size * 0.12)
    
    # Glow circle
    odraw.ellipse(
        [chk_cx - badge_r, chk_cy - badge_r, chk_cx + badge_r, chk_cy + badge_r],
        fill=(16, 185, 129, 255),
        outline=(255, 255, 255, 255),
        width=int(render_size * 0.016)
    )

    # Checkmark inside the badge
    ck_stroke = int(render_size * 0.022)
    ck1_x = chk_cx - int(badge_r * 0.45)
    ck1_y = chk_cy - int(badge_r * 0.05)
    ck2_x = chk_cx - int(badge_r * 0.10)
    ck2_y = chk_cy + int(badge_r * 0.35)
    ck3_x = chk_cx + int(badge_r * 0.50)
    ck3_y = chk_cy - int(badge_r * 0.35)

    odraw.line([ck1_x, ck1_y, ck2_x, ck2_y], fill=(255, 255, 255, 255), width=ck_stroke)
    odraw.line([ck2_x, ck2_y, ck3_x, ck3_y], fill=(255, 255, 255, 255), width=ck_stroke)
    odraw.ellipse([ck1_x - ck_stroke//2, ck1_y - ck_stroke//2, ck1_x + ck_stroke//2, ck1_y + ck_stroke//2], fill=(255, 255, 255, 255))
    odraw.ellipse([ck2_x - ck_stroke//2, ck2_y - ck_stroke//2, ck2_x + ck_stroke//2, ck2_y + ck_stroke//2], fill=(255, 255, 255, 255))
    odraw.ellipse([ck3_x - ck_stroke//2, ck3_y - ck_stroke//2, ck3_x + ck_stroke//2, ck3_y + ck_stroke//2], fill=(255, 255, 255, 255))

    # Composite overlay
    img = Image.alpha_composite(img, overlay)

    # Downscale from 2x supersampled to target size
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    os.makedirs("extension/icons", exist_ok=True)
    os.makedirs("public/icons", exist_ok=True)

    master = create_master_icon(1024)

    # Output targets:
    # 1. Chrome Extension
    ext_sizes = [16, 32, 48, 128]
    for s in ext_sizes:
        out = master.resize((s, s), Image.Resampling.LANCZOS)
        path = f"extension/icons/icon{s}.png"
        out.save(path, "PNG", optimize=True)
        print(f"Generated {path} ({s}x{s})")

    # 2. PWA
    pwa_targets = [
        (192, "public/icons/icon-192.png"),
        (512, "public/icons/icon-512.png"),
        (180, "public/apple-touch-icon.png"),
    ]
    for s, path in pwa_targets:
        out = master.resize((s, s), Image.Resampling.LANCZOS)
        out.save(path, "PNG", optimize=True)
        print(f"Generated {path} ({s}x{s})")

    print("All icons generated successfully!")

if __name__ == "__main__":
    main()

