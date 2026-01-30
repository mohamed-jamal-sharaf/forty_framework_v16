# -*- coding: utf-8 -*-
"""
Server Access: Open/Edit DocType files directly from Frappe
Allows reading/saving files: .py .js .json .md .html .css inside the doctype folder.
- Protects against directory traversal (no .. or /)
- Auto backup before each save in organized folders by extension
- Keeps all backups without deletion
"""

import os
import shutil
import time
import frappe
from frappe.model.document import Document

# Allowed extensions
ALLOWED_EXT = {".py", ".js", ".json", ".md", ".html", ".css"}

# Main backup folder name
BACKUP_FOLDER_NAME = "backups"


class ServerAccess(Document):
    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        file_content: DF.Code | None
        filename: DF.Literal[None]
        last_op_log: DF.SmallText | None
        target_doctype: DF.Link | None

    pass


def _is_safe_filename(name: str) -> bool:
    """Ensure filename is safe (no / or \\ or ..)."""
    return bool(name) and ("/" not in name) and ("\\" not in name) and (".." not in name)


def _get_extension_folder(filename: str) -> str:
    """Return folder name based on file extension."""
    _, ext = os.path.splitext(filename)
    return ext.lower().lstrip(".")


def _doctype_folder_path(doctype_name: str) -> str:
    """Return the actual path to the doctype folder."""
    if not doctype_name:
        frappe.throw("Target DocType is required.")

    try:
        doctype = frappe.get_doc("DocType", doctype_name)
    except Exception:
        frappe.throw(f"Invalid DocType: {doctype_name}")

    module = doctype.module
    module_path = frappe.get_module_path(module)
    folder = frappe.scrub(doctype_name)
    path = os.path.join(module_path, "doctype", folder)

    if not os.path.isdir(path):
        frappe.throw(f"Doctype folder not found: {path}")

    return path


def _get_backup_folder(base_path: str, filename: str) -> str:
    """Create backups/extension folder if not exists."""
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base_path, BACKUP_FOLDER_NAME, ext_folder)
    
    if not os.path.exists(backup_folder):
        os.makedirs(backup_folder)
    
    return backup_folder


def _format_file_size(size_bytes: int) -> str:
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


@frappe.whitelist()
def list_doctype_files(target_doctype: str) -> list:
    """Return list of editable files in doctype folder."""
    base = _doctype_folder_path(target_doctype)
    files = []
    for fn in sorted(os.listdir(base)):
        if fn == BACKUP_FOLDER_NAME:
            continue
        full = os.path.join(base, fn)
        if os.path.isfile(full):
            _, ext = os.path.splitext(fn)
            if ext.lower() in ALLOWED_EXT:
                files.append(fn)
    return files


