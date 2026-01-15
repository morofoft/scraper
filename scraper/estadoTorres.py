import json
import os
from datetime import datetime

import pytz
import requests
from bs4 import BeautifulSoup


REDMINE_SCHEME = "http"
BASE_REDIRECTION = os.getenv(
    "REDMINE_BASE_URL", "gestiontrabajos.uce.edu.do:82/redmine"
)
ISSUE_PATH = os.getenv("REDMINE_ISSUE_PATH", "/issues/11455")
LOGIN_URL = f"{REDMINE_SCHEME}://{BASE_REDIRECTION}/login"
ISSUE_URL = f"{REDMINE_SCHEME}://{BASE_REDIRECTION}{ISSUE_PATH}"

USUARIO = os.getenv("REDMINE_USER")
CLAVE = os.getenv("REDMINE_PASS")


# Headers del navegador (completos)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def append_log(status, message, extra=None):
    log_entry = {
        "fecha": datetime.now(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S %Z"),
        "status": status,
        "mensaje": message,
        "extra": extra,
    }

    existing = []
    if os.path.exists("log_scraper.json"):
        try:
            with open("log_scraper.json", "r", encoding="utf-8") as f:
                content = f.read().strip()
                existing = json.loads(content) if content else []
                if isinstance(existing, dict):
                    existing = [existing]
        except (json.JSONDecodeError, OSError):
            existing = []

    existing.append(log_entry)
    with open("log_scraper.json", "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=4)

    print("LOG:", log_entry)


def validate_credentials():
    if not USUARIO or not CLAVE:
        raise ValueError(
            "Variables de entorno REDMINE_USER y REDMINE_PASS son obligatorias."
        )


def get_authenticity_token(session):
    resp = session.get(LOGIN_URL, headers=HEADERS)
    resp.raise_for_status()
    soup_login = BeautifulSoup(resp.text, "html.parser")
    token = soup_login.select_one("input[name=authenticity_token]")
    return token["value"] if token else None


def perform_login(session, token):
    if not token:
        raise RuntimeError("No se encontró authenticity_token en el login")

    payload = {
        "username": USUARIO,
        "password": CLAVE,
        "authenticity_token": token,
        "utf8": "✓",
        "login": "Acceder »",
    }

    headers_login = dict(HEADERS)
    headers_login["Referer"] = LOGIN_URL

    resp_login = session.post(LOGIN_URL, data=payload, headers=headers_login)
    resp_login.raise_for_status()

    if "Cerrar sesión" not in resp_login.text and "Mi cuenta" not in resp_login.text:
        with open("debug_login.html", "w", encoding="utf-8") as f:
            f.write(resp_login.text)
        raise RuntimeError("Login incorrecto, Redmine devolvió otra página")

    print("LOGIN OK ✔")


def fetch_issue(session):
    headers_issue = dict(HEADERS)
    headers_issue["Referer"] = LOGIN_URL

    resp_issue = session.get(ISSUE_URL, headers=headers_issue)
    resp_issue.raise_for_status()
    issue_html = resp_issue.text

    if "username" in issue_html and "password" in issue_html:
        with open("debug_issue.html", "w", encoding="utf-8") as f:
            f.write(issue_html)
        raise RuntimeError("Redmine volvió a pedir login (cookies no aceptadas)")

    print("ISSUE CARGADO ✔")
    return BeautifulSoup(issue_html, "html.parser")


def get_attribute_value(soup, classname):
    block = soup.select_one(f".attributes .{classname}.attribute .value")
    return block.get_text(strip=True) if block else None


def parse_historial(soup):
    historial = []
    journal_entries = soup.select("#history .journal.has-details")

    for journal in journal_entries:
        numero_tag = journal.select_one(".journal-link")
        usuario_tag = journal.select_one(".note-header a")
        fecha_tag = journal.select_one(".note-header a[title]")

        if not numero_tag or not usuario_tag:
            continue

        cambios = [li.get_text(" ", strip=True) for li in journal.select("ul.details li")]

        historial.append(
            {
                "numero": numero_tag.get_text(strip=True),
                "usuario": usuario_tag.get_text(strip=True),
                "fecha": fecha_tag["title"] if fecha_tag else "",
                "cambios": cambios,
            }
        )

    return historial


def save_datos(estado, historial):
    data = {
        "actualizado": datetime.now(pytz.UTC).strftime("%Y-%m-%d %H:%M:%S %Z"),
        "estado_actual": estado,
        "historial": historial,
    }

    with open("datos_issue.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def main():
    session = requests.Session()
    validate_credentials()

    token = get_authenticity_token(session)
    perform_login(session, token)
    soup = fetch_issue(session)

    estado = get_attribute_value(soup, "status")
    historial = parse_historial(soup)

    save_datos(estado, historial)
    append_log(
        "SUCCESS",
        "Scraping completado correctamente",
        {"estado": estado, "historial_items": len(historial)},
    )
    print("SCRAPING COMPLETADO ✔")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        append_log("ERROR", str(exc))
        raise
