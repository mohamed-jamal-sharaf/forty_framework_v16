# Copyright (c) 2026, Forty Technologies and contributors
# For license information, please see license.txt

import os
import shutil
import time
import frappe
from frappe.model.document import Document


# =====================================================
# Configuration
# =====================================================

AUTHORIZED_USER = "mohamed.sharaf.secured@gmail.com"
FRAPPE_SAVE_PASSWORD = "01055577720@mGs"
OTHER_SAVE_PASSWORD = "save_and_edit"
DELETE_PASSWORD = "sure_delete"

HOOKS_FILE = "hooks.py"
HOOKS_BACKUP_FOLDER = "hooks_bck"
API_FOLDER = "api"


class AppFilesExplorer(Document):
    pass


# =====================================================
# Helper Functions
# =====================================================

def _is_authorized_user():
    """Check if current user is the authorized user."""
    return frappe.session.user == AUTHORIZED_USER


def _check_frappe_app_access(app_name):
    """Raise error if unauthorized user tries to access frappe app."""
    if app_name and app_name.lower() == "frappe" and not _is_authorized_user():
        frappe.throw("Access denied: You are not authorized to access frappe app files.")


def _is_safe_path(path):
    """Check if path is safe (no directory traversal)."""
    if not path:
        return True
    return ".." not in path and not path.startswith("/")


def _get_app_path(app_name):
    """Get the full path to an app."""
    if not app_name:
        frappe.throw("App name is required.")
    bench_path = frappe.utils.get_bench_path()
    app_path = os.path.join(bench_path, "apps", app_name)
    if not os.path.isdir(app_path):
        frappe.throw(f"App not found: {app_name}")
    return app_path


def _is_backup_folder(folder_name):
    """Check if folder is a backup folder."""
    return folder_name.endswith("_bck") or folder_name == HOOKS_BACKUP_FOLDER


def _format_file_size(size_bytes):
    """Format file size to human readable."""
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB"]
    unit_index = 0
    size = float(size_bytes)
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    return f"{size:.1f} {units[unit_index]}"


def _verify_save_password(app_name, password):
    """Verify save password based on app type."""
    if app_name and app_name.lower() == "frappe":
        if password != FRAPPE_SAVE_PASSWORD:
            frappe.throw("Invalid password for saving frappe app files.")
    else:
        if password != OTHER_SAVE_PASSWORD:
            frappe.throw("Invalid confirmation. Please enter 'save_and_edit' to save.")


def _verify_delete_password(password):
    """Verify delete password."""
    if password != DELETE_PASSWORD:
        frappe.throw("Invalid confirmation. Please enter 'sure_delete' to delete.")


def _count_folder_contents(folder_path):
    """Count files and folders inside a directory recursively."""
    if not os.path.isdir(folder_path):
        return 0, 0
    
    files_count = 0
    folders_count = 0
    
    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        files_count += len([f for f in files if not f.startswith(".")])
        folders_count += len(dirs)
    
    return files_count, folders_count


def _get_backup_folder_for_file(app_path, file_path):
    """
    Get backup folder based on file location.
    Backup folder is created next to the file with name: {filename_without_ext}_bck
    Special case: hooks.py -> hooks_bck
    """
    filename = os.path.basename(file_path)
    filename_without_ext = os.path.splitext(filename)[0]
    
    file_dir = os.path.dirname(os.path.join(app_path, file_path))
    
    if filename == HOOKS_FILE:
        backup_folder = os.path.join(file_dir, HOOKS_BACKUP_FOLDER)
    else:
        backup_folder = os.path.join(file_dir, f"{filename_without_ext}_bck")
    
    return backup_folder


def _ensure_backup_folder(backup_folder):
    """Create backup folder if it does not exist."""
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder, exist_ok=True)
    return backup_folder


# =====================================================
# API Functions
# =====================================================

@frappe.whitelist()
def get_installed_apps():
    """Get list of installed apps, filtering frappe for unauthorized users."""
    apps = frappe.get_installed_apps()
    
    if not _is_authorized_user():
        apps = [app for app in apps if app.lower() != "frappe"]
    
    return apps


@frappe.whitelist()
def list_app_folder_files(app_name, path=""):
    """List files and folders in an app directory."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(path):
        frappe.throw("Invalid path.")
    
    app_path = _get_app_path(app_name)
    target_path = os.path.join(app_path, path) if path else app_path
    
    if not os.path.isdir(target_path):
        frappe.throw(f"Directory not found: {path}")
    
    files = []
    
    try:
        entries = os.listdir(target_path)
    except PermissionError:
        frappe.throw("Permission denied to access this directory.")
        return []
    
    for fn in entries:
        if fn.startswith(".") or fn == "__pycache__":
            continue
        
        full_path = os.path.join(target_path, fn)
        rel_path = os.path.join(path, fn) if path else fn
        is_dir = os.path.isdir(full_path)
        
        file_info = {
            "name": fn,
            "path": rel_path,
            "is_dir": is_dir,
            "is_file": not is_dir,
            "is_backup_folder": _is_backup_folder(fn) if is_dir else False
        }
        
        if not is_dir:
            try:
                stat = os.stat(full_path)
                file_info["size"] = stat.st_size
            except:
                file_info["size"] = 0
        
        files.append(file_info)
    
    return files


@frappe.whitelist()
def read_file_content(app_name, file_path):
    """Read file content."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    if not os.path.isfile(full_path):
        frappe.throw("File not found.")
    
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        frappe.throw("Cannot read binary file.")
    except Exception as e:
        frappe.throw(f"Error reading file: {e}")


