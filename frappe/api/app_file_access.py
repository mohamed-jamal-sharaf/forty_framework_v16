import os
import time
import shutil
import glob
import frappe

# ✅ Return list of installed apps
@frappe.whitelist()
def get_installed_apps():
    return frappe.get_installed_apps()


# ✅ Browsing files and folders in an app directory
@frappe.whitelist()
def list_app_folder_files(app_name, path=""):
    base_path = frappe.get_app_path(app_name)

    # ✅ If path is blank → show root of the app folder
    clean_path = path.strip().lstrip("/").replace("..", "")
    target_path = os.path.join(base_path, clean_path)

    if not os.path.exists(target_path):
        return []

    files = []
    for entry in os.listdir(target_path):
        full = os.path.join(target_path, entry)
        file_size = None
        if os.path.isfile(full):
            try:
                file_size = os.path.getsize(full)
            except:
                file_size = 0
        
        files.append({
            "name": entry,
            "is_file": os.path.isfile(full),
            "is_dir": os.path.isdir(full),
            "path": os.path.join(clean_path, entry) if clean_path else entry,
            "size": file_size
        })
    return files


# ✅ Reading file content
@frappe.whitelist()
def read_file_content(app_name, file_path):
    if not app_name or not file_path:
        frappe.throw("⚠️ Missing app name or file path")

    clean_path = file_path.strip().lstrip("/").replace("..", "")
    full_path = os.path.join(frappe.get_app_path(app_name), clean_path)

    if not os.path.isfile(full_path):
        frappe.throw(f"❌ File does not exist: {clean_path}")

    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        frappe.throw(f"Failed to read file: {e}")


# ✅ Clean old backups - keep only latest 3
def cleanup_old_backups(file_path, max_backups=3):
    """Remove old backup files, keeping only the most recent ones"""
    backup_pattern = f"{file_path}.bak.*"
    backup_files = glob.glob(backup_pattern)
    
    if len(backup_files) <= max_backups:
        return
    
    # Sort by modification time (oldest first)
    backup_files.sort(key=lambda x: os.path.getmtime(x))
    
    # Remove oldest backups, keep only max_backups
    files_to_remove = backup_files[:-max_backups]
    for old_backup in files_to_remove:
        try:
            os.remove(old_backup)
            frappe.logger().info(f"🗑️ Removed old backup: {os.path.basename(old_backup)}")
        except Exception as e:
            frappe.logger().error(f"⚠️ Failed to remove old backup {old_backup}: {e}")


# ✅ Save file with backup before overwriting (keeps only 3 backups)
@frappe.whitelist()
def write_file_content_with_backup(app_name, file_path, content):
    if not app_name or not file_path:
        frappe.throw("⚠️ Missing app name or file path")

    # 🔐 Sanitize path to prevent traversal attacks
    clean_path = file_path.strip().lstrip("/").replace("..", "")
    full = os.path.join(frappe.get_app_path(app_name), clean_path)

    if not os.path.isfile(full):
        frappe.throw(f"❌ Target file not found: {clean_path}")

    # 🔹 Backup suffix
    ts = time.strftime("%Y%m%d-%H%M%S")
    backup = f"{full}.bak.{ts}"

    # ✅ Backup original file
    try:
        shutil.copy2(full, backup)
    except Exception as e:
        frappe.throw(f"⚠️ Backup failed: {e}")

    # ✅ Write new version
    try:
        with open(full, "w", encoding="utf-8", newline="\n") as f:
            f.write(content if content is not None else "")
    except Exception as e:
        frappe.throw(f"❌ File write failed: {e}")

    # 🧹 Clean old backups - keep only 3
    cleanup_old_backups(full, max_backups=3)

    return f"✅ Saved successfully 👍 Backup created: {os.path.basename(backup)}"


