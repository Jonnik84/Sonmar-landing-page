"""Синхронізація каталогу та документів з Directus у data/catalog.json.

Запуск:
    DIRECTUS_TOKEN=... python3 catalog/sync.py
Змінні оточення:
    DIRECTUS_URL    — адреса Directus (за замовчуванням https://directus.sonmar.com.ua)
    DIRECTUS_TOKEN  — статичний токен користувача з правом ЧИТАННЯ колекцій
                      product_family, product_groups, products, brands,
                      resources, resource_variants, entity_resources, directus_files.
Або з готового дампу (для тестів):  python3 catalog/sync.py --dump dump.json

Правила публікації:
  * лише активні серії й моделі; з серій — тільки ті, для яких є оформлення в catalog/families.py;
  * найновіша опублікована версія документа — основна, попередні — у списку «Інші версії»;
  * документ потрапляє на сайт, тільки якщо його файл у Directus відкритий для всіх
    (/assets/<id> віддається без токена) — закриті файли ніколи не з'являться на сайті;
  * типи з EXCLUDE_TYPES не публікуються.
Для каталогів (тип «Каталог») генерується обкладинка images/catalog/<file-id>.webp (потрібен pdftoppm).
"""
import json, os, subprocess, sys, tempfile, urllib.error, urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from families import FAMILIES, ORDER  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'catalog.json'
COVERS = ROOT / 'images' / 'catalog'
BASE = os.environ.get('DIRECTUS_URL', 'https://directus.sonmar.com.ua').rstrip('/')
TOKEN = os.environ.get('DIRECTUS_TOKEN', '')

EXCLUDE_TYPES = {'Проблеми та рішення'}
CATALOG_TYPE = 'Каталог'
# Порядок типів документів на сайті
TYPE_ORDER = ['Каталог', 'Листівка/буклет', 'Технічні дані', 'Інструкція з монтажу', 'Інструкція з настройки',
              'Інструкція «Швидкий старт»', 'CAD/BIM інформація', 'Схема запчастин', 'video']
ACTIVE = {'active', None}

QUERIES = {
    'families': '/items/product_family?limit=-1&fields=id,name,status,brand.name,'
                'product_groups.id,product_groups.status,'
                'product_groups.products.id,product_groups.products.name,product_groups.products.status',
    'variants': '/items/resource_variants?limit=-1&fields=id,name,language,published_date,url,'
                'file.id,file.filesize,file.type,file.filename_download,'
                'resource_id.id,resource_id.name,resource_id.type,resource_id.format',
    'links': '/items/entity_resources?limit=-1&fields=resource,brand.name,product_family,product_group,product',
}


