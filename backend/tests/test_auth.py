def test_register_and_login(client):
    # 1. Register new owner
    reg_payload = {
        "email": "testowner@solarsync.io",
        "password": "Password123!",
        "full_name": "Test Owner",
        "phone_number": "+91 99001 99001",
        "role": "installation_owner"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 200, res_reg.text
    data_reg = res_reg.json()
    assert "access_token" in data_reg
    assert data_reg["user"]["email"] == "testowner@solarsync.io"

    # 2. Duplicate registration fails
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # 3. Login with wrong password
    res_bad_pw = client.post("/api/v1/auth/login", json={
        "email": "testowner@solarsync.io",
        "password": "WrongPassword!"
    })
    assert res_bad_pw.status_code == 401

    # 4. Login with correct password
    res_login = client.post("/api/v1/auth/login", json={
        "email": "testowner@solarsync.io",
        "password": "Password123!"
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # 5. Get current profile with JWT
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["full_name"] == "Test Owner"

