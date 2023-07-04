from hashlib import sha256
from secrets import token_urlsafe
from time import time
from random import randint
from uuid import uuid4
from firebase_admin import db
from utils import valid_roblosecurity,get_userid_with_cookie


class AuthHandler:
    def __init__(self):
        self.ref = db.reference("/auth")

    def validate_auth_key(self, auth_key):
        print(auth_key)
        auth_ref = self.ref.child(auth_key)
        existing_auth = auth_ref.get()
        return existing_auth

    def validate_cookie(self, cookie):
        ref = db.reference("/auth")
        existing_auth = ref.order_by_child("roblosecurity").equal_to(cookie).get()
        if existing_auth:
            auth_key = next(iter(existing_auth.values()))["authkey"]
            is_valid_token = valid_roblosecurity(cookie)
            if is_valid_token:
                return auth_key
            is_valid_token = valid_roblosecurity(cookie)
            if is_valid_token:
                self.ref.child(auth_key).update({"roblosecurity": cookie})
            return auth_key
        else:
            is_valid_token = valid_roblosecurity(cookie)
            if is_valid_token:
                auth_key = self.generate_token()
                user_id = get_userid_with_cookie(cookie)
                ref = db.reference("/auth")
                existing_id = ref.order_by_child("userid").equal_to(user_id).get()
                if existing_id:
                    authkey = next(iter(existing_id))
                    ref.child(authkey).update({"roblosecurity": cookie})
                    return authkey
                auth_ref = ref.child(auth_key)
                auth_ref.set(
                    {
                        "roblosecurity": cookie,
                        "authkey": auth_key,
                        "userid": user_id,
                        "robux": 0,
                    }
                )
                return auth_key
            else:
                return None

    def generate_token(self):
        random_data = token_urlsafe(78)
        timestamp = int(time() * 1000)
        unique_id = str(uuid4())
        token_data = f"{random_data}.{timestamp}.{unique_id}.{timestamp * randint(24, 69) / randint(2324, 6932) + randint(2424, 6329)}"
        token_hash = sha256(token_data.encode()).hexdigest()
        return token_hash