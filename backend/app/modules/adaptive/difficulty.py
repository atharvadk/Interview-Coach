from app.models.schemas import Difficulty


class AdaptiveDifficulty:
    def __init__(self):
        # { session_id: { "scores": [], "current_difficulty": "medium" } }
        self._sessions = {}

    def init_session(self, session_id: str, difficulty: str = "medium"):
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                "scores":             [],
                "current_difficulty": difficulty
            }

    def add_score(self, session_id: str, score: float):
        if session_id not in self._sessions:
            self.init_session(session_id)
        self._sessions[session_id]["scores"].append(score)

    def get_next_difficulty(self, session_id: str) -> Difficulty:
        if session_id not in self._sessions:
            return Difficulty.MEDIUM

        scores = self._sessions[session_id]["scores"]
        current = self._sessions[session_id]["current_difficulty"]

        # Need at least 3 scores before adapting
        if len(scores) < 3:
            return Difficulty(current)

        # Take last 3 scores only
        last_3  = scores[-3:]
        average = sum(last_3) / 3

        print(f"Adaptive engine — last 3 scores: {last_3}, average: {average:.2f}")

        if average >= 8.0:
            next_diff = Difficulty.HARD
        elif average < 4.0:
            next_diff = Difficulty.EASY
        else:
            next_diff = Difficulty.MEDIUM

        # Update stored difficulty
        self._sessions[session_id]["current_difficulty"] = next_diff.value

        return next_diff

    def get_average(self, session_id: str) -> float:
        scores = self._sessions.get(session_id, {}).get("scores", [])
        if not scores:
            return 0.0
        return round(sum(scores) / len(scores), 2)

    def get_score_history(self, session_id: str) -> list:
        return self._sessions.get(session_id, {}).get("scores", [])


# Global instance
adaptive_engine = AdaptiveDifficulty()