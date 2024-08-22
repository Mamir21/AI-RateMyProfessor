import ratemyprofessor
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

def fetchProfessorData(schoolName, professorName):
    professor = ratemyprofessor.get_professor_by_school_and_name(
        ratemyprofessor.get_school_by_name(schoolName), professorName)
    if professor is not None:
        professorData = {
            "id": f"{professor.school.name}-{professor.name}",
            "name": professor.name,
            "department": professor.department,
            "school": {"name": professor.school.name},
            "rating": professor.rating,
            "difficulty": professor.difficulty,
            "num_ratings": professor.num_ratings,
            "would_take_again": professor.would_take_again or "N/A"
        }

        # Generate embedding
        text = f"{professor.name} works in the {professor.department} Department of {professor.school.name}."
        text += f" Rating: {professor.rating} / 5.0. Difficulty: {professor.difficulty} / 5.0."
        text += f" Total Ratings: {professor.num_ratings}. Would Take Again: {professor.would_take_again or 'N/A'}%."
        embedding = model.encode(text).tolist()  # Convert embedding to list to be JSON serializable

        return {"professorData": professorData, "embedding": embedding}
    return None

if __name__ == "__main__":
    import sys
    schoolName = sys.argv[1]
    professorName = sys.argv[2]
    print(fetchProfessorData(schoolName, professorName))