# Copyright (c) 2026, Forty Technologies and contributors
# For license information, please see license.txt

import os
import shutil
import time
import frappe
from frappe.model.document import Document


# Allowed extensions
ALLOWED_EXT = {".py", ".js", ".json", ".md", ".html", ".css", ".scss", ".sql", ".txt", ".xml", ".yaml", ".yml", ".sh"}

# Backup folder name
BACKUP_FOLDER_NAME = "backups"

# Authorized users for frappe app access
AUTHORIZED_USERS = ["Administrator", "mohamed.sharaf.secured@gmail.com"]


class AppFilesExplorer(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        app_name: DF.Literal[None]
        file_path: DF.Data | None
        my_code: DF.Code | None
        target_path: DF.Data | None

    # end: auto-generated types

    pass


# =====================================================
# Helper Functions
# =====================================================

def _is_authorized_for_frappe_app():
    """Check if current user can access frappe app files."""
    return frappe.session.user in AUTHORIZED_USERS


def _check_frappe_app_access(app_name):
    """Raise error if unauthorized user tries to access frappe app."""
    if app_name and app_name.lower() == "frappe" and not _is_authorized_for_frappe_app():
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


def _get_extension_folder(filename):
    """Return folder name based on file extension."""
    _, ext = os.path.splitext(filename)
    return ext.lower().lstrip(".")


def _get_backup_folder(base_path, filename):
    """Create backups/extension folder if not exists."""
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base_path, BACKUP_FOLDER_NAME, ext_folder)
    
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
    
    return backup_folder


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


# =====================================================
# API Functions
# =====================================================

@frappe.whitelist()
def get_installed_apps():
    """Get list of installed apps, filtering frappe for unauthorized users."""
    apps = frappe.get_installed_apps()
    
    if not _is_authorized_for_frappe_app():
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
    for fn in os.listdir(target_path):
        if fn.startswith(".") or fn == "__pycache__" or fn == BACKUP_FOLDER_NAME:
            continue
        
        full_path = os.path.join(target_path, fn)
        rel_path = os.path.join(path, fn) if path else fn
        is_dir = os.path.isdir(full_path)
        
        file_info = {
            "name": fn,
            "path": rel_path,
            "is_dir": is_dir,
            "is_file": not is_dir
        }
        
        if not is_dir:
            try:
                stat = os.stat(full_path)
                file_info["size"] = stat.st_size
            except Exception:
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


