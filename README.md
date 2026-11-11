# SONMAR — лендинг

Односторінковий сайт ТОВ «СОНМАР» (насосні станції та автоматика) українською мовою.

Статичний сайт без збирання: `index.html`, `styles.css`, `script.js`, фото в `images/`.

## Перегляд локально

Відкрийте `index.html` у браузері або запустіть простий сервер:

```bash
python3 -m http.server 8000
```

## Публікація

Підходить будь-який статичний хостинг: GitHub Pages, Netlify, Cloudflare Pages, Vercel — достатньо завантажити вміст репозиторію.

## Мови

Основна мова — українська (`index.html`, відкривається за замовчуванням на `sonmar.com.ua`).
Інші версії генеруються автоматично:

| Мова | Адреса |
|---|---|
| Польська | `sonmar.com.ua/pl/` |
| Румунська | `sonmar.com.ua/ro/` |
| Російська | `sonmar.com.ua/ru/` |

Після будь-якої зміни тексту в `index.html`:

1. Додайте/оновіть переклад у `i18n/translations.py` (ключ — точний український рядок).
2. Запустіть `python3 i18n/build.py` (потрібен `beautifulsoup4`).
3. Закомітьте `index.html`, `i18n/` та папки `pl/`, `ro/`, `ru/`.

Скрипт зупиниться й покаже рядки без перекладу. Файли в `pl/`, `ro/`, `ru/` вручну не редагуйте.

## Каталог і документація з Directus

Блоки «Власна торгова марка» та «Документація» беруть дані з `data/catalog.json`.
Його створює `catalog/sync.py` з Directus (`directus.sonmar.com.ua`):

- серії й моделі — з `product_family` / `product_groups` / `products` (заводські моделі на сайт не потрапляють);
- документи — з `resources` + `resource_variants`, лише найновіша версія кожного документа
  і лише файли, відкриті в Directus для всіх; тип «Проблеми та рішення» не публікується;
- обкладинка каталогу генерується автоматично з першої сторінки PDF.

Фото, опис і характеристики серій — у `catalog/families.py` (джерело — прайс-каталог 2026.1).
Нова серія з'явиться на сайті після того, як для неї додати запис у цей файл.

Оновлення: GitHub Action `Sync catalog` кожні 6 годин (або вручну: Actions → Sync catalog → Run workflow).
Токен Directus (статичний токен користувача з правом лише на читання колекцій `product_family`, `product_groups`,
`products`, `brands`, `resources`, `resource_variants`, `entity_resources`, `directus_files`) зберігається
в Bitwarden Secrets Manager (EU) під назвою `DIRECTUS_READ_TOKEN`.
У GitHub — лише секрет `BW_ACCESS_TOKEN` (токен machine account Bitwarden з доступом до цього секрету).
