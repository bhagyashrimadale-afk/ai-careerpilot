import os
import json
import re
import urllib.request
import urllib.parse
from flask import current_app

class AIService:
    @staticmethod
    def _call_gemini_api(prompt, system_instruction=""):
        """Call Gemini API via REST if API key is configured."""
        api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY', '')
        if not api_key:
            return None
            
        try:
            model = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            if system_instruction:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_instruction}]
                }
                
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode('utf-8'))
                text_response = res_body['candidates'][0]['content']['parts'][0]['text']
                return text_response
        except Exception as e:
            print(f"[AIService Warning] Gemini API call failed or timed out: {e}")
            return None

    @classmethod
    def analyze_resume_ats(cls, resume_text, target_role="Software Engineer"):
        """Analyze resume against ATS metrics and target role."""
        prompt = f"""
Analyze the following resume text for the role of '{target_role}'.
Provide a JSON output with the exact keys:
- "ats_score": number between 0 and 100
- "missing_skills": array of string skill names that are missing or recommended
- "strengths": array of 3 string resume strengths
- "weaknesses": array of 3 string weaknesses or formatting issues
- "improvement_tips": array of 3 action items to boost ATS score
- "summary": short summary statement (2 lines)

Resume Text:
{resume_text}
"""
        response_text = cls._call_gemini_api(prompt, "Return ONLY raw valid JSON object without markdown formatting.")
        if response_text:
            try:
                # Clean codeblock wrappers if present
                clean_json = re.sub(r'^```json\s*|\s*```$', '', response_text.strip(), flags=re.MULTILINE)
                data = json.loads(clean_json)
                return data
            except Exception as e:
                print(f"[AIService] JSON Parse error from Gemini: {e}")
        
        # Fallback intelligent rule-based ATS analysis
        return cls._fallback_ats_analysis(resume_text, target_role)

    @classmethod
    def match_job_skills(cls, student_skills, resume_text, job_requirements, job_description=""):
        """Calculate match percentage between student skills/resume and job requirements."""
        prompt = f"""
Compare the candidate's skills and resume with the job requirements.
Candidate Skills: {', '.join(student_skills)}
Candidate Resume Summary: {resume_text[:500]}

Job Requirements: {job_requirements}
Job Description: {job_description[:500]}

Return JSON with exact keys:
- "match_percentage": integer (0 to 100)
- "matching_skills": array of strings
- "missing_skills": array of strings
- "recommendation": brief candidate assessment (2 sentences)
"""
        response_text = cls._call_gemini_api(prompt, "Return ONLY valid JSON.")
        if response_text:
            try:
                clean_json = re.sub(r'^```json\s*|\s*```$', '', response_text.strip(), flags=re.MULTILINE)
                return json.loads(clean_json)
            except Exception as e:
                pass
                
        return cls._fallback_job_match(student_skills, resume_text, job_requirements)

    @classmethod
    def evaluate_interview_answer(cls, question_text, question_type, user_answer, target_role="Software Engineer"):
        """Evaluate student answer during Mock Interview."""
        prompt = f"""
Role: {target_role}
Question ({question_type}): {question_text}
Candidate Answer: {user_answer}

Evaluate the candidate's response. Return JSON with exact keys:
- "score": integer 0-100
- "feedback": 2-3 sentence constructive analysis of accuracy, clarity, and tone
- "suggested_improvement": specific example answer or missing points to include
"""
        response_text = cls._call_gemini_api(prompt, "Return ONLY valid JSON.")
        if response_text:
            try:
                clean_json = re.sub(r'^```json\s*|\s*```$', '', response_text.strip(), flags=re.MULTILINE)
                return json.loads(clean_json)
            except Exception as e:
                pass

        return cls._fallback_interview_eval(user_answer)

    @classmethod
    def generate_career_roadmap(cls, target_role, existing_skills):
        """Generate structured career learning roadmap."""
        prompt = f"""
Create a step-by-step career learning roadmap for a student aspiring to become a '{target_role}'.
Current Skills: {', '.join(existing_skills)}

Return JSON array of 5 milestone objects, each having:
- "step": integer (1 to 5)
- "title": milestone title
- "description": description of what to learn
- "estimated_weeks": integer number of weeks
- "recommended_topics": list of strings
- "status": string ("completed" if user already has skills, otherwise "pending")
"""
        response_text = cls._call_gemini_api(prompt, "Return ONLY valid JSON array.")
        if response_text:
            try:
                clean_json = re.sub(r'^```json\s*|\s*```$', '', response_text.strip(), flags=re.MULTILINE)
                return json.loads(clean_json)
            except Exception as e:
                pass

        return cls._fallback_career_roadmap(target_role, existing_skills)

    # --- NLP HEURISTIC FALLBACKS ---
    @staticmethod
    def _fallback_ats_analysis(resume_text, target_role):
        text = resume_text.lower()
        role = target_role.lower()
        
        # Industry standard skill matrices for target roles
        role_skills_map = {
            "full stack developer": ["react", "node", "python", "javascript", "express", "sql", "git", "rest api", "html", "css", "docker"],
            "frontend developer": ["react", "javascript", "typescript", "tailwind", "html", "css", "redux", "git", "jest", "vite"],
            "backend developer": ["python", "java", "node", "express", "flask", "django", "sql", "mongodb", "postgresql", "rest api", "docker"],
            "data scientist": ["python", "pandas", "numpy", "scikit-learn", "sql", "tableau", "machine learning", "statistics", "r"],
            "software engineer": ["python", "java", "c++", "data structures", "algorithms", "sql", "git", "system design", "rest api"]
        }
        
        expected_skills = role_skills_map.get(role, role_skills_map["software engineer"])
        found_skills = [skill for skill in expected_skills if skill in text]
        missing_skills = [skill for skill in expected_skills if skill not in text]
        
        base_score = 40
        if len(text) > 300: base_score += 15
        if len(text) > 800: base_score += 10
        if "education" in text or "university" in text or "b.tech" in text: base_score += 10
        if "project" in text or "developed" in text or "built" in text: base_score += 10
        if "github" in text or "linkedin" in text: base_score += 5
        
        skill_ratio = len(found_skills) / max(len(expected_skills), 1)
        final_score = min(100, int(base_score + (skill_ratio * 20)))
        
        return {
            "ats_score": final_score,
            "missing_skills": [s.title() for s in missing_skills[:5]],
            "strengths": [
                f"Contains key domain terms ({', '.join([s.title() for s in found_skills[:3]]) or 'General tech skills'})",
                "Includes clear contact and education references",
                "Clear project-oriented experience descriptions"
            ],
            "weaknesses": [
                f"Lacks explicit mentions of {', '.join([s.title() for s in missing_skills[:2]]) if missing_skills else 'cloud DevOps tools'}",
                "Quantifiable metric impact (e.g. % performance increase) could be stronger",
                "Action verbs in bullet points need strengthening"
            ],
            "improvement_tips": [
                f"Incorporate key target keywords like {', '.join([s.title() for s in missing_skills[:3]])}",
                "Add metrics to your project achievements (e.g. 'Improved efficiency by 25%')",
                "Ensure standard sections: Summary, Technical Skills, Projects, Education"
            ],
            "summary": f"Your resume scores {final_score}/100 ATS match for {target_role}. Adding missing domain keywords will boost your visibility to recruiters."
        }

    @staticmethod
    def _fallback_job_match(student_skills, resume_text, job_requirements):
        reqs = [r.strip().lower() for r in job_requirements.replace('\n', ',').split(',') if r.strip()]
        user_skills_lower = [s.lower() for s in student_skills]
        resume_lower = resume_text.lower()
        
        matched = []
        missing = []
        for req in reqs:
            if any(req in s or s in req for s in user_skills_lower) or req in resume_lower:
                matched.append(req.title())
            else:
                missing.append(req.title())
                
        total = max(len(reqs), 1)
        match_pct = int((len(matched) / total) * 100)
        
        return {
            "match_percentage": max(20, min(95, match_pct if reqs else 70)),
            "matching_skills": matched if matched else [s.title() for s in student_skills[:4]],
            "missing_skills": missing[:4] if missing else ["Docker", "Kubernetes"],
            "recommendation": f"Candidate aligns well with {match_pct}% match. Review missing skills to improve eligibility."
        }

    @staticmethod
    def _fallback_interview_eval(user_answer):
        ans_len = len(user_answer.strip())
        if ans_len < 10:
            score = 30
            feedback = "Answer is too short. Try to elaborate on technical concepts and provide concrete examples using the STAR method."
            suggested = "Expand your explanation by defining key concepts, giving practical project examples, and discussing edge cases."
        elif ans_len < 50:
            score = 65
            feedback = "Good direct answer, but missing in-depth explanation and practical execution details."
            suggested = "Provide technical details on implementation, complexity considerations, and trade-offs."
        else:
            score = 88
            feedback = "Excellent response! Clear structure, sound technical knowledge, and good communication style."
            suggested = "Maintain this clarity! You can also mention production metrics or team collaboration context."
            
        return {
            "score": score,
            "feedback": feedback,
            "suggested_improvement": suggested
        }

    @staticmethod
    def _fallback_career_roadmap(target_role, existing_skills):
        skills_set = {s.lower() for s in existing_skills}
        
        milestones = [
            {
                "step": 1,
                "title": "Core Computer Science Fundamentals",
                "description": "Master Data Structures, Algorithms, Object-Oriented Programming, and Database concepts.",
                "estimated_weeks": 4,
                "recommended_topics": ["Arrays & Strings", "Trees & Graphs", "SQL Queries", "OOP Concepts"],
                "status": "completed" if "python" in skills_set or "java" in skills_set or "sql" in skills_set else "completed"
            },
            {
                "step": 2,
                "title": f"Essential {target_role} Skillset",
                "description": "Build fluency in modern frameworks, libraries, and design patterns required for the role.",
                "estimated_weeks": 6,
                "recommended_topics": ["React.js", "Flask / Node.js API", "State Management", "Tailwind CSS"],
                "status": "completed" if "react" in skills_set or "flask" in skills_set else "pending"
            },
            {
                "step": 3,
                "title": "Full-Stack Project Development",
                "description": "Construct 2 production-grade applications featuring JWT auth, DB integration, and AI APIs.",
                "estimated_weeks": 5,
                "recommended_topics": ["RESTful APIs", "JWT Security", "Database Schema Design", "Git Workflow"],
                "status": "pending"
            },
            {
                "step": 4,
                "title": "Mock Interview & Placement Preparation",
                "description": "Practice system design, timed aptitude tests, and AI technical & HR mock interviews.",
                "estimated_weeks": 3,
                "recommended_topics": ["System Design Basics", "STAR Technique", "Timed Quizzes", "ATS Optimization"],
                "status": "pending"
            },
            {
                "step": 5,
                "title": "Job Applications & Portfolio Launch",
                "description": "Publish live portfolio, optimize LinkedIn/GitHub profiles, and apply for target placements.",
                "estimated_weeks": 2,
                "recommended_topics": ["Portfolio Website", "Cold Emailing", "Interview Tracking", "Offer Negotiation"],
                "status": "pending"
            }
        ]
        return milestones
