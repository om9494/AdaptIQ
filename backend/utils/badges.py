BADGE_DEFS = {
    'first_login': 'First Steps',
    'streak_5': 'On Fire',
    'streak_30': 'Unstoppable',
    'quiz_master': 'Quiz Master',
    'course_complete': 'Graduate',
    'top_learner': 'Top Learner'
}


def award_badges(profile, quiz_passed_count: int = 0, completed_courses: int = 0, just_logged_in: bool = False):
    new_badges = []
    badges = set(profile.badges or [])

    if just_logged_in and 'first_login' not in badges:
        badges.add('first_login')
        new_badges.append('first_login')

    if profile.streak_days >= 5 and 'streak_5' not in badges:
        badges.add('streak_5')
        new_badges.append('streak_5')

    if profile.streak_days >= 30 and 'streak_30' not in badges:
        badges.add('streak_30')
        new_badges.append('streak_30')

    if quiz_passed_count >= 5 and 'quiz_master' not in badges:
        badges.add('quiz_master')
        new_badges.append('quiz_master')

    if completed_courses > 0 and 'course_complete' not in badges:
        badges.add('course_complete')
        new_badges.append('course_complete')

    if profile.total_points >= 500 and 'top_learner' not in badges:
        badges.add('top_learner')
        new_badges.append('top_learner')

    profile.badges = list(badges)
    return new_badges
