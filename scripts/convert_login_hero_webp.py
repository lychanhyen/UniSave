"""Chuyển hai ảnh nền trang đăng nhập sang WebP, đồng thời lưu ảnh gốc PNG để dự phòng."""

from pathlib import Path

from PIL import Image

LOGIN_DIR = Path("public/assets/images/login")
SOURCE_DIR = Path("docs/assets/source")

JOBS = [
    # (tệp gốc, tên tệp WebP, chất lượng)
    (LOGIN_DIR / "login-hero.png", LOGIN_DIR / "login-hero.webp", 86),
    (Path("55e154cc-dc2f-42eb-b411-449676a0ba5f.png"), LOGIN_DIR / "login-hero-mobile.webp", 86),
]

SOURCE_DIR.mkdir(parents=True, exist_ok=True)

for source, target, quality in JOBS:
    if not source.exists():
        print("thiếu tệp:", source)
        continue

    image = Image.open(source).convert("RGB")
    image.save(target, "WEBP", quality=quality, method=6)

    # Giữ bản gốc PNG ở thư mục tài liệu (không được phục vụ ra ngoài ứng dụng).
    backup = SOURCE_DIR / source.name
    if source.parent != SOURCE_DIR:
        if backup.exists():
            backup.unlink()
        source.rename(backup)

    before = source.stat().st_size if source.exists() else backup.stat().st_size
    after = target.stat().st_size
    print(
        f"{target.name}: {image.size[0]}x{image.size[1]} | {before // 1024} KB → {after // 1024} KB "
        f"(giảm {round((1 - after / before) * 100)}%)"
    )
