from app.models.schema import (
    StudentProfile, DsaProblem, DsaSubmission, 
    AptitudeTestResult, MockInterview
)

class ReadinessService:
    @staticmethod
    def calculate_readiness_score(user_id):
        """
        Calculates student's Placement Readiness Score (0-100) and returns radar chart breakdown.
        Weights:
        - Profile Completeness: 15%
        - ATS Resume Score: 20%
        - DSA Progress: 25%
        - Aptitude Accuracy: 20%
        - Mock Interview Performance: 20%
        """
        profile = StudentProfile.query.filter_by(user_id=user_id).first()
        
        # 1. Profile Completeness (0-100)
        profile_score = 0
        if profile:
            if profile.headline: profile_score += 15
            if profile.bio: profile_score += 15
            if profile.target_role: profile_score += 10
            if profile.phone: profile_score += 10
            if profile.github_url or profile.linkedin_url: profile_score += 10
            if len(profile.education) > 0: profile_score += 15
            if len(profile.skills) > 0: profile_score += 15
            if len(profile.projects) > 0: profile_score += 10
        profile_score = min(100, profile_score)
        
        # 2. ATS Resume Score (0-100)
        ats_score = profile.ats_score if profile else 0
        
        # 3. DSA Progress (0-100)
        total_dsa = DsaProblem.query.count()
        solved_submissions = DsaSubmission.query.filter_by(student_id=user_id, status='Solved').all()
        solved_problem_ids = set(s.problem_id for s in solved_submissions)
        solved_dsa = len(solved_problem_ids)
        dsa_score = int((solved_dsa / max(total_dsa, 1)) * 100) if total_dsa > 0 else (75 if solved_dsa > 0 else 0)
        dsa_score = min(100, dsa_score)
        
        # 4. Aptitude Accuracy (0-100)
        aptitude_results = AptitudeTestResult.query.filter_by(student_id=user_id).all()
        if aptitude_results:
            apt_avg = sum([r.score_percentage for r in aptitude_results]) / len(aptitude_results)
            aptitude_score = int(apt_avg)
        else:
            aptitude_score = 0
            
        # 5. Mock Interview Performance (0-100)
        interviews = MockInterview.query.filter_by(student_id=user_id).all()
        if interviews:
            interview_avg = sum([i.overall_score for i in interviews]) / len(interviews)
            interview_score = int(interview_avg)
        else:
            interview_score = 0

        # Weighted Overall Calculation
        overall_readiness = int(
            (profile_score * 0.15) +
            (ats_score * 0.20) +
            (dsa_score * 0.25) +
            (aptitude_score * 0.20) +
            (interview_score * 0.20)
        )
        
        # Determine status tier
        if overall_readiness >= 80:
            status_tier = "Placement Ready 🚀"
            recommendation = "You are in top placement shape! Keep practicing mock interviews and apply for premium roles."
        elif overall_readiness >= 60:
            status_tier = "Nearly Ready ⚡"
            recommendation = "Great progress! Focus on boosting your ATS score and solving Medium DSA problems."
        else:
            status_tier = "Needs Preparation 📈"
            recommendation = "Build your profile completeness, upload your resume for ATS analysis, and complete practice quizzes."

        return {
            "overall_score": overall_readiness,
            "status_tier": status_tier,
            "recommendation": recommendation,
            "breakdown": {
                "profile": profile_score,
                "ats": ats_score,
                "dsa": dsa_score,
                "aptitude": aptitude_score,
                "interview": interview_score
            },
            "radar_data": [
                {"subject": "Profile Completeness", "A": profile_score, "fullMark": 100},
                {"subject": "Resume ATS", "A": ats_score, "fullMark": 100},
                {"subject": "DSA Skills", "A": dsa_score, "fullMark": 100},
                {"subject": "Aptitude Score", "A": aptitude_score, "fullMark": 100},
                {"subject": "Mock Interview", "A": interview_score, "fullMark": 100}
            ]
        }
