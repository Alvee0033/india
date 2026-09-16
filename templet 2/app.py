import os
import io
import base64
from flask import Flask, render_template_string, request, jsonify, send_file
from generate_card import generate_punjab_dl, BASE_DIR, TEMPLATE_PATH

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

HTML_TEMPLATE = r"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Punjab Driving License Generator (Template 2)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
    <header class="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                    PB
                </div>
                <div>
                    <h1 class="font-bold text-base md:text-lg text-white">Punjab Driving Licence Generator (Template 2)</h1>
                    <p class="text-xs text-slate-400">High-Resolution Print-Ready (1536 × 2752 px)</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="updatePreview()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700 transition">
                    🔄 Refresh
                </button>
                <button onclick="downloadCard()" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-white rounded-lg shadow-lg shadow-amber-950/30 transition flex items-center gap-2">
                    ⬇️ Download Card
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Form Column -->
        <div class="lg:col-span-6 bg-slate-950/50 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
            
            <!-- Section: License Number & Top Codes -->
            <div>
                <h2 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🏛️ License Number & Verification Codes
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Driving Licence Number</label>
                        <input type="text" id="dl_no" value="PB35 20210005691" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Back Top-Right Code</label>
                        <input type="text" id="top_right_code" value="PBDL000002570487" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            </div>

            <!-- Section: Dates -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    📅 Dates & Validity
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Issue Date</label>
                        <input type="text" id="issue_date" value="14-06-2021" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Validity (NT)</label>
                        <input type="text" id="validity_nt" value="13-06-2031" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Validity (TR)</label>
                        <input type="text" id="validity_tr" value="13-06-2031" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">First Issue Date (Right)</label>
                        <input type="text" id="first_issue_date" value="14-06-2021" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            </div>

            <!-- Section: Personal Details -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    👤 Personal Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input type="text" id="name" value="JIBIN KUMAR P" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Son/Daughter/Wife of</label>
                        <input type="text" id="relation" value="K M BABU" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 mt-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Date of Birth</label>
                        <input type="text" id="dob" value="16-06-1995" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Blood Group</label>
                        <input type="text" id="blood_group" value="O- VE" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Organ Donor</label>
                        <input type="text" id="organ_donor" value="N" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-3 mt-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Address Line 1</label>
                        <input type="text" id="address_1" value="THIRUVATHIRA, HENTRY ROAD, PAPPINISSRI" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Address Line 2</label>
                        <input type="text" id="address_2" value="P O, Pappinisseri S.O, Kannur, Kerala - 670561" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            </div>

            <!-- Section: Vehicle Table & Back Info -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🚗 Vehicle Authorisation (Back Table)
                </h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span class="text-xs font-bold text-slate-300">🏍️ Row 1: Motorcycle (MCWG)</span>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <div>
                                <label class="block text-[11px] text-slate-400">Class Code</label>
                                <input type="text" id="mcwg_code" value="MCWG" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Issued By</label>
                                <input type="text" id="mcwg_issued_by" value="PB35" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Date of Issue</label>
                                <input type="text" id="mcwg_date" value="14-06-2021" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Category</label>
                                <input type="text" id="mcwg_category" value="NT" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                        </div>
                    </div>

                    <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span class="text-xs font-bold text-slate-300">🚙 Row 2: Light Motor Vehicle (LMV)</span>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <div>
                                <label class="block text-[11px] text-slate-400">Class Code</label>
                                <input type="text" id="lmv_code" value="LMV" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Issued By</label>
                                <input type="text" id="lmv_issued_by" value="PB35" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Date of Issue</label>
                                <input type="text" id="lmv_date" value="14-06-2021" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Category</label>
                                <input type="text" id="lmv_category" value="NT" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mt-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Emergency Contact Number</label>
                        <input type="text" id="emergency_contact" placeholder="Leave blank or enter phone" value="" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">QR Code Data</label>
                        <input type="text" id="qr_data" placeholder="Auto-generated if empty" value="" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                    </div>
                </div>
            </div>

            <!-- Section: Uploads -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    📷 Custom Photos & Signatures
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Driver Photo</label>
                        <input type="file" id="photo_file" accept="image/*" class="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-full">
                        <span class="text-[10px] text-slate-500 mt-1 block">Default: sample_photo.jpg</span>
                    </div>

                    <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Holder Signature</label>
                        <input type="file" id="holder_sig_file" accept="image/*" class="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-full">
                        <span class="text-[10px] text-slate-500 mt-1 block">Default: sample_holder_signature.png</span>
                    </div>

                    <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Authority Signature</label>
                        <input type="file" id="auth_sig_file" accept="image/*" class="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 w-full">
                        <span class="text-[10px] text-slate-500 mt-1 block">Default: clean authority signature</span>
                    </div>
                </div>
            </div>

        </div>

        <!-- Preview Column -->
        <div class="lg:col-span-6 flex flex-col items-center">
            <div class="sticky top-20 w-full flex flex-col items-center">
                <div class="w-full flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Card Preview</span>
                    <span id="status_indicator" class="text-xs text-emerald-400 font-medium">Ready</span>
                </div>

                <div class="relative w-full max-w-[500px] rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 p-2">
                    <div id="loading_spinner" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center hidden z-20">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                    </div>
                    <img id="card_preview" src="/api/preview" alt="Driving License Preview" class="w-full h-auto object-contain rounded-lg">
                </div>

                <div class="mt-4 flex gap-3 w-full max-w-[500px]">
                    <button onclick="updatePreview()" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700 transition">
                        🔄 Refresh Preview
                    </button>
                    <button onclick="downloadCard()" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-white rounded-lg shadow-lg shadow-amber-950/40 transition">
                        ⬇️ Download High-Res PNG
                    </button>
                </div>
            </div>
        </div>
    </main>

    <script>
        let photoBase64 = null;
        let holderSigBase64 = null;
        let authSigBase64 = null;

        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        document.getElementById('photo_file').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                photoBase64 = await fileToBase64(e.target.files[0]);
                updatePreview();
            }
        });

        document.getElementById('holder_sig_file').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                holderSigBase64 = await fileToBase64(e.target.files[0]);
                updatePreview();
            }
        });

        document.getElementById('auth_sig_file').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                authSigBase64 = await fileToBase64(e.target.files[0]);
                updatePreview();
            }
        });

        // Auto-refresh when typing finishes (debounce)
        let debounceTimer;
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updatePreview, 600);
            });
        });

        function getFormData() {
            return {
                dl_no: document.getElementById('dl_no').value,
                top_right_code: document.getElementById('top_right_code').value,
                issue_date: document.getElementById('issue_date').value,
                validity_nt: document.getElementById('validity_nt').value,
                validity_tr: document.getElementById('validity_tr').value,
                first_issue_date: document.getElementById('first_issue_date').value,
                name: document.getElementById('name').value,
                dob: document.getElementById('dob').value,
                blood_group: document.getElementById('blood_group').value,
                organ_donor: document.getElementById('organ_donor').value,
                relation: document.getElementById('relation').value,
                address_1: document.getElementById('address_1').value,
                address_2: document.getElementById('address_2').value,
                mcwg_code: document.getElementById('mcwg_code').value,
                mcwg_issued_by: document.getElementById('mcwg_issued_by').value,
                mcwg_date: document.getElementById('mcwg_date').value,
                mcwg_category: document.getElementById('mcwg_category').value,
                lmv_code: document.getElementById('lmv_code').value,
                lmv_issued_by: document.getElementById('lmv_issued_by').value,
                lmv_date: document.getElementById('lmv_date').value,
                lmv_category: document.getElementById('lmv_category').value,
                emergency_contact: document.getElementById('emergency_contact').value,
                qr_data: document.getElementById('qr_data').value,
                photo_base64: photoBase64,
                holder_sig_base64: holderSigBase64,
                auth_sig_base64: authSigBase64
            };
        }

        async function updatePreview() {
            const spinner = document.getElementById('loading_spinner');
            const status = document.getElementById('status_indicator');
            spinner.classList.remove('hidden');
            status.textContent = 'Rendering...';
            status.className = 'text-xs text-amber-400 font-medium';

            try {
                const resp = await fetch('/api/preview', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(getFormData())
                });
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                document.getElementById('card_preview').src = url;
                status.textContent = 'Updated';
                status.className = 'text-xs text-emerald-400 font-medium';
            } catch (err) {
                console.error(err);
                status.textContent = 'Error';
                status.className = 'text-xs text-rose-400 font-medium';
            } finally {
                spinner.classList.add('hidden');
            }
        }

        async function downloadCard() {
            const resp = await fetch('/api/preview', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(getFormData())
            });
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dlNo = (document.getElementById('dl_no').value || 'punjab_dl').replace(/\s+/g, '_');
            a.href = url;
            a.download = `${dlNo}_punjab_dl.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/preview', methods=['GET', 'POST'])
def preview():
    data = {}
    photo_path = os.path.join(BASE_DIR, "sample_photo.jpg")
    holder_sig_path = os.path.join(BASE_DIR, "sample_holder_signature.png")
    auth_sig_path = os.path.join(BASE_DIR, "sample_authority_signature_clean.png")
    temp_files = []

    if request.method == 'POST':
        body = request.get_json(silent=True) or {}
        data = body
        # Photo upload
        photo_b64 = body.get('photo_base64')
        if photo_b64 == "none":
            photo_path = None
        elif photo_b64 and "," in photo_b64:
            try:
                header, encoded = photo_b64.split(",", 1)
                img_data = base64.b64decode(encoded)
                temp_photo_path = os.path.join(BASE_DIR, "temp_uploaded_photo.png")
                with open(temp_photo_path, "wb") as f:
                    f.write(img_data)
                photo_path = temp_photo_path
                temp_files.append(temp_photo_path)
            except Exception as e:
                print("Error parsing photo_base64:", e)

        # Holder Signature upload
        holder_sig_b64 = body.get('holder_sig_base64')
        if holder_sig_b64 == "none":
            holder_sig_path = None
        elif holder_sig_b64 and "," in holder_sig_b64:
            try:
                header, encoded = holder_sig_b64.split(",", 1)
                img_data = base64.b64decode(encoded)
                temp_holder_sig_path = os.path.join(BASE_DIR, "temp_uploaded_holder_sig.png")
                with open(temp_holder_sig_path, "wb") as f:
                    f.write(img_data)
                holder_sig_path = temp_holder_sig_path
                temp_files.append(temp_holder_sig_path)
            except Exception as e:
                print("Error parsing holder_sig_base64:", e)

        # Authority Signature upload
        auth_sig_b64 = body.get('auth_sig_base64')
        if auth_sig_b64 == "none":
            auth_sig_path = None
        elif auth_sig_b64 and "," in auth_sig_b64:
            try:
                header, encoded = auth_sig_b64.split(",", 1)
                img_data = base64.b64decode(encoded)
                temp_auth_sig_path = os.path.join(BASE_DIR, "temp_uploaded_auth_sig.png")
                with open(temp_auth_sig_path, "wb") as f:
                    f.write(img_data)
                auth_sig_path = temp_auth_sig_path
                temp_files.append(temp_auth_sig_path)
            except Exception as e:
                print("Error parsing auth_sig_base64:", e)
    else:
        # Load default demo data
        demo_json = os.path.join(BASE_DIR, "demo2_data.json")
        if os.path.exists(demo_json):
            import json
            with open(demo_json, "r", encoding="utf-8") as f:
                data = json.load(f)

    # Generate Card
    card_img = generate_punjab_dl(
        data=data,
        photo_path=photo_path,
        signature_path=holder_sig_path,
        auth_sig_path=auth_sig_path
    )

    # Cleanup temp files
    for tf in temp_files:
        try:
            if os.path.exists(tf):
                os.remove(tf)
        except Exception:
            pass

    # Return PNG byte stream
    img_io = io.BytesIO()
    card_img.save(img_io, 'PNG', quality=95)
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5052))
    print(f"Starting Punjab Driving License generator web app on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
