import random

def extract_project_topics(projects):
    # Simple heuristic: extract keywords from project lines
    topics = []
    for line in projects:
        words = [w for w in line.split() if len(w) > 3]
        if words:
            topics.append(" ".join(words[:5]))
    return topics

def generate_project_question(project_topic, difficulty="medium"):
    templates = [
        f"Describe your project: {project_topic}. What challenges did you face and how did you overcome them?",
        f"How did you design and implement the project: {project_topic}?",
        f"What technologies did you use in {project_topic} and why?",
        f"What was your role in the project {project_topic}?",
        f"How would you improve {project_topic} if you had more time/resources?"
    ]
    return random.choice(templates)
