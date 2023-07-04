from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from utils import initialize_firebase, get_firebase_app, valid_roblosecurity
from cloudscraper import create_scraper
from handlers.authhandler import AuthHandler
from handlers.balancehandler import BalanceHandler

scraper = create_scraper()
app = Flask(__name__)
CORS(app, supports_credentials=True)
initialize_firebase()
get_firebase_app()
auth_handler = AuthHandler()
balance_handler = BalanceHandler()

@app.route('/get_userid', methods=['POST'])
def get_userid():
    token = request.json.get('cookie')
    print(token)
    if token:
        auth_key = auth_handler.validate_auth_key(token)
        if auth_key:
            existing_auth = auth_handler.validate_auth_key(token)
            if existing_auth:
                print(existing_auth["userid"])
                return jsonify({'success': True, 'user_id': existing_auth["userid"]})
    return jsonify({'success': False, 'message': 'Invalid token'})

@app.route("/auth/validauthkey", methods=["POST"])
def validate_auth():
    auth_key = request.json.get("data", {}).get("cookie")
    existing_auth = auth_handler.validate_auth_key(auth_key)

    if existing_auth:
        roblosecurity = existing_auth["roblosecurity"]
        user_id = existing_auth["userid"]
        robuxamt = existing_auth["robux"]
        is_valid_token = valid_roblosecurity(roblosecurity)
        headshot_url = f"https://thumbnails.roblox.com/v1/users/avatar?userIds={user_id}&size=420x420&format=Png&isCircular=true"
        username_url = f"https://users.roblox.com/v1/users/{user_id}"
        response = scraper.get(username_url)

        if response.status_code == 200:
            data = response.json()

        if is_valid_token:
            return jsonify(
                {
                    "success": True,
                    "message": roblosecurity,
                    "id": user_id,
                    "headshot": f"data:image/png;base64,{base64.b64encode(scraper.get(scraper.get(headshot_url).json()['data'][0]['imageUrl']).content).decode('utf-8')}",
                    "username": data["name"],
                    "robuxamount":robuxamt
                }
            )
        else:
            return jsonify({"success": False, "message": "Cookie is not valid"})
    else:
        return jsonify(
            {"success": False, "message": "No matching auth key found in the database"}
        )


@app.route("/auth/cookie", methods=["POST"])
def validate_cookie():
    cookie = request.json.get("data", {}).get("cookie")
    auth_key = auth_handler.validate_cookie(cookie)

    if auth_key:
        return jsonify({"success": True, "token": auth_key})
    else:
        return jsonify({"success": False, "token": "none"})


@app.route("/balance/deposit", methods=["POST"])
def deposit():
    data = request.get_json()
    return balance_handler.deposit(data)


@app.route("/balance/withdraw", methods=["POST"])
def withdraw():
    return balance_handler.withdraw()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=81)
