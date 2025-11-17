#!/bin/bash
# Inline команда для создания суперадмина на сервере

echo "Создание суперадмина asannameg@gmail.com..."

cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate

# Проверяем какой backend используется
if [ -d "django_project" ]; then
    echo "Используется Django"
    cd django_project
    python3 manage.py shell <<EOF
from apps.users.models import User
user = User.objects.filter(email='asannameg@gmail.com').first()
if user:
    user.set_password('ParolJok6#')
    user.is_admin = True
    user.is_verified = True
    user.is_active = True
    user.save()
    print("✅ User updated")
else:
    user = User.objects.create_user(
        email='asannameg@gmail.com',
        password='ParolJok6#',
        full_name='asannameg',
        company='ZAKUP.ONE',
        is_admin=True,
        is_verified=True,
        is_active=True
    )
    print(f"✅ User created: {user.email}")
EOF
else
    echo "Используется FastAPI"
    python3 create_superadmin_asannameg.py
fi

echo "✅ Готово!"

