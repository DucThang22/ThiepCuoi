"""
Tạo bản ảnh tối ưu cho thiệp cưới (WebP + bản fallback) vào thư mục assets/opt/.
Ảnh gốc trong assets/images/ được giữ nguyên làm nguồn.

Chạy lại sau mỗi lần thay ảnh:
    python tools/optimize_images.py
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "images")
OUT = os.path.join(ROOT, "assets", "opt")

# (tên file gốc, kích thước tối đa (w, h), có tạo bản thumb cho album/khung nhỏ không)
PHOTOS = [
    # ảnh dùng to (hero, thư mời, lightbox)
    ("TTT09584_web.jpg", (1080, 1620), True),
    ("TTT08627_web.jpg", (1200, 1800), True),
    ("TTT09222_web.jpg", (800, 1200), True),
    ("TTT08982_web.jpg", (1080, 1620), True),
    ("TTT09824_web.jpg", (1080, 1620), True),
    ("TTT09053_web.jpg", (1080, 1620), True),
    ("TTT09839_web.jpg", (1620, 1080), True),
    ("TTT08816_web.jpg", (1080, 1620), True),
    ("TTT09334_web.jpg", (1080, 1620), True),
    ("TTT09654_web.jpg", (1080, 1620), True),
    ("TTT08789_web.jpg", (1080, 1620), True),
    ("TTT08688_web.jpg", (1080, 1620), False),
    ("TTT09027_web.jpg", (1080, 1620), False),
    ("bride_portrait.jpg", (800, 1000), False),
    ("couple_dance_3d.jpg", (600, 600), False),
    ("TTT08816_avatar.jpg", (270, 270), False),
    ("TTT08867_avatar.jpg", (270, 270), False),
]

# ảnh trong suốt (PNG): kích thước theo mức hiển thị CSS x3 (màn hình retina)
ALPHA = [
    ("wax_seal.png", (240, 240)),          # hiển thị 66px
    ("Song_hy_v2.png", (240, 264)),        # hiển thị 78px
    ("flower_top_left.png", (620, 620)),   # hiển thị 205px
    ("wedding_gift_box.png", (552, 526)),  # hiển thị 210px
    ("TTT09027_v2.png", (800, 1090)),      # hiển thị tối đa 255px
]

# QR giữ PNG lossless (để quét chuẩn), chỉ nén lại
QR = ["qr_groom_clean.png", "qr_bride_clean.png"]

THUMB_BOX = (720, 1080)  # khung album 255x385 CSS px (x3 retina ~ 765px)


def fit(im, box):
    im = im.copy()
    im.thumbnail(box, Image.LANCZOS)
    return im


def cover_thumb(im, box):
    """Thu nhỏ sao cho ảnh vẫn phủ kín khung (object-fit: cover)."""
    w, h = im.size
    scale = max(box[0] / w, box[1] / h)
    if scale >= 1:
        return im.copy()
    return im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)


def stem(name):
    return os.path.splitext(name)[0]


def save_photo(im, base):
    im.save(base + ".webp", "WEBP", quality=80, method=6)
    im.save(base + ".jpg", "JPEG", quality=82, optimize=True, progressive=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    total_in = total_out = 0

    for name, box, thumb in PHOTOS:
        src = os.path.join(SRC, name)
        im = Image.open(src).convert("RGB")
        total_in += os.path.getsize(src)
        base = os.path.join(OUT, stem(name))
        save_photo(fit(im, box), base)
        total_out += os.path.getsize(base + ".webp")
        if thumb:
            save_photo(cover_thumb(im, THUMB_BOX), base + "_thumb")

    for name, box in ALPHA:
        src = os.path.join(SRC, name)
        im = fit(Image.open(src).convert("RGBA"), box)
        total_in += os.path.getsize(src)
        base = os.path.join(OUT, stem(name))
        im.save(base + ".webp", "WEBP", quality=88, alpha_quality=100, method=6)
        im.save(base + ".png", "PNG", optimize=True)
        total_out += os.path.getsize(base + ".webp")

    for name in QR:
        src = os.path.join(SRC, name)
        im = Image.open(src)
        im.save(os.path.join(OUT, name), "PNG", optimize=True)
        im.save(os.path.join(OUT, stem(name) + ".webp"), "WEBP", lossless=True, method=6)

    print(f"Ảnh gốc: {total_in/1024/1024:.2f} MB -> WebP: {total_out/1024/1024:.2f} MB")
    for f in sorted(os.listdir(OUT)):
        print(f"  {f:32s} {os.path.getsize(os.path.join(OUT, f))//1024:5d} KB")


if __name__ == "__main__":
    main()
