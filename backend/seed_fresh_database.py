from app import create_app
from models.db_models import Course, User
from seed import seed


def seed_fresh_database():
    app = create_app()
    with app.app_context():
        if User.query.first() or Course.query.first():
            print('Seed skipped because the database already contains data.')
            return

    seed(reset=False)


if __name__ == '__main__':
    seed_fresh_database()
