import os
import io
import base64
from flask import Flask, render_template_string, request, jsonify, send_file
from generate_card import generate_indian_dl, BASE_DIR, TEMPLATE_PATH

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

HTML_TEMPLATE = r"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indian Driving License Card Generator</title>
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
                <div class="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-lg">
                    🇮🇳
                </div>
                <div>
                    <h1 class="font-bold text-base md:text-lg text-white">Indian Driving License Generator</h1>
                    <p class="text-xs text-slate-400">High-Resolution Print-Ready (1792 × 2400 px)</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="updatePreview()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700 transition">
                    🔄 Refresh
                </button>
                <button onclick="downloadCard()" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-lg shadow-orange-950/30 transition flex items-center gap-2">
                    ⬇️ Download Card
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Form Column -->
        <div class="lg:col-span-6 bg-slate-950/50 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
            
            <!-- Section: Header & State -->
            <div>
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🏛️ State & License Info
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="md:col-span-2">
                        <label class="block text-xs text-slate-400 mb-1">Issued By (State Name)</label>
                        <input type="text" id="state" value="Uttar Pradesh" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">State Code (Badge)</label>
                        <input type="text" id="state_code" value="UP" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="block text-xs text-slate-400 mb-1">Driving License Number</label>
                    <input type="text" id="dl_no" value="UP63 08848623226" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-orange-500">
                </div>
            </div>

            <!-- Section: Dates -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    📅 Dates & Validity
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Issue Date</label>
                        <input type="text" id="issue_date" value="30-12-2020" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Validity (NT)</label>
                        <input type="text" id="validity_nt" value="30-12-2030" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Validity (TR)</label>
                        <input type="text" id="validity_tr" value="30-12-2030" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">First Issue Date (Right)</label>
                        <input type="text" id="first_issue_date" value="30-12-2020" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>
            </div>

            <!-- Section: Personal Details -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    👤 Personal Information
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input type="text" id="name" value="Shivam Shahi" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Son/Daughter/Wife of</label>
                        <input type="text" id="relation" value="Santosh Shahi" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 mt-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Date of Birth</label>
                        <input type="text" id="dob" value="11-07-2002" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Blood Group</label>
                        <input type="text" id="blood_group" value="A+" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Organ Donor</label>
                        <input type="text" id="organ_donor" value="N/A" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>

                <div class="mt-3">
                    <label class="block text-xs text-slate-400 mb-1">Permanent Address</label>
                    <textarea id="address" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">GOPALRAOPET,TELANGANA,INDIA</textarea>
                </div>
            </div>

            <!-- Section: Vehicle Table & Back Info -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🚗 Vehicle Authorisation (Back Table)
                </h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span class="text-xs font-bold text-slate-300">🏍️ Motorcycle (MCWG)</span>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <div>
                                <label class="block text-[11px] text-slate-400">Issued By</label>
                                <input type="text" id="mcwg_issued_by" value="UPoo" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Date of Issue</label>
                                <input type="text" id="mcwg_date" value="30-12-2020" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                        </div>
                    </div>

                    <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span class="text-xs font-bold text-slate-300">🚗 Light Motor (LMV)</span>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <div>
                                <label class="block text-[11px] text-slate-400">Issued By</label>
                                <input type="text" id="lmv_issued_by" value="UPoo" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] text-slate-400">Date of Issue</label>
                                <input type="text" id="lmv_date" value="30-12-2020" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Emergency Contact Number</label>
                        <input type="text" id="emergency_contact" placeholder="Optional (e.g. 9876543210)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">QR Code Data Override</label>
                        <input type="text" id="qr_data" placeholder="Auto-generated if blank" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>
            </div>

            <!-- Section: Licensing Authority (Bottom Right) -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    ✍️ Licensing Authority (Bottom Right)
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Authority Title</label>
                        <input type="text" id="auth_title" value="Licensing Authority" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Office / Location Text</label>
                        <input type="text" id="auth_office" value="UP00 MEERUT" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-orange-500">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="block text-xs text-slate-400 mb-1">Authority Signature (Overlay on text)</label>
                    <div class="flex items-center gap-2">
                        <input type="file" id="auth_sig_file" accept="image/*" class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30">
                        <button type="button" onclick="useSampleAuthSig()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 whitespace-nowrap">
                            Use Sample
                        </button>
                        <button type="button" onclick="clearAuthSig()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 whitespace-nowrap text-rose-400 hover:text-rose-300">
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Section: Photo & Signature Upload -->
            <div class="pt-4 border-t border-slate-800">
                <h2 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    📷 Photo & Holder Signature
                </h2>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Driver Photo</label>
                        <div class="flex items-center gap-2">
                            <input type="file" id="photo_file" accept="image/*" class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30">
                            <button type="button" onclick="useSamplePhoto()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 whitespace-nowrap">
                                Use Sample Photo
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Holder Signature (Over "Holder's Signature" text)</label>
                        <div class="flex items-center gap-2">
                            <input type="file" id="holder_sig_file" accept="image/*" class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30">
                            <button type="button" onclick="useSampleHolderSig()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 whitespace-nowrap">
                                Use Sample
                            </button>
                            <button type="button" onclick="clearHolderSig()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 whitespace-nowrap text-rose-400 hover:text-rose-300">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Preview Column -->
        <div class="lg:col-span-6 flex flex-col items-center">
            <div class="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 shadow-sm sticky top-20">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                    <span id="status_indicator" class="text-xs text-emerald-400 font-medium">Ready</span>
                </div>
                <div class="relative bg-black/40 rounded-lg overflow-hidden flex justify-center items-center border border-slate-800 max-h-[78vh] overflow-y-auto p-2">
                    <img id="card_preview" src="/api/preview" alt="License Preview" class="max-w-full h-auto rounded shadow-2xl transition duration-150">
                    <div id="loading_spinner" class="hidden absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                </div>
                <div class="mt-3 text-center text-xs text-slate-500">
                    Template: 1792 × 2400 px | High-resolution print ready
                </div>
            </div>
        </div>
    </main>

    <script>
        let photoBase64 = null;
        let holderSigBase64 = "sample";
        let authSigBase64 = "sample";

        // Auto update preview on input change with debounce
        let debounceTimer;
        document.querySelectorAll('input, textarea').forEach(el => {
            el.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updatePreview, 350);
            });
        });

        document.getElementById('photo_file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    photoBase64 = evt.target.result;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('holder_sig_file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    holderSigBase64 = evt.target.result;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });

        function clearHolderSig() {
            holderSigBase64 = "none";
            document.getElementById('holder_sig_file').value = "";
            updatePreview();
        }

        function useSampleHolderSig() {
            holderSigBase64 = "sample";
            document.getElementById('holder_sig_file').value = "";
            updatePreview();
        }

        document.getElementById('auth_sig_file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    authSigBase64 = evt.target.result;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });

        function clearAuthSig() {
            authSigBase64 = "none";
            document.getElementById('auth_sig_file').value = "";
            updatePreview();
        }

        function useSampleAuthSig() {
            authSigBase64 = "sample";
            document.getElementById('auth_sig_file').value = "";
            updatePreview();
        }

        function useSamplePhoto() {
            photoBase64 = null;
            document.getElementById('photo_file').value = "";
            updatePreview();
        }

        function getFormData() {
            return {
                state: document.getElementById('state').value,
                state_code: document.getElementById('state_code').value,
                dl_no: document.getElementById('dl_no').value,
                issue_date: document.getElementById('issue_date').value,
                validity_nt: document.getElementById('validity_nt').value,
                validity_tr: document.getElementById('validity_tr').value,
                first_issue_date: document.getElementById('first_issue_date').value,
                name: document.getElementById('name').value,
                dob: document.getElementById('dob').value,
                blood_group: document.getElementById('blood_group').value,
                organ_donor: document.getElementById('organ_donor').value,
                relation: document.getElementById('relation').value,
                address: document.getElementById('address').value,
                mcwg_issued_by: document.getElementById('mcwg_issued_by').value,
                mcwg_date: document.getElementById('mcwg_date').value,
                lmv_issued_by: document.getElementById('lmv_issued_by').value,
                lmv_date: document.getElementById('lmv_date').value,
                emergency_contact: document.getElementById('emergency_contact').value,
                qr_data: document.getElementById('qr_data').value,
                auth_title: document.getElementById('auth_title').value,
                auth_office: document.getElementById('auth_office').value,
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
            const dlNo = (document.getElementById('dl_no').value || 'dl_card').replace(/\s+/g, '_');
            a.href = url;
            a.download = `${dlNo}_indian_dl.png`;
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
    holder_sig_path = os.path.join(BASE_DIR, "sample_holder_signature_clean.png")
    auth_sig_path = os.path.join(BASE_DIR, "sample_authority_signature.png")
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
                temp_hsig_path = os.path.join(BASE_DIR, "temp_uploaded_holder_sig.png")
                with open(temp_hsig_path, "wb") as f:
                    f.write(img_data)
                holder_sig_path = temp_hsig_path
                temp_files.append(temp_hsig_path)
            except Exception as e:
                print("Error parsing holder_sig_base64:", e)

        # Auth Signature upload
        auth_sig_b64 = body.get('auth_sig_base64')
        if auth_sig_b64 == "none":
            auth_sig_path = None
        elif auth_sig_b64 and "," in auth_sig_b64:
            try:
                header, encoded = auth_sig_b64.split(",", 1)
                img_data = base64.b64decode(encoded)
                temp_sig_path = os.path.join(BASE_DIR, "temp_uploaded_auth_sig.png")
                with open(temp_sig_path, "wb") as f:
                    f.write(img_data)
                auth_sig_path = temp_sig_path
                temp_files.append(temp_sig_path)
            except Exception as e:
                print("Error parsing auth_sig_base64:", e)
    else:
        # Default sample values for GET
        data = {
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

    card_img = generate_indian_dl(
        data=data,
        photo_path=photo_path,
        signature_path=holder_sig_path,
        auth_signature_path=auth_sig_path
    )

    # Clean up temp files
    for tf in temp_files:
        if os.path.exists(tf):
            try:
                os.remove(tf)
            except:
                pass

    buf = io.BytesIO()
    card_img.convert("RGB").save(buf, format="PNG", quality=95)
    buf.seek(0)
    return send_file(buf, mimetype="image/png")

if __name__ == '__main__':
    print("Starting Indian Driving License Web App on http://127.0.0.1:5050 ...")
    app.run(host='0.0.0.0', port=5050, debug=False)
