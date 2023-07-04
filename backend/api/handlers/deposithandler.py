from cloudscraper import create_scraper
import json
from utils import get_roblox_xcsrf
import re

class DepositHandler:
    CREATE_GAMEPASS_API = "https://apis.roblox.com/game-passes/v1/game-passes"
    IMAGE_MEMORY = open("gpc.png", "rb")
    SCRAPER = scraper = create_scraper()
    def create_deposit(self,deposit_cookie,withdraw_cookie,withdraw_id,deposit_amount):
        gamepass_id = self.create_gamepass(withdraw_id,withdraw_cookie)
        pricechange = self.change_price_of_gp(gamepass_id,deposit_amount,withdraw_cookie)
        buy_GP = self.buy_gamepass(gamepass_id,deposit_cookie,deposit_amount)
        if buy_GP == False: return {"success":False,"AddedAmount":deposit_amount}
        return {"success":True,"AddedAmount":deposit_amount}
    def get_place_id(self, userid):
        headers = {"accept": "application/json"}
        url = f"https://games.roblox.com/v2/users/{userid}/games?accessFilter=2&limit=10&sortOrder=Asc"
        
        response = self.SCRAPER.get(url, headers=headers)
        if response.status_code == 200:
            return json.loads(response.text)["data"][0]["id"]
        else:
            print("Request failed with status code:", response.status_code)

    def delete_gamepass(self,gamepass_id,deleter_cookie):
        url = "https://www.roblox.com/game-pass/revoke"
        payload = f"id={gamepass_id}"
        headers = {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'cookie': f'.ROBLOSECURITY={deleter_cookie}',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'x-csrf-token': get_roblox_xcsrf(deleter_cookie)
        }
        response = self.SCRAPER.post(url, headers=headers, data=payload)
        return response.json()["isValid"]

    def create_gamepass(self, userid, deposit_cookie):
        universeid = self.get_place_id(userid)
        data = {
            "Name": "1Donationsthanksguys",
            "Description": "Description",
            "UniverseId": universeid,
        }
        response = self.SCRAPER.post(
            self.CREATE_GAMEPASS_API,
            data=data,
            files={"File": ("gpc.png", self.IMAGE_MEMORY, "image/png")},
            cookies={".ROBLOSECURITY": deposit_cookie},
            headers={"x-csrf-token": get_roblox_xcsrf(deposit_cookie)},
        )
        return response.json()["gamePassId"]


    def buy_gamepass(self,gamepass_id,buyer_cookie,deposit_amnt):
        detail_res = self.SCRAPER.get(f"https://www.roblox.com/game-pass/{gamepass_id}")
        text = detail_res.text
        productId = int(re.search("data-product-id=\"(\d+)\"", text).group(1))
        expectedSellerId = int(re.search("data-expected-seller-id=\"(\d+)\"", text).group(1))

        headers = {
            "cookie": f".ROBLOSECURITY={buyer_cookie}",
            "x-csrf-token": get_roblox_xcsrf(buyer_cookie),
        }

        payload = {
            "expectedSellerId": expectedSellerId,
            "expectedCurrency": 1,
            "expectedPrice": deposit_amnt
        }

        response = self.SCRAPER.post(f"https://economy.roblox.com/v1/purchases/products/{productId}", headers=headers, data=payload)
        try:
            self.delete_gamepass(gamepass_id,buyer_cookie)
        except Exception as e:
            print(e)
        try:
            response.json()["purchased"]
        except Exception as e:
            print(e)
            return False
        return response.json()["purchased"]

    def change_price_of_gp(self, gamepass_id,price,gp_cookie):
        url = 'https://www.roblox.com/game-pass/update'
        headers = {
            'X-CSRF-TOKEN': get_roblox_xcsrf(gp_cookie),
        }
        payload = {
            'id': gamepass_id,
            'price': price,
            'isForSale': True,
        }
        response = self.SCRAPER.post(url, headers=headers, json=payload,cookies={".ROBLOSECURITY": gp_cookie},)
        return response.json()["isValid"]