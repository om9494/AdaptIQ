EDUCATOR1_COURSES = [
    {
        'title': 'AI & Machine Learning Engineer Path',
        'description': 'A structured roadmap into AI and machine learning covering datasets, supervised learning, evaluation, and portfolio-ready delivery.',
        'subject': 'AI/ML',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#14b8a6', 'surface': '#ccfbf1', 'ink': '#0f766e'},
        'video': {
            'title': 'Machine Learning for Everybody - Full Course',
            'url': 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
            'duration_seconds': 1200,
            'difficulty_score': 0.45,
            'concept_tags': ['machine_learning', 'datasets', 'modeling'],
            'description': 'Start with a guided overview of machine learning concepts, terminology, and the end-to-end model-building workflow.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Problem Framing and Dataset Thinking',
                'duration_seconds': 480,
                'difficulty_score': 0.4,
                'concept_tags': ['problem_framing', 'labels', 'datasets'],
                'description': 'Learn how to convert business needs into ML problems, define labels clearly, and identify the right training data.'
            },
            {
                'title': 'Path Step 2: Feature Engineering and Evaluation',
                'duration_seconds': 540,
                'difficulty_score': 0.5,
                'concept_tags': ['features', 'metrics', 'validation'],
                'description': 'Understand how features are prepared, why train-validation-test splits matter, and how to choose useful evaluation metrics.'
            },
            {
                'title': 'Path Step 3: Shipping a Beginner ML Portfolio Project',
                'duration_seconds': 600,
                'difficulty_score': 0.58,
                'concept_tags': ['portfolio', 'deployment', 'iteration'],
                'description': 'Map out a simple ML project from notebook to demo, including documentation, iteration loops, and stakeholder communication.'
            }
        ],
        'gamification': {
            'track_name': 'Model Builder Track',
            'xp_per_lesson': 45,
            'streak_bonus_xp': 18,
            'weekly_quest': 'Complete two modules and log one new model insight.',
            'final_boss': 'Ship a mini ML case-study recap.',
            'milestones': [
                {'threshold': 25, 'badge': 'Data Scout', 'xp': 60},
                {'threshold': 50, 'badge': 'Feature Crafter', 'xp': 90},
                {'threshold': 75, 'badge': 'Model Tuner', 'xp': 120},
                {'threshold': 100, 'badge': 'AI Pathfinder', 'xp': 180},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student2@adaptiq.com', 'student3@adaptiq.com']
    },
    {
        'title': 'DevOps Foundations with Docker and CI/CD',
        'description': 'A hands-on introduction to DevOps workflows with containers, deployment pipelines, release confidence, and operational collaboration.',
        'subject': 'DevOps',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#3b82f6', 'surface': '#dbeafe', 'ink': '#1d4ed8'},
        'video': {
            'title': 'Docker Tutorial for Beginners - A Full DevOps Course',
            'url': 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
            'duration_seconds': 1080,
            'difficulty_score': 0.5,
            'concept_tags': ['docker', 'containers', 'devops'],
            'description': 'Build DevOps intuition by understanding containers, images, registries, and the workflow from development to deployment.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: DevOps Culture, Flow, and Ownership',
                'duration_seconds': 420,
                'difficulty_score': 0.38,
                'concept_tags': ['devops_culture', 'collaboration', 'feedback_loops'],
                'description': 'Explore how DevOps connects developers and operations teams through automation, faster feedback, and shared service ownership.'
            },
            {
                'title': 'Path Step 2: CI/CD Pipelines that Teams Trust',
                'duration_seconds': 540,
                'difficulty_score': 0.52,
                'concept_tags': ['ci_cd', 'testing', 'release_automation'],
                'description': 'Learn how build, test, and deploy stages work together to reduce release risk and keep delivery predictable.'
            },
            {
                'title': 'Path Step 3: Environment Promotion and Observability',
                'duration_seconds': 600,
                'difficulty_score': 0.58,
                'concept_tags': ['staging', 'monitoring', 'incident_response'],
                'description': 'Understand promotion across dev, staging, and production environments, plus the monitoring signals teams rely on after release.'
            }
        ],
        'gamification': {
            'track_name': 'Pipeline Pilot Track',
            'xp_per_lesson': 42,
            'streak_bonus_xp': 20,
            'weekly_quest': 'Automate one workflow and capture a before/after note.',
            'final_boss': 'Design a release checklist for a production service.',
            'milestones': [
                {'threshold': 25, 'badge': 'Container Cadet', 'xp': 55},
                {'threshold': 50, 'badge': 'Pipeline Runner', 'xp': 85},
                {'threshold': 75, 'badge': 'Ops Guardian', 'xp': 115},
                {'threshold': 100, 'badge': 'DevOps Vanguard', 'xp': 170},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student4@adaptiq.com', 'student5@adaptiq.com']
    },
    {
        'title': 'AWS Cloud Practitioner Launch Path',
        'description': 'A beginner-friendly cloud roadmap introducing AWS services, architecture basics, security, and cost-aware deployment thinking.',
        'subject': 'Cloud Computing',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#f97316', 'surface': '#ffedd5', 'ink': '#c2410c'},
        'video': {
            'title': 'AWS Certified Cloud Practitioner Certification Course',
            'url': 'https://www.youtube.com/watch?v=NhDYbskXRgc',
            'duration_seconds': 960,
            'difficulty_score': 0.4,
            'concept_tags': ['aws', 'cloud_basics', 'shared_responsibility'],
            'description': 'Get introduced to the AWS ecosystem, core services, terminology, and the mindset required to reason about cloud systems.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Regions, Availability Zones, and Global Services',
                'duration_seconds': 420,
                'difficulty_score': 0.34,
                'concept_tags': ['regions', 'availability_zones', 'resilience'],
                'description': 'Learn how AWS infrastructure is organized and why region and zone design choices affect uptime and latency.'
            },
            {
                'title': 'Path Step 2: Compute, Storage, and Databases',
                'duration_seconds': 540,
                'difficulty_score': 0.42,
                'concept_tags': ['ec2', 's3', 'rds'],
                'description': 'Compare the foundational building blocks of cloud applications and understand when to reach for compute, object storage, or managed databases.'
            },
            {
                'title': 'Path Step 3: Identity, Billing, and Cost Hygiene',
                'duration_seconds': 600,
                'difficulty_score': 0.48,
                'concept_tags': ['iam', 'billing', 'cost_optimization'],
                'description': 'Cover practical cloud hygiene around identity management, least privilege, pricing awareness, and budget guardrails.'
            }
        ],
        'gamification': {
            'track_name': 'Cloud Lift-Off Track',
            'xp_per_lesson': 38,
            'streak_bonus_xp': 16,
            'weekly_quest': 'Sketch one cloud architecture and explain its tradeoffs.',
            'final_boss': 'Create a cloud readiness cheat sheet for beginners.',
            'milestones': [
                {'threshold': 25, 'badge': 'Zone Explorer', 'xp': 50},
                {'threshold': 50, 'badge': 'Service Mapper', 'xp': 80},
                {'threshold': 75, 'badge': 'Cost Keeper', 'xp': 110},
                {'threshold': 100, 'badge': 'Cloud Navigator', 'xp': 160},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student6@adaptiq.com', 'student7@adaptiq.com']
    },
    {
        'title': 'Data Structures & Algorithms Interview Path',
        'description': 'A complete DSA track for aspiring software engineers focused on arrays, linked structures, recursion, graph thinking, and interview readiness.',
        'subject': 'Data Structures & Algorithms',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#8b5cf6', 'surface': '#ede9fe', 'ink': '#6d28d9'},
        'video': {
            'title': 'Algorithms and Data Structures Tutorial - Full Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=8hly31xKli0',
            'duration_seconds': 1020,
            'difficulty_score': 0.52,
            'concept_tags': ['arrays', 'linked_lists', 'time_complexity'],
            'description': 'Work through foundational data structures and algorithm patterns that appear across interviews and production code.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Big O, Tradeoffs, and Mental Models',
                'duration_seconds': 450,
                'difficulty_score': 0.45,
                'concept_tags': ['big_o', 'tradeoffs', 'performance'],
                'description': 'Build intuition for runtime and space complexity so you can compare solutions instead of memorizing them mechanically.'
            },
            {
                'title': 'Path Step 2: Trees, Graphs, and Traversal Strategy',
                'duration_seconds': 570,
                'difficulty_score': 0.58,
                'concept_tags': ['trees', 'graphs', 'bfs_dfs'],
                'description': 'See how hierarchical and network-shaped problems are modeled and solved using depth-first and breadth-first approaches.'
            },
            {
                'title': 'Path Step 3: Interview Patterns and Practice Loops',
                'duration_seconds': 600,
                'difficulty_score': 0.62,
                'concept_tags': ['patterns', 'interview_practice', 'problem_solving'],
                'description': 'Turn raw topic knowledge into repeatable interview performance with pattern grouping, explanation habits, and post-problem reviews.'
            }
        ],
        'gamification': {
            'track_name': 'Interview Arena Track',
            'xp_per_lesson': 48,
            'streak_bonus_xp': 18,
            'weekly_quest': 'Solve one problem aloud and capture your reasoning.',
            'final_boss': 'Complete a timed mock interview review.',
            'milestones': [
                {'threshold': 25, 'badge': 'Complexity Scout', 'xp': 60},
                {'threshold': 50, 'badge': 'Traversal Runner', 'xp': 90},
                {'threshold': 75, 'badge': 'Pattern Hunter', 'xp': 125},
                {'threshold': 100, 'badge': 'Algorithm Ace', 'xp': 185},
            ]
        },
        'student_emails': ['student3@adaptiq.com', 'student5@adaptiq.com', 'student8@adaptiq.com']
    },
    {
        'title': 'SQL and Relational Database Developer Path',
        'description': 'A practical database course focused on SQL fluency, schema design, joins, data quality, and backend-friendly modeling decisions.',
        'subject': 'Databases',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#0ea5e9', 'surface': '#e0f2fe', 'ink': '#0369a1'},
        'video': {
            'title': 'SQL Tutorial - Full Database Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            'duration_seconds': 900,
            'difficulty_score': 0.38,
            'concept_tags': ['sql', 'databases', 'queries'],
            'description': 'Build hands-on SQL fluency by learning to query, filter, aggregate, and reason about relational data.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Modeling Entities, Keys, and Relationships',
                'duration_seconds': 420,
                'difficulty_score': 0.34,
                'concept_tags': ['entity_modeling', 'primary_keys', 'foreign_keys'],
                'description': 'Start with schema thinking so tables, keys, and relationships stay clear before query complexity grows.'
            },
            {
                'title': 'Path Step 2: Joins, Aggregation, and Reporting Logic',
                'duration_seconds': 540,
                'difficulty_score': 0.42,
                'concept_tags': ['joins', 'group_by', 'reporting'],
                'description': 'Learn how to combine tables correctly, summarize data, and produce reliable outputs for dashboards and product features.'
            },
            {
                'title': 'Path Step 3: Constraints, Indexing, and Backend Readiness',
                'duration_seconds': 600,
                'difficulty_score': 0.5,
                'concept_tags': ['constraints', 'indexing', 'transactions'],
                'description': 'Strengthen your database design with indexing, data integrity rules, and the transaction thinking needed for backend systems.'
            }
        ],
        'gamification': {
            'track_name': 'Query Quest Track',
            'xp_per_lesson': 40,
            'streak_bonus_xp': 14,
            'weekly_quest': 'Refactor one query for clarity and speed.',
            'final_boss': 'Design a schema card for a realistic product flow.',
            'milestones': [
                {'threshold': 25, 'badge': 'Schema Scout', 'xp': 45},
                {'threshold': 50, 'badge': 'Join Juggler', 'xp': 75},
                {'threshold': 75, 'badge': 'Report Smith', 'xp': 105},
                {'threshold': 100, 'badge': 'Database Defender', 'xp': 155},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student7@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Python Developer Foundations Path',
        'description': 'A beginner-to-builder Python course covering syntax, control flow, reusable functions, and project-ready coding habits.',
        'subject': 'Programming',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#22c55e', 'surface': '#dcfce7', 'ink': '#15803d'},
        'video': {
            'title': 'Learn Python - Full Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            'duration_seconds': 900,
            'difficulty_score': 0.34,
            'concept_tags': ['python', 'syntax', 'variables'],
            'description': 'Start coding in Python by learning the core language features that support scripting, automation, and application development.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Variables, Types, and Clean Input Handling',
                'duration_seconds': 420,
                'difficulty_score': 0.28,
                'concept_tags': ['variables', 'types', 'input_output'],
                'description': 'Practice storing data, converting types safely, and working with user input in a way that prevents beginner mistakes.'
            },
            {
                'title': 'Path Step 2: Conditions, Loops, and Basic Automation',
                'duration_seconds': 510,
                'difficulty_score': 0.36,
                'concept_tags': ['conditions', 'loops', 'automation'],
                'description': 'Use Python control flow to automate repetitive work and design simple logic for realistic beginner projects.'
            },
            {
                'title': 'Path Step 3: Functions, Modules, and Project Structure',
                'duration_seconds': 600,
                'difficulty_score': 0.44,
                'concept_tags': ['functions', 'modules', 'project_structure'],
                'description': 'Organize Python code into reusable functions and clean files so your scripts scale beyond one-off experiments.'
            }
        ],
        'gamification': {
            'track_name': 'Builder Sprint Track',
            'xp_per_lesson': 36,
            'streak_bonus_xp': 12,
            'weekly_quest': 'Automate one tiny daily task and write down the win.',
            'final_boss': 'Ship a command-line helper concept sketch.',
            'milestones': [
                {'threshold': 25, 'badge': 'Syntax Starter', 'xp': 40},
                {'threshold': 50, 'badge': 'Loop Runner', 'xp': 70},
                {'threshold': 75, 'badge': 'Function Forger', 'xp': 100},
                {'threshold': 100, 'badge': 'Python Pathfinder', 'xp': 150},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student4@adaptiq.com', 'student10@adaptiq.com']
    },
    {
        'title': 'JavaScript Frontend Developer Path',
        'description': 'A focused JavaScript learning path for interactive web apps, covering language fundamentals, DOM work, and browser-side thinking.',
        'subject': 'Frontend Development',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#f59e0b', 'surface': '#fef3c7', 'ink': '#b45309'},
        'video': {
            'title': 'Learn JavaScript - Full Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            'duration_seconds': 930,
            'difficulty_score': 0.36,
            'concept_tags': ['javascript', 'dom', 'web_apps'],
            'description': 'Build a JavaScript foundation that supports frontend development, interactivity, and modern web application logic.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Variables, Arrays, and Object Thinking',
                'duration_seconds': 420,
                'difficulty_score': 0.32,
                'concept_tags': ['variables', 'arrays', 'objects'],
                'description': 'Understand how JavaScript stores and shapes data so you can build stateful interfaces without confusion.'
            },
            {
                'title': 'Path Step 2: Functions, Events, and DOM Updates',
                'duration_seconds': 540,
                'difficulty_score': 0.42,
                'concept_tags': ['functions', 'events', 'dom'],
                'description': 'Connect user interactions to application behavior by wiring up functions, event listeners, and DOM updates deliberately.'
            },
            {
                'title': 'Path Step 3: Async Fetching and Component-Style Thinking',
                'duration_seconds': 600,
                'difficulty_score': 0.48,
                'concept_tags': ['async', 'fetch', 'state_management'],
                'description': 'Move from static pages to app-like behavior by learning asynchronous requests, loading states, and UI composition patterns.'
            }
        ],
        'gamification': {
            'track_name': 'Interface Crafter Track',
            'xp_per_lesson': 39,
            'streak_bonus_xp': 15,
            'weekly_quest': 'Rebuild one small interaction with cleaner state handling.',
            'final_boss': 'Storyboard a polished component interaction.',
            'milestones': [
                {'threshold': 25, 'badge': 'DOM Diver', 'xp': 48},
                {'threshold': 50, 'badge': 'Event Tamer', 'xp': 78},
                {'threshold': 75, 'badge': 'Async Ace', 'xp': 108},
                {'threshold': 100, 'badge': 'Frontend Flame', 'xp': 158},
            ]
        },
        'student_emails': ['student3@adaptiq.com', 'student6@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Git & GitHub Collaboration Path',
        'description': 'A developer workflow course for mastering version control, team collaboration, branching habits, and pull request confidence.',
        'subject': 'Developer Tools',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#ef4444', 'surface': '#fee2e2', 'ink': '#b91c1c'},
        'video': {
            'title': 'Git and GitHub for Beginners - Crash Course',
            'url': 'https://www.youtube.com/watch?v=RGOj5yH7evk',
            'duration_seconds': 840,
            'difficulty_score': 0.3,
            'concept_tags': ['git', 'github', 'version_control'],
            'description': 'Learn the Git workflow that powers team development, including repositories, commits, remotes, and collaboration basics.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Commits that Tell a Clear Story',
                'duration_seconds': 360,
                'difficulty_score': 0.28,
                'concept_tags': ['commits', 'history', 'developer_hygiene'],
                'description': 'Practice writing meaningful commits and keeping history understandable for teammates, reviewers, and future debugging.'
            },
            {
                'title': 'Path Step 2: Branching, Merging, and Conflict Recovery',
                'duration_seconds': 480,
                'difficulty_score': 0.4,
                'concept_tags': ['branches', 'merge', 'conflicts'],
                'description': 'Understand safe collaboration patterns for parallel work, merge handling, and recovering from common Git mistakes.'
            },
            {
                'title': 'Path Step 3: Pull Requests, Reviews, and Release Discipline',
                'duration_seconds': 540,
                'difficulty_score': 0.46,
                'concept_tags': ['pull_requests', 'code_review', 'release_flow'],
                'description': 'Turn Git basics into team readiness by using pull requests well, responding to review feedback, and keeping release branches healthy.'
            }
        ],
        'gamification': {
            'track_name': 'Collaboration Cadence Track',
            'xp_per_lesson': 34,
            'streak_bonus_xp': 13,
            'weekly_quest': 'Clean up one branch flow and summarize the lesson learned.',
            'final_boss': 'Write a release-ready PR plan for a feature rollout.',
            'milestones': [
                {'threshold': 25, 'badge': 'Commit Scout', 'xp': 42},
                {'threshold': 50, 'badge': 'Merge Marshal', 'xp': 72},
                {'threshold': 75, 'badge': 'Review Ranger', 'xp': 102},
                {'threshold': 100, 'badge': 'Workflow Captain', 'xp': 148},
            ]
        },
        'student_emails': ['student4@adaptiq.com', 'student8@adaptiq.com', 'student10@adaptiq.com']
    },
    {
        'title': 'Linear Algebra for AI Builders Path',
        'description': 'A math-for-ML course that translates vectors, matrices, and transformations into intuition for machine learning systems.',
        'subject': 'Mathematics for AI',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#a855f7', 'surface': '#f3e8ff', 'ink': '#7e22ce'},
        'video': {
            'title': 'Linear Transformations and Matrices - Essence of Linear Algebra',
            'url': 'https://www.youtube.com/watch?v=kYB8IZa5AuE',
            'duration_seconds': 660,
            'difficulty_score': 0.5,
            'concept_tags': ['linear_algebra', 'matrices', 'transformations'],
            'description': 'Use geometric intuition to understand how matrices transform space and why that matters in modern AI systems.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Vectors, Direction, and Feature Space',
                'duration_seconds': 420,
                'difficulty_score': 0.42,
                'concept_tags': ['vectors', 'direction', 'feature_space'],
                'description': 'Develop a practical feel for vectors as feature containers and directional objects used throughout machine learning.'
            },
            {
                'title': 'Path Step 2: Matrix Multiplication as Information Mixing',
                'duration_seconds': 540,
                'difficulty_score': 0.54,
                'concept_tags': ['matrix_multiplication', 'dot_product', 'projections'],
                'description': 'Connect the mechanics of matrix multiplication to feature mixing, projections, and the computations inside learned models.'
            },
            {
                'title': 'Path Step 3: Eigen Thinking and Optimization Intuition',
                'duration_seconds': 600,
                'difficulty_score': 0.6,
                'concept_tags': ['eigenvectors', 'optimization', 'dimensionality'],
                'description': 'Get a beginner-friendly introduction to the matrix ideas that appear later in PCA, optimization, and representation learning.'
            }
        ],
        'gamification': {
            'track_name': 'Vector Voyage Track',
            'xp_per_lesson': 44,
            'streak_bonus_xp': 17,
            'weekly_quest': 'Explain one matrix idea using a sketch or metaphor.',
            'final_boss': 'Create a concept sheet linking math to model behavior.',
            'milestones': [
                {'threshold': 25, 'badge': 'Vector Scout', 'xp': 58},
                {'threshold': 50, 'badge': 'Matrix Maker', 'xp': 88},
                {'threshold': 75, 'badge': 'Projection Pilot', 'xp': 118},
                {'threshold': 100, 'badge': 'Linear Legend', 'xp': 176},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student5@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Programming Fundamentals and Problem Solving Path',
        'description': 'A broad computer science starter path designed to help beginners reason clearly, break down problems, and build software confidence.',
        'subject': 'Computer Science',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator1@adaptiq.com',
        'theme': {'accent': '#06b6d4', 'surface': '#cffafe', 'ink': '#0e7490'},
        'video': {
            'title': 'Introduction to Programming and Computer Science - Full Course',
            'url': 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
            'duration_seconds': 780,
            'difficulty_score': 0.32,
            'concept_tags': ['computer_science', 'programming', 'problem_solving'],
            'description': 'Build broad confidence in the mental models behind programming, debugging, abstraction, and computational thinking.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Breaking Problems into Small Steps',
                'duration_seconds': 360,
                'difficulty_score': 0.24,
                'concept_tags': ['decomposition', 'logic', 'workflow'],
                'description': 'Practice the core habit behind every technical role: decomposing a vague task into clear, testable implementation steps.'
            },
            {
                'title': 'Path Step 2: Debugging as a Repeatable Process',
                'duration_seconds': 420,
                'difficulty_score': 0.3,
                'concept_tags': ['debugging', 'hypotheses', 'inspection'],
                'description': 'Learn a calm debugging workflow built on observation, hypothesis testing, and narrowing the search space deliberately.'
            },
            {
                'title': 'Path Step 3: From Practice Tasks to Real Projects',
                'duration_seconds': 540,
                'difficulty_score': 0.38,
                'concept_tags': ['projects', 'scope', 'iteration'],
                'description': 'Turn isolated exercises into meaningful project work by choosing scope wisely, documenting decisions, and iterating in public.'
            }
        ],
        'gamification': {
            'track_name': 'Core Logic Track',
            'xp_per_lesson': 35,
            'streak_bonus_xp': 11,
            'weekly_quest': 'Break one messy problem into a cleaner action list.',
            'final_boss': 'Design a small project brief with success checkpoints.',
            'milestones': [
                {'threshold': 25, 'badge': 'Logic Scout', 'xp': 40},
                {'threshold': 50, 'badge': 'Debugger', 'xp': 68},
                {'threshold': 75, 'badge': 'Project Planner', 'xp': 96},
                {'threshold': 100, 'badge': 'Problem Solver', 'xp': 142},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student6@adaptiq.com', 'student10@adaptiq.com']
    },
]


EDUCATOR2_COURSES = [
    {
        'title': 'React Product Engineering Path',
        'description': 'A modern React path covering component architecture, hooks, state flow, and shipping interactive product experiences with confidence.',
        'subject': 'React Development',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#38bdf8', 'surface': '#e0f2fe', 'ink': '#0369a1'},
        'video': {
            'title': 'React Course - Beginner\'s Tutorial for React JavaScript Library',
            'url': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            'duration_seconds': 1080,
            'difficulty_score': 0.48,
            'concept_tags': ['react', 'components', 'hooks'],
            'description': 'Learn React from the ground up by understanding JSX, props, state, hooks, and how product UIs are composed.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Component Boundaries and Reusability',
                'duration_seconds': 420,
                'difficulty_score': 0.42,
                'concept_tags': ['components', 'props', 'reusability'],
                'description': 'See how clean component boundaries help teams build faster and keep product interfaces maintainable.'
            },
            {
                'title': 'Path Step 2: State, Events, and Rendering Decisions',
                'duration_seconds': 540,
                'difficulty_score': 0.5,
                'concept_tags': ['state', 'events', 'rendering'],
                'description': 'Understand how state changes drive user experience and how to keep interactions predictable.'
            },
            {
                'title': 'Path Step 3: Product Flows, Async UX, and Polish',
                'duration_seconds': 600,
                'difficulty_score': 0.58,
                'concept_tags': ['async_ui', 'loading_states', 'product_polish'],
                'description': 'Translate React knowledge into polished product flows with resilient loading, feedback, and empty states.'
            }
        ],
        'gamification': {
            'track_name': 'UI Forge Track',
            'xp_per_lesson': 46,
            'streak_bonus_xp': 18,
            'weekly_quest': 'Refactor one interface into smaller reusable parts.',
            'final_boss': 'Pitch a polished feature flow using React patterns.',
            'milestones': [
                {'threshold': 25, 'badge': 'JSX Scout', 'xp': 62},
                {'threshold': 50, 'badge': 'Hook Handler', 'xp': 92},
                {'threshold': 75, 'badge': 'State Strategist', 'xp': 126},
                {'threshold': 100, 'badge': 'React Ranger', 'xp': 186},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student4@adaptiq.com', 'student8@adaptiq.com']
    },
    {
        'title': 'Node.js API Engineering Path',
        'description': 'A backend engineering path for building APIs with Node.js and Express, centered on routing, middleware, data flow, and maintainable services.',
        'subject': 'Backend Development',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#22c55e', 'surface': '#dcfce7', 'ink': '#166534'},
        'video': {
            'title': 'Node.js and Express.js - Full Course',
            'url': 'https://www.youtube.com/watch?v=Oe421EPjeBE',
            'duration_seconds': 1020,
            'difficulty_score': 0.5,
            'concept_tags': ['nodejs', 'express', 'apis'],
            'description': 'Build a backend foundation in Node.js and Express, from server basics to structured API design.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Routing, Controllers, and Request Lifecycles',
                'duration_seconds': 420,
                'difficulty_score': 0.44,
                'concept_tags': ['routing', 'controllers', 'request_lifecycle'],
                'description': 'Learn how requests move through an API and how to organize backend code so growth stays manageable.'
            },
            {
                'title': 'Path Step 2: Middleware, Validation, and Error Design',
                'duration_seconds': 540,
                'difficulty_score': 0.52,
                'concept_tags': ['middleware', 'validation', 'error_handling'],
                'description': 'Create reliable APIs by validating inputs early and designing errors that are useful to both users and developers.'
            },
            {
                'title': 'Path Step 3: Service Boundaries and Production Thinking',
                'duration_seconds': 600,
                'difficulty_score': 0.6,
                'concept_tags': ['service_layers', 'production_readiness', 'api_design'],
                'description': 'Move from tutorial APIs to maintainable services with cleaner boundaries, observability, and deployment awareness.'
            }
        ],
        'gamification': {
            'track_name': 'API Architect Track',
            'xp_per_lesson': 47,
            'streak_bonus_xp': 19,
            'weekly_quest': 'Map one request flow end to end and note failure points.',
            'final_boss': 'Design a clean API contract for a real feature.',
            'milestones': [
                {'threshold': 25, 'badge': 'Route Runner', 'xp': 58},
                {'threshold': 50, 'badge': 'Middleware Maker', 'xp': 90},
                {'threshold': 75, 'badge': 'Validation Vanguard', 'xp': 124},
                {'threshold': 100, 'badge': 'Service Sentinel', 'xp': 188},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student5@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Flutter Mobile App Builder Path',
        'description': 'A cross-platform mobile path focused on Flutter widgets, layout, state handling, and shipping polished app experiences on iOS and Android.',
        'subject': 'Mobile Development',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#0ea5e9', 'surface': '#e0f2fe', 'ink': '#075985'},
        'video': {
            'title': 'Flutter Course for Beginners - 37-hour Cross Platform App Development Tutorial',
            'url': 'https://www.youtube.com/watch?v=VPvVD8t02U8',
            'duration_seconds': 1140,
            'difficulty_score': 0.52,
            'concept_tags': ['flutter', 'widgets', 'mobile_apps'],
            'description': 'Start building cross-platform applications by learning Flutter widgets, layout systems, and app structure.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Widget Trees and Screen Composition',
                'duration_seconds': 420,
                'difficulty_score': 0.46,
                'concept_tags': ['widget_tree', 'composition', 'layouts'],
                'description': 'Understand how Flutter composes screens so you can structure interfaces without fighting the framework.'
            },
            {
                'title': 'Path Step 2: State, Navigation, and User Journeys',
                'duration_seconds': 540,
                'difficulty_score': 0.54,
                'concept_tags': ['state_management', 'navigation', 'user_flows'],
                'description': 'Connect screens into usable mobile journeys with clean state updates and navigation design.'
            },
            {
                'title': 'Path Step 3: Mobile Polish, Performance, and Delivery',
                'duration_seconds': 600,
                'difficulty_score': 0.6,
                'concept_tags': ['performance', 'mobile_polish', 'release_flow'],
                'description': 'Learn the mobile-specific details that make apps feel intentional, smooth, and ready for release.'
            }
        ],
        'gamification': {
            'track_name': 'Mobile Momentum Track',
            'xp_per_lesson': 44,
            'streak_bonus_xp': 18,
            'weekly_quest': 'Storyboard one mobile flow with delight moments.',
            'final_boss': 'Prototype a mini app launch sequence.',
            'milestones': [
                {'threshold': 25, 'badge': 'Widget Walker', 'xp': 56},
                {'threshold': 50, 'badge': 'Flow Finder', 'xp': 86},
                {'threshold': 75, 'badge': 'State Shaper', 'xp': 118},
                {'threshold': 100, 'badge': 'Flutter Finisher', 'xp': 178},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student6@adaptiq.com', 'student10@adaptiq.com']
    },
    {
        'title': 'Linux and Shell Automation Path',
        'description': 'A practical Linux path for command-line fluency, shell navigation, scripting basics, and automation habits used by engineers every day.',
        'subject': 'Operating Systems',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#64748b', 'surface': '#e2e8f0', 'ink': '#334155'},
        'video': {
            'title': 'Linux Operating System - Crash Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=sWbUDq4S6Y8',
            'duration_seconds': 840,
            'difficulty_score': 0.38,
            'concept_tags': ['linux', 'shell', 'filesystem'],
            'description': 'Get comfortable with Linux fundamentals, command-line workflows, and how system structure supports engineering work.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Filesystem Thinking and Safe Navigation',
                'duration_seconds': 360,
                'difficulty_score': 0.32,
                'concept_tags': ['filesystem', 'navigation', 'cli_basics'],
                'description': 'Learn how Linux organizes files and how to move confidently through systems without breaking things.'
            },
            {
                'title': 'Path Step 2: Pipes, Redirection, and Workflow Chaining',
                'duration_seconds': 480,
                'difficulty_score': 0.42,
                'concept_tags': ['pipes', 'redirection', 'workflow_automation'],
                'description': 'Use small shell tools together to create powerful repeatable workflows from simple building blocks.'
            },
            {
                'title': 'Path Step 3: Shell Scripts that Save Time',
                'duration_seconds': 540,
                'difficulty_score': 0.5,
                'concept_tags': ['bash', 'scripts', 'automation'],
                'description': 'Turn repeated command-line steps into lightweight scripts that help you move faster and more reliably.'
            }
        ],
        'gamification': {
            'track_name': 'Terminal Trek Track',
            'xp_per_lesson': 33,
            'streak_bonus_xp': 12,
            'weekly_quest': 'Automate one repetitive local workflow with a shell command chain.',
            'final_boss': 'Build a safe startup checklist for a Linux workstation.',
            'milestones': [
                {'threshold': 25, 'badge': 'Shell Scout', 'xp': 44},
                {'threshold': 50, 'badge': 'Pipe Pilot', 'xp': 72},
                {'threshold': 75, 'badge': 'Script Smith', 'xp': 102},
                {'threshold': 100, 'badge': 'Linux Lantern', 'xp': 146},
            ]
        },
        'student_emails': ['student3@adaptiq.com', 'student4@adaptiq.com', 'student7@adaptiq.com']
    },
    {
        'title': 'Cybersecurity Analyst Foundations Path',
        'description': 'A security foundations path covering threat thinking, common attack patterns, secure habits, and the mindset of an analyst protecting systems.',
        'subject': 'Cybersecurity',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#ef4444', 'surface': '#fee2e2', 'ink': '#b91c1c'},
        'video': {
            'title': 'Cyber Security Full Course for Beginner',
            'url': 'https://www.youtube.com/watch?v=U_P23SqJaDc',
            'duration_seconds': 900,
            'difficulty_score': 0.46,
            'concept_tags': ['cybersecurity', 'threats', 'defense_layers'],
            'description': 'Build security awareness from first principles by understanding systems, threats, and safer digital behaviors.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Threat Models and Attack Surfaces',
                'duration_seconds': 420,
                'difficulty_score': 0.42,
                'concept_tags': ['threat_modeling', 'attack_surface', 'risk'],
                'description': 'Learn how defenders think about likely threats, exposed assets, and the tradeoffs in real environments.'
            },
            {
                'title': 'Path Step 2: Identity, Hygiene, and Safe Defaults',
                'duration_seconds': 540,
                'difficulty_score': 0.48,
                'concept_tags': ['identity_security', 'passwords', 'safe_defaults'],
                'description': 'Cover security basics that make a real difference, from credential hygiene to safer day-to-day platform habits.'
            },
            {
                'title': 'Path Step 3: Incident Thinking and Response Notes',
                'duration_seconds': 600,
                'difficulty_score': 0.56,
                'concept_tags': ['incident_response', 'logging', 'containment'],
                'description': 'Build the habit of investigating calmly, documenting clearly, and responding with useful containment steps.'
            }
        ],
        'gamification': {
            'track_name': 'Defense Grid Track',
            'xp_per_lesson': 45,
            'streak_bonus_xp': 17,
            'weekly_quest': 'Harden one digital habit and note the payoff.',
            'final_boss': 'Write a mini incident playbook for a common security issue.',
            'milestones': [
                {'threshold': 25, 'badge': 'Threat Scout', 'xp': 60},
                {'threshold': 50, 'badge': 'Risk Reader', 'xp': 90},
                {'threshold': 75, 'badge': 'Defense Driver', 'xp': 122},
                {'threshold': 100, 'badge': 'Security Sentinel', 'xp': 184},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student8@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Go Backend Systems Path',
        'description': 'A backend path focused on Go fundamentals, concurrency thinking, APIs, and building crisp, efficient services.',
        'subject': 'Go Development',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#14b8a6', 'surface': '#ccfbf1', 'ink': '#0f766e'},
        'video': {
            'title': 'Learn Go Programming by Building 11 Projects - Full Course',
            'url': 'https://www.youtube.com/watch?v=jFfo23yIWac',
            'duration_seconds': 960,
            'difficulty_score': 0.5,
            'concept_tags': ['golang', 'concurrency', 'backend_services'],
            'description': 'Use Go to build backend confidence by learning its syntax, standard library, and service-friendly development style.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Types, Simplicity, and Service Design',
                'duration_seconds': 420,
                'difficulty_score': 0.46,
                'concept_tags': ['types', 'simplicity', 'service_design'],
                'description': 'Understand why Go favors simplicity and how that shapes maintainable service architecture.'
            },
            {
                'title': 'Path Step 2: Goroutines, Channels, and Coordination',
                'duration_seconds': 540,
                'difficulty_score': 0.56,
                'concept_tags': ['goroutines', 'channels', 'coordination'],
                'description': 'Develop intuition for concurrency primitives and when they help or hurt backend clarity.'
            },
            {
                'title': 'Path Step 3: APIs, Tooling, and Operational Readiness',
                'duration_seconds': 600,
                'difficulty_score': 0.62,
                'concept_tags': ['http_servers', 'tooling', 'operational_readiness'],
                'description': 'Move from language basics to production-friendly APIs with better tooling and service discipline.'
            }
        ],
        'gamification': {
            'track_name': 'Concurrency Climb Track',
            'xp_per_lesson': 46,
            'streak_bonus_xp': 18,
            'weekly_quest': 'Refactor one flow with cleaner control or concurrency.',
            'final_boss': 'Plan a small Go service with an operations checklist.',
            'milestones': [
                {'threshold': 25, 'badge': 'Go Getter', 'xp': 58},
                {'threshold': 50, 'badge': 'Routine Runner', 'xp': 90},
                {'threshold': 75, 'badge': 'Channel Captain', 'xp': 122},
                {'threshold': 100, 'badge': 'Backend Bolt', 'xp': 184},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student5@adaptiq.com', 'student6@adaptiq.com']
    },
    {
        'title': 'C# Application Development Path',
        'description': 'A C# foundations path for object-oriented thinking, application structure, and the disciplined coding habits common in .NET work.',
        'subject': '.NET Development',
        'difficulty_level': 'Easy',
        'thumbnail_url': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#7c3aed', 'surface': '#ede9fe', 'ink': '#5b21b6'},
        'video': {
            'title': 'C# Tutorial - Full Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=GhQdlIFylQ8',
            'duration_seconds': 900,
            'difficulty_score': 0.42,
            'concept_tags': ['csharp', 'oop', 'dotnet'],
            'description': 'Learn C# through practical fundamentals, object-oriented programming, and the foundations of structured application code.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Classes, Methods, and Clear Naming',
                'duration_seconds': 390,
                'difficulty_score': 0.38,
                'concept_tags': ['classes', 'methods', 'naming'],
                'description': 'Build maintainable habits by shaping code into readable classes and clearly named behavior.'
            },
            {
                'title': 'Path Step 2: OOP Principles and Application Design',
                'duration_seconds': 510,
                'difficulty_score': 0.48,
                'concept_tags': ['encapsulation', 'inheritance', 'polymorphism'],
                'description': 'Connect core OOP concepts to real application structure instead of treating them as isolated theory.'
            },
            {
                'title': 'Path Step 3: Validation, Testing Mindset, and Growth Paths',
                'duration_seconds': 570,
                'difficulty_score': 0.54,
                'concept_tags': ['validation', 'testing_mindset', 'dotnet_growth'],
                'description': 'Move beyond syntax by thinking about correctness, validation, and the next path into APIs or desktop apps.'
            }
        ],
        'gamification': {
            'track_name': 'OOP Odyssey Track',
            'xp_per_lesson': 37,
            'streak_bonus_xp': 14,
            'weekly_quest': 'Refactor one class into a cleaner responsibility split.',
            'final_boss': 'Draft a simple app blueprint using OOP boundaries.',
            'milestones': [
                {'threshold': 25, 'badge': 'Class Crafter', 'xp': 46},
                {'threshold': 50, 'badge': 'Method Maker', 'xp': 76},
                {'threshold': 75, 'badge': 'OOP Operator', 'xp': 106},
                {'threshold': 100, 'badge': '.NET Navigator', 'xp': 154},
            ]
        },
        'student_emails': ['student3@adaptiq.com', 'student7@adaptiq.com', 'student10@adaptiq.com']
    },
    {
        'title': 'TypeScript Full-Stack Foundations Path',
        'description': 'A TypeScript path for developers who want stronger contracts, safer refactors, and more predictable full-stack JavaScript systems.',
        'subject': 'TypeScript',
        'difficulty_level': 'Medium',
        'thumbnail_url': 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#2563eb', 'surface': '#dbeafe', 'ink': '#1d4ed8'},
        'video': {
            'title': 'TypeScript Course for Beginners - Learn TypeScript from Scratch',
            'url': 'https://www.youtube.com/watch?v=30LWjhZzg50',
            'duration_seconds': 840,
            'difficulty_score': 0.46,
            'concept_tags': ['typescript', 'types', 'safer_refactors'],
            'description': 'Learn how TypeScript improves developer confidence through types, tooling, and more reliable change management.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Types as Communication Tools',
                'duration_seconds': 390,
                'difficulty_score': 0.4,
                'concept_tags': ['types', 'interfaces', 'communication'],
                'description': 'Use TypeScript types to make system behavior more obvious to teammates and future you.'
            },
            {
                'title': 'Path Step 2: Narrowing, Generics, and Scalable Patterns',
                'duration_seconds': 510,
                'difficulty_score': 0.52,
                'concept_tags': ['narrowing', 'generics', 'patterns'],
                'description': 'Move past basic typing into the TypeScript features that make large codebases safer and more expressive.'
            },
            {
                'title': 'Path Step 3: Full-Stack Contracts and Refactor Safety',
                'duration_seconds': 570,
                'difficulty_score': 0.58,
                'concept_tags': ['contracts', 'refactoring', 'full_stack'],
                'description': 'Learn how TypeScript can align frontend and backend assumptions and make refactoring less stressful.'
            }
        ],
        'gamification': {
            'track_name': 'Type Shield Track',
            'xp_per_lesson': 41,
            'streak_bonus_xp': 16,
            'weekly_quest': 'Tighten one loose type and note the bug it prevents.',
            'final_boss': 'Design a shared contract for a front/back feature flow.',
            'milestones': [
                {'threshold': 25, 'badge': 'Type Taster', 'xp': 50},
                {'threshold': 50, 'badge': 'Generic Guide', 'xp': 82},
                {'threshold': 75, 'badge': 'Contract Keeper', 'xp': 114},
                {'threshold': 100, 'badge': 'Refactor Ranger', 'xp': 168},
            ]
        },
        'student_emails': ['student2@adaptiq.com', 'student4@adaptiq.com', 'student9@adaptiq.com']
    },
    {
        'title': 'Rust Systems Programming Path',
        'description': 'A systems programming path focused on Rust ownership, memory safety, performance thinking, and building reliable low-level software.',
        'subject': 'Rust Programming',
        'difficulty_level': 'Hard',
        'thumbnail_url': 'https://images.unsplash.com/photo-1516321310764-8d3f1e6b4d44?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#f97316', 'surface': '#ffedd5', 'ink': '#c2410c'},
        'video': {
            'title': 'Rust Programming Course for Beginners',
            'url': 'https://www.youtube.com/watch?v=BpPEoZW5IiY',
            'duration_seconds': 900,
            'difficulty_score': 0.68,
            'concept_tags': ['rust', 'ownership', 'memory_safety'],
            'description': 'Enter Rust through its core mental models and learn why safety and performance are such a compelling pairing.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Ownership and Borrowing Intuition',
                'duration_seconds': 420,
                'difficulty_score': 0.64,
                'concept_tags': ['ownership', 'borrowing', 'lifetimes'],
                'description': 'Build a usable mental model for ownership so Rust errors become guidance instead of friction.'
            },
            {
                'title': 'Path Step 2: Structuring Data and Error Paths',
                'duration_seconds': 540,
                'difficulty_score': 0.7,
                'concept_tags': ['structs', 'enums', 'results'],
                'description': 'Use Rust data modeling and error handling patterns to design robust low-level programs.'
            },
            {
                'title': 'Path Step 3: Performance, Reliability, and Systems Fit',
                'duration_seconds': 600,
                'difficulty_score': 0.76,
                'concept_tags': ['performance', 'reliability', 'systems_fit'],
                'description': 'Understand the kinds of systems problems where Rust shines and how its constraints can become strengths.'
            }
        ],
        'gamification': {
            'track_name': 'Ownership Gauntlet Track',
            'xp_per_lesson': 52,
            'streak_bonus_xp': 20,
            'weekly_quest': 'Explain one borrow-checker lesson in plain language.',
            'final_boss': 'Write a reliability checklist for a Rust utility idea.',
            'milestones': [
                {'threshold': 25, 'badge': 'Borrow Brave', 'xp': 64},
                {'threshold': 50, 'badge': 'Ownership Operator', 'xp': 98},
                {'threshold': 75, 'badge': 'Result Wrangler', 'xp': 134},
                {'threshold': 100, 'badge': 'Systems Smith', 'xp': 196},
            ]
        },
        'student_emails': ['student1@adaptiq.com', 'student5@adaptiq.com', 'student8@adaptiq.com']
    },
    {
        'title': 'Solidity Smart Contract Builder Path',
        'description': 'A blockchain builder path for learning Solidity, smart contract structure, and how to think about secure decentralized application logic.',
        'subject': 'Blockchain Development',
        'difficulty_level': 'Hard',
        'thumbnail_url': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
        'educator_email': 'educator2@adaptiq.com',
        'theme': {'accent': '#f59e0b', 'surface': '#fef3c7', 'ink': '#b45309'},
        'video': {
            'title': 'Solidity, Blockchain, and Smart Contract Course - Beginner to Expert',
            'url': 'https://www.youtube.com/watch?v=M576WGiDBdQ',
            'duration_seconds': 1020,
            'difficulty_score': 0.66,
            'concept_tags': ['solidity', 'smart_contracts', 'web3'],
            'description': 'Learn Solidity fundamentals and how smart contracts are structured, deployed, and reasoned about in practice.'
        },
        'text_lessons': [
            {
                'title': 'Path Step 1: Contract State and Deterministic Thinking',
                'duration_seconds': 420,
                'difficulty_score': 0.6,
                'concept_tags': ['contract_state', 'determinism', 'transactions'],
                'description': 'Understand how smart contracts manage state and why deterministic behavior matters in decentralized systems.'
            },
            {
                'title': 'Path Step 2: Security Patterns and Failure Costs',
                'duration_seconds': 540,
                'difficulty_score': 0.7,
                'concept_tags': ['security_patterns', 'reentrancy', 'access_control'],
                'description': 'Build respect for the security posture smart contracts need by studying common risks and safer design patterns.'
            },
            {
                'title': 'Path Step 3: Product Fit, Audits, and Ecosystem Readiness',
                'duration_seconds': 600,
                'difficulty_score': 0.76,
                'concept_tags': ['audits', 'ecosystem_fit', 'deployment_readiness'],
                'description': 'Move beyond coding by thinking about audits, ecosystem assumptions, and what makes decentralized software usable.'
            }
        ],
        'gamification': {
            'track_name': 'Chain Architect Track',
            'xp_per_lesson': 50,
            'streak_bonus_xp': 19,
            'weekly_quest': 'Review one contract risk and write the safer alternative.',
            'final_boss': 'Draft a secure launch checklist for a smart contract idea.',
            'milestones': [
                {'threshold': 25, 'badge': 'State Shaper', 'xp': 60},
                {'threshold': 50, 'badge': 'Gas Guardian', 'xp': 94},
                {'threshold': 75, 'badge': 'Security Seer', 'xp': 128},
                {'threshold': 100, 'badge': 'Web3 Warden', 'xp': 190},
            ]
        },
        'student_emails': ['student6@adaptiq.com', 'student7@adaptiq.com', 'student10@adaptiq.com']
    },
]


ALL_COURSE_BLUEPRINTS = EDUCATOR1_COURSES + EDUCATOR2_COURSES
COURSE_BLUEPRINT_BY_TITLE = {blueprint['title']: blueprint for blueprint in ALL_COURSE_BLUEPRINTS}


def expand_course_contents(blueprint):
    return [blueprint['video'], *blueprint.get('text_lessons', [])]


def get_course_runtime(title, completion_percentage=0.0):
    blueprint = COURSE_BLUEPRINT_BY_TITLE.get(title)
    if not blueprint:
        return {
            'theme': {'accent': '#6366f1', 'surface': '#e0e7ff', 'ink': '#4338ca'},
            'gamification': {
                'track_name': 'Learning Track',
                'xp_per_lesson': 35,
                'streak_bonus_xp': 10,
                'weekly_quest': 'Complete a lesson and capture one learning note.',
                'final_boss': 'Finish the course challenge.',
                'milestone_rewards': []
            },
            'lesson_count': 0,
            'estimated_minutes': 0,
        }

    contents = expand_course_contents(blueprint)
    estimated_minutes = round(sum(item.get('duration_seconds', 0) for item in contents) / 60)
    milestones = []
    for row in blueprint['gamification']['milestones']:
        milestones.append({
            **row,
            'earned': completion_percentage >= row['threshold']
        })

    total_xp = blueprint['gamification']['xp_per_lesson'] * len(contents) + sum(row['xp'] for row in blueprint['gamification']['milestones'])

    return {
        'theme': blueprint['theme'],
        'lesson_count': len(contents),
        'estimated_minutes': estimated_minutes,
        'gamification': {
            'track_name': blueprint['gamification']['track_name'],
            'xp_per_lesson': blueprint['gamification']['xp_per_lesson'],
            'streak_bonus_xp': blueprint['gamification']['streak_bonus_xp'],
            'weekly_quest': blueprint['gamification']['weekly_quest'],
            'final_boss': blueprint['gamification']['final_boss'],
            'estimated_total_xp': total_xp,
            'milestone_rewards': milestones,
        }
    }