@frappe.whitelist()
def write_file_content_with_backup(app_name, file_path, content):
    """Write file with auto backup organized by extension."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    if not os.path.isfile(full_path):
        frappe.throw("File not found.")
    
    filename = os.path.basename(file_path)
    file_dir = os.path.dirname(full_path)
    ext_folder = _get_extension_folder(filename)
    backup_folder = _get_backup_folder(file_dir, filename)
    
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
    
    return {
        "success": True,
        "message": f"Saved. Backup: {BACKUP_FOLDER_NAME}/{ext_folder}/{backup_filename}"
    }


@frappe.whitelist()
def create_new_file(app_name, folder_path, file_name):
    """Create a new file."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(folder_path) or not _is_safe_path(file_name):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    target_dir = os.path.join(app_path, folder_path) if folder_path else app_path
    full_path = os.path.join(target_dir, file_name)
    
    if os.path.exists(full_path):
        frappe.throw(f"File already exists: {file_name}")
    
    ext = os.path.splitext(file_name)[1].lower()
    templates = {
        ".py": "# -*- coding: utf-8 -*-\n\nimport frappe\n\n",
        ".js": "// Client Script\n\n",
        ".json": "{\n\n}\n",
        ".html": "<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n\n</body>\n</html>\n",
        ".css": "/* Styles */\n\n",
        ".md": "# Title\n\n"
    }
    
    content = templates.get(ext, "")
    
    try:
        with open(full_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
    except Exception as e:
        frappe.throw(f"Failed to create file: {e}")
    
    rel_path = os.path.join(folder_path, file_name) if folder_path else file_name
    
    return {
        "success": True,
        "message": f"Created: {file_name}",
        "file_path": rel_path
    }


@frappe.whitelist()
def create_new_folder(app_name, parent_path, folder_name):
    """Create a new folder."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(parent_path) or not _is_safe_path(folder_name):
        frappe.throw("Invalid path or folder name.")
    
    app_path = _get_app_path(app_name)
    target_dir = os.path.join(app_path, parent_path) if parent_path else app_path
    full_path = os.path.join(target_dir, folder_name)
    
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
def delete_file(app_name, file_path):
    """Delete a file and its backups."""
    _check_frappe_app_access(app_name)
    
    if frappe.session.user != "Administrator":
        frappe.throw("Access denied: Only Administrator can delete files.")
    
    if not _is_safe_path(file_path):
        frappe.throw("Invalid file path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    if not os.path.isfile(full_path):
        frappe.throw("File not found.")
    
    filename = os.path.basename(file_path)
    file_dir = os.path.dirname(full_path)
    
    backups_deleted = 0
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(file_dir, BACKUP_FOLDER_NAME, ext_folder)
    
    if os.path.exists(backup_folder):
        prefix = f"{filename}.bak."
        for fn in os.listdir(backup_folder):
            if fn.startswith(prefix):
                try:
                    os.remove(os.path.join(backup_folder, fn))
                    backups_deleted += 1
                except Exception:
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
def delete_folder(app_name, folder_path):
    """Delete an empty folder."""
    _check_frappe_app_access(app_name)
    
    if frappe.session.user != "Administrator":
        frappe.throw("Access denied: Only Administrator can delete folders.")
    
    if not _is_safe_path(folder_path):
        frappe.throw("Invalid folder path.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, folder_path)
    
    if not os.path.isdir(full_path):
        frappe.throw("Folder not found.")
    
    contents = os.listdir(full_path)
    if contents:
        frappe.throw("Folder is not empty. Delete all contents first.")
    
    try:
        os.rmdir(full_path)
    except Exception as e:
        frappe.throw(f"Failed to delete folder: {e}")
    
    return {
        "success": True,
        "message": f"Deleted folder: {os.path.basename(folder_path)}"
    }


@frappe.whitelist()
def rename_item(app_name, old_path, new_name):
    """Rename a file or folder."""
    _check_frappe_app_access(app_name)
    
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
    full_path = os.path.join(app_path, file_path)
    
    filename = os.path.basename(file_path)
    file_dir = os.path.dirname(full_path)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(file_dir, BACKUP_FOLDER_NAME, ext_folder)
    
    if not os.path.exists(backup_folder):
        return []
    
    backups = []
    prefix = f"{filename}.bak."
    
    for fn in sorted(os.listdir(backup_folder), reverse=True):
        if fn.startswith(prefix):
            full_backup_path = os.path.join(backup_folder, fn)
            stat = os.stat(full_backup_path)
            backups.append({
                "filename": fn,
                "timestamp": fn.replace(prefix, ""),
                "size": stat.st_size,
                "size_formatted": _format_file_size(stat.st_size),
                "created": time.ctime(stat.st_mtime),
                "folder": ext_folder
            })
    
    return backups


@frappe.whitelist()
def restore_backup(app_name, file_path, backup_filename):
    """Restore a specific backup."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path) or not _is_safe_path(backup_filename):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    filename = os.path.basename(file_path)
    file_dir = os.path.dirname(full_path)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(file_dir, BACKUP_FOLDER_NAME, ext_folder)
    
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    ts = time.strftime("%Y%m%d-%H%M%S")
    pre_restore_backup = os.path.join(backup_folder, f"{filename}.pre-restore.{ts}")
    
    try:
        shutil.copy2(full_path, pre_restore_backup)
        shutil.copy2(backup_file, full_path)
    except Exception as e:
        frappe.throw(f"Failed to restore backup: {e}")
    
    return {
        "success": True,
        "message": f"Restored from: {ext_folder}/{backup_filename}"
    }


@frappe.whitelist()
def read_backup_content(app_name, file_path, backup_filename):
    """Read content of a specific backup."""
    _check_frappe_app_access(app_name)
    
    if not _is_safe_path(file_path) or not _is_safe_path(backup_filename):
        frappe.throw("Invalid path or filename.")
    
    app_path = _get_app_path(app_name)
    full_path = os.path.join(app_path, file_path)
    
    filename = os.path.basename(file_path)
    file_dir = os.path.dirname(full_path)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(file_dir, BACKUP_FOLDER_NAME, ext_folder)
    
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    try:
        with open(backup_file, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        frappe.throw("Cannot read binary file.")