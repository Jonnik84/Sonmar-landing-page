"""Друкує всі українські рядки з index.html, які треба перекласти (JSON-масив)."""
import json, re, sys
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment

ROOT = Path(__file__).resolve().parent.parent
CYR = re.compile(r'[А-Яа-яЄєІіЇїҐґ]')
ATTRS = ('alt', 'aria-label', 'content', 'title', 'data-copied')
SKIP_PARENTS = {'script', 'style'}

def strings(soup):
    seen = []
    def add(t):
        t = t.strip()
        if t and CYR.search(t) and t not in seen:
            seen.append(t)
    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or node.parent.name in SKIP_PARENTS:
            continue
        if node.find_parent(class_='lang__menu'):
            continue
        add(str(node))
    for el in soup.find_all(True):
        for a in ATTRS:
            if el.has_attr(a):
                add(el[a])
    return seen

if __name__ == '__main__':
    soup = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
    print(json.dumps(strings(soup), ensure_ascii=False, indent=1))
