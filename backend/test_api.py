import urllib.request
import json

def test_api():
    try:
        # Test health
        req = urllib.request.Request('http://127.0.0.1:5000/api/health')
        with urllib.request.urlopen(req) as response:
            print("HEALTH RESPONSE:", response.read().decode('utf-8'))
    except Exception as e:
        print("HEALTH ERROR:", e)

    try:
        # Test login
        url = 'http://127.0.0.1:5000/api/auth/login'
        data = json.dumps({'email': 'student@careerpilot.com', 'password': 'password123'}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            print("LOGIN RESPONSE:", response.read().decode('utf-8'))
    except Exception as e:
        print("LOGIN ERROR:", e)

if __name__ == '__main__':
    test_api()
