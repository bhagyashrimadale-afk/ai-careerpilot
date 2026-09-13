import json
from app import create_app
from app.models.schema import (
    db, User, StudentProfile, Education, Skill, Project, Certification,
    JobPosting, JobApplication, DsaProblem, DsaSubmission,
    AptitudeCategory, AptitudeQuestion, Notification
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Clearing database tables...")
        db.drop_all()
        db.create_all()

        print("Seeding Users...")
        # 1. Student User
        student = User(name="Alex Rivera", email="student@careerpilot.com", role="student")
        student.set_password("password123")
        db.session.add(student)

        # 2. Recruiter User
        recruiter = User(name="Sarah Jenkins", email="recruiter@techcorp.com", role="recruiter")
        recruiter.set_password("password123")
        db.session.add(recruiter)

        # 3. Admin User
        admin = User(name="Admin User", email="admin@careerpilot.com", role="admin")
        admin.set_password("password123")
        db.session.add(admin)

        db.session.commit()

        print("Seeding Student Profile...")
        profile = StudentProfile(
            user_id=student.id,
            headline="Final Year CS Student | Aspiring Full Stack & AI Engineer",
            target_role="Full Stack Developer",
            bio="Passionate computer science student experienced in building web applications with React, Python, and cloud services. Seeking full-time software engineering roles.",
            phone="+1 (555) 234-5678",
            github_url="https://github.com/alexrivera",
            linkedin_url="https://linkedin.com/in/alexrivera-cs",
            portfolio_url="https://alexrivera.dev",
            resume_text="""
Alex Rivera
Software Engineer | Full Stack & AI Enthusiast
Email: student@careerpilot.com | GitHub: github.com/alexrivera

SUMMARY:
Highly motivated Computer Science student with expertise in React, Flask, REST APIs, MySQL, and Machine Learning integration. Proven track record of developing responsive full-stack applications.

EDUCATION:
B.Tech in Computer Science and Engineering - State University (2022 - 2026) | GPA: 3.8/4.0

TECHNICAL SKILLS:
Languages: Python, JavaScript, SQL, HTML5, CSS3, C++
Frameworks: React.js, Flask, Node.js, Express, Tailwind CSS
Database & Cloud: MySQL, PostgreSQL, SQLite, Git, Docker, REST APIs

PROJECTS:
1. AI Placement Platform: Built a full-stack platform with React, Python Flask, and Gemini API for ATS scoring and mock interviews.
2. Real-time Analytics Dashboard: Built an interactive metrics tracker using Recharts and WebSockets.
""",
            ats_score=85,
            missing_skills=json.dumps(["Docker", "AWS", "TypeScript"]),
            ats_analysis=json.dumps({
                "ats_score": 85,
                "missing_skills": ["Docker", "AWS", "TypeScript"],
                "strengths": [
                    "Strong full-stack tech keywords present",
                    "Clear Education & GPA details",
                    "Structured project section with technical depth"
                ],
                "weaknesses": [
                    "Needs explicit mention of cloud deployment platforms like AWS",
                    "Could quantify project achievements with metrics"
                ],
                "improvement_tips": [
                    "Add cloud tools like Docker or AWS to skills",
                    "Include quantifiable impact metrics in project descriptions"
                ],
                "summary": "Strong candidate resume scoring 85/100 ATS match for Full Stack Developer."
            })
        )
        db.session.add(profile)
        db.session.commit()

        # Add Education, Skills, Projects
        edu = Education(
            profile_id=profile.id,
            institution="State University of Technology",
            degree="B.Tech",
            field_of_study="Computer Science & Engineering",
            start_year="2022",
            end_year="2026",
            grade="3.8 / 4.0"
        )
        db.session.add(edu)

        skills = [
            Skill(profile_id=profile.id, name="React.js", level="Advanced", category="Frontend"),
            Skill(profile_id=profile.id, name="Python", level="Advanced", category="Backend"),
            Skill(profile_id=profile.id, name="Flask", level="Intermediate", category="Backend"),
            Skill(profile_id=profile.id, name="JavaScript", level="Advanced", category="Frontend"),
            Skill(profile_id=profile.id, name="MySQL", level="Intermediate", category="Database"),
            Skill(profile_id=profile.id, name="Git", level="Advanced", category="Tools")
        ]
        db.session.add_all(skills)

        proj1 = Project(
            profile_id=profile.id,
            title="AI Placement & Career Platform",
            description="Full-stack AI platform with ATS Resume scoring, AI job matcher, and automated mock interviews.",
            tech_stack="React, Flask, MySQL, Tailwind CSS, Gemini API",
            repo_url="https://github.com/alexrivera/careerpilot",
            live_url="https://careerpilot.vercel.app"
        )
        db.session.add(proj1)

        cert1 = Certification(
            profile_id=profile.id,
            title="AWS Certified Cloud Practitioner",
            issuer="Amazon Web Services",
            issue_date="2025-08-15",
            credential_url="https://aws.amazon.com/verification"
        )
        db.session.add(cert1)
        db.session.commit()

        print("Seeding Job Postings...")
        jobs = [
            JobPosting(
                recruiter_id=recruiter.id,
                title="Full Stack Software Engineer",
                company="TechCorp Solutions",
                location="San Francisco, CA (Hybrid)",
                type="Full-time",
                salary_range="$95,000 - $125,000 / year",
                description="We are seeking a talented Full Stack Engineer to join our core product team. You will build user-facing web applications using React.js and Python microservices.",
                requirements=json.dumps(["React.js", "Python", "Flask", "MySQL", "REST API", "Git"])
            ),
            JobPosting(
                recruiter_id=recruiter.id,
                title="Frontend Developer (React Specialist)",
                company="Nexus Innovations",
                location="Remote",
                type="Full-time",
                salary_range="$85,000 - $110,000 / year",
                description="Join Nexus to craft slick UI components with React, Vite, and Tailwind CSS. Focus on performance optimization and responsive user experience.",
                requirements=json.dumps(["React.js", "JavaScript", "Tailwind CSS", "Redux", "HTML5", "CSS3"])
            ),
            JobPosting(
                recruiter_id=recruiter.id,
                title="Graduate Software Engineer Intern",
                company="CloudScale Systems",
                location="Austin, TX",
                type="Internship",
                salary_range="$45 / hour",
                description="Great opportunity for graduating students! Work closely with senior engineers building scalable backend services in Python and database architectures.",
                requirements=json.dumps(["Python", "SQL", "Data Structures", "Algorithms", "Git"])
            )
        ]
        db.session.add_all(jobs)
        db.session.commit()

        print("Seeding Job Application...")
        app1 = JobApplication(
            job_id=jobs[0].id,
            student_id=student.id,
            status="Interview",
            notes="Technical interview scheduled for Thursday at 2 PM PST.",
            ai_match_percentage=92,
            match_reasons=json.dumps(["React.js", "Python", "Flask", "MySQL", "REST API"])
        )
        db.session.add(app1)

        print("Seeding DSA Problems...")
        dsa_problems = [
            DsaProblem(
                title="Two Sum",
                topic="Arrays & Hashing",
                difficulty="Easy",
                description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
                constraints="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
                example_input="nums = [2,7,11,15], target = 9",
                example_output="[0, 1]",
                starter_code="def twoSum(nums, target):\n    # Write your solution here\n    hash_map = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in hash_map:\n            return [hash_map[diff], i]\n        hash_map[num] = i\n    return []"
            ),
            DsaProblem(
                title="Longest Substring Without Repeating Characters",
                topic="Sliding Window",
                difficulty="Medium",
                description="Given a string `s`, find the length of the longest substring without repeating characters.",
                constraints="0 <= s.length <= 5 * 10^4",
                example_input="s = 'abcabcbb'",
                example_output="3",
                starter_code="def lengthOfLongestSubstring(s):\n    # Write your sliding window solution here\n    seen = {}\n    left = max_len = 0\n    for right, char in enumerate(s):\n        if char in seen and seen[char] >= left:\n            left = seen[char] + 1\n        seen[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len"
            ),
            DsaProblem(
                title="Reverse a Linked List",
                topic="Linked Lists",
                difficulty="Easy",
                description="Given the head of a singly linked list, reverse the list, and return the reversed list's head.",
                constraints="0 <= Number of nodes <= 5000",
                example_input="head = [1,2,3,4,5]",
                example_output="[5,4,3,2,1]",
                starter_code="def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev"
            ),
            DsaProblem(
                title="Binary Tree Level Order Traversal",
                topic="Trees & BFS",
                difficulty="Medium",
                description="Given the root of a binary tree, return the level order traversal of its nodes' values (from left to right, level by level).",
                constraints="The number of nodes in the tree is in the range [0, 2000].",
                example_input="root = [3,9,20,null,null,15,7]",
                example_output="[[3],[9,20],[15,7]]",
                starter_code="from collections import deque\n\ndef levelOrder(root):\n    if not root: return []\n    res, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        res.append(level)\n    return res"
            )
        ]
        db.session.add_all(dsa_problems)
        db.session.commit()

        # Seed sample DSA submission
        sub1 = DsaSubmission(
            problem_id=dsa_problems[0].id,
            student_id=student.id,
            code=dsa_problems[0].starter_code,
            status="Solved",
            score=100
        )
        db.session.add(sub1)

        print("Seeding Aptitude Categories & Questions...")
        cat1 = AptitudeCategory(name="Quantitative Aptitude", description="Test numerical ability, percentage calculation, ratios, and speed-time math problems.")
        cat2 = AptitudeCategory(name="Logical Reasoning", description="Evaluate analytical thinking, blood relations, syllogisms, and sequence logic.")
        cat3 = AptitudeCategory(name="Verbal Ability", description="Check vocabulary, sentence correction, reading comprehension, and grammar rules.")
        db.session.add_all([cat1, cat2, cat3])
        db.session.commit()

        questions = [
            AptitudeQuestion(
                category_id=cat1.id,
                question_text="A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
                option_a="120 metres",
                option_b="150 metres",
                option_c="180 metres",
                option_d="324 metres",
                correct_option="B",
                explanation="Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres.",
                topic_tag="Speed & Distance"
            ),
            AptitudeQuestion(
                category_id=cat1.id,
                question_text="If 20% of a number is 120, then what is 120% of that number?",
                option_a="360",
                option_b="600",
                option_c="720",
                option_d="840",
                correct_option="C",
                explanation="Let the number be x. 0.20 * x = 120 => x = 600. 120% of 600 = 1.20 * 600 = 720.",
                topic_tag="Percentages"
            ),
            AptitudeQuestion(
                category_id=cat2.id,
                question_text="Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
                option_a="1/3",
                option_b="1/8",
                option_c="2/8",
                option_d="1/16",
                correct_option="B",
                explanation="This is a simple division series. Each number is half of the previous number: 1/4 divided by 2 is 1/8.",
                topic_tag="Number Series"
            ),
            AptitudeQuestion(
                category_id=cat3.id,
                question_text="Select the antonym for 'BENEVOLENT':",
                option_a="Generous",
                option_b="Malevolent",
                option_c="Kind",
                option_d="Compassionate",
                correct_option="B",
                explanation="Benevolent means well-meaning and kindly. Its direct antonym is Malevolent (wishing evil to others).",
                topic_tag="Vocabulary"
            )
        ]
        db.session.add_all(questions)

        print("Seeding Notifications...")
        notifs = [
            Notification(
                user_id=student.id,
                title="Interview Scheduled! 🎉",
                message="TechCorp Solutions has scheduled your technical interview for Thursday at 2:00 PM PST.",
                type="interview"
            ),
            Notification(
                user_id=student.id,
                title="Upcoming Placement Drive 🚀",
                message="Nexus Innovations Campus Placement Drive registration deadline is September 20, 2026.",
                type="drive"
            ),
            Notification(
                user_id=student.id,
                title="Daily Placement Practice",
                message="Complete 1 Medium DSA problem and 1 Quantitative Quiz to boost your Placement Readiness Score!",
                type="reminder"
            )
        ]
        db.session.add_all(notifs)

        db.session.commit()
        print("Database Seeding Completed Successfully! All demo accounts & data initialized.")

if __name__ == '__main__':
    seed_database()
