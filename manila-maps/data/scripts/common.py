"""Shared helpers for the search/route builders (keep in sync with src/engine/*.js)."""
import re
import unicodedata

NCR_CITIES = [
    'Manila', 'Quezon City', 'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Marikina',
    'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Pateros', 'San Juan', 'Taguig', 'Valenzuela',
]

_non_alnum = re.compile(r'[^a-z0-9]+')
_apos = re.compile(r"['’`´]")


def fold(s):
    """Accent/case folding identical to search.js fold()."""
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = _apos.sub('', s)
    return s


def tokens(s):
    """Tokens of a name: folded words, plus hyphen/dot-joined compounds ("bel-air" -> bel, air, belair)."""
    f = fold(s)
    out = []
    for w in f.split():
        parts = [p for p in _non_alnum.split(w) if p]
        out.extend(parts)
        if len(parts) > 1:
            out.append(''.join(parts))
    return out


# canonical forms for abbreviations (both directions map to the short form)
CANON = {
    'avenue': 'ave', 'av': 'ave', 'avn': 'ave',
    'street': 'st', 'str': 'st',
    'boulevard': 'blvd', 'blv': 'blvd',
    'road': 'rd',
    'barangay': 'brgy', 'bgy': 'brgy', 'brg': 'brgy',
    'santo': 'sto', 'santa': 'sta', 'saint': 'st',
    'general': 'gen', 'mount': 'mt', 'highway': 'hwy', 'extension': 'ext',
    'doctor': 'dr', 'drive': 'dr', 'senator': 'sen', 'president': 'pres', 'university': 'univ',
    'hospital': 'hosp', 'national': 'natl', 'international': 'intl', 'subdivision': 'subd',
    'centre': 'center', 'ctr': 'center', 'village': 'vill', 'compound': 'cmpd', 'cpd': 'cmpd',
    'building': 'bldg', 'corporation': 'corp', 'elementary': 'elem', 'memorial': 'meml',
    'apartment': 'apt', 'apartments': 'apt', 'station': 'stn', 'terminal': 'term', 'junior': 'jr',
    'senior': 'sr', 'heights': 'hts', 'number': 'no', 'maria': 'ma', 'expressway': 'expwy', 'expy': 'expwy', 'exp': 'expwy',
}


def canon(t):
    return CANON.get(t, t)


# Common aliases / nicknames: (regex on the display name, extra searchable text)
ALIASES = [
    (r'\bNinoy Aquino International Airport\b', 'NAIA'),
    (r'\bNAIA\b', 'Ninoy Aquino International Airport'),
    (r'^SM Mall of Asia$', 'MOA;Mall of Asia'),
    (r'\bMall of Asia\b', 'MOA'),
    (r'^Bonifacio Global City$', 'BGC;Fort Bonifacio;The Fort'),
    (r'(?<=.)\bBonifacio Global City\b|\bBonifacio Global City\b(?=.)', 'BGC'),
    (r'\bBGC\b', 'Bonifacio Global City'),
    (r'\bUniversity of the Philippines\b', 'UP'),
    (r'^University of the Philippines Diliman$', 'UP Diliman;UPD'),
    (r'\bEDSA\b', 'Epifanio de los Santos Avenue'),
    (r'\bEpifanio de los Santos\b', 'EDSA'),
    (r'\bLight Rail Transit\b', 'LRT'),
    (r'\bMetro Rail Transit\b', 'MRT'),
    (r'^Quezon City$', 'QC'),
    (r'^Quezon Memorial Circle$', 'QC Circle;QCMC;Memorial Circle'),
    (r'^Rizal Park$', 'Luneta;Luneta Park'),
    (r'^Luneta( Park)?$', 'Rizal Park'),
    (r'^Quiapo Church$', 'Minor Basilica of the Black Nazarene;Quiapo Basilica'),
    (r'^Minor Basilica of the Black Nazarene$', 'Quiapo Church'),
    (r'^University of Santo Tomas$', 'UST'),
    (r'^De La Salle University$', 'DLSU;La Salle'),
    (r'^Ateneo de Manila University$', 'ADMU;Ateneo'),
    (r'^Polytechnic University of the Philippines', 'PUP'),
    (r'^Philippine General Hospital$', 'PGH'),
    (r'^Far Eastern University$', 'FEU'),
    (r'^University of the East', 'UE'),
    (r'^Cultural Center of the Philippines', 'CCP'),
    (r"^St\.? Luke's Medical Center", 'SLMC;Saint Lukes'),
    (r'^SM Megamall$', 'Megamall'),
        (r'^Intramuros$', 'Walled City'),
    (r'^Philippine International Convention Center', 'PICC'),
    (r'^Smart Araneta Coliseum$', 'Araneta Coliseum;Big Dome'),
    (r'^Araneta City$', 'Araneta Center;Cubao'),
    (r'^Trinoma$', 'TriNoMa'),
    (r'^Robinsons Place Manila$', 'Robinsons Ermita'),
    (r'^Makati Central Business District$', 'Makati CBD'),
    (r'^Ortigas Center$', 'Ortigas CBD'),
]
ALIASES = [(re.compile(p, re.I), a) for p, a in ALIASES]


def aliases_for(name):
    """Curated alternative spellings of a name: the matched phrase replaced by each nickname
    (e.g. "NAIA Terminal 3" -> "Ninoy Aquino International Airport Terminal 3")."""
    out = []
    for rx, a in ALIASES:
        if rx.search(name):
            for x in a.split(';'):
                v = re.sub(r'\s+', ' ', rx.sub(x, name)).strip()
                if v and v != name and v not in out:
                    out.append(v)
    return out