@frappe.whitelist()
def read_doctype_file(target_doctype: str, filename: str) -> str:
    """Read file content from doctype folder."""
    if not _is_safe_filename(filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    full = os.path.join(base, filename)

    if not os.path.isfile(full):
        frappe.throw("File not found.")

    with open(full, "r", encoding="utf-8") as f:
        return f.read()


@frappe.whitelist()
def get_non_frappe_doctypes(doctype, txt, searchfield, start, page_len, filters):
    """Get DocTypes that don't belong to the frappe app."""
    frappe_modules = frappe.get_all(
        "Module Def",
        filters={"app_name": "frappe"},
        pluck="name"
    )
    
    return frappe.db.sql("""
        SELECT name, module
        FROM `tabDocType`
        WHERE 
            module NOT IN %(frappe_modules)s
            AND (name LIKE %(txt)s OR module LIKE %(txt)s)
            AND istable = 0
        ORDER BY name
        LIMIT %(start)s, %(page_len)s
    """, {
        "frappe_modules": frappe_modules,
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })


@frappe.whitelist()
def save_doctype_file(target_doctype: str, filename: str, content: str) -> str:
    """Save file with auto backup in organized folder."""
    if not _is_safe_filename(filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    full = os.path.join(base, filename)

    if not os.path.isfile(full):
        frappe.throw("File not found.")

    ext_folder = _get_extension_folder(filename)
    backup_folder = _get_backup_folder(base, filename)

    ts = time.strftime("%Y%m%d-%H%M%S")
    backup_filename = f"{filename}.bak.{ts}"
    backup_path = os.path.join(backup_folder, backup_filename)

    try:
        shutil.copy2(full, backup_path)
    except Exception as e:
        frappe.throw(f"Failed to backup file: {e}")

    try:
        with open(full, "w", encoding="utf-8", newline="\n") as f:
            f.write(content if content is not None else "")
    except Exception as e:
        frappe.throw(f"Failed to write file: {e}")

    return f"Saved. Backup: {BACKUP_FOLDER_NAME}/{ext_folder}/{backup_filename}"


@frappe.whitelist()
def list_backup_folders(target_doctype: str) -> list:
    """Return list of backup folders by extension."""
    base = _doctype_folder_path(target_doctype)
    backup_base = os.path.join(base, BACKUP_FOLDER_NAME)
    
    if not os.path.exists(backup_base):
        return []
    
    folders = []
    for fn in sorted(os.listdir(backup_base)):
        full_path = os.path.join(backup_base, fn)
        if os.path.isdir(full_path):
            file_count = len([f for f in os.listdir(full_path) if os.path.isfile(os.path.join(full_path, f))])
            folders.append({
                "extension": fn,
                "path": f"{BACKUP_FOLDER_NAME}/{fn}",
                "file_count": file_count
            })
    
    return folders


@frappe.whitelist()
def list_file_backups(target_doctype: str, filename: str) -> list:
    """Return list of backups for a specific file."""
    if not _is_safe_filename(filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base, BACKUP_FOLDER_NAME, ext_folder)
    
    if not os.path.exists(backup_folder):
        return []
    
    backups = []
    prefix = f"{filename}.bak."
    
    for fn in sorted(os.listdir(backup_folder), reverse=True):
        if fn.startswith(prefix):
            full_path = os.path.join(backup_folder, fn)
            stat = os.stat(full_path)
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
def restore_backup(target_doctype: str, filename: str, backup_filename: str) -> str:
    """Restore a specific backup."""
    if not _is_safe_filename(filename) or not _is_safe_filename(backup_filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base, BACKUP_FOLDER_NAME, ext_folder)
    
    original_file = os.path.join(base, filename)
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    ts = time.strftime("%Y%m%d-%H%M%S")
    pre_restore_backup = os.path.join(backup_folder, f"{filename}.pre-restore.{ts}")
    
    try:
        shutil.copy2(original_file, pre_restore_backup)
        shutil.copy2(backup_file, original_file)
    except Exception as e:
        frappe.throw(f"Failed to restore backup: {e}")
    
    return f"Restored from: {ext_folder}/{backup_filename}"


@frappe.whitelist()
def read_backup_file(target_doctype: str, filename: str, backup_filename: str) -> str:
    """Read content of a specific backup."""
    if not _is_safe_filename(filename) or not _is_safe_filename(backup_filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base, BACKUP_FOLDER_NAME, ext_folder)
    
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    with open(backup_file, "r", encoding="utf-8") as f:
        return f.read()


@frappe.whitelist()
def delete_backup(target_doctype: str, filename: str, backup_filename: str) -> str:
    """Delete a specific backup."""
    if not _is_safe_filename(filename) or not _is_safe_filename(backup_filename):
        frappe.throw("Invalid file name.")

    base = _doctype_folder_path(target_doctype)
    ext_folder = _get_extension_folder(filename)
    backup_folder = os.path.join(base, BACKUP_FOLDER_NAME, ext_folder)
    
    backup_file = os.path.join(backup_folder, backup_filename)
    
    if not os.path.isfile(backup_file):
        frappe.throw("Backup file not found.")
    
    try:
        os.remove(backup_file)
    except Exception as e:
        frappe.throw(f"Failed to delete backup: {e}")
    
    return f"Deleted: {ext_folder}/{backup_filename}"
