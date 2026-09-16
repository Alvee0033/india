import os
import io
import json
import argparse
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templet.png")

def get_font(size, bold=True):
    font_paths = [
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()

def get_condensed_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/ttf-dejavu/DejaVuSansCondensed-Bold.ttf" if bold else "/usr/share/fonts/ttf-dejavu/DejaVuSansCondensed.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
        "/usr/share/fonts/dejavu/DejaVuSansCondensed-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSansCondensed.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return get_font(size, bold)

def draw_cell_centered(draw, text, cx, cy, font, fill=(0, 0, 0)):
    """Draws text precisely centered horizontally and vertically at (cx, cy)."""
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = cx - w / 2.0
    y = cy - h / 2.0 - bbox[1]
    draw.text((x, y), text, fill=fill, font=font)

def extract_signature_png(sig_img: Image.Image, threshold: int = 195) -> Image.Image:
    """Extracts ink from a signature image, converting white/light paper background into transparent PNG."""
    sig_img = sig_img.convert("RGBA")
    datas = sig_img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        brightness = (r + g + b) / 3.0
        if brightness > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            alpha = int(255 * (1.0 - (brightness / float(threshold))))
            alpha = max(140, min(255, alpha))
            new_data.append((10, 15, 30, alpha))
    sig_img.putdata(new_data)
    return sig_img

def generate_indian_dl(
    data: dict,
    photo_path: str = None,
    signature_path: str = None,
    auth_signature_path: str = None,
    preview_mode: bool = True
) -> Image.Image:

    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"Template image not found: {TEMPLATE_PATH}")

    card = Image.open(TEMPLATE_PATH).convert("RGBA")
    draw = ImageDraw.Draw(card)

    state = data.get("state", "UNION OF INDIA").upper()
    rto = data.get("rto", "TRANSPORT DEPARTMENT").upper()
    state_desc = data.get("state_desc", "FORM 7 - DRIVING LICENCE").upper()
    dl_no = data.get("dl_no", "").strip()
    doi = data.get("doi", "").strip()

    name = data.get("name", "").strip().upper()
    relation = data.get("relation", "").strip().upper()
    rel_type = data.get("rel_type", "S/W/D").strip().upper()
    dob = data.get("dob", "").strip()
    blood = data.get("blood", "U").strip().upper()
    org_donor = data.get("org_donor", "N").strip().upper()

    v_nt = data.get("v_nt", "").strip()
    v_tr = data.get("v_tr", "").strip()

    addr_line1 = data.get("addr_line1", "").strip().upper()
    addr_line2 = data.get("addr_line2", "").strip().upper()

    badge_no = data.get("badge_no", "").strip()

    cov_rows = data.get("cov_rows", [
        {"cov": "MCWG", "issue_date": doi},
        {"cov": "LMV", "issue_date": doi}
    ])

    draw.text((559, 112), state, fill=(0, 0, 0), font=get_font(66, True))
    draw.text((559, 194), rto, fill=(0, 0, 0), font=get_font(42, True))
    draw.text((559, 248), state_desc, fill=(0, 0, 0), font=get_font(38, True))

    draw.text((559, 305), f"DL No : {dl_no}", fill=(0, 0, 0), font=get_font(56, True))
    draw.text((1284, 305), f"DOI : {doi}", fill=(0, 0, 0), font=get_font(52, True))

    draw.text((559, 396), f"Name : {name}", fill=(0, 0, 0), font=get_condensed_font(50, True))
    draw.text((559, 461), f"{rel_type} : {relation}", fill=(0, 0, 0), font=get_condensed_font(48, True))

    draw.text((559, 526), f"DOB : {dob}", fill=(0, 0, 0), font=get_font(48, True))
    draw.text((1050, 526), f"Blood : {blood}", fill=(0, 0, 0), font=get_font(48, True))
    draw.text((1438, 526), f"Org Donor : {org_donor}", fill=(0, 0, 0), font=get_font(48, True))

    draw.text((559, 591), f"Validity (NT) : {v_nt}", fill=(0, 0, 0), font=get_font(46, True))
    if v_tr:
        draw.text((1240, 591), f"TR : {v_tr}", fill=(0, 0, 0), font=get_font(46, True))

    draw.text((559, 656), f"Address : {addr_line1}", fill=(0, 0, 0), font=get_condensed_font(44, True))
    if addr_line2:
        draw.text((774, 711), addr_line2, fill=(0, 0, 0), font=get_condensed_font(44, True))

    row_y_centers = [882, 942, 1002, 1062]

    for idx, row in enumerate(cov_rows[:4]):
        cy = row_y_centers[idx]
        cov_code = str(row.get("cov", "")).upper()
        cov_doi = str(row.get("issue_date", doi)).strip()

        if cov_code:
            draw_cell_centered(draw, cov_code, 703, cy, font=get_font(34, True))
            draw_cell_centered(draw, cov_doi, 1145, cy, font=get_font(34, True))

    if photo_path and os.path.exists(photo_path):
        try:
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((434, 532), Image.Resampling.LANCZOS)
            card.paste(photo, (77, 396), photo)
        except Exception as e:
            print(f"Warning: Failed to process photo ({e})")

    if signature_path and os.path.exists(signature_path):
        try:
            sig = Image.open(signature_path)
            sig = extract_signature_png(sig)
            sig = sig.resize((434, 150), Image.Resampling.LANCZOS)
            card.paste(sig, (77, 950), sig)
        except Exception as e:
            print(f"Warning: Failed to process signature ({e})")

    if auth_signature_path and os.path.exists(auth_signature_path):
        try:
            auth_sig = Image.open(auth_signature_path)
            auth_sig = extract_signature_png(auth_sig)
            auth_sig = auth_sig.resize((350, 130), Image.Resampling.LANCZOS)
            card.paste(auth_sig, (1350, 950), auth_sig)
        except Exception as e:
            print(f"Warning: Failed to process auth signature ({e})")

    base_url = data.get("base_url", "https://sarathi.parivahan.gov.in").rstrip("/")
    qr_content = f"{base_url}/dl-status/{dl_no}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(qr_content)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    qr_img = qr_img.resize((330, 330), Image.Resampling.LANCZOS)
    card.paste(qr_img, (1400, 420), qr_img)

    if preview_mode:
        card = card.resize((896, 1200), Image.Resampling.LANCZOS)

    return card

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Indian DL Card")
    parser.add_argument("--json", required=True, help="Path to JSON data file")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--preview", action="store_true", help="Generate fast web preview resolution")
    parser.add_argument("--photo", default=None, help="Path to holder photo")
    parser.add_argument("--signature", default=None, help="Path to holder signature")
    parser.add_argument("--auth-signature", default=None, help="Path to authority signature")
    parser.add_argument("--auth_signature", default=None, help="Alias path to authority signature")

    args = parser.parse_args()

    with open(args.json, "r", encoding="utf-8") as f:
        dl_data = json.load(f)

    photo_p = args.photo if args.photo and args.photo != "none" else None
    sig_p = args.signature if args.signature and args.signature != "none" else None
    auth_p = args.auth_signature or args.auth_signature
    if auth_p == "none":
        auth_p = None

    result_card = generate_indian_dl(
        data=dl_data,
        photo_path=photo_p,
        signature_path=sig_p,
        auth_signature_path=auth_p,
        preview_mode=args.preview
    )

    result_card.convert("RGB").save(args.output, "PNG")
    print(f"DL Card generated successfully at {args.output}")
