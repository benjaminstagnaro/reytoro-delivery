# Arma una escena de puesto de feria (toldo + cajones con fruta) con las fotos de productos y la desenfoca.
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageEnhance
import glob, random, os
random.seed(7)
src = os.environ.get('FOTOS', 'fotos-productos')  # carpeta con las fotos originales
fotos = [ImageOps.exif_transpose(Image.open(f)).convert('RGB') for f in sorted(glob.glob(src + '/*'))]
W, H = 2400, 1350
c = Image.new('RGB', (W, H), (92, 64, 40))
d = ImageDraw.Draw(c)
# pared / fondo del galpón: degradé cálido
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(70 + 40 * t), int(52 + 25 * t), int(36 + 10 * t)))
# luces colgantes (se vuelven bokeh)
for i in range(14):
    x = random.randint(0, W); y = random.randint(40, 260); r = random.randint(14, 30)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 226, 160))
# toldo a rayas verde y crema con borde ondulado
top = 0; alto = 300; ancho = 120
for i, x in enumerate(range(-ancho, W + ancho, ancho)):
    col = (34, 96, 58) if i % 2 == 0 else (246, 236, 210)
    d.rectangle([x, top, x + ancho, alto], fill=col)
    d.pieslice([x, alto - ancho // 2, x + ancho, alto + ancho // 2], 0, 180, fill=col)
# cajones en 3 niveles: los de abajo más grandes (perspectiva)
def cajon(foto, x, y, w, h):
    f = foto
    fw, fh = f.size
    k = random.uniform(0.38, 0.5)  # acercar al centro para que se vea la fruta y no la mesa
    cw, ch = int(fw * k), int(fw * k * h / w)
    f = f.crop(((fw - cw) // 2, (fh - ch) // 2, (fw + cw) // 2, (fh + ch) // 2)).resize((w, h))
    borde = max(10, w // 14)
    d.rectangle([x - borde, y - borde // 2, x + w + borde, y + h + borde * 2], fill=(150, 104, 62))
    c.paste(f, (x, y))
    for j in range(2):  # tablas del frente del cajón
        yy = y + h - borde + j * borde
        d.rectangle([x - borde, yy, x + w + borde, yy + borde - 3], fill=(176, 126, 78) if j == 0 else (132, 90, 52))
niveles = [(330, 7, 220, 140), (540, 6, 300, 190), (800, 5, 400, 250), (1110, 4, 560, 330)]
orden = fotos[:]
for (y, n, w, h) in niveles:
    paso = W / n
    random.shuffle(orden)
    for i in range(n + 1):
        x = int(i * paso - paso * 0.35 + random.randint(-40, 40))
        cajon(orden[i % len(orden)], x, y + random.randint(-25, 25), w + random.randint(-30, 30), h)
for i in range(40):  # brillos de luz sobre la fruta
    x = random.randint(0, W); y = random.randint(320, H); r = random.randint(10, 26)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 240, 205))
c = c.filter(ImageFilter.GaussianBlur(34))
c = ImageEnhance.Color(c).enhance(1.12)
c = ImageEnhance.Brightness(c).enhance(0.92)
c = c.resize((1600, 900), Image.LANCZOS)
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'fondo', 'feria-desenfocada.webp')
c.save(out, 'WEBP', quality=72, method=6)
print(os.path.getsize(out) // 1024, 'KB')
