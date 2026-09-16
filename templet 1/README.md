# Indian Union Driving License Generator & Editor

This directory contains the complete engine, template assets, CLI generator, and web application for generating high-resolution Indian Driving License cards (both Front and Back).

All code and assets are self-contained inside this folder.

---

## 📁 Files in This Directory

- **`templet.png`**: High-resolution (1792 × 2400) blank card template (Front & Back).
- **`demo.jpeg`**: Reference card image for visual comparison.
- **`generate_card.py`**: Core Python / Pillow generation engine with pixel-accurate coordinates and CLI.
- **`app.py`**: Web application with live preview, input fields, photo upload, and one-click PNG download.
- **`sample_photo.jpg`**: Sample passport photo extracted for testing.
- **`sample_signature.png`**: Sample signature file (optional).
- **`test_demo_result.png`**: Generated high-resolution test demo card matching `demo.jpeg`.

---

## 🚀 Running the Web Editor

Launch the local web server:

```bash
cd /home/alvee/Desktop/india
python3 app.py
```

Then open your browser at:
👉 **`http://localhost:5050`**

### Features:
- **Live Real-Time Preview**: Any change to text or dates updates the card instantly.
- **Photo Upload**: Drag and drop or upload any custom photo, or click "Use Sample Photo".
- **Download Card**: 1-click download of the print-ready high-resolution PNG (1792 × 2400 px).
- **Signature**: Omitted by default as requested; optional signature uploading is supported when ready.

---

## 💻 CLI Usage

You can also generate cards directly from the command line:

```bash
# Default demo test
python3 generate_card.py --output card_output.png

# With custom data JSON and photo
python3 generate_card.py --json my_data.json --photo my_photo.jpg --output my_card.png
```

---

## 📝 Editable Fields Supported

### Front Card:
- **State Name**: e.g., `Uttar Pradesh`
- **State Code Badge**: e.g., `UP` (renders as `(UP)` inside orange badge)
- **Driving License Number**: e.g., `UP63 08848623226`
- **Issue Date**: e.g., `30-12-2020`
- **Validity (NT)**: Non-Transport date, e.g., `30-12-2030`
- **Validity (TR)**: Transport date, e.g., `30-12-2030`
- **First Issue Date**: Vertical text along right edge, e.g., `30-12-2020`
- **Full Name**: e.g., `Shivam Shahi`
- **Date of Birth**: e.g., `11-07-2002`
- **Blood Group**: e.g., `A+`
- **Organ Donor**: e.g., `N/A`, `YES`, `NO`
- **Son/Daughter/Wife of**: e.g., `Santosh Shahi`
- **Address**: Permanent address (single or multi-line)
- **Driver Photo**: Passport photo box (1381, 214, 297 × 345 px)

### Back Card:
- **DL No (Header)**: Next to `DL No:`
- **DL No (Top Right Small)**: Reference DL number on top right
- **QR Code**: Auto-generated from DL data and fitted into the QR box
- **Vehicle Table (MCWG)**: Issued By (`UP00`) & Date (`30-12-2020`)
- **Vehicle Table (LMV)**: Issued By (`UP00`) & Date (`30-12-2020`)
- **Emergency Contact Number**: Optional contact number at bottom left