# ✅ Create new file
@frappe.whitelist()
def create_new_file(app_name, folder_path, file_name):
    """Create a new file in the specified folder"""
    if not app_name or not file_name:
        frappe.throw("⚠️ Missing app name or file name")

    # 🔐 Sanitize inputs
    clean_folder = folder_path.strip().lstrip("/").replace("..", "") if folder_path else ""
    clean_file_name = file_name.strip().replace("..", "").replace("/", "").replace("\\", "")
    
    if not clean_file_name:
        frappe.throw("⚠️ Invalid file name")

    # Build full path
    base_path = frappe.get_app_path(app_name)
    if clean_folder:
        target_folder = os.path.join(base_path, clean_folder)
    else:
        target_folder = base_path
    
    full_path = os.path.join(target_folder, clean_file_name)

    # Check if folder exists
    if not os.path.isdir(target_folder):
        frappe.throw(f"❌ Folder does not exist: {clean_folder or 'root'}")

    # Check if file already exists
    if os.path.exists(full_path):
        frappe.throw(f"⚠️ File already exists: {clean_file_name}")

    # Get file extension for default content
    ext = clean_file_name.split('.')[-1].lower() if '.' in clean_file_name else ''
    default_content = get_default_file_content(ext, clean_file_name)

    # ✅ Create the file
    try:
        with open(full_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(default_content)
    except Exception as e:
        frappe.throw(f"❌ Failed to create file: {e}")

    relative_path = os.path.join(clean_folder, clean_file_name) if clean_folder else clean_file_name
    
    return {
        "success": True,
        "message": f"✅ File created successfully: {clean_file_name}",
        "file_path": relative_path
    }


def get_default_file_content(extension, file_name):
    """Return default content based on file extension"""
    defaults = {
        'py': f'''# -*- coding: utf-8 -*-
# {file_name}
# Created: {time.strftime("%Y-%m-%d %H:%M:%S")}

import frappe

''',
        'js': f'''// {file_name}
// Created: {time.strftime("%Y-%m-%d %H:%M:%S")}

frappe.ui.form.on('', {{
    refresh(frm) {{
        // Your code here
    }}
}});
''',
        'html': f'''<!-- {file_name} -->
<!-- Created: {time.strftime("%Y-%m-%d %H:%M:%S")} -->
<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>

</body>
</html>
''',
        'css': f'''/* {file_name} */
/* Created: {time.strftime("%Y-%m-%d %H:%M:%S")} */

''',
        'json': '{\n    \n}',
        'md': f'''# {file_name.replace('.md', '')}

Created: {time.strftime("%Y-%m-%d %H:%M:%S")}

''',
        'txt': '',
        'sql': f'''-- {file_name}
-- Created: {time.strftime("%Y-%m-%d %H:%M:%S")}

'''
    }
    
    return defaults.get(extension, '')


# ✅ Delete file (Administrator only)
@frappe.whitelist()
def delete_file(app_name, file_path):
    """Delete a file - Administrator only"""
    
    # 🔐 Check if user is Administrator
    if frappe.session.user != "Administrator":
        frappe.throw("🚫 Access Denied: Only Administrator can delete files")

    if not app_name or not file_path:
        frappe.throw("⚠️ Missing app name or file path")

    # 🔐 Sanitize path
    clean_path = file_path.strip().lstrip("/").replace("..", "")
    full_path = os.path.join(frappe.get_app_path(app_name), clean_path)

    # Check if file exists
    if not os.path.exists(full_path):
        frappe.throw(f"❌ File not found: {clean_path}")

    # Prevent deleting directories with this function
    if os.path.isdir(full_path):
        frappe.throw("⚠️ Cannot delete directories. Only files can be deleted.")

    # Get file name for message
    file_name = os.path.basename(full_path)

    # ✅ Delete the file
    try:
        os.remove(full_path)
    except Exception as e:
        frappe.throw(f"❌ Failed to delete file: {e}")

    # Also delete associated backup files
    backup_pattern = f"{full_path}.bak.*"
    backup_files = glob.glob(backup_pattern)
    deleted_backups = 0
    for backup in backup_files:
        try:
            os.remove(backup)
            deleted_backups += 1
        except:
            pass

    return {
        "success": True,
        "message": f"✅ File deleted successfully: {file_name}",
        "backups_deleted": deleted_backups
    }


# ✅ Create new folder
@frappe.whitelist()
def create_new_folder(app_name, parent_path, folder_name):
    """Create a new folder"""
    if not app_name or not folder_name:
        frappe.throw("⚠️ Missing app name or folder name")

    # 🔐 Sanitize inputs
    clean_parent = parent_path.strip().lstrip("/").replace("..", "") if parent_path else ""
    clean_folder_name = folder_name.strip().replace("..", "").replace("/", "").replace("\\", "")
    
    if not clean_folder_name:
        frappe.throw("⚠️ Invalid folder name")

    # Build full path
    base_path = frappe.get_app_path(app_name)
    if clean_parent:
        target_parent = os.path.join(base_path, clean_parent)
    else:
        target_parent = base_path
    
    full_path = os.path.join(target_parent, clean_folder_name)

    # Check if parent folder exists
    if not os.path.isdir(target_parent):
        frappe.throw(f"❌ Parent folder does not exist: {clean_parent or 'root'}")

    # Check if folder already exists
    if os.path.exists(full_path):
        frappe.throw(f"⚠️ Folder already exists: {clean_folder_name}")

    # ✅ Create the folder
    try:
        os.makedirs(full_path)
    except Exception as e:
        frappe.throw(f"❌ Failed to create folder: {e}")

    relative_path = os.path.join(clean_parent, clean_folder_name) if clean_parent else clean_folder_name
    
    return {
        "success": True,
        "message": f"✅ Folder created successfully: {clean_folder_name}",
        "folder_path": relative_path
    }


# ✅ Delete folder (Administrator only)
@frappe.whitelist()
def delete_folder(app_name, folder_path):
    """Delete an empty folder - Administrator only"""
    
    # 🔐 Check if user is Administrator
    if frappe.session.user != "Administrator":
        frappe.throw("🚫 Access Denied: Only Administrator can delete folders")

    if not app_name or not folder_path:
        frappe.throw("⚠️ Missing app name or folder path")

    # 🔐 Sanitize path
    clean_path = folder_path.strip().lstrip("/").replace("..", "")
    full_path = os.path.join(frappe.get_app_path(app_name), clean_path)

    # Check if folder exists
    if not os.path.exists(full_path):
        frappe.throw(f"❌ Folder not found: {clean_path}")

    # Check if it's a directory
    if not os.path.isdir(full_path):
        frappe.throw("⚠️ Path is not a folder")

    # Check if folder is empty
    if os.listdir(full_path):
        frappe.throw("⚠️ Cannot delete non-empty folder. Please delete all files first.")

    folder_name = os.path.basename(full_path)

    # ✅ Delete the folder
    try:
        os.rmdir(full_path)
    except Exception as e:
        frappe.throw(f"❌ Failed to delete folder: {e}")

    return {
        "success": True,
        "message": f"✅ Folder deleted successfully: {folder_name}"
    }


# ✅ Rename file or folder
@frappe.whitelist()
def rename_item(app_name, old_path, new_name):
    """Rename a file or folder"""
    if not app_name or not old_path or not new_name:
        frappe.throw("⚠️ Missing required parameters")

    # 🔐 Sanitize inputs
    clean_old_path = old_path.strip().lstrip("/").replace("..", "")
    clean_new_name = new_name.strip().replace("..", "").replace("/", "").replace("\\", "")
    
    if not clean_new_name:
        frappe.throw("⚠️ Invalid new name")

    base_path = frappe.get_app_path(app_name)
    full_old_path = os.path.join(base_path, clean_old_path)
    
    # Get parent directory
    parent_dir = os.path.dirname(full_old_path)
    full_new_path = os.path.join(parent_dir, clean_new_name)

    # Check if source exists
    if not os.path.exists(full_old_path):
        frappe.throw(f"❌ Item not found: {clean_old_path}")

    # Check if destination already exists
    if os.path.exists(full_new_path):
        frappe.throw(f"⚠️ An item with name '{clean_new_name}' already exists")

    old_name = os.path.basename(full_old_path)

    # ✅ Rename
    try:
        os.rename(full_old_path, full_new_path)
    except Exception as e:
        frappe.throw(f"❌ Failed to rename: {e}")

    # Calculate new relative path
    relative_parent = os.path.dirname(clean_old_path)
    new_relative_path = os.path.join(relative_parent, clean_new_name) if relative_parent else clean_new_name

    return {
        "success": True,
        "message": f"✅ Renamed '{old_name}' to '{clean_new_name}'",
        "new_path": new_relative_path
    }