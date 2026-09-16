import os
import json
import argparse
from PIL import Image, ImageDraw, ImageFont
import qrcode

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templet2.png")

def get_font(size, bold=True):
    font_paths = [
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
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
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = cx - w / 2.0
    y = cy - h / 2.0 - bbox[1]
    draw.text((x, y), text, fill=fill, font=font)

def extract_signature_png(sig_img: Image.Image, threshold: int = 195) -> Image.Image:
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

def generate_punjab_dl(
    data: dict,
    photo_path: str = None,
    signature_path: str = None,
    auth_sig_path: str = None,
    output_path: str = None,
    preview: bool = False
) -> Image.Image:

    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"Template image not found: {TEMPLATE_PATH}")

    card = Image.open(TEMPLATE_PATH).convert("RGBA")
    draw = ImageDraw.Draw(card)

    dl_no = data.get("dl_no", "PB35 20210005691").strip()
    top_right_code = data.get("top_right_code", "").strip()
    doi = data.get("issue_date", "14-06-2021").strip()
    validity_nt = data.get("validity_nt", "13-06-2031").strip()
    validity_tr = data.get("validity_tr", "").strip()

    name = data.get("name", "").strip().upper()
    dob = data.get("dob", "").strip()
    blood = data.get("blood_group", "O- VE").strip().upper()
    org_donor = data.get("organ_donor", "N").strip().upper()
    relation = data.get("relation", "").strip().upper()

    address_1 = data.get("address_1", "").strip().upper()
    address_2 = data.get("address_2", "").strip().upper()

    auth_office = data.get("auth_office", "RTO PATHANKOT").strip().upper()

    draw.text((615, 410), dl_no, fill=(0, 0, 0), font=get_font(42, True))
    if top_right_code:
        draw.text((1310, 410), top_right_code, fill=(0, 0, 0), font=get_font(34, True))

    draw.text((615, 475), f"DOI : {doi}", fill=(0, 0, 0), font=get_font(36, True))
    draw.text((1150, 475), f"Val(NT) : {validity_nt}", fill=(0, 0, 0), font=get_font(36, True))
    if validity_tr:
        draw.text((1420, 475), f"TR : {validity_tr}", fill=(0, 0, 0), font=get_font(36, True))

    draw.text((615, 545), f"Name : {name}", fill=(0, 0, 0), font=get_condensed_font(40, True))
    draw.text((615, 605), f"S/W/D : {relation}", fill=(0, 0, 0), font=get_condensed_font(38, True))

    draw.text((615, 665), f"DOB : {dob}", fill=(0, 0, 0), font=get_font(36, True))
    draw.text((1050, 665), f"Blood : {blood}", fill=(0, 0, 0), font=get_font(36, True))
    draw.text((1400, 665), f"Org Donor : {org_donor}", fill=(0, 0, 0), font=get_font(36, True))

    draw.text((615, 725), f"Address : {address_1}", fill=(0, 0, 0), font=get_condensed_font(36, True))
    if address_2:
        draw.text((800, 775), address_2, fill=(0, 0, 0), font=get_condensed_font(36, True))

    draw.text((615, 845), f"Issued By : {auth_office}", fill=(0, 0, 0), font=get_font(34, True))

    # COV Rows
    cov_rows = [
        {"cov": data.get("mcwg_code", "MCWG"), "doi": data.get("mcwg_date", doi)},
        {"cov": data.get("lmv_code", "LMV"), "doi": data.get("lmv_date", doi)}
    ]
    row_y = [970, 1030]
    for idx, r in enumerate(cov_rows):
        if r["cov"]:
            draw_cell_centered(draw, str(r["cov"]), 730, row_y[idx], font=get_font(32, True))
            draw_cell_centered(draw, str(r["doi"]), 1180, row_y[idx], font=get_font(32, True))

    if photo_path and os.path.exists(photo_path) and photo_path != "none":
        try:
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((410, 500), Image.Resampling.LANCZOS)
            card.paste(photo, (95, 410), photo)
        except Exception as e:
            print(f"Warning: Failed to process photo ({e})")

    if signature_path and os.path.exists(signature_path) and signature_path != "none":
        try:
            sig = Image.open(signature_path)
            sig = extract_signature_png(sig)
            sig = sig.resize((410, 130), Image.Resampling.LANCZOS)
            card.paste(sig, (95, 930), sig)
        except Exception as e:
            print(f"Warning: Failed to process signature ({e})")

    if auth_sig_path and os.path.exists(auth_sig_path) and auth_sig_path != "none":
        try:
            auth_sig = Image.open(auth_sig_path)
            auth_sig = extract_signature_png(auth_sig)
            auth_sig = auth_sig.resize((320, 120), Image.Resampling.LANCZOS)
            card.paste(auth_sig, (1350, 930), auth_sig)
        except Exception as e:
            print(f"Warning: Failed to process auth signature ({e})")

    base_url = data.get("base_url", "https://parivahan-ind.com").rstrip("/")
    qr_content = f"{base_url}/dl-status/{dl_no}"
    qr = qrcode.QRCode(version=1, box_size=8, border=1)
    qr.add_data(qr_content)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    qr_img = qr_img.resize((300, 300), Image.Resampling.LANCZOS)
    card.paste(qr_img, (1410, 480), qr_img)

    if preview:
        card = card.resize((896, 1200), Image.Resampling.LANCZOS)

    if output_path:
        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        final_img = card.convert("RGB")
        final_img.save(output_path, "PNG")

    return card

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Punjab Driving Licence (Template 2)")
    parser.add_argument("--json", required=True, help="Path to JSON data file")
    parser.add_argument("--photo", default=None, help="Path to driver photo")
    parser.add_argument("--signature", default=None, help="Path to holder signature")
    parser.add_argument("--auth_signature", "--auth-signature", default=None, help="Path to authority signature")
    parser.add_argument("--output", required=True, help="Path for output image")
    parser.add_argument("--preview", action="store_true", help="Generate fast web-optimized preview image")
    args = parser.parse_args()

    with open(args.json, "r", encoding="utf-8") as f:
        demo_data = json.load(f)

    photo_p = args.photo if args.photo and args.photo != "none" else None
    sig_p = args.signature if args.signature and args.signature != "none" else None
    auth_p = args.auth_signature
    if auth_p == "none":
        auth_p = None

    generate_punjab_dl(
        data=demo_data,
        photo_path=photo_p,
        signature_path=sig_p,
        auth_sig_path=auth_p,
        output_path=args.output,
        preview=args.preview
    )