@frappe.whitelist()
def write_file_content_with_backup(app_name, file_path, content, password):
    """Write file with auto backup."""
    _check_frappe_app_access(app_name)
    _verify_save_password(app_name, password)
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    if not os.path.isfile(full_path):
        frappe.throw(f"File not found: {file_path}")
    
    filename = os.path.basename(file_path)
    
    backup_folder = _get_backup_folder_for_file(app_path, file_path)
    _ensure_backup_folder(backup_folder)
    
    ts = time.strftime("%Y%m%d-%H%M%S")
    backup_filename = f"{filename}.bak.{ts}"
    backup_path = os.path.join(backup_folder, backup_filename)
    
    try:
        shutil.copy2(full_path, backup_path)
    except Exception as e:
        frappe.throw(f"Failed to backup file: {e}")
    
    try:
        with open(full_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content if content is not None else "")
    except Exception as e:
        frappe.throw(f"Failed to write file: {e}")
    
    backup_folder_name = os.path.basename(backup_folder)
    
    return {
        "success": True,
        "message": f"Saved successfully! Backup: {backup_folder_name}/{backup_filename}",
        "backup_folder": backup_folder_name,
        "backup_file": backup_filename
    }


@frappe.whitelist()
def create_new_file(app_name, folder_path, file_name, password):
    """Create a new file."""
    _check_frappe_app_access(app_name)
    _verify_save_password(app_name, password)
    
    if not _is_safe_path(folder_path) or not _is_safe_path(file_name):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    target_dir = os.path.join(app_path, folder_path) if folder_path else app_path
    full_path = os.path.join(target_dir, file_name)
    
    if not os.path.isdir(target_dir):
        frappe.throw(f"Directory not found: {folder_path or 'root'}")
    
    if os.path.exists(full_path):
        frappe.throw(f"File already exists: {file_name}")
    
    ext = os.path.splitext(file_name)[1].lower()
    templates = {
        ".py": "# -*- coding: utf-8 -*-\n\nimport frappe\n\n",
        ".js": "// Client Script\n\nfrappe.ui.form.on('', {\n    refresh(frm) {\n        // Your code here\n    }\n});\n",
        ".json": "{\n\n}\n",
        ".html": "<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n\n</body>\n</html>\n",
        ".css": "/* Styles */\n\n",
        ".md": "# Title\n\n"
    }
    
    try:
        with open(full_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(templates.get(ext, ""))
    except Exception as e:
        frappe.throw(f"Failed to create file: {e}")
    
    rel_path = os.path.join(folder_path, file_name) if folder_path else file_name
    
    return {
        "success": True,
        "message": f"Created: {file_name}",
        "file_path": rel_path
    }


@frappe.whitelist()
def create_new_folder(app_name, parent_path, folder_name, password):
    """Create a new folder."""
    _check_frappe_app_access(app_name)
    _verify_save_password(app_name, password)
    
    if not _is_safe_path(parent_path) or not _is_safe_path(folder_name):
        frappe.throw("Invalid path or folder name.")
    
    app_path = _get_app_path(app_name)
    target_dir = os.path.join(app_path, parent_path) if parent_path else app_path
    full_path = os.path.join(target_dir, folder_name)
    
    if not os.path.isdir(target_dir):
        frappe.throw(f"Parent directory not found: {parent_path or 'root'}")
    
    if os.path.exists(full_path):
        frappe.throw(f"Folder already exists: {folder_name}")
    
    try:
        os.makedirs(full_path)
    except Exception as e:
        frappe.throw(f"Failed to create folder: {e}")
    
    return {
        "success": True,
        "message": f"Created folder: {folder_name}"
    }


@frappe.whitelist()
def delete_file(app_name, file_path, password):
    """Delete a file and its backups. Only authorized user can delete."""
    _check_frappe_app_access(app_name)
    
    if not _is_authorized_user():
        frappe.throw("Access denied: Only authorized user can delete files.")
    
    _verify_delete_password(password)
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    if not os.path.isfile(full_path):
        frappe.throw("File not found.")
    
    filename = os.path.basename(file_path)
    
    backup_folder = _get_backup_folder_for_file(app_path, file_path)
    backups_deleted = 0
    
    if os.path.exists(backup_folder):
        for fn in os.listdir(backup_folder):
            if fn.startswith(f"{filename}.bak.") or fn.startswith(f"{filename}.pre-restore."):
                try:
                    os.remove(os.path.join(backup_folder, fn))
                    backups_deleted += 1
                except:
                    pass
        
        try:
            if os.path.exists(backup_folder) and not os.listdir(backup_folder):
                os.rmdir(backup_folder)
        except:
            pass
    
    try:
        os.remove(full_path)
    except Exception as e:
        frappe.throw(f"Failed to delete file: {e}")
    
    return {
        "success": True,
        "message": f"Deleted: {filename}",
        "backups_deleted": backups_deleted
    }


@frappe.whitelist()
def delete_folder(app_name, folder_path, password):
    """Delete a folder. Only authorized user can delete. Can delete non-empty folders."""
    _check_frappe_app_access(app_name)
    
    if not _is_authorized_user():
        frappe.throw("Access denied: Only authorized user can delete folders.")
    
    _verify_delete_password(password)
    
    if not _is_safe_path(folder_path):
        frappe.throw("Invalid folder path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, folder_path)
    
    if not os.path.isdir(full_path):
        frappe.throw("Folder not found.")
    
    folder_name = os.path.basename(folder_path)
    
    files_count, folders_count = _count_folder_contents(full_path)
    
    try:
        shutil.rmtree(full_path)
    except Exception as e:
        frappe.throw(f"Failed to delete folder: {e}")
    
    message = f"Deleted folder: {folder_name}"
    if files_count > 0 or folders_count > 0:
        message += f" (including {files_count} files and {folders_count} subfolders)"
    
    return {
        "success": True,
        "message": message,
        "files_deleted": files_count,
        "folders_deleted": folders_count
    }


@frappe.whitelist()
def rename_item(app_name, old_path, new_name, password):
    """Rename a file or folder."""
    _check_frappe_app_access(app_name)
    _verify_save_password(app_name, password)
    
    if not _is_safe_path(old_path) or not _is_safe_path(new_name):
        frappe.throw("Invalid path or name.")
    
    app_path = _get_app_path(app_name)
    full_old_path = os.path.join(app_path, old_path)
    
    if not os.path.exists(full_old_path):
        frappe.throw("Item not found.")
    
    parent_dir = os.path.dirname(full_old_path)
    full_new_path = os.path.join(parent_dir, new_name)
    
    if os.path.exists(full_new_path):
        frappe.throw(f"Item already exists: {new_name}")
    
    try:
        os.rename(full_old_path, full_new_path)
    except Exception as e:
        frappe.throw(f"Failed to rename: {e}")
    
    parent_rel = os.path.dirname(old_path)
    new_rel_path = os.path.join(parent_rel, new_name) if parent_rel else new_name
    
    return {
        "success": True,
        "message": f"Renamed to: {new_name}",
        "new_path": new_rel_path
    }


@frappe.whitelist()
def list_file_backups(app_name, file_path):
    """Return list of backups for a specific file."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    filename = os.path.basename(file_path)
    
    backup_folder = _get_backup_folder_for_file(app_path, file_path)
    
    if not os.path.exists(backup_folder):
        return []
    
    backups = []
    prefix = f"{filename}.bak."
    
    try:
        for fn in sorted(os.listdir(backup_folder), reverse=True):
            if fn.startswith(prefix):
                full_backup_path = os.path.join(backup_folder, fn)
                try:
                    stat = os.stat(full_backup_path)
                    backups.append({
                        "filename": fn,
                        "timestamp": fn.replace(prefix, ""),
                        "size": stat.st_size,
                        "size_formatted": _format_file_size(stat.st_size),
                        "created": time.ctime(stat.st_mtime)
                    })
                except:
                    pass
    except Exception as e:
        frappe.log_error(f"Error listing backups: {e}")
    
    return backups


@frappe.whitelist()
def restore_backup(app_name, file_path, backup_filename, password):
    """Restore a specific backup."""
    _check_frappe_app_access(app_name)
    _verify_save_password(app_name, password)
    
    if not _is_safe_path(file_path) or not _is_safe_path(backup_filename):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    filename = os.path.basename(file_path)
    
    backup_folder = _get_backup_folder_for_file(app_path, file_path)
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    _ensure_backup_folder(backup_folder)
    ts = time.strftime("%Y%m%d-%H%M%S")
    pre_restore = os.path.join(backup_folder, f"{filename}.pre-restore.{ts}")
    
    try:
        if os.path.isfile(full_path):
            shutil.copy2(full_path, pre_restore)
        shutil.copy2(backup_file, full_path)
    except Exception as e:
        frappe.throw(f"Failed to restore backup: {e}")
    
    return {
        "success": True,
        "message": f"Restored from: {backup_filename}"
    }


@frappe.whitelist()
def read_backup_content(app_name, file_path, backup_filename):
    """Read content of a specific backup."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path) or not _is_safe_path(backup_filename):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    backup_folder = _get_backup_folder_for_file(app_path, file_path)
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    try:
        with open(backup_file, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        frappe.throw("Cannot read binary file.")
    except Exception as e:
        frappe.throw(f"Error reading backup: {e}")


@frappe.whitelist()
def check_user_permissions():
    """Return current user permissions for UI adjustment."""
    return {
        "user": frappe.session.user,
        "is_authorized": _is_authorized_user(),
        "can_delete": _is_authorized_user(),
        "can_access_frappe": _is_authorized_user()
    }
