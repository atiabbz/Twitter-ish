rmdir /s /Q "network/__pycache__"
rmdir /s /Q "network/migrations"
rmdir /s /Q "project4/__pycache__"
taskkill /IM "DB Browser for SQLite.exe" /F
del "db.sqlite3"