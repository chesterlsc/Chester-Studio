"""Write a map bundle as download parts + manila-latest.json.

GitHub Pages refuses files over 100 MB, so the bundle is published as
manila.mmap.000, .001, ... (each <= 90 MB). The apps download the parts in order,
check the whole-file SHA-256, then verify every entry before swapping it in.

usage: python3 -I split_bundle.py <bundle.mmap> <out_dir>
"""
import hashlib, json, os, sys, zipfile

PART = 90 * 1000 * 1000

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.startswith('manila.mmap'):
        os.remove(os.path.join(out, f))
manifest = json.loads(zipfile.ZipFile(src).read('manifest.json'))
whole = hashlib.sha256()
parts = []
with open(src, 'rb') as f:
    i = 0
    while True:
        data = f.read(PART)
        if not data:
            break
        name = f'manila.mmap.{i:03d}'
        with open(os.path.join(out, name), 'wb') as p:
            p.write(data)
        whole.update(data)
        parts.append({'url': name, 'size': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        i += 1
latest = {
    'id': manifest['id'],
    'title': manifest.get('title'),
    'osmTimestamp': manifest.get('osmTimestamp'),
    'size': os.path.getsize(src),
    'sha256': whole.hexdigest(),
    'parts': parts,
}
with open(os.path.join(out, 'manila-latest.json'), 'w') as f:
    json.dump(latest, f, indent=2)
print(f"{len(parts)} part(s), {latest['size']} bytes, id {latest['id']}")
