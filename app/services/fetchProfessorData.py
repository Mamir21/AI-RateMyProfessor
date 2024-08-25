import ratemyprofessor
from sentence_transformers import SentenceTransformer
import json
import sys
import warnings
from transformers import logging as transformers_logging
import logging

# Setup logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Suppress the specific FutureWarning related to `clean_up_tokenization_spaces`
warnings.filterwarnings("ignore", category=FutureWarning, module="transformers.tokenization_utils_base")
transformers_logging.set_verbosity_error()

model = SentenceTransformer('all-MiniLM-L6-v2')

def fetch_professor_data(schoolName, professorName):
    try:
        school = ratemyprofessor.get_school_by_name(schoolName)
        if not school:
            return {"error": f"School '{schoolName}' not found."}

        professor = ratemyprofessor.get_professor_by_school_and_name(school, professorName)
        if not professor:
            return {"error": f"Professor '{professorName}' not found at '{schoolName}'."}

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
    except Exception as e:
        logger.error(f"Error in fetching professor data: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        # Print error as JSON to stderr, ensuring it's handled correctly
        sys.stderr.write(json.dumps({"error": "Usage: script.py <schoolName> <professorName>"}))
        sys.exit(1)

    schoolName = sys.argv[1]
    professorName = sys.argv[2]
    
    # Fetch the professor data
    result = fetch_professor_data(schoolName, professorName)

    # Ensure all output is valid JSON
    try:
        print(json.dumps(result))
    except TypeError as e:
        # Handle any serialization issues
        logger.error(f"Failed to serialize result: {str(e)}")
        sys.stderr.write(json.dumps({"error": "Failed to serialize result: " + str(e)}))
        sys.exit(1)