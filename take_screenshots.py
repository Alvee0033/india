import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ARTIFACT_DIR = "/home/alvee/.gemini/antigravity/brain/d11e366e-5fd8-45fc-b865-0c648eed72b1"

def get_driver(width=1280, height=850):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument(f'--window-size={width},{height}')
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(width, height)
    return driver

def capture_all():
    # 1. Desktop Add New (Generator)
    print("Capturing desktop generator...")
    driver = get_driver(1280, 900)
    driver.get('http://127.0.0.1:3005/admin/licenses/new')
    time.sleep(3)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_add_new_desktop.png'))
    driver.quit()

    # 2. Mobile Add New (Form Mode)
    print("Capturing mobile form mode...")
    driver = get_driver(390, 844)
    driver.get('http://127.0.0.1:3005/admin/licenses/new')
    time.sleep(3)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_mobile_form_view.png'))
    
    # 3. Mobile Add New (Preview Mode)
    print("Capturing mobile preview mode...")
    try:
        # Click the Card Preview toggle button
        preview_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Card Preview')]")
        if preview_btns:
            preview_btns[0].click()
            time.sleep(2)
        driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_mobile_preview_view.png'))
    except Exception as e:
        print(f"Error toggling preview: {e}")
    driver.quit()

    # 4. Mobile Directory
    print("Capturing mobile directory...")
    driver = get_driver(390, 844)
    driver.get('http://127.0.0.1:3005/admin/licenses')
    time.sleep(3)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_mobile_directory.png'))
    driver.quit()

    # 5. Mobile Dashboard
    print("Capturing mobile dashboard...")
    driver = get_driver(390, 844)
    driver.get('http://127.0.0.1:3005/admin')
    time.sleep(3)
    driver.save_screenshot(os.path.join(ARTIFACT_DIR, 'ss_mobile_dashboard.png'))
    driver.quit()

    print("All screenshots captured successfully!")

if __name__ == '__main__':
    capture_all()
