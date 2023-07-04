from flask import  jsonify
from handlers.authhandler import AuthHandler
from handlers.deposithandler import DepositHandler
from random import choice
from utils import valid_roblosecurity,get_userid_with_cookie
import constants
from cloudscraper import create_scraper
from firebase_admin import db

class BalanceHandler:
    SCRAPER = create_scraper()
    def __init__(self):
        self.auth_handler = AuthHandler()
        self.deposit_handler = DepositHandler()

    def get_a_working_random_gen_cookie(self):
        gen_cookie = choice(constants.general_cookies)
        if valid_roblosecurity(gen_cookie):
            return gen_cookie
        return self.get_a_working_random_gen_cookie()

    def deposit(self, data):
        amount = int(data["amount"])
        auth_token = data["auth"]
        existing_auth = self.auth_handler.validate_auth_key(auth_token)
        if not existing_auth:
            return jsonify({"success": False, "message": "Invalid auth token"})
        cookie = existing_auth["roblosecurity"]

        if amount <= 6:
            return jsonify({"success": False, "message": "Invalid deposit amount"})

        response = self.SCRAPER.get(
            "https://economy.roblox.com/v1/user/currency",
            headers={"Cookie": f".ROBLOSECURITY={cookie}"},
        )
        if response.status_code != 200:
            return jsonify({"success": False, "message": "Invalid roblosecurity"})

        current_robux_amount = int(response.json()["robux"])
        if current_robux_amount < amount:
            return jsonify(
                {
                    "success": False,
                    "message": "Amount deposited larger than current available Robux on account",
                }
            )
        if len(constants.withdraw_pool) <= 0:
            if amount > sum(user["amount"] for user in constants.withdraw_pool):
                gen_cookie = self.get_a_working_random_gen_cookie()
                userid = get_userid_with_cookie(gen_cookie)
                deposit_details = self.deposit_handler.create_deposit(cookie,gen_cookie,userid,amount)
                if deposit_details["success"] != True: return jsonify({"success": False,"message": "depositing had an error and robux will not be addded to website nor will it be taken"})
                ref = db.reference("/auth")
                current_amt = ref.child(auth_token).get().get("robux") 
                ref.child(auth_token).update({"robux": int(current_amt)+int(deposit_details["AddedAmount"])})
                return deposit_details
        else:
            fulfilled = []
            remaining_amount = amount
            while remaining_amount > 0 and len(constants.withdraw_pool) > 0:
                user = choice(constants.withdraw_pool)
                if remaining_amount >= user["amount"]:
                    fulfilled.append(user)
                    remaining_amount -= user["amount"]
                    constants.withdraw_pool.remove(user)
                else:
                    break
            if remaining_amount == 0:
                constants.deposit_pool.append({"cookies": "", "amount": amount})
                return "Deposit successful"
            else:
                constants.withdraw_pool.extend(fulfilled)
                return "b"

        constants.deposit_pool.append({"cookies": "", "amount": amount})
        return "Deposit successful"

    def withdraw(self):
        pass