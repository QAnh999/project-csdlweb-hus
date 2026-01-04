import os
from pathlib import Path
from datetime import datetime
import subprocess
import gzip
import shutil
from app.core.config import settings

BACKUP_DIR = Path("./backups")
BACKUP_DIR.mkdir(exist_ok=True)

# ----------------- Backup -----------------
def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"{settings.POSTGRES_DB}_backup_{timestamp}.sql"
    compressed_file = f"{backup_file}.gz"

    # Tách thông tin từ settings
    db_user = settings.POSTGRES_USER
    db_name = settings.POSTGRES_DB
    db_host = settings.POSTGRES_HOST
    db_port = settings.POSTGRES_PORT
    db_password = settings.POSTGRES_PASSWORD

    command = f'pg_dump -U {db_user} -h {db_host} -p {db_port} {db_name} -F c -b -v -f "{backup_file}"'

    try:
        subprocess.run(command, shell=True, check=True, env={**os.environ, "PGPASSWORD": db_password})
        # Nén file
        with open(backup_file, 'rb') as f_in, gzip.open(compressed_file, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
        os.remove(backup_file)
        return compressed_file
    except subprocess.CalledProcessError as e:
        print("Backup lỗi:", e)
        return None

# ----------------- Restore -----------------
def restore_database(file_path: str):
    db_user = settings.POSTGRES_USER
    db_name = settings.POSTGRES_DB
    db_host = settings.POSTGRES_HOST
    db_port = settings.POSTGRES_PORT
    db_password = settings.POSTGRES_PASSWORD

    # Giải nén nếu là .gz
    if file_path.endswith(".gz"):
        temp_file = BACKUP_DIR / "temp_restore.sql"
        with gzip.open(file_path, 'rb') as f_in, open(temp_file, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
        restore_file = temp_file
    else:
        restore_file = file_path

    command = f'pg_restore -U {db_user} -h {db_host} -p {db_port} -d {db_name} -v "{restore_file}"'

    try:
        subprocess.run(command, shell=True, check=True, env={**os.environ, "PGPASSWORD": db_password})
        print(f"Restore thành công từ: {file_path}")
    except subprocess.CalledProcessError as e:
        print("Restore lỗi:", e)
    finally:
        if file_path.endswith(".gz") and temp_file.exists():
            temp_file.unlink()  # xóa temp file

# ----------------- List Backups -----------------
def list_backups():
    return sorted([str(f) for f in BACKUP_DIR.glob("*.sql.gz")], reverse=True)
