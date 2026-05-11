#!/usr/bin/env python3
"""
Inject Plausible Analytics + ZOO event tracking into all HTML pages.
"""
import os
import re
import sys
from pathlib import Path

SITE_ROOT = Path("/root/zoo-website")

PLAUSIBLE_SNIPPET = """<!-- Plausible Analytics — Privacy-first, no cookies -->
<script async src="https://plausible.io/js/pa-atEbFT9Jx_NxeU_9opquI.js"></script>
"""

ZOO_TRACKER_SNIPPET = """<!-- ZOO Analytics Event Tracker -->
<script src="/js/analytics-tracker.js" defer></script>
"""

def inject_into_file(filepath):
    """Inject analytics snippets into an HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has our tracker
    if 'zoo-analytics' in content or 'analytics-tracker.js' in content:
        print(f"  SKIP (already has ZOO tracker): {filepath.relative_to(SITE_ROOT)}")
        return False
    
    original = content
    
    # 1. Inject Plausible snippet right after <head>
    if '<head>' in content:
        content = content.replace('<head>', '<head>\n' + PLAUSIBLE_SNIPPET, 1)
    elif '<head ' in content:
        content = re.sub(r'(<head[^>]*>)', r'\1\n' + PLAUSIBLE_SNIPPET, content, count=1)
    
    # 2. Inject ZOO tracker right before </head>
    if '</head>' in content:
        content = content.replace('</head>', ZOO_TRACKER_SNIPPET + '</head>', 1)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  INJECTED: {filepath.relative_to(SITE_ROOT)}")
        return True
    
    print(f"  NO CHANGE: {filepath.relative_to(SITE_ROOT)}")
    return False

def main():
    html_files = sorted(SITE_ROOT.rglob("*.html"))
    injected = 0
    total = 0
    
    print(f"Scanning {len(html_files)} HTML files in {SITE_ROOT}...")
    print()
    
    for html_file in html_files:
        # Skip dashboard (already has analytics)
        if 'dashboard' in str(html_file):
            print(f"  SKIP (dashboard): {html_file.relative_to(SITE_ROOT)}")
            continue
        
        total += 1
        if inject_into_file(html_file):
            injected += 1
    
    print()
    print(f"Results: {injected}/{total} files injected with analytics")

if __name__ == "__main__":
    main()
