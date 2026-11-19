"""
Script dọn dẹp các bản Deployment cũ trên Vercel cho dự án thangtrangwedding.
Giữ lại duy nhất 1 bản Production mới nhất và 1 bản Preview mới nhất, xóa sạch tất cả các bản cũ để giải phóng 100% dung lượng.

Hướng dẫn sử dụng:
1. Lấy Vercel Token tại: https://vercel.com/account/tokens
2. Chạy lệnh:
   python cleanup_vercel.py <VERCEL_TOKEN>
"""

import sys, os, json
import urllib.request
import urllib.error

PROJECT_NAME = "thangtrangwedding"

def main():
    token = os.environ.get("VERCEL_TOKEN")
    if len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("[!] Thiếu Vercel Token!")
        print("Cách dùng: python cleanup_vercel.py <VERCEL_TOKEN>")
        print("Lấy token cá nhân tại: https://vercel.com/account/tokens")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print(f"[*] Đang kết nối tới Vercel API để kiểm tra danh sách deployments của dự án '{PROJECT_NAME}'...")
    url = f"https://api.vercel.com/v6/deployments?limit=100"
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Không thể lấy danh sách deployments: {e.code} {e.reason}")
        print(e.read().decode())
        return

    deployments = data.get("deployments", [])
    # Lọc deployments của project
    proj_deps = [d for d in deployments if d.get("name") == PROJECT_NAME or PROJECT_NAME in d.get("url", "")]
    
    if not proj_deps:
        print(f"[*] Không tìm thấy deployment nào cho dự án '{PROJECT_NAME}'.")
        return

    print(f"[*] Tìm thấy tổng cộng {len(proj_deps)} deployments.")
    
    # Sắp xếp mới nhất trước. Giữ lại: bản Production READY mới nhất + bản Preview READY mới nhất.
    # Không bao giờ xoá bản đang build/xếp hàng (chưa READY), tránh xoá nhầm bản production đang chạy.
    proj_deps.sort(key=lambda d: d.get("created", 0), reverse=True)
    keep = {}
    for d in proj_deps:
        if d.get("state") != "READY":
            continue
        target = d.get("target") or "preview"
        if target not in keep:
            keep[target] = d

    if "production" not in keep:
        print("[!] Không tìm thấy bản Production nào đã READY. Dừng lại để an toàn, không xoá gì.")
        return

    keep_ids = {d.get("uid") for d in keep.values()}
    to_delete = [d for d in proj_deps
                 if d.get("uid") not in keep_ids and d.get("state") in ("READY", "ERROR", "CANCELED")]

    for target, d in keep.items():
        print(f"[*] Giữ lại bản {target}: {d.get('url')} (ID: {d.get('uid')})")
    print(f"[*] Chuẩn bị xóa {len(to_delete)} bản deployments cũ để giải phóng dung lượng...")

    deleted_count = 0
    for dep in to_delete:
        dep_id = dep.get("uid")
        dep_url = dep.get("url")
        del_url = f"https://api.vercel.com/v13/deployments/{dep_id}"
        del_req = urllib.request.Request(del_url, headers=headers, method="DELETE")
        try:
            with urllib.request.urlopen(del_req) as del_res:
                if del_res.status in (200, 204):
                    deleted_count += 1
                    print(f"  [OK] Đã xóa bản cũ: {dep_url} ({dep_id})")
        except urllib.error.HTTPError as err:
            print(f"  [!] Lỗi khi xóa {dep_id}: {err.code}")

    print(f"\n[DONE] Hoàn tất! Đã xóa thành công {deleted_count} bản build cũ.")
    print("Dung lượng trên Vercel đã được giải phóng triệt để!")

if __name__ == "__main__":
    main()

