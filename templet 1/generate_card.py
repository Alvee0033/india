import os
import io
import json
import argparse
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templet.png")

# Fonts
FONT_BOLD_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def get_font(size, bold=True):
    font_path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    if not os.path.exists(font_path):
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(font_path, size)

def get_condensed_font(size, bold=False):
    if bold:
        candidates = [
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
            "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf",
            FONT_BOLD_PATH
        ]
    else:
        candidates = [
            "/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
            "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Regular.otf",
            FONT_REG_PATH
        ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return get_font(size, bold)

def draw_cell_centered(draw, text, cx, cy, font, fill=(0, 0, 0)):
    """Draws text precisely centered horizontally and vertically at (cx, cy)."""
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((cx - w / 2 - bbox[0], cy - h / 2 - bbox[1]), text, fill=fill, font=font)

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

def generate_indian_dl(
    data,
    template_path=TEMPLATE_PATH,
    photo_path=None,
    signature_path=None,
    auth_signature_path=None,
    output_path=None,
    preview=False
):
    """
    Renders an Indian Union Driving License with both Front and Back sides.
    All fields are fully customizable and pixel-perfect to the official card layout.
    """
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at: {template_path}")

    card = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(card)

    # 1. State Name (Front Header)
    # 'Issued by' ends at x=539. Placed with exact font match to 'Issued by' at size 66 bold
    state = (data.get("state") or "Uttar Pradesh").strip()
    if state:
        draw.text((559, 112), state, fill=(0, 0, 0), font=get_font(66, True))

    # 2. State Code in Orange Circle (Center: 1685, 95)
    state_code = (data.get("state_code") or "UP").strip()
    if state_code:
        badge_text = f"({state_code})" if not (state_code.startswith("(") and state_code.endswith(")")) else state_code
        draw_cell_centered(draw, badge_text, 1685, 95, get_font(35, True))

    # 3. Front Driving Licence No (Top Center)
    # Left edge aligned with Issue Date column at x=505; vertically centered at y=256
    dl_no = (data.get("dl_no") or "").strip()
    if dl_no:
        draw.text((505, 256), dl_no, fill=(0, 0, 0), font=get_font(56, True))

    # 4. Dates: Issue Date, Validity NT, Validity TR
    issue_date = (data.get("issue_date") or "").strip()
    validity_nt = (data.get("validity_nt") or "").strip()
    validity_tr = (data.get("validity_tr") or "").strip()

    date_font = get_font(42, True)
    if issue_date:
        draw.text((505, 412), issue_date, fill=(0, 0, 0), font=date_font)
    if validity_nt:
        draw.text((794, 412), validity_nt, fill=(0, 0, 0), font=date_font)
    if validity_tr:
        draw.text((1117, 412), validity_tr, fill=(0, 0, 0), font=date_font)

    # 5. Driver Photo (Box: xmin=1381, ymin=214, width=297, height=345)
    if photo_path and os.path.exists(photo_path):
        try:
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((297, 345), Image.Resampling.LANCZOS)
            card.paste(photo, (1381, 214))
        except Exception as e:
            print(f"Warning: Could not load photo: {e}")

    # 6. Holder Signature Label and Signature Image
    # In official DL format, "Holder's Signature" is printed centered beneath photo
    f_sig_lbl = get_condensed_font(40)
    draw_cell_centered(draw, "Holder's Signature", 1530, 665, f_sig_lbl)

    if signature_path and os.path.exists(signature_path):
        try:
            sig = Image.open(signature_path).convert("RGBA")
            sig = extract_signature_png(sig)
            if sig.width > 260 or sig.width < 180:
                new_w = 230
                new_h = int(sig.height * (new_w / sig.width))
                sig = sig.resize((new_w, new_h), Image.Resampling.LANCZOS)
            card.paste(sig, (1530 - sig.width // 2, 595), sig)
        except Exception as e:
            print(f"Warning: Could not load holder signature: {e}")

    # 7. Date of First Issue (Vertical text alongside photo, reading BOTTOM to TOP)
    # Starts at bottom with 'Date' (~y=900) and ends at top with bold date value (~y=340) alongside photo
    first_issue = (data.get("first_issue_date") or issue_date or "").strip()
    if first_issue:
        v_label_font = get_font(36, False)
        v_val_font = get_font(38, True)
        label_text = "Date Of First Issue"
        val_text = first_issue

        bb_label = draw.textbbox((0, 0), label_text, font=v_label_font)
        w_label = bb_label[2] - bb_label[0]
        bb_val = draw.textbbox((0, 0), val_text, font=v_val_font)
        w_val = bb_val[2] - bb_val[0]

        gap = 35
        total_w = w_label + gap + w_val
        max_h = max(bb_label[3] - bb_label[1], bb_val[3] - bb_val[1]) + 20

        txt_img = Image.new("RGBA", (total_w + 30, max_h + 20), (255, 255, 255, 0))
        t_draw = ImageDraw.Draw(txt_img)
        t_draw.text((10, 10), label_text, fill=(0, 0, 0), font=v_label_font)
        t_draw.text((10 + w_label + gap, 10), val_text, fill=(0, 0, 0), font=v_val_font)

        # Rotated 90 degrees CCW: 'Date' is at bottom, date value ends at top
        rot_img = txt_img.rotate(90, expand=True)
        card.paste(rot_img, (1734 - rot_img.width // 2, 340), rot_img)

    # 8. Personal Details (Sized up and bolded to match demo and card labels)
    name = (data.get("name") or "").strip()
    dob = (data.get("dob") or "").strip()
    blood_group = (data.get("blood_group") or "").strip()
    organ_donor = (data.get("organ_donor") or "N/A").strip()
    relation = (data.get("relation") or "").strip()
    address = (data.get("address") or "").strip()

    if name:
        draw.text((505, 644), name, fill=(0, 0, 0), font=get_font(54, True))
    if dob:
        draw.text((350, 729), dob, fill=(0, 0, 0), font=get_font(48, True))
    if blood_group:
        draw.text((1040, 729), blood_group, fill=(0, 0, 0), font=get_font(48, True))
    if organ_donor:
        draw.text((1520, 729), organ_donor, fill=(0, 0, 0), font=get_font(48, True))
    if relation:
        draw.text((540, 813), relation, fill=(0, 0, 0), font=get_font(48, True))
    if address:
        addr_font = get_font(48, True)
        if "\n" in address:
            lines = address.split("\n")
            curr_y = 980
            for line in lines:
                draw.text((52, curr_y), line.strip(), fill=(0, 0, 0), font=addr_font)
                curr_y += 56
        else:
            draw.text((52, 980), address, fill=(0, 0, 0), font=addr_font)

    # ---------------- BACK SIDE ----------------

    # 9. DL No on Back
    if dl_no:
        # Header DL No (ends at x=189 on template, placed with single space at x=203)
        draw.text((203, 1272), dl_no, fill=(0, 0, 0), font=get_font(48, True))
        # Small DL No at top-right of blue header bar (right-aligned to x=1640)
        sm_font = get_font(26, True)
        sm_bbox = draw.textbbox((0, 0), dl_no, font=sm_font)
        sm_w = sm_bbox[2] - sm_bbox[0]
        draw.text((1640 - sm_w, 1298), dl_no, fill=(0, 0, 0), font=sm_font)

    # 10. QR Code (White box at 40, 1373, w=297, h=303)
    qr_text = data.get("qr_data", "")
    if not qr_text and dl_no:
        dl_slug = dl_no.strip().replace(" ", "-").lower()
        base_url = (data.get("base_url") or os.environ.get("VERIFY_DOMAIN", "sarathi-parivahangovin.com")).strip()
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"
        qr_text = f"{base_url.rstrip('/')}/dl-status/{dl_slug}/"

    if qr_text:
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=1
        )
        qr.add_data(qr_text)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
        qr_img = qr_img.resize((280, 280), Image.Resampling.LANCZOS)
        card.paste(qr_img, (48, 1384))

    # 11. Back Table (Vehicle Authorisation)
    mcwg_issued_by = data.get("mcwg_issued_by", "").strip()
    mcwg_date = data.get("mcwg_date", "").strip()
    lmv_issued_by = data.get("lmv_issued_by", "").strip()
    lmv_date = data.get("lmv_date", "").strip()

    tbl_code_font = get_font(38, True)
    tbl_date_font = get_font(36, True)

    if mcwg_issued_by:
        draw_cell_centered(draw, mcwg_issued_by, 486.5, 1857, tbl_code_font)
    if mcwg_date:
        draw_cell_centered(draw, mcwg_date, 712.5, 1857, tbl_date_font)

    if lmv_issued_by:
        draw_cell_centered(draw, lmv_issued_by, 486.5, 1925.5, tbl_code_font)
    if lmv_date:
        draw_cell_centered(draw, lmv_date, 712.5, 1925.5, tbl_date_font)

    # 12. Emergency Contact Number
    emergency_contact = (data.get("emergency_contact") or "").strip()
    if emergency_contact:
        draw.text((650, 2282), emergency_contact, fill=(0, 0, 0), font=get_font(40, True))

    # 13. Licensing Authority Section (Bottom Right - Under Signature)
    auth_title = ((data.get("auth_title") or "") or "Licensing Authority").strip()
    auth_office = (data.get("auth_office") or "").strip()
    office_lines = [line.strip() for line in auth_office.splitlines() if line.strip()]

    has_auth_sig = bool(
        auth_signature_path
        and str(auth_signature_path).lower() != "none"
        and os.path.exists(auth_signature_path)
    )

    # Licensing Authority text (y=2252)
    if auth_title:
        draw.text((1365, 2252), auth_title, fill=(0, 0, 0), font=get_condensed_font(40, bold=False))

    # Fixed starting position: line 1 stays anchored at y=2298, subsequent lines go DOWN
    office_font = get_condensed_font(42, bold=True)
    start_office_y = 2298 if auth_title else 2260
    for i, line in enumerate(office_lines):
        draw.text((1365, start_office_y + i * 40), line, fill=(0, 0, 0), font=office_font)

    # Authority Signature: placed bigger right ON TOP of Licensing Authority text
    if has_auth_sig:
        try:
            auth_sig = Image.open(auth_signature_path).convert("RGBA")
            auth_sig = extract_signature_png(auth_sig)
            sig_w = 340
            sig_h = int(auth_sig.height * (sig_w / auth_sig.width))
            if sig_h > 120:
                sig_h = 120
                sig_w = int(auth_sig.width * (sig_h / auth_sig.height))
            auth_sig = auth_sig.resize((sig_w, sig_h), Image.Resampling.LANCZOS)
            sig_x = 1525 - sig_w // 2
            sig_y = 2246 - sig_h // 2
            card.paste(auth_sig, (sig_x, sig_y), auth_sig)
        except Exception as e:
            print(f"Warning: Could not load authority signature: {e}")

    # Save
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
    parser = argparse.ArgumentParser(description="Generate Indian Union Driving License")
    parser.add_argument("--json", help="Path to JSON file with DL data")
    parser.add_argument("--photo", help="Path to driver photo", default=os.path.join(BASE_DIR, "sample_photo.jpg"))
    parser.add_argument("--signature", help="Path to holder signature", default=os.path.join(BASE_DIR, "sample_holder_signature_clean.png"))
    parser.add_argument("--auth-signature", help="Path to authority signature", default="none")
    parser.add_argument("--output", help="Path for output image", default=os.path.join(BASE_DIR, "test_demo_result.png"))
    parser.add_argument("--preview", action="store_true", help="Generate fast web-optimized preview image")
    args = parser.parse_args()

    demo_data = {
        "state": "Uttar Pradesh",
        "state_code": "UP",
        "dl_no": "UP63 08848623226",
        "issue_date": "30-12-2020",
        "validity_nt": "30-12-2030",
        "validity_tr": "30-12-2030",
        "first_issue_date": "30-12-2020",
        "name": "Shivam Shahi",
        "dob": "11-07-2002",
        "blood_group": "A+",
        "organ_donor": "N/A",
        "relation": "Santosh Shahi",
        "address": "GOPALRAOPET,TELANGANA,INDIA",
        "mcwg_issued_by": "UPoo",
        "mcwg_date": "30-12-2020",
        "lmv_issued_by": "UPoo",
        "lmv_date": "30-12-2020",
        "emergency_contact": "",
        "auth_title": "Licensing Authority",
        "auth_office": "UP00 MEERUT"
    }

    if args.json and os.path.exists(args.json):
        with open(args.json, "r", encoding="utf-8") as f:
            demo_data = json.load(f)

    generate_indian_dl(
        data=demo_data,
        photo_path=args.photo,
        signature_path=args.signature,
        auth_signature_path=args.auth_signature,
        output_path=args.output,
        preview=args.preview
    )

