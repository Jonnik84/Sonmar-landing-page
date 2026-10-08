"""Генерує мовні версії сайту з українського index.html.

Запуск з кореня репозиторію:  python3 i18n/build.py
Створює pl/index.html, ro/index.html, ru/index.html.
Якщо в index.html з'явився новий текст без перекладу, скрипт зупиниться
й покаже, які рядки треба додати в i18n/translations.py.
"""
import re, sys
from pathlib import Path
from urllib.parse import quote, unquote
from bs4 import BeautifulSoup, Comment

sys.path.insert(0, str(Path(__file__).resolve().parent))
from translations import T  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://sonmar.com.ua'
LANGS = {'pl': ('PL', 'pl_PL'), 'ro': ('RO', 'ro_RO'), 'ru': ('RU', 'ru_RU')}
CYR = re.compile(r'[А-Яа-яЄєІіЇїҐґ]')
ATTRS = ('alt', 'aria-label', 'content', 'title', 'data-copied')
URL_ATTRS = ('href', 'src', 'data-full')
EXTERNAL = re.compile(r'^(#|/|[a-z]+:)', re.I)


def tr(text, lang, missing):
    key = text.strip()
    if not key or not CYR.search(key):
        return text
    if key not in T or lang not in T[key]:
        missing.add(key)
        return text
    lead = text[:len(text) - len(text.lstrip())]
    trail = text[len(text.rstrip()):]
    return lead + T[key][lang] + trail


def build(lang, source):
    code, locale = LANGS[lang]
    soup = BeautifulSoup(source, 'html.parser')
    missing = set()

    soup.html['lang'] = lang
    soup.find('meta', property='og:locale')['content'] = locale
    soup.find('link', rel='canonical')['href'] = f'{SITE}/{lang}/'
    soup.find('meta', property='og:url')['content'] = f'{SITE}/{lang}/'

    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or node.parent.name in ('script', 'style'):
            continue
        if node.find_parent(class_='lang__menu'):
            continue
        new = tr(str(node), lang, missing)
        if new != str(node):
            node.replace_with(new)

    for el in soup.find_all(True):
        for a in ATTRS:
            if el.has_attr(a):
                el[a] = tr(el[a], lang, missing)
        for a in URL_ATTRS:
            if el.has_attr(a) and not EXTERNAL.match(el[a]):
                el[a] = '../' + el[a]
        href = el.get('href', '')
        if href.startswith('mailto:') and 'subject=' in href:
            base, subj = href.split('subject=', 1)
            el['href'] = base + 'subject=' + quote(tr(unquote(subj), lang, missing))

    soup.find(class_='lang__cur').string = code
    for a in soup.select('.lang__menu a'):
        if a.get('data-lang') == lang:
            a['aria-current'] = 'true'
        elif a.has_attr('aria-current'):
            del a['aria-current']

    if missing:
        sys.exit(f'[{lang}] немає перекладу для:\n  ' + '\n  '.join(sorted(missing)))

    out = str(soup)
    out = out.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- Згенеровано з index.html скриптом i18n/build.py — не редагуйте вручну -->', 1)
    path = ROOT / lang / 'index.html'
    path.parent.mkdir(exist_ok=True)
    path.write_text(out, encoding='utf-8')
    print('OK', path.relative_to(ROOT))


if __name__ == '__main__':
    src = (ROOT / 'index.html').read_text(encoding='utf-8')
    for lang in LANGS:
        build(lang, src)
