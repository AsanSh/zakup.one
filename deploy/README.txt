ИНСТРУКЦИЯ ПО ЗАГРУЗКЕ НА SPACESHIP

1. Загрузите все файлы из этой папки на сервер через FTP
2. Переименуйте .env.example в .env и настройте его
3. Установите права:
   - Папки: 755
   - Файлы: 644
   - uploads/: 777
4. В панели Spaceship настройте Python приложение с точкой входа: wsgi:application
5. Установите зависимости: pip install -r requirements.txt

FTP данные:
- Host: ftp.spaceship.ru
- Username: www.zakup.one
- Password: ParolJok9@
