from app import create_app
from app.models.schema import (
    db,
    User,
    JobPosting,
    DsaProblem,
    AptitudeCategory,
    AptitudeQuestion
)
import json


app = create_app()


def safe_seed_database():
    with app.app_context():

        print("Starting SAFE data insertion...")
        print("Existing users and other data will NOT be deleted.")

        # -------------------------------------------------
        # 1. Find or create a recruiter
        # -------------------------------------------------
        recruiter = User.query.filter_by(role="recruiter").first()

        if recruiter:
            print(f"Using existing recruiter: {recruiter.name}")
        else:
            recruiter = User(
                name="CareerPilot Recruiter",
                email="recruiter@careerpilot.local",
                role="recruiter"
            )
            recruiter.set_password("CareerPilot@123")
            db.session.add(recruiter)
            db.session.flush()

            print("Created recruiter account.")

        # -------------------------------------------------
        # 2. Add Practice Job Postings
        # -------------------------------------------------
        jobs = [
            {
                "title": "Frontend Developer",
                "company": "Practice Company",
                "location": "Remote",
                "type": "Full-time",
                "salary_range": "Not specified",
                "description": "Practice job posting for students preparing for frontend development roles.",
                "requirements": [
                    "HTML",
                    "CSS",
                    "JavaScript",
                    "React.js"
                ]
            },
            {
                "title": "Python Developer",
                "company": "Practice Company",
                "location": "Remote",
                "type": "Full-time",
                "salary_range": "Not specified",
                "description": "Practice job posting for students preparing for Python development roles.",
                "requirements": [
                    "Python",
                    "SQL",
                    "REST API",
                    "Git"
                ]
            },
            {
                "title": "Data Analyst",
                "company": "Practice Company",
                "location": "Remote",
                "type": "Full-time",
                "salary_range": "Not specified",
                "description": "Practice job posting for students preparing for entry-level data analysis roles.",
                "requirements": [
                    "Python",
                    "SQL",
                    "Excel",
                    "Data Analysis"
                ]
            }
        ]

        for job_data in jobs:

            existing_job = JobPosting.query.filter_by(
                title=job_data["title"],
                company=job_data["company"]
            ).first()

            if existing_job:
                print(f"Job already exists: {job_data['title']}")
                continue

            job = JobPosting(
                recruiter_id=recruiter.id,
                title=job_data["title"],
                company=job_data["company"],
                location=job_data["location"],
                type=job_data["type"],
                salary_range=job_data["salary_range"],
                description=job_data["description"],
                requirements=json.dumps(job_data["requirements"])
            )

            db.session.add(job)
            print(f"Added job: {job_data['title']}")

        # -------------------------------------------------
        # 3. Add DSA Problems
        # -------------------------------------------------
        dsa_problems = [
            {
                "title": "Find Maximum Element in an Array",
                "topic": "Arrays",
                "difficulty": "Easy",
                "description": "Given an array of integers, find the maximum element.",
                "constraints": "1 <= n <= 100000",
                "example_input": "[3, 7, 2, 9, 4]",
                "example_output": "9",
                "starter_code": "def find_max(arr):\n    pass"
            },
            {
                "title": "Reverse a String",
                "topic": "Strings",
                "difficulty": "Easy",
                "description": "Given a string, return the string in reverse order.",
                "constraints": "1 <= length <= 100000",
                "example_input": "hello",
                "example_output": "olleh",
                "starter_code": "def reverse_string(s):\n    pass"
            },
            {
                "title": "Two Sum",
                "topic": "Arrays",
                "difficulty": "Easy",
                "description": "Given an array and a target value, find two elements whose sum equals the target.",
                "constraints": "2 <= n <= 100000",
                "example_input": "arr = [2, 7, 11, 15], target = 9",
                "example_output": "[0, 1]",
                "starter_code": "def two_sum(arr, target):\n    pass"
            },
            {
                "title": "Binary Search",
                "topic": "Searching",
                "difficulty": "Medium",
                "description": "Given a sorted array and a target value, find the target using binary search.",
                "constraints": "1 <= n <= 100000",
                "example_input": "arr = [1, 3, 5, 7, 9], target = 7",
                "example_output": "3",
                "starter_code": "def binary_search(arr, target):\n    pass"
            }
        ]

        for problem_data in dsa_problems:

            existing_problem = DsaProblem.query.filter_by(
                title=problem_data["title"]
            ).first()

            if existing_problem:
                print(f"DSA already exists: {problem_data['title']}")
                continue

            problem = DsaProblem(**problem_data)
            db.session.add(problem)

            print(f"Added DSA problem: {problem_data['title']}")

        # -------------------------------------------------
        # 4. Add Aptitude Categories
        # -------------------------------------------------
        categories = {
            "Quantitative Aptitude":
                "Practice questions for basic quantitative aptitude.",
            "Logical Reasoning":
                "Practice questions for logical reasoning.",
            "Verbal Ability":
                "Practice questions for basic verbal ability."
        }

        category_objects = {}

        for name, description in categories.items():

            category = AptitudeCategory.query.filter_by(
                name=name
            ).first()

            if category:
                print(f"Aptitude category already exists: {name}")
            else:
                category = AptitudeCategory(
                    name=name,
                    description=description
                )

                db.session.add(category)
                db.session.flush()

                print(f"Added aptitude category: {name}")

            category_objects[name] = category

        # -------------------------------------------------
        # 5. Add Aptitude Questions
        # -------------------------------------------------
        questions = [
            {
                "category": "Quantitative Aptitude",
                "question_text": "What is 25% of 200?",
                "option_a": "25",
                "option_b": "40",
                "option_c": "50",
                "option_d": "75",
                "correct_option": "C",
                "explanation": "25% of 200 is 50.",
                "topic_tag": "Percentage"
            },
            {
                "category": "Quantitative Aptitude",
                "question_text": "If a number is increased from 50 to 60, what is the percentage increase?",
                "option_a": "10%",
                "option_b": "20%",
                "option_c": "25%",
                "option_d": "30%",
                "correct_option": "B",
                "explanation": "Increase = 10. Percentage increase = 10/50 × 100 = 20%.",
                "topic_tag": "Percentage"
            },
            {
                "category": "Logical Reasoning",
                "question_text": "Find the next number: 2, 4, 6, 8, ?",
                "option_a": "9",
                "option_b": "10",
                "option_c": "11",
                "option_d": "12",
                "correct_option": "B",
                "explanation": "Each number increases by 2.",
                "topic_tag": "Number Series"
            },
            {
                "category": "Verbal Ability",
                "question_text": "Choose the synonym of 'Rapid'.",
                "option_a": "Slow",
                "option_b": "Quick",
                "option_c": "Weak",
                "option_d": "Late",
                "correct_option": "B",
                "explanation": "Rapid means quick or fast.",
                "topic_tag": "Vocabulary"
            }
        ]

        for question_data in questions:

            category = category_objects[question_data["category"]]

            existing_question = AptitudeQuestion.query.filter_by(
                category_id=category.id,
                question_text=question_data["question_text"]
            ).first()

            if existing_question:
                print(
                    f"Aptitude question already exists: "
                    f"{question_data['question_text']}"
                )
                continue

            question = AptitudeQuestion(
                category_id=category.id,
                question_text=question_data["question_text"],
                option_a=question_data["option_a"],
                option_b=question_data["option_b"],
                option_c=question_data["option_c"],
                option_d=question_data["option_d"],
                correct_option=question_data["correct_option"],
                explanation=question_data["explanation"],
                topic_tag=question_data["topic_tag"]
            )

            db.session.add(question)

            print(
                f"Added aptitude question: "
                f"{question_data['question_text']}"
            )

        # -------------------------------------------------
        # Save everything
        # -------------------------------------------------
        db.session.commit()

        print()
        print("======================================")
        print("SAFE SEED COMPLETED")
        print("======================================")
        print(f"Jobs: {JobPosting.query.count()}")
        print(f"DSA Problems: {DsaProblem.query.count()}")
        print(f"Aptitude Categories: {AptitudeCategory.query.count()}")
        print(f"Aptitude Questions: {AptitudeQuestion.query.count()}")
        print("Existing users/data were NOT deleted.")


if __name__ == "__main__":
    safe_seed_database()