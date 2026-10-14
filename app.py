from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
PAGES = FRONTEND / "pages"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="/static")


@app.get("/")
def home():
    return send_from_directory(FRONTEND, "index.html")


@app.get("/pages/<path:page_name>")
def serve_page(page_name):
    return send_from_directory(PAGES, page_name)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "app": "CareerCompass"})


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message", "")).strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400

    lower = message.lower()
    if any(word in lower for word in ("skill gap", "skills to learn", "skill")):
        reply = ("Start by comparing your current skills with 3–5 current job descriptions "
                 "for a role you want. List repeated requirements, rate your confidence, "
                 "then choose one priority skill and build a small project to practice it.")
    elif any(word in lower for word in ("roadmap", "30-day", "learning plan", "learn")):
        reply = ("A simple 30-day plan: Week 1—choose one target role and review its requirements; "
                 "Week 2—learn one foundational skill; Week 3—apply it in a small project; "
                 "Week 4—document the project, request feedback, and update your resume. "
                 "Adapt this plan to your schedule.")
    elif any(word in lower for word in ("career", "path", "role", "direction", "job")):
        reply = ("Explore 2–3 career paths by comparing daily tasks, required skills, work settings, "
                 "and entry routes. Consider your interests and strengths, review current job "
                 "descriptions, and speak with people in the field before deciding.")
    else:
        reply = ("Thanks for sharing. To make progress, write down your goal, identify one "
                 "question you need answered, and choose a small next action. I’m a starter "
                 "demo, so verify career requirements and opportunities using current official sources.")
    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
