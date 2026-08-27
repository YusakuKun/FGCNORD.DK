#!/usr/bin/env python3
"""Generer simple SVG pladsholder-billeder og konverter dem til PNG."""

import os
import subprocess
from pathlib import Path

PUBLIC = Path(__file__).parent.parent / "public"

ASSETS = [
    # (filename, width, height, bg, text)
    ("fgc4v3_transparent", 400, 400, "#F7F1E6", "FGC\nNORD"),
    ("fgc4v3_dark", 400, 400, "#1A1A18", "FGC\nNORD"),
    ("hero-illustration", 800, 800, "#51512A", "HERO\nILLUSTRATION"),
    ("community-photo-1", 800, 600, "#A84434", "COMMUNITY\nPHOTO"),
]

ULTIMATE_STAGES = [
    "Battlefield", "Final Destination", "Smashville", "Town & City",
    "Pokemon Stadium 2", "Kalos Pokemon League", "Lylat Cruise", "Yoshi's Story"
]

MELEE_STAGES = [
    "Battlefield", "Final Destination", "Yoshi's Story",
    "Fountain of Dreams", "Dream Land", "Pokemon Stadium"
]

COLORS = ["#A84434", "#51512A", "#C96A58", "#1A1A18", "#141413", "#EFE6D5"]


def svg_wrap(content: str, width: int, height: int) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
{content}
</svg>'''


def text_svg(text: str, width: int, height: int, bg: str, text_color: str = "#141413") -> str:
    lines = text.split("\\n")
    # Estimer font-size baseret på længste linje
    longest = max(lines, key=len)
    font_size = min(width / (len(longest) * 0.6), height / (len(lines) * 1.5))
    font_size = max(20, min(font_size, 80))
    line_height = font_size * 1.2
    start_y = height / 2 - (len(lines) - 1) * line_height / 2

    text_elements = ""
    for i, line in enumerate(lines):
        y = start_y + i * line_height
        safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        text_elements += f'    <text x="{width/2}" y="{y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="{font_size}" fill="{text_color}">{safe_line}</text>\n'

    return svg_wrap(
        f'  <rect width="{width}" height="{height}" fill="{bg}"/>\n{text_elements}',
        width, height
    )


def save_png(name: str, svg_content: str, subdir: str = ""):
    out_dir = PUBLIC / subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    svg_path = out_dir / f"{name}.svg"
    png_path = out_dir / f"{name}.png"
    svg_path.write_text(svg_content)

    # Brug sips til at konvertere til PNG
    try:
        subprocess.run(
            ["sips", "-s", "format", "png", str(svg_path), "--out", str(png_path)],
            check=True,
            capture_output=True,
        )
        svg_path.unlink()
        print(f"✓ {png_path.relative_to(PUBLIC.parent)}")
    except subprocess.CalledProcessError as e:
        print(f"✗ Fejl ved konvertering af {name}: {e.stderr.decode()}")


def main():
    for name, w, h, bg, text in ASSETS:
        text_c = "#F7F1E6" if bg in ("#1A1A18", "#141413", "#51512A") else "#141413"
        save_png(name, text_svg(text, w, h, bg, text_c), subdir="")

    for i, stage in enumerate(ULTIMATE_STAGES):
        bg = COLORS[i % len(COLORS)]
        text_c = "#F7F1E6" if bg in ("#1A1A18", "#141413", "#51512A") else "#141413"
        safe_name = stage.replace("'", "").replace(" ", "-").lower()
        save_png(safe_name, text_svg(stage, 400, 225, bg, text_c), subdir="stage-thumbs/")

    for i, stage in enumerate(MELEE_STAGES):
        bg = COLORS[(i + 2) % len(COLORS)]
        text_c = "#F7F1E6" if bg in ("#1A1A18", "#141413", "#51512A") else "#141413"
        safe_name = stage.replace("'", "").replace(" ", "-").lower()
        save_png(safe_name, text_svg(stage, 400, 225, bg, text_c), subdir="melee-thumbs")

    # Favicon
    favicon_svg = svg_wrap(
        '  <rect width="32" height="32" fill="#A84434"/>\n  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#F7F1E6">F</text>',
        32, 32
    )
    (PUBLIC / "favicon.svg").write_text(favicon_svg)
    print(f"✓ public/favicon.svg")


if __name__ == "__main__":
    main()
