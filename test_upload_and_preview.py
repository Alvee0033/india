import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PIL import Image

ARTIFACT_DIR = "/home/alvee/.gemini/antigravity/brain/d11e366e-5fd8-45fc-b865-0c648eed72b1"

# Create a test photo
test_photo_path = "/tmp/test_avatar.jpg"
img = Image.new('RGB', (300, 300), color=(220, 50, 50))
img.save(test_photo_path)

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1440,900')
driver = webdriver.Chrome(options=options)

try:
    print("1. Opening /login...")
    driver.get('http://127.0.0.1:3005/login')
    time.sleep(1)
    
    # Fill login form
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("admin@dlims.gov")
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("dlims@admin2024")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(2)
    print("Logged in, current URL:", driver.current_url)

    print("2. Navigating to /admin/licenses/new...")
    driver.get('http://127.0.0.1:3005/admin/licenses/new')
    time.sleep(3)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_before_upload.png'))

    print("3. Finding file input for photo...")
    file_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")
    print(f"Found {len(file_inputs)} file inputs")
    # First file input is photo
    photo_input = file_inputs[0]
    photo_input.send_keys(test_photo_path)
    time.sleep(2)

    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_after_file_select.png'))
    print("Saved ss_after_file_select.png")

    # Check if cropper modal appeared
    crop_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Crop & Apply')]")
    print(f"Crop & Apply buttons found: {len(crop_btns)}")
    if crop_btns:
        print("Clicking Crop & Apply...")
        crop_btns[0].click()
        time.sleep(4)
    else:
        print("Cropper modal did not appear!")

    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_after_crop_apply.png'))
    print("Saved ss_after_crop_apply.png")

    # Check the card preview image
    preview_imgs = driver.find_elements(By.CSS_SELECTOR, "img[alt='Driving Licence Card']")
    print(f"Preview images found: {len(preview_imgs)}")
    if preview_imgs:
        src = preview_imgs[0].get_attribute('src')
        print(f"Preview src starts with: {src[:60]}... length: {len(src)}")

except Exception as e:
    print("Error:", e)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_error.png'))
finally:
    driver.quit()
    print("Done testing.")
