import os
import json
import argparse
from PIL import Image, ImageDraw, ImageFont
import qrcode

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templet2.png")

PROJECT_ROOT = os.path.dirname(BASE_DIR)
LOCAL_FONTS_DIR = os.path.join(PROJECT_ROOT, "fonts")

def get_font(size, bold=True):
    font_paths = [
        os.path.join(LOCAL_FONTS_DIR, "LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf"),
        os.path.join(LOCAL_FONTS_DIR, "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"),
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def get_condensed_font(size, bold=False):
    if bold:
        candidates = [
            os.path.join(LOCAL_FONTS_DIR, "DejaVuSansCondensed-Bold.ttf"),
            os.path.join(LOCAL_FONTS_DIR, "LiberationSans-Bold.ttf"),
            "/usr/share/fonts/ttf-dejavu/DejaVuSansCondensed-Bold.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
            "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf",
            "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        ]
    else:
        candidates = [
            os.path.join(LOCAL_FONTS_DIR, "DejaVuSansCondensed.ttf"),
            os.path.join(LOCAL_FONTS_DIR, "LiberationSans-Regular.ttf"),
            "/usr/share/fonts/ttf-dejavu/DejaVuSansCondensed.ttf",
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
            "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Regular.otf",
            "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
        ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return get_font(size, bold)

def extract_signature_png(sig_img: Image.Image, threshold: int = 195) -> Image.Image:
    """Extracts ink from a signature image, converting white/light paper background into transparent PNG."""
    sig_img = sig_img.convert("RGBA")
    datas = sig_img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum >= threshold:
            new_data.append((0, 0, 0, 0))
        elif lum > 110:
            alpha = int(255 * (1.0 - (lum - 110) / (threshold - 110)))
            new_data.append((min(r, 40), min(g, 40), min(b, 40), min(a, alpha)))
        else:
            new_data.append((min(r, 40), min(g, 40), min(b, 40), a))
    sig_img.putdata(new_data)
    return sig_img

def draw_centered_cell(draw, text, col_x0, col_x1, y_mid, font, fill=(0, 0, 0)):
    if not text:
        return
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (col_x0 + col_x1) // 2 - tw // 2
    ty = y_mid - (bbox[3] + bbox[1]) // 2
    draw.text((tx, ty), text, fill=fill, font=font)

def generate_punjab_dl(data, photo_path=None, signature_path=None, auth_sig_path=None, output_path=None, preview=False):
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"Template image not found: {TEMPLATE_PATH}")

    card = Image.open(TEMPLATE_PATH).convert("RGBA")
    draw = ImageDraw.Draw(card)

    font_dl = get_font(52, bold=True)
    font_date = get_font(32, bold=True)
    font_name = get_font(44, bold=True)
    font_info = get_font(42, bold=True)
    font_addr = get_font(38, bold=True)
    font_vdate = get_font(36, bold=True)
    font_tbl = get_font(36, bold=True)
    font_top_code = get_font(34, bold=True)

    # 1. Front Driving Licence Number
    dl_no = (data.get("dl_no") or "").strip()
    if dl_no:
        draw.text((430, 240), dl_no, fill=(0, 0, 0), font=font_dl)

    # 2. Front Dates aligned individually with corresponding title headers
    issue_date = (data.get("issue_date") or "").strip()
    validity_nt = (data.get("validity_nt") or "").strip()
    validity_tr = (data.get("validity_tr") or "").strip()
    if issue_date:
        # Centered under Issue Date label: center=541
        bbox_id = font_date.getbbox(issue_date)
        w_id = bbox_id[2] - bbox_id[0]
        draw.text((int(541 - w_id / 2), 428), issue_date, fill=(0, 0, 0), font=font_date)
    if validity_nt:
        # Centered under Validity(NT) label: center=784
        bbox_nt = font_date.getbbox(validity_nt)
        w_nt = bbox_nt[2] - bbox_nt[0]
        draw.text((int(784 - w_nt / 2), 428), validity_nt, fill=(0, 0, 0), font=font_date)
    if validity_tr:
        # Centered under Validity(TR) label: center=1040
        bbox_tr = font_date.getbbox(validity_tr)
        w_tr = bbox_tr[2] - bbox_tr[0]
        draw.text((int(1040 - w_tr / 2), 428), validity_tr, fill=(0, 0, 0), font=font_date)

    # 3. Personal Information
    name = (data.get("name") or "").strip()
    dob = (data.get("dob") or "").strip()
    blood_group = (data.get("blood_group") or "").strip()
    organ_donor = (data.get("organ_donor") or "").strip()
    relation = (data.get("relation") or "").strip()

    if name:
        draw.text((425, 672), name, fill=(0, 0, 0), font=font_name)
    if dob:
        draw.text((315, 735), dob, fill=(0, 0, 0), font=font_info)
    if blood_group:
        draw.text((885, 735), blood_group, fill=(0, 0, 0), font=font_info)
    if organ_donor:
        draw.text((1300, 735), organ_donor, fill=(0, 0, 0), font=font_info)
    if relation:
        draw.text((480, 818), relation, fill=(0, 0, 0), font=font_info)

    # 4. Address Lines
    addr1 = (data.get("address_1") or "").strip()
    addr2 = (data.get("address_2") or "").strip()
    if addr1:
        draw.text((58, 978), addr1, fill=(0, 0, 0), font=font_addr)
    if addr2:
        draw.text((58, 1028), addr2, fill=(0, 0, 0), font=font_addr)

    # 5. Driver Photo
    if photo_path and os.path.exists(photo_path):
        try:
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((310, 330), Image.Resampling.LANCZOS)
            card.paste(photo, (1167, 218))
        except Exception as e:
            print(f"Warning: Could not load photo: {e}")

    # 6. Holder Signature
    if signature_path and os.path.exists(signature_path) and str(signature_path).lower() != "none":
        try:
            sig = Image.open(signature_path).convert("RGBA")
            sig = extract_signature_png(sig)
            sig_w = 150
            sig_h = int(sig.height * (sig_w / sig.width))
            sig = sig.resize((sig_w, sig_h), Image.Resampling.LANCZOS)
            card.paste(sig, (1240, 565), sig)
        except Exception as e:
            print(f"Warning: Could not load signature: {e}")

    # 7. Vertical Date Of First Issue (aligned with Date of First Issue label)
    first_issue = (data.get("first_issue_date") or issue_date or "").strip()
    if first_issue:
        bbox = font_vdate.getbbox(first_issue)
        w_t = bbox[2] - bbox[0]
        h_t = bbox[3] - bbox[1]
        v_img_t = Image.new("RGBA", (w_t, h_t), (0, 0, 0, 0))
        v_draw_t = ImageDraw.Draw(v_img_t)
        v_draw_t.text((-bbox[0], -bbox[1]), first_issue, fill=(0, 0, 0), font=font_vdate)
        v_rot = v_img_t.rotate(270, expand=True)
        # Position with baseline aligned with label on right edge
        card.paste(v_rot, (1492, 310), v_rot)

    # 8. Back DL No (shifted slightly higher to align with label baseline)
    if dl_no:
        draw.text((230, 1640), dl_no, fill=(0, 0, 0), font=font_dl)

    # 9. Back Top Right Code
    top_code = (data.get("top_right_code") or "PBDL000002570487").strip()
    if top_code:
        bbox_tc = font_top_code.getbbox(top_code)
        w_tc = bbox_tc[2] - bbox_tc[0]
        draw.text((1536 - 80 - w_tc, 1656), top_code, fill=(0, 0, 0), font=font_top_code)

    # 10. Back QR Code
    qr_text = data.get("qr_data", "")
    if not qr_text and dl_no:
        dl_slug = dl_no.strip().replace(" ", "-").lower()
        base_url = (data.get("base_url") or os.environ.get("VERIFY_DOMAIN", "sarathi-parivahangovin.com")).strip()
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"
        qr_text = f"{base_url.rstrip('/')}/dl-status/{dl_slug}/"

    if qr_text:
        try:
            qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=0)
            qr.add_data(qr_text)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
            qr_img = qr_img.resize((285, 285), Image.Resampling.NEAREST)
            card.paste(qr_img, (25, 1785))
        except Exception as e:
            print(f"Warning: Could not generate QR code: {e}")

    # 11. Vehicle Classes Table
    # Row 1 (y: 2275..2328, mid: 2301) -> MCWG (Bike pre-printed in Col 1)
    mcwg_code = (data.get("mcwg_code", "") or "").strip() or "MCWG"
    mcwg_issued = data.get("mcwg_issued_by", "").strip()
    mcwg_date = data.get("mcwg_date", "").strip()
    mcwg_cat = (data.get("mcwg_category", "") or "").strip() or "NT"

    draw_centered_cell(draw, mcwg_code, 214, 383, 2301, font_tbl)
    draw_centered_cell(draw, mcwg_issued, 383, 551, 2301, font_tbl)
    draw_centered_cell(draw, mcwg_date, 551, 757, 2301, font_tbl)
    draw_centered_cell(draw, mcwg_cat, 757, 908, 2301, font_tbl)

    # Row 2 (y: 2328..2380, mid: 2354) -> LMV (Car pre-printed in Col 1)
    lmv_code = (data.get("lmv_code", "") or "").strip() or "LMV"
    lmv_issued = data.get("lmv_issued_by", "").strip()
    lmv_date = data.get("lmv_date", "").strip()
    lmv_cat = (data.get("lmv_category", "") or "").strip() or "NT"

    draw_centered_cell(draw, lmv_code, 214, 383, 2354, font_tbl)
    draw_centered_cell(draw, lmv_issued, 383, 551, 2354, font_tbl)
    draw_centered_cell(draw, lmv_date, 551, 757, 2354, font_tbl)
    draw_centered_cell(draw, lmv_cat, 757, 908, 2354, font_tbl)

    # 12. Licensing Authority Section & Office (auth_office)
    auth_office = (data.get("auth_office") or "").strip()
    office_lines = [line.strip() for line in auth_office.splitlines() if line.strip()]

    has_auth_sig = bool(
        auth_sig_path
        and str(auth_sig_path).lower() != "none"
        and os.path.exists(auth_sig_path)
    )

    # Fixed starting position: line 1 stays anchored at y=2668, subsequent lines go DOWN
    office_font = get_condensed_font(38, bold=True)
    start_office_y = 2668
    for i, line in enumerate(office_lines):
        draw.text((1150, start_office_y + i * 38), line, fill=(0, 0, 0), font=office_font)

    # Authority Signature: placed bigger right ON TOP of Licensing Authority text (y=2640)
    if has_auth_sig:
        try:
            auth_sig = Image.open(auth_sig_path).convert("RGBA")
            auth_sig = extract_signature_png(auth_sig)
            sig_w = 340
            sig_h = int(auth_sig.height * (sig_w / auth_sig.width))
            if sig_h > 120:
                sig_h = 120
                sig_w = int(auth_sig.width * (sig_h / auth_sig.height))
            auth_sig = auth_sig.resize((sig_w, sig_h), Image.Resampling.LANCZOS)
            sig_x = 1300 - sig_w // 2
            sig_y = 2640 - sig_h // 2
            card.paste(auth_sig, (sig_x, sig_y), auth_sig)
        except Exception as e:
            print(f"Warning: Could not load authority signature: {e}")

    # 13. Emergency Contact (optional)
    emergency = (data.get("emergency_contact") or "").strip()
    if emergency:
        draw.text((600, 2690), emergency, fill=(0, 0, 0), font=font_info)

    if output_path:
        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        final_img = card.convert("RGB")
        if preview:
            final_img.thumbnail((1200, 1800), Image.Resampling.LANCZOS)
            final_img.save(output_path, "JPEG", quality=88, optimize=True)
        else:
            final_img.save(output_path, "PNG", quality=95)
        print(f"Card generated successfully: {output_path}")

    return card

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Punjab Driving Licence (Template 2)")
    parser.add_argument("--json", help="Path to JSON data file", default=os.path.join(BASE_DIR, "demo2_data.json"))
    parser.add_argument("--photo", help="Path to driver photo", default=os.path.join(BASE_DIR, "sample_photo.jpg"))
    parser.add_argument("--signature", help="Path to holder signature", default=os.path.join(BASE_DIR, "sample_holder_signature.png"))
    parser.add_argument("--auth_signature", "--auth-signature", help="Path to authority signature", default="none")
    parser.add_argument("--output", help="Path for output image", default=os.path.join(BASE_DIR, "test_demo2_result.png"))
    parser.add_argument("--preview", action="store_true", help="Generate fast web-optimized preview image")
    args = parser.parse_args()

    demo_data = {}
    if args.json and os.path.exists(args.json):
        with open(args.json, "r", encoding="utf-8") as f:
            demo_data = json.load(f)

    generate_punjab_dl(
        data=demo_data,
        photo_path=args.photo,
        signature_path=args.signature,
        auth_sig_path=args.auth_signature,
        output_path=args.output,
        preview=args.preview
    )
