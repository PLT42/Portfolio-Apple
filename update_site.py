import os
import re

# CONFIGURATION
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
PARTIALS_DIR = os.path.join(PROJECT_ROOT, 'partials')
FOOTER_PATH = os.path.join(PARTIALS_DIR, 'footer.html')
NAVBAR_PATH = os.path.join(PARTIALS_DIR, 'navbar.html')
DOCK_PATH = os.path.join(PARTIALS_DIR, 'mobile_dock.html')

# FILES TO IGNORE
EXCLUDE_DIRS = ['.git', '.gemini', 'partials', 'node_modules', 'club_manga', 'portfolio_v1']
EXCLUDE_FILES = ['admin.html', 'test.html', 'espace.html', 'index.html'] # User exclusions

def get_footer_content():
    """Reads the master footer content."""
    if not os.path.exists(FOOTER_PATH):
        print(f"❌ Error: Partial file not found at {FOOTER_PATH}")
        return None
    with open(FOOTER_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def get_navbar_content():
    """Reads the master navbar content."""
    if not os.path.exists(NAVBAR_PATH):
        print(f"❌ Error: Partial file not found at {NAVBAR_PATH}")
        return None
    with open(NAVBAR_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def get_dock_content():
    """Reads the master mobile dock content."""
    if not os.path.exists(DOCK_PATH):
        print(f"❌ Error: Partial file not found at {DOCK_PATH}")
        return None
    with open(DOCK_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def update_files():
    """Updates all HTML files with the master footer, navbar, and dock."""
    footer_content = get_footer_content()
    navbar_content = get_navbar_content()
    dock_content = get_dock_content()
    
    if not footer_content and not navbar_content and not dock_content:
        print("❌ No partials to update. Exiting.")
        return

    # Regex to find existing footer: <footer class="site-footer"> ... </footer>
    footer_regex = re.compile(r'<footer[^>]*class=["\']site-footer["\'][^>]*>.*?</footer>', re.DOTALL | re.IGNORECASE)
    
    # Regex to find existing navbar: <nav class="navbar"> ... </nav>
    navbar_regex = re.compile(r'<nav[^>]*class=["\']navbar["\'][^>]*>.*?</nav>', re.DOTALL | re.IGNORECASE)

    # Regex to find existing mobile dock: <!-- MOBILE DOCK ... --> ... <!-- NAVIGATION POPUP ... -->
    # This is a bit tricky, we search for the ID "mobile-dock"
    dock_regex = re.compile(r'<!-- MOBILE DOCK \(The "Bubble"\) -->.*?<!-- FLOATING MENU POPUP.*?</div>.*?\(?function \(\) \{.*?\}\)\(\);.*?</script>', re.DOTALL | re.IGNORECASE)

    # Regex to find ANY FontAwesome link (simple or complex with integrity)
    fa_regex = re.compile(r'<link[^>]*href=["\'].*?font-awesome.*?["\'][^>]*>', re.IGNORECASE)
    
    # The standard, working FontAwesome link
    STANDARD_FA_LINK = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">'

    count = 0
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Filter exclusions
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file.endswith('.html') and file not in EXCLUDE_FILES:
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content

                # 1. Fix FontAwesome
                if fa_regex.search(content):
                    content = fa_regex.sub(STANDARD_FA_LINK, content)
                elif '<head>' in content:
                    content = content.replace('<head>', f'<head>\n    {STANDARD_FA_LINK}')
                
                # 2. Navbar Replacement
                if navbar_content:
                    if navbar_regex.search(content):
                        content = navbar_regex.sub(navbar_content, content)

                # 3. Footer Replacement
                if footer_content:
                    if footer_regex.search(content):
                        content = footer_regex.sub(footer_content, content)
                
                # 4. Mobile Dock Replacement
                if dock_content:
                    if dock_regex.search(content):
                        content = dock_regex.sub(dock_content, content)
                    elif 'id="mobile-dock"' in content:
                        # Fallback for simpler dock structures
                        fallback_dock_regex = re.compile(r'<div id=["\']mobile-dock["\'].*?</div>', re.DOTALL)
                        content = fallback_dock_regex.sub(dock_content, content)
                

                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ Updated: {os.path.relpath(file_path, PROJECT_ROOT)}")
                    count += 1
                else:
                    print(f"➖ Skipped (No change): {os.path.relpath(file_path, PROJECT_ROOT)}")

    print(f"\n🎉 Finished! Updated {count} files.")

if __name__ == "__main__":
    print("🚀 Starting Portfolio Update Script...")
    update_files()
