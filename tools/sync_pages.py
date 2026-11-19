"""
Đồng bộ các bản sao thiệp từ 2 file gốc:
  - index.html   -> nha-trai.html, nha-trai/index.html
  - nha-gai.html -> trang-thang.html, nha-gai/index.html, trang-thang/index.html

Bản nằm trong thư mục con được tự sửa đường dẫn thành "../" để vẫn hiển thị đúng
khi khách mở link có dấu "/" ở cuối (vd: https://.../nha-trai/).

Cách dùng (sau mỗi lần sửa index.html hoặc nha-gai.html):
    python tools/sync_pages.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TARGETS = {
    "index.html": ["nha-trai.html", "nha-trai/index.html"],
    "nha-gai.html": ["trang-thang.html", "nha-gai/index.html", "trang-thang/index.html"],
}

# Thuộc tính chứa đường dẫn tương đối tới tài nguyên của trang
ATTR_RE = re.compile(r'\b(src|href|srcset|content|data-img-src|data-full)="(assets/|style\.css|script\.js)')


def to_subfolder(html):
    return ATTR_RE.sub(lambda m: f'{m.group(1)}="../{m.group(2)}', html)


def main():
    for src_name, targets in TARGETS.items():
        with open(os.path.join(ROOT, src_name), encoding="utf-8", newline="") as f:
            html = f.read()
        for target in targets:
            out = to_subfolder(html) if "/" in target else html
            path = os.path.join(ROOT, target)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(out)
            print(f"{src_name} -> {target}")


if __name__ == "__main__":
    main()