def get(path):
    req = urllib.request.Request(BASE + path, headers={'Authorization': f'Bearer {TOKEN}'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)['data']


def is_public(file_id):
    # Запит без токена: якщо файл віддається анонімно — він публічний.
    req = urllib.request.Request(f'{BASE}/assets/{file_id}', headers={'Range': 'bytes=0-1023'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status in (200, 206)
    except urllib.error.HTTPError as e:
        return e.code == 416      # діапазон не підійшов, але доступ є
    except Exception:
        return False


def make_cover(file_id):
    path = COVERS / f'{file_id}.webp'
    if path.exists():
        return path
    try:
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            pdf = Path(tmp) / 'c.pdf'
            urllib.request.urlretrieve(f'{BASE}/assets/{file_id}', pdf)
            subprocess.run(['pdftoppm', '-f', '1', '-l', '1', '-r', '110', '-jpeg', str(pdf), str(Path(tmp) / 'p')], check=True)
            im = Image.open(next(Path(tmp).glob('p*.jpg')))
            w, h = im.size
            if w > h * 1.2:          # розворот: беремо праву половину (лицьова обкладинка)
                im = im.crop((w // 2, 0, w, h))
            im.thumbnail((640, 640))
            COVERS.mkdir(parents=True, exist_ok=True)
            im.save(path, 'WEBP', quality=84, method=6)
            return path
    except Exception as e:  # обкладинка — не критично
        print('  ! cover failed:', e)
        return None


def build(raw, check_public=is_public):
    now = datetime.now(timezone.utc).isoformat()

    # --- серії та моделі
    fam_by_id, group_to_fam, product_to_fam, brand_fams = {}, {}, {}, {}
    for f in raw['families']:
        if f.get('status') not in ACTIVE:
            continue
        code = f['name']
        fam_by_id[f['id']] = code
        brand = (f.get('brand') or {}).get('name')
        brand_fams.setdefault(brand, []).append(code)
        models = []
        for g in f.get('product_groups') or []:
            group_to_fam[g['id']] = code
            for p in g.get('products') or []:
                if p.get('id'):
                    product_to_fam[p['id']] = code
                if p.get('status') in ACTIVE:
                    models.append(p['name'].strip())
        f['_models'] = sorted(set(models), key=lambda s: [int(x) if x.isdigit() else x for x in s.replace('-', ' ').split()])
        f['_brand'] = brand

    # --- до яких серій прив'язаний кожен ресурс
    res_fams = {}
    for l in raw['links']:
        rid = l['resource'] if isinstance(l['resource'], str) else l['resource']['id']
        codes = set()
        if l.get('product_family') in fam_by_id:
            codes.add(fam_by_id[l['product_family']])
        if l.get('product_group') in group_to_fam:
            codes.add(group_to_fam[l['product_group']])
        if l.get('product') in product_to_fam:
            codes.add(product_to_fam[l['product']])
        b = l.get('brand')
        if b:
            codes.update(brand_fams.get(b['name'] if isinstance(b, dict) else b, []))
        res_fams.setdefault(rid, set()).update(codes)

    # --- усі опубліковані версії кожного ресурсу (найновіша — перша)
    by_res = {}
    for v in raw['variants']:
        r = v.get('resource_id') or {}
        if r.get('type') in EXCLUDE_TYPES:
            continue
        pd = v.get('published_date')
        if pd and pd > now:
            continue
        if not ((v.get('file') or {}).get('id') or v.get('url')):
            continue
        by_res.setdefault(r['id'], []).append(v)

    def target(v):
        """Посилання на файл/URL версії або None, якщо файл не публічний."""
        r, f = v['resource_id'], v.get('file') or {}
        if f.get('id'):
            if not check_public(f['id']):
                print('  - skip (not public):', r['name'], r['type'], v.get('name') or '')
                return None
            url = f"{BASE}/assets/{f['id']}"
            return {'url': url, 'download': url + '?download', 'size': int(f.get('filesize') or 0),
                    'format': (f.get('type') or '').split('/')[-1].upper() or 'FILE'}
        return {'url': v['url'], 'download': None, 'size': 0,
                'format': 'VIDEO' if r.get('format') == 'video_link' else 'WEB'}

    def meta(v):
        return {'version': (v.get('name') or '').strip() or None,
                'date': (v.get('published_date') or '')[:10] or None,
                'lang': v.get('language') or []}

    docs, catalog = [], None
    for rid, variants in by_res.items():
        variants.sort(key=lambda v: v.get('published_date') or '', reverse=True)
        published, seen_files = [], set()
        for v in variants:
            fid = (v.get('file') or {}).get('id')
            if fid and fid in seen_files:
                continue
            t = target(v)
            if t:
                published.append((v, t))
                if fid:
                    seen_files.add(fid)
        if not published:
            continue
        v, item = published[0]
        r, f = v['resource_id'], v.get('file') or {}
        item.update({'id': v['id'], 'title': r['name'].strip(), 'type': r['type'], **meta(v),
                     'families': sorted(c for c in res_fams.get(rid, ()) if c in FAMILIES)})
        # попередні версії — для випадаючого списку на сайті
        item['versions'] = [{**meta(ov), **{k: ot[k] for k in ('url', 'download', 'size')}}
                            for ov, ot in published[1:]]
        if r['type'] == CATALOG_TYPE and f.get('id'):
            cover = make_cover(f['id'])
            if cover:
                item['cover'] = str(cover.relative_to(ROOT))
            if catalog is None or (item['date'] or '') > (catalog['date'] or ''):
                catalog = item
        docs.append(item)

    docs.sort(key=lambda d: (TYPE_ORDER.index(d['type']) if d['type'] in TYPE_ORDER else len(TYPE_ORDER),
                             d['type'], d['title'].lower(), d['date'] or ''))

    families = []
    for code in ORDER + sorted(set(FAMILIES) - set(ORDER)):
        f = next((x for x in raw['families'] if x['name'] == code and '_models' in x), None)
        if not f:
            continue
        meta = FAMILIES[code]
        families.append({
            'code': code, 'brand': f['_brand'], 'image': meta['image'], 'models': f['_models'],
            'title': meta['title'], 'specs': meta['specs'], 'feature': meta['feature'],
            'docs': sum(1 for d in docs if code in d['families']),
        })

    return {'generated': now, 'catalog': catalog, 'families': families, 'documents': docs}


def main():
    if '--dump' in sys.argv:
        raw = json.loads(Path(sys.argv[sys.argv.index('--dump') + 1]).read_text(encoding='utf-8'))
    else:
        if not TOKEN:
            sys.exit('DIRECTUS_TOKEN не задано')
        raw = {k: get(q) for k, q in QUERIES.items()}
    data = build(raw)
    OUT.parent.mkdir(exist_ok=True)
    new = json.dumps(data, ensure_ascii=False, indent=1)
    old = OUT.read_text(encoding='utf-8') if OUT.exists() else ''
    strip = lambda s: '\n'.join(l for l in s.splitlines() if '"generated"' not in l)
    if strip(old) == strip(new):
        print('Без змін.')
        return
    OUT.write_text(new + '\n', encoding='utf-8')
    print(f"OK: {len(data['families'])} серій, {len(data['documents'])} документів →", OUT.relative_to(ROOT))


if __name__ == '__main__':
    main()
