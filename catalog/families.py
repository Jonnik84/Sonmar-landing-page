# Оформлення серій для сайту: фото, опис і ключові характеристики.
# Моделі та документи підтягуються з Directus автоматично (catalog/sync.py),
# а тут — те, чого в Directus немає. Джерело даних — прайс-каталог SONMAR by PRODN 2026.1.
# Серія з Directus без запису тут на сайті не показується (щоб не з'явилась «порожня» картка).

FAMILIES = {
    'PNC': {
        'image': 'images/products/pnc.webp',
        'title': {
            'uk': 'Багатоступінчастий відцентровий насос',
            'pl': 'Wielostopniowa pompa odśrodkowa',
            'ro': 'Pompă centrifugă multietajată',
            'ru': 'Многоступенчатый центробежный насос',
        },
        'specs': {
            'uk': ['1,5–4 кВт', 'до 31 м³/год', 'до 82 м'],
            'pl': ['1,5–4 kW', 'do 31 m³/h', 'do 82 m'],
            'ro': ['1,5–4 kW', 'până la 31 m³/h', 'până la 82 m'],
            'ru': ['1,5–4 кВт', 'до 31 м³/ч', 'до 82 м'],
        },
        'feature': {
            'uk': 'Паралельна робота до 6 насосів · Wi-Fi',
            'pl': 'Praca równoległa do 6 pomp · Wi-Fi',
            'ro': 'Funcționare în paralel până la 6 pompe · Wi-Fi',
            'ru': 'Параллельная работа до 6 насосов · Wi-Fi',
        },
    },
    'BB': {
        'image': 'images/products/bb.webp',
        'title': {
            'uk': 'Багатоступінчастий відцентровий насос',
            'pl': 'Wielostopniowa pompa odśrodkowa',
            'ro': 'Pompă centrifugă multietajată',
            'ru': 'Многоступенчатый центробежный насос',
        },
        'specs': {
            'uk': ['1,5–2,2 кВт', 'до 7,5 м³/год', 'до 122 м'],
            'pl': ['1,5–2,2 kW', 'do 7,5 m³/h', 'do 122 m'],
            'ro': ['1,5–2,2 kW', 'până la 7,5 m³/h', 'până la 122 m'],
            'ru': ['1,5–2,2 кВт', 'до 7,5 м³/ч', 'до 122 м'],
        },
        'feature': {
            'uk': 'Крильчатка з нержавіючої сталі · паралельна робота',
            'pl': 'Wirnik ze stali nierdzewnej · praca równoległa',
            'ro': 'Rotor din oțel inoxidabil · funcționare în paralel',
            'ru': 'Крыльчатка из нержавеющей стали · параллельная работа',
        },
    },
    'PRZ': {
        'image': 'images/products/prz.webp',
        'title': {
            'uk': 'Багатоступінчастий самовсмоктувальний відцентровий насос',
            'pl': 'Wielostopniowa samozasysająca pompa odśrodkowa',
            'ro': 'Pompă centrifugă multietajată autoamorsantă',
            'ru': 'Многоступенчатый самовсасывающий центробежный насос',
        },
        'specs': {
            'uk': ['0,55–0,75 кВт', 'до 7 м³/год', 'до 48 м'],
            'pl': ['0,55–0,75 kW', 'do 7 m³/h', 'do 48 m'],
            'ro': ['0,55–0,75 kW', 'până la 7 m³/h', 'până la 48 m'],
            'ru': ['0,55–0,75 кВт', 'до 7 м³/ч', 'до 48 м'],
        },
        'feature': {
            'uk': 'Паралельна робота до 2 насосів · Wi-Fi',
            'pl': 'Praca równoległa do 2 pomp · Wi-Fi',
            'ro': 'Funcționare în paralel până la 2 pompe · Wi-Fi',
            'ru': 'Параллельная работа до 2 насосов · Wi-Fi',
        },
    },
    'BBZ': {
        'image': 'images/products/bbz.webp',
        'title': {
            'uk': 'Самовсмоктувальний багатоступінчастий відцентровий насос',
            'pl': 'Samozasysająca wielostopniowa pompa odśrodkowa',
            'ro': 'Pompă centrifugă multietajată autoamorsantă',
            'ru': 'Самовсасывающий многоступенчатый центробежный насос',
        },
        'specs': {
            'uk': ['0,55–0,75 кВт', 'до 7 м³/год', 'до 48 м'],
            'pl': ['0,55–0,75 kW', 'do 7 m³/h', 'do 48 m'],
            'ro': ['0,55–0,75 kW', 'până la 7 m³/h', 'până la 48 m'],
            'ru': ['0,55–0,75 кВт', 'до 7 м³/ч', 'до 48 м'],
        },
        'feature': {
            'uk': 'Самовсмоктування · постійний тиск',
            'pl': 'Samozasysanie · stałe ciśnienie',
            'ro': 'Autoamorsare · presiune constantă',
            'ru': 'Самовсасывание · постоянное давление',
        },
    },
    'BA': {
        'image': 'images/products/ba.webp',
        'title': {
            'uk': 'Самовсмоктувальний вихровий насос',
            'pl': 'Samozasysająca pompa wirowa',
            'ro': 'Pompă periferică autoamorsantă',
            'ru': 'Самовсасывающий вихревой насос',
        },
        'specs': {
            'uk': ['0,3 кВт', 'до 2 м³/год', 'до 34 м'],
            'pl': ['0,3 kW', 'do 2 m³/h', 'do 34 m'],
            'ro': ['0,3 kW', 'până la 2 m³/h', 'până la 34 m'],
            'ru': ['0,3 кВт', 'до 2 м³/ч', 'до 34 м'],
        },
        'feature': {
            'uk': 'Латунна крильчатка · інтегрований датчик',
            'pl': 'Mosiężny wirnik · zintegrowany czujnik',
            'ro': 'Rotor din alamă · senzor integrat',
            'ru': 'Латунная крыльчатка · встроенный датчик',
        },
    },
    'VFS': {
        'image': 'images/products/vfs.webp',
        'title': {
            'uk': 'Інтелектуальний інверторний контролер насоса',
            'pl': 'Inteligentny falownikowy sterownik pompy',
            'ro': 'Controler inteligent cu invertor pentru pompă',
            'ru': 'Интеллектуальный инверторный контроллер насоса',
        },
        'specs': {
            'uk': ['1,5–4 кВт', 'вхід 220 В, 1 фаза'],
            'pl': ['1,5–4 kW', 'wejście 220 V, 1 faza'],
            'ro': ['1,5–4 kW', 'intrare 220 V, monofazat'],
            'ru': ['1,5–4 кВт', 'вход 220 В, 1 фаза'],
        },
        'feature': {
            'uk': 'Постійний тиск · паралельна робота · Wi-Fi',
            'pl': 'Stałe ciśnienie · praca równoległa · Wi-Fi',
            'ro': 'Presiune constantă · funcționare în paralel · Wi-Fi',
            'ru': 'Постоянное давление · параллельная работа · Wi-Fi',
        },
    },
}

# Порядок карток на сайті
ORDER = ['PNC', 'BB', 'PRZ', 'BBZ', 'BA', 'VFS']
