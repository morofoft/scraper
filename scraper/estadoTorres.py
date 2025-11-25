import os
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import pytz

LOGIN_URL = "http://gestiontrabajos.uce.edu.do:82/redmine/login"
ISSUE_URL = "http://gestiontrabajos.uce.edu.do:82/redmine/issues/11455"

USUARIO = os.getenv("REDMINE_USER")
CLAVE = os.getenv("REDMINE_PASS")

session = requests.Session()

# Headers del navegador (completos)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def write_log(status, message, extra=None):
    log_data = {
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": status,
        "mensaje": message,
        "extra": extra
    }
    with open("log_scraper.json", "w", encoding="utf-8") as f:
        json.dump(log_data, f, ensure_ascii=False, indent=4)
    print("LOG:", log_data)

# 1. Cargar página de login #
resp = session.get(LOGIN_URL, headers=headers)
soup_login = BeautifulSoup(resp.text, "html.parser")

token = soup_login.select_one("input[name=authenticity_token]")
if not token:
    write_log("ERROR", "No se encontró authenticity_token en el login")
    exit()

auth_token = token["value"]

# 2. Login real #
payload = {
    "username": USUARIO,
    "password": CLAVE,
    "authenticity_token": auth_token,
    "utf8": "✓",
    "login": "Acceder »"
}

# Añadir Referer requerido
headers_login = dict(headers)
headers_login["Referer"] = LOGIN_URL

resp_login = session.post(LOGIN_URL, data=payload, headers=headers_login)

if "Cerrar sesión" not in resp_login.text and "Mi cuenta" not in resp_login.text:
    write_log("ERROR", "Login incorrecto, Redmine devolvió otra página")
    with open("debug_login.html", "w", encoding="utf-8") as f:
        f.write(resp_login.text)
    exit()

print("LOGIN OK ✔")

# 3. Acceder al issue con las COOKIES del login #
headers_issue = dict(headers)
headers_issue["Referer"] = LOGIN_URL

resp_issue = session.get(ISSUE_URL, headers=headers_issue)
issue_html = resp_issue.text

# Comprobar si Redmine volvió a forzar login
if "username" in issue_html and "password" in issue_html:
    write_log("ERROR", "Redmine volvió a pedir login (cookies no aceptadas)")
    with open("debug_issue.html", "w", encoding="utf-8") as f:
        f.write(issue_html)
    exit()

print("ISSUE CARGADO ✔")

soup = BeautifulSoup(issue_html, "html.parser")

# 4. Extraer Estado #
def get_attribute_value(soup, classname):
    block = soup.select_one(f".attributes .{classname}.attribute .value")
    return block.get_text(strip=True) if block else None

EstadoTesis = get_attribute_value(soup, "status")

# 5. Extraer historial #
historial = []

journal_entries = soup.select("#history .journal.has-details")

for journal in journal_entries:
    numero = journal.select_one(".journal-link").get_text(strip=True)
    usuario = journal.select_one(".note-header a").get_text(strip=True)
    fecha_tag = journal.select_one(".note-header a[title]")
    fecha = fecha_tag["title"] if fecha_tag else ""
    cambios = [li.get_text(" ", strip=True) for li in journal.select("ul.details li")]

    historial.append({
        "numero": numero,
        "usuario": usuario,
        "fecha": fecha,
        "cambios": cambios
    })

# 6. Guardar JSON final #
data = {
    "actualizado": datetime.now(santo_domingo_tz).strftime("%Y-%m-%d %H:%M:%S"),
    "estado_actual": EstadoTesis,
    "historial": historial
}

with open("datos_issue.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

write_log("SUCCESS", "Scraping completado correctamente", {
    "estado": EstadoTesis,
    "historial_items": len(historial)
})

print("SCRAPING COMPLETADO ✔")

