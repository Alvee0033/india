import os
import io
import json
import argparse
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templet3.png")

# Fonts
PROJECT_ROOT = os.path.dirname(BASE_DIR)
LOCAL_FONTS_DIR = os.path.join(PROJECT_ROOT, "fonts")

def get_font(size, bold=True):
    candidates = [
        os.path.join(LOCAL_FONTS_DIR, "LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf"),
        os.path.join(LOCAL_FONTS_DIR, "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"),
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

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

def generate_kerala_dl(
    data,
    template_path=TEMPLATE_PATH,
    photo_path=None,
    signature_path=None,
    output_path=None,
    preview=False
):
    """
    Renders Kerala Driving Licence (Template 3) with Front and Back sides.
    Pixel-perfect match to demo3.jpeg on 1792 x 2400 canvas.
    """
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at: {template_path}")

    card = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(card)

    font_data = get_font(44, True)

    # 1. Front Driving Licence No
    dl_no = (data.get("dl_no") or "").strip()
    if dl_no:
        draw.text((584, 300), dl_no, fill=(0, 0, 0), font=get_font(52, True))

    # 2. Front Dates (Issue Date, Validity NT, Validity TR)
    issue_date = (data.get("issue_date") or "").strip()
    validity_nt = (data.get("validity_nt") or "").strip()
    validity_tr = (data.get("validity_tr") or "").strip()

    font_dates = get_font(40, True)
    if issue_date:
        draw.text((389, 439), issue_date, fill=(0, 0, 0), font=font_dates)
    if validity_nt:
        draw.text((700, 439), validity_nt, fill=(0, 0, 0), font=font_dates)
    if validity_tr:
        draw.text((1030, 439), validity_tr, fill=(0, 0, 0), font=font_dates)

    # 3. Personal Information (Size 44 Bold)
    name = (data.get("name") or "").strip()
    dob = (data.get("dob") or "").strip()
    blood_group = (data.get("blood_group") or "").strip()
    organ_donor = (data.get("organ_donor") or "").strip()
    relation = (data.get("relation") or "").strip()

    if name:
        draw.text((505, 510), name, fill=(0, 0, 0), font=font_data)
    if dob:
        draw.text((505, 582), dob, fill=(0, 0, 0), font=font_data)
    if blood_group:
        draw.text((1168, 579), blood_group, fill=(0, 0, 0), font=font_data)
    if organ_donor:
        draw.text((505, 654), organ_donor, fill=(0, 0, 0), font=font_data)
    if relation:
        draw.text((505, 724), relation, fill=(0, 0, 0), font=font_data)

    # 4. Addresses (Permanent and Present)
    # Placed below the underlines with size 38 Bold
    perm1 = (data.get("perm_address_1") or "").strip()
    perm2 = (data.get("perm_address_2") or "").strip()
    perm3 = (data.get("perm_address_3") or "").strip()

    pres1 = (data.get("pres_address_1") or "").strip()
    pres2 = (data.get("pres_address_2") or "").strip()
    pres3 = (data.get("pres_address_3") or "").strip()

    addr_font = get_font(38, True)
    if perm1:
        draw.text((150, 850), perm1, fill=(0, 0, 0), font=addr_font)
    if perm2:
        draw.text((150, 905), perm2, fill=(0, 0, 0), font=addr_font)
    if perm3:
        draw.text((150, 960), perm3, fill=(0, 0, 0), font=addr_font)

    if pres1:
        draw.text((885, 850), pres1, fill=(0, 0, 0), font=addr_font)
    if pres2:
        draw.text((885, 905), pres2, fill=(0, 0, 0), font=addr_font)
    if pres3:
        draw.text((885, 960), pres3, fill=(0, 0, 0), font=addr_font)

    # 5. Driver Photo
    # Photo box in template: (1340, 304, w=279, h=304)
    if photo_path and os.path.exists(photo_path):
        try:
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((279, 304), Image.Resampling.LANCZOS)
            card.paste(photo, (1340, 304))
        except Exception as e:
            print(f"Warning: Could not load photo: {e}")

    # 6. Holder Signature
    # Positioned cleanly ABOVE 'Holder,Signature' label at x=1350, y=620
    if signature_path and os.path.exists(signature_path) and str(signature_path).lower() != "none":
        try:
            sig = Image.open(signature_path).convert("RGBA")
            sig = extract_signature_png(sig)
            sig_w = 260
            sig_h = int(sig.height * (sig_w / sig.width))
            sig = sig.resize((sig_w, sig_h), Image.Resampling.LANCZOS)
            card.paste(sig, (1350, 620), sig)
        except Exception as e:
            print(f"Warning: Could not load signature: {e}")

    # 7. Vertical Date Of First Issue
    # Reads top-to-bottom, positioned above 'Date Of First Issue' label at x=1654, y=310
    first_issue = (data.get("first_issue_date") or issue_date or "").strip()
    if first_issue:
        vfont = get_font(38, True)
        bbox = vfont.getbbox(first_issue)
        w_t = bbox[2] - bbox[0]
        h_t = bbox[3] - bbox[1]
        v_img_t = Image.new("RGBA", (w_t, h_t), (0, 0, 0, 0))
        v_draw_t = ImageDraw.Draw(v_img_t)
        v_draw_t.text((-bbox[0], -bbox[1]), first_issue, fill=(0, 0, 0), font=vfont)
        v_rot = v_img_t.rotate(270, expand=True)
        card.paste(v_rot, (1656, 310), v_rot)

    # 8. Back DL No
    # Exact match: size 58 Bold at x=405, y=1322
    if dl_no:
        draw.text((405, 1322), dl_no, fill=(0, 0, 0), font=get_font(58, True))

    # 9. Back QR Code
    # In demo, QR matrix is ~265x265 centered at x=324, y=1601
    qr_text = data.get("qr_data", "")
    if not qr_text and dl_no:
        dl_slug = dl_no.strip().replace(" ", "-").lower()
        base_url = (data.get("base_url") or os.environ.get("VERIFY_DOMAIN", "sarathi-parivahangovin.com")).strip()
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"
        qr_text = f"{base_url.rstrip('/')}/dl-status/{dl_slug}/"

    if qr_text:
        try:
            qr = qrcode.QRCode(
                version=None,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=0
            )
            qr.add_data(qr_text)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
            # Resize QR to 265 x 265 and paste with clean white padding
            qr_img = qr_img.resize((265, 265), Image.Resampling.NEAREST)
            card.paste(qr_img, (192, 1469))
        except Exception as e:
            print(f"Warning: Could not generate QR code: {e}")

    # 10. Vehicle Class icons — paste pre-cropped patch from demo (white boxes + icons)
    icon_patch_path = os.path.join(BASE_DIR, "icon_patch.png")
    if os.path.exists(icon_patch_path):
        patch = Image.open(icon_patch_path).convert("RGBA")
        card.paste(patch, (85, 1800))

    mcwg_code = (data.get("mcwg_code", "") or "").strip() or "MCWG"
    mcwg_issued = data.get("mcwg_issued_by", "").strip()
    mcwg_date = data.get("mcwg_date", "").strip()

    lmv_code = (data.get("lmv_code", "") or "").strip() or "LMV"
    lmv_issued = data.get("lmv_issued_by", "").strip()
    lmv_date = data.get("lmv_date", "").strip()

    code_font = get_font(46, True)
    date_font = get_font(50, True)

    draw.text((561, 1844), mcwg_code, fill=(0, 0, 0), font=code_font)
    if mcwg_issued:
        draw.text((872, 1844), mcwg_issued, fill=(0, 0, 0), font=code_font)
    if mcwg_date:
        draw.text((1240, 1844), mcwg_date, fill=(0, 0, 0), font=date_font)

    draw.text((561, 1936), lmv_code, fill=(0, 0, 0), font=code_font)
    if lmv_issued:
        draw.text((872, 1936), lmv_issued, fill=(0, 0, 0), font=code_font)
    if lmv_date:
        draw.text((1240, 1936), lmv_date, fill=(0, 0, 0), font=date_font)

    # 11. Emergency Contact
    emergency = (data.get("emergency_contact") or "").strip()
    if emergency:
        draw.text((750, 2200), emergency, fill=(0, 0, 0), font=font_data)

    # 12. Licensing Authority Office (e.g. THIRUVATHIRA)
    auth_office = (data.get("auth_office") or "").strip()
    if auth_office:
        thiru_font = get_font(42, True)
        bbox = thiru_font.getbbox(auth_office)
        txt_w = bbox[2] - bbox[0]
        draw.text((1375 - txt_w // 2, 2255), auth_office, fill=(0, 0, 0), font=thiru_font)

    # Save output
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
    parser = argparse.ArgumentParser(description="Generate Kerala Driving Licence (Template 3)")
    parser.add_argument("--json", help="Path to JSON data file", default=os.path.join(BASE_DIR, "demo3_data.json"))
    parser.add_argument("--photo", help="Path to driver photo", default=os.path.join(BASE_DIR, "sample_photo.jpg"))
    parser.add_argument("--signature", help="Path to holder signature", default=os.path.join(BASE_DIR, "sample_holder_signature.png"))
    parser.add_argument("--output", help="Path for output image", default=os.path.join(BASE_DIR, "test_demo3_result.png"))
    parser.add_argument("--preview", action="store_true", help="Generate fast web-optimized preview image")
    args = parser.parse_args()

    demo_data = {}
    if args.json and os.path.exists(args.json):
        with open(args.json, "r", encoding="utf-8") as f:
            demo_data = json.load(f)

    generate_kerala_dl(
        data=demo_data,
        photo_path=args.photo,
        signature_path=args.signature,
        output_path=args.output,
        preview=args.preview
    )
