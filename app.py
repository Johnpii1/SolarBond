"""SolarBond development backend.

This Flask service provides a small, explicit API for the Next.js client during
local development. It records connection events and investment intents; it does
not custody keys or sign transactions. Stellar wallet signing remains in the
user's wallet and settlement remains in the Soroban contract.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///solarbond.db"),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)
db = SQLAlchemy(app)


@app.after_request
def add_development_cors_headers(response):
    """Allow the local Next.js client to call the development API."""
    if request.path.startswith("/api/"):
        response.headers["Access-Control-Allow-Origin"] = os.environ.get(
            "CORS_ORIGIN", "http://localhost:3000"
        )
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


class WalletSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(64), nullable=False, index=True)
    wallet_id = db.Column(db.String(80), nullable=False)
    network = db.Column(db.String(16), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


class InvestmentIntent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


def json_error(message: str, status: int):
    return jsonify({"error": message}), status


@app.get("/api/health")
def health():
    return jsonify({"service": "SolarBond API", "status": "ok"})


@app.post("/api/wallet-sessions")
def create_wallet_session():
    payload = request.get_json(silent=True) or {}
    address = str(payload.get("address", "")).strip()
    wallet_id = str(payload.get("walletId", "wallet")).strip()
    network = str(payload.get("network", "PUBLIC")).upper()
    if not address.startswith("G") or not 10 <= len(address) <= 64:
        return json_error("A valid Stellar public address is required.", 400)
    if not wallet_id or network not in {"PUBLIC", "TESTNET"}:
        return json_error("A wallet id and supported network are required.", 400)

    session = WalletSession(address=address, wallet_id=wallet_id, network=network)
    db.session.add(session)
    db.session.commit()
    return jsonify({"id": session.id, "address": address, "network": network}), 201


@app.post("/api/investments")
def create_investment_intent():
    payload = request.get_json(silent=True) or {}
    project_id = payload.get("projectId")
    amount = payload.get("amount")
    if not isinstance(project_id, int) or project_id < 1:
        return json_error("projectId must be a positive integer.", 400)
    if not isinstance(amount, (int, float)) or isinstance(amount, bool) or amount <= 0:
        return json_error("amount must be a positive number.", 400)

    intent = InvestmentIntent(project_id=project_id, amount=float(amount), address=payload.get("address"))
    db.session.add(intent)
    db.session.commit()
    return jsonify({"id": intent.id, "projectId": intent.project_id, "amount": intent.amount}), 201


@app.cli.command("init-db")
def init_db_command():
    """Create the local database tables."""
    db.create_all()
    print("Initialized SolarBond database.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=os.environ.get("FLASK_DEBUG") == "1")
