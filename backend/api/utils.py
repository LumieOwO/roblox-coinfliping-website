from cloudscraper import create_scraper
scraper = create_scraper()
import firebase_admin
from firebase_admin import credentials
FIREBASE_URL = ""
def initialize_firebase():
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": FIREBASE_URL 
        }
    )

def get_firebase_app():
    return firebase_admin.get_app()


def get_roblox_xcsrf(cookie):
    response = scraper.post('https://auth.roblox.com/v1/usernames/validate',cookies = {
                ".ROBLOSECURITY":str(cookie),
            })

    csrftoken = response.headers['x-csrf-token']
    return csrftoken

def get_userid_with_cookie(cookie):
    response = scraper.get(
        "https://www.roblox.com/users/profile",
        cookies={".ROBLOSECURITY": cookie},
    )
    try:
        return response.url.split("https://www.roblox.com/users/")[1].split("/")[0]
    except:
        return response.url.split("https://web.roblox.com/users/")[1].split("/")[0]


def valid_roblosecurity(cookie):
    response = scraper.get(
        "https://economy.roblox.com/v1/user/currency",
        headers={"Cookie": f".ROBLOSECURITY={cookie}"},
    )
    if response.status_code == 200:
        return True
    return False