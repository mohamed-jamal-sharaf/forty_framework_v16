import os
import shutil
import frappe
from datetime import datetime

# المسار الرئيسي للتطبيق
APP_ROOT = "/home/frappe/forty-bench/apps/frappe/frappe"
HOOKS_FILE = os.path.join(APP_ROOT, "hooks.py")
HOOKS_BACKUP_FOLDER = os.path.join(APP_ROOT, "hook bck")
API_FOLDER = os.path.join(APP_ROOT, "api")

# المستخدم المسموح له برؤية كل الملفات
ADMIN_USER = "Mohamed.sharaf.secured@gmail.com"


@frappe.whitelist()
def get_files_list():
    """
    إرجاع قائمة الملفات المسموح بها
    - المستخدم العادي: hooks.py, api folder, hook bck folder
    - المستخدم Admin: كل الملفات
    """
    current_user = frappe.session.user
    files_list = []
    
    # إذا كان المستخدم هو Admin → أظهر كل شيء
    if current_user == ADMIN_USER:
        for item in os.listdir(APP_ROOT):
            item_path = os.path.join(APP_ROOT, item)
            files_list.append({
                "name": item,
                "path": item_path,
                "is_folder": os.path.isdir(item_path),
                "size": get_file_size(item_path),
                "modified": get_modified_time(item_path)
            })
    else:
        # المستخدم العادي → فقط hooks.py و api و hook bck
        allowed_items = ["hooks.py", "api", "hook bck"]
        
        for item in allowed_items:
            item_path = os.path.join(APP_ROOT, item)
            if os.path.exists(item_path):
                files_list.append({
                    "name": item,
                    "path": item_path,
                    "is_folder": os.path.isdir(item_path),
                    "size": get_file_size(item_path),
                    "modified": get_modified_time(item_path)
                })
    
    return files_list


@frappe.whitelist()
def get_folder_contents(folder_path):
    """
    إرجاع محتويات مجلد معين
    """
    if not is_path_allowed(folder_path):
        frappe.throw("غير مسموح بالوصول لهذا المسار")
    
    contents = []
    
    if os.path.isdir(folder_path):
        for item in os.listdir(folder_path):
            item_path = os.path.join(folder_path, item)
            contents.append({
                "name": item,
                "path": item_path,
                "is_folder": os.path.isdir(item_path),
                "size": get_file_size(item_path),
                "modified": get_modified_time(item_path)
            })
    
    return contents


@frappe.whitelist()
def get_file_content(file_path):
    """
    قراءة محتوى ملف
    """
    if not is_path_allowed(file_path):
        frappe.throw("غير مسموح بالوصول لهذا الملف")
    
    if not os.path.isfile(file_path):
        frappe.throw("الملف غير موجود")
    
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


@frappe.whitelist()
def save_file(file_path, content):
    """
    حفظ ملف مع إنشاء نسخة احتياطية تلقائية
    """
    if not is_path_allowed(file_path):
        frappe.throw("غير مسموح بالوصول لهذا الملف")
    
    # إنشاء نسخة احتياطية قبل الحفظ
    create_backup(file_path)
    
    # حفظ الملف
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return {"success": True, "message": "تم الحفظ بنجاح"}


def create_backup(file_path):
    """
    إنشاء نسخة احتياطية:
    - hooks.py → hook bck/hooks_YYYYMMDD_HHMMSS.py
    - api/xxx.py → api/xxx/xxx_YYYYMMDD_HHMMSS.py
    """
    if not os.path.isfile(file_path):
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = os.path.basename(file_path)
    file_name_no_ext = os.path.splitext(file_name)[0]
    file_ext = os.path.splitext(file_name)[1]
    
    # إذا كان الملف هو hooks.py
    if file_path == HOOKS_FILE:
        backup_folder = HOOKS_BACKUP_FOLDER
        backup_name = f"hooks_{timestamp}{file_ext}"
    
    # إذا كان الملف داخل مجلد api
    elif file_path.startswith(API_FOLDER):
        # أنشئ مجلد باسم الملف داخل نفس المسار
        file_dir = os.path.dirname(file_path)
        backup_folder = os.path.join(file_dir, file_name_no_ext)
        backup_name = f"{file_name_no_ext}_{timestamp}{file_ext}"
    
    else:
        # ملفات أخرى - لا نعمل backup
        return
    
    # إنشاء مجلد الـ backup إذا لم يكن موجود
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
    
    # نسخ الملف
    backup_path = os.path.join(backup_folder, backup_name)
    shutil.copy2(file_path, backup_path)
    
    return backup_path


@frappe.whitelist()
def get_backups(file_path):
    """
    إرجاع قائمة النسخ الاحتياطية لملف معين
    """
    if not is_path_allowed(file_path):
        frappe.throw("غير مسموح بالوصول")
    
    file_name = os.path.basename(file_path)
    file_name_no_ext = os.path.splitext(file_name)[0]
    
    backups = []
    
    # إذا كان hooks.py
    if file_path == HOOKS_FILE:
        backup_folder = HOOKS_BACKUP_FOLDER
        prefix = "hooks_"
    
    # إذا كان داخل api
    elif file_path.startswith(API_FOLDER):
        file_dir = os.path.dirname(file_path)
        backup_folder = os.path.join(file_dir, file_name_no_ext)
        prefix = f"{file_name_no_ext}_"
    
    else:
        return backups
    
    if os.path.exists(backup_folder):
        for item in os.listdir(backup_folder):
            if item.startswith(prefix):
                item_path = os.path.join(backup_folder, item)
                backups.append({
                    "name": item,
                    "path": item_path,
                    "modified": get_modified_time(item_path),
                    "size": get_file_size(item_path)
                })
    
    # ترتيب من الأحدث للأقدم
    backups.sort(key=lambda x: x["modified"], reverse=True)
    
    return backups


@frappe.whitelist()
def restore_backup(backup_path, original_path):
    """
    استعادة نسخة احتياطية
    """
    if not is_path_allowed(backup_path) or not is_path_allowed(original_path):
        frappe.throw("غير مسموح بالوصول")
    
    if not os.path.isfile(backup_path):
        frappe.throw("ملف الـ Backup غير موجود")
    
    # إنشاء backup للملف الحالي قبل الاستعادة
    create_backup(original_path)
    
    # استعادة الـ backup
    shutil.copy2(backup_path, original_path)
    
    return {"success": True, "message": "تم الاستعادة بنجاح"}


@frappe.whitelist()
def create_file(folder_path, file_name, content=""):
    """
    إنشاء ملف جديد
    """
    if not is_path_allowed(folder_path):
        frappe.throw("غير مسموح بالوصول")
    
    file_path = os.path.join(folder_path, file_name)
    
    if os.path.exists(file_path):
        frappe.throw("الملف موجود بالفعل")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return {"success": True, "path": file_path}


@frappe.whitelist()
def create_folder(parent_path, folder_name):
    """
    إنشاء مجلد جديد
    """
    if not is_path_allowed(parent_path):
        frappe.throw("غير مسموح بالوصول")
    
    folder_path = os.path.join(parent_path, folder_name)
    
    if os.path.exists(folder_path):
        frappe.throw("المجلد موجود بالفعل")
    
    os.makedirs(folder_path)
    
    return {"success": True, "path": folder_path}


@frappe.whitelist()
def delete_item(item_path):
    """
    حذف ملف أو مجلد
    """
    if not is_path_allowed(item_path):
        frappe.throw("غير مسموح بالوصول")
    
    # لا نسمح بحذف الملفات الأساسية
    if item_path in [HOOKS_FILE, API_FOLDER]:
        frappe.throw("لا يمكن حذف هذا العنصر")
    
    if os.path.isfile(item_path):
        os.remove(item_path)
    elif os.path.isdir(item_path):
        shutil.rmtree(item_path)
    
    return {"success": True}


# ==================== Helper Functions ====================

def is_path_allowed(path):
    """
    التحقق إذا كان المسار مسموح به
    """
    current_user = frappe.session.user
    
    # Admin يمكنه الوصول لكل شيء
    if current_user == ADMIN_USER:
        return path.startswith(APP_ROOT)
    
    # المستخدم العادي - فقط hooks.py و api و hook bck
    allowed_paths = [HOOKS_FILE, API_FOLDER, HOOKS_BACKUP_FOLDER]
    
    for allowed in allowed_paths:
        if path == allowed or path.startswith(allowed + os.sep):
            return True
    
    return False


def get_file_size(path):
    """
    حجم الملف بصيغة مقروءة
    """
    try:
        if os.path.isfile(path):
            size = os.path.getsize(path)
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size/1024:.1f} KB"
            else:
                return f"{size/(1024*1024):.1f} MB"
        return "-"
    except:
        return "-"


def get_modified_time(path):
    """
    وقت التعديل
    """
    try:
        mtime = os.path.getmtime(path)
        return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
    except:
        return "-"