def poi_for(t):
    """OSM tags -> (class, subclass, rank, kind). Mirrors ManilaProfile.poiFor. kind is 'poi' or 'station'."""
    g = t.get
    am, sh, tou, le, rw, pt, ae, hw, off, hist = (g('amenity'), g('shop'), g('tourism'), g('leisure'),
                                                 g('railway'), g('public_transport'), g('aeroway'),
                                                 g('highway'), g('office'), g('historic'))
    if ae == 'aerodrome':
        return ('airport', ae, 1, 'poi')
    if ae == 'terminal':
        return ('airport', ae, 2, 'poi')
    if rw in ('station', 'halt'):
        return ('train', g('station') or rw, 3, 'station')
    if pt == 'station' and any(g(k) == 'yes' for k in ('train', 'subway', 'light_rail', 'monorail')):
        return ('train', 'station', 3, 'station')
    if am == 'ferry_terminal':
        return ('ferry', am, 6, 'station')
    if am == 'bus_station':
        return ('bus', am, 7, 'station')
    if hw == 'bus_stop' or (pt == 'platform' and g('bus') == 'yes'):
        return ('bus', 'bus_stop', 18, 'poi')
    if sh:
        if sh in ('mall', 'department_store'):
            return ('mall', sh, 2, 'poi')
        if sh in ('supermarket', 'wholesale'):
            return ('supermarket', sh, 9, 'poi')
        if sh == 'convenience':
            return ('convenience', sh, 16, 'poi')
        if sh == 'chemist':
            return ('pharmacy', sh, 14, 'poi')
        if sh in ('vacant', 'no', 'yes'):
            return None
        return ('shop', sh, 17, 'poi')
    if am:
        m = {
            'marketplace': ('market', 8), 'restaurant': ('food', 15), 'fast_food': ('food', 15),
            'food_court': ('food', 15), 'ice_cream': ('food', 15), 'canteen': ('food', 15), 'cafe': ('cafe', 15),
            'bar': ('bar', 16), 'pub': ('bar', 16), 'nightclub': ('bar', 16), 'biergarten': ('bar', 16),
            'bank': ('bank', 14), 'bureau_de_change': ('bank', 14), 'money_transfer': ('bank', 14),
            'atm': ('atm', 19), 'hospital': ('hospital', 3), 'clinic': ('clinic', 13), 'doctors': ('clinic', 13),
            'dentist': ('clinic', 13), 'health_post': ('clinic', 13), 'pharmacy': ('pharmacy', 14),
            'school': ('school', 10), 'kindergarten': ('school', 10), 'university': ('university', 5),
            'college': ('university', 5), 'fuel': ('fuel', 12), 'charging_station': ('charging', 16),
            'parking': ('parking', 18), 'townhall': ('government', 6), 'courthouse': ('government', 6),
            'embassy': ('government', 6), 'police': ('police', 11), 'fire_station': ('fire', 12),
            'post_office': ('post', 12), 'cinema': ('cinema', 12), 'theatre': ('cinema', 12),
            'library': ('library', 12), 'toilets': ('toilet', 19),
        }
        if am == 'place_of_worship':
            rel = g('religion') or ''
            cls = {'christian': 'church', 'muslim': 'mosque'}.get(rel, 'temple')
            return (cls, rel or am, 11, 'poi')
        if am in m:
            c, r = m[am]
            return (c, am, r, 'poi')
        if am in ('community_centre', 'social_facility', 'arts_centre', 'events_venue', 'conference_centre',
                  'veterinary', 'car_wash', 'car_rental', 'childcare', 'internet_cafe', 'public_bath'):
            return ('other', am, 17, 'poi')
        return None
    if tou:
        if tou in ('hotel', 'hostel', 'guest_house', 'motel', 'apartment'):
            return ('hotel', tou, 12, 'poi')
        if tou in ('museum', 'gallery'):
            return ('museum', tou, 8, 'poi')
        if tou in ('attraction', 'viewpoint', 'theme_park', 'zoo', 'aquarium', 'artwork'):
            return ('attraction', tou, 16 if tou == 'artwork' else 7, 'poi')
        return None
    if le:
        if le in ('park', 'garden', 'nature_reserve'):
            return ('park', le, 8, 'poi')
        if le == 'fitness_centre':
            return ('gym', le, 16, 'poi')
        if le in ('sports_centre', 'stadium', 'golf_course', 'swimming_pool', 'pitch', 'sports_hall'):
            return ('sports', le, 7 if le == 'stadium' else 15, 'poi')
        return None
    if off == 'government':
        return ('government', off, 9, 'poi')
    if hist in ('monument', 'memorial', 'church', 'fort', 'castle', 'ruins', 'building'):
        return ('attraction', hist, 9, 'poi')
    return None


def display_name(t):
    for k in ('name', 'name:en', 'official_name', 'alt_name', 'short_name'):
        v = t.get(k)
        if v and v.strip():
            return v.split(';')[0].strip()
    return None


def alt_names(t, name):
    out = []
    for k in ('name:en', 'alt_name', 'short_name', 'official_name', 'old_name', 'loc_name', 'name:tl', 'name:fil'):
        v = t.get(k)
        if v:
            for p in v.split(';'):
                p = p.strip()
                if p and p != name and p not in out:
                    out.append(p)
    return out
