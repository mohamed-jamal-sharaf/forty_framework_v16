# -* - coding: utf - 8 -* -
# restart_api.py
# Bench Operations API for Frappe
# Place this file in: frappe / api / restart_api.py

import os
import subprocess
import threading
import time
import sys
import json
import traceback
import frappe
    from frappe import _
    from frappe.utils import now_datetime, get_datetime_str

# =====================================================
# CONFIGURATION - Update these for your server
# =====================================================
    CONFIG = {
        "bench_user": "frappe",
        "bench_path": "/home/frappe/forty-bench",
        "supervisor_group": "forty-bench-web",
        "site": "dms.fortycloud.io"
    }
# =====================================================

    CACHE_PREFIX = "bench_operation_"


def get_progress(operation_id):
"""Get operation progress from Redis cache"""
try:
data = frappe.cache().get_value(f"{CACHE_PREFIX}{operation_id}")
if data:
    if isinstance(data, str):
        return json.loads(data)
return data
except:
pass
return None


def set_progress(operation_id, data):
"""Set operation progress in Redis cache"""
try:
frappe.cache().set_value(
    f"{CACHE_PREFIX}{operation_id}",
    json.dumps(data) if isinstance(data, dict) else data,
        expires_in_sec = 3600
        )
except:
pass


def add_log(operation_id, message):
"""Add a log entry"""
data = get_progress(operation_id)
if data:
    data["logs"].append({
        "time": get_datetime_str(now_datetime()),
        "message": str(message)
    })
data["message"] = str(message)[: 100]
set_progress(operation_id, data)


def update_progress(operation_id, progress, message):
"""Update progress"""
data = get_progress(operation_id)
if data:
    data["progress"] = progress
data["message"] = str(message)[: 100]
set_progress(operation_id, data)


def complete_operation(operation_id, success = True, message = ""):
"""Mark operation complete"""
data = get_progress(operation_id)
if data:
    data["status"] = "completed" if success else "error"
data["progress"] = 100
data["message"] = message
data["completed_at"] = get_datetime_str(now_datetime())
set_progress(operation_id, data)


# =====================================================
# MIGRATE - Using Frappe's enqueue for background job
# =====================================================

    @frappe.whitelist()
def run_migrate(sudo_password = None):
"""Run bench migrate"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

operation_id = f"migrate_{int(time.time())}"
    
    # Initialize in Redis
data = {
    "operation": "migrate",
    "status": "running",
    "progress": 5,
    "message": "Starting migration...",
    "started_at": get_datetime_str(now_datetime()),
    "logs": [{ "time": get_datetime_str(now_datetime()), "message": "📦 Migration initiated" }]
}
set_progress(operation_id, data)
    
    # Use frappe.enqueue instead of threading
frappe.enqueue(
    "frappe.api.restart_api.execute_migrate_job",
    queue = "long",
    timeout = 600,
    operation_id = operation_id,
    sudo_password = sudo_password
)

return { "success": True, "operation_id": operation_id }


def execute_migrate_job(operation_id, sudo_password = None):
"""Background job for migration"""
try:
site = CONFIG["site"]
bench_path = CONFIG["bench_path"]
bench_user = CONFIG["bench_user"]

add_log(operation_id, f"📦 Migrating site: {site}")
update_progress(operation_id, 10, "Preparing...")
        
        # Build command
if sudo_password:
    cmd = f"echo '{sudo_password}' | sudo -S -u {bench_user} bash -c 'cd {bench_path} && bench --site {site} migrate' 2>&1"
        else:
cmd = f"cd {bench_path} && bench --site {site} migrate 2>&1"

add_log(operation_id, "🔄 Running bench migrate...")
update_progress(operation_id, 15, "Running migrations...")

result = subprocess.run(
    cmd,
    shell = True,
    capture_output = True,
    text = True,
    timeout = 600,
    cwd = bench_path
)

output = result.stdout or ""

if output:
    lines = [l.strip() for l in output.split('\n') if l.strip() and 'password' not in l.lower()]
for i, line in enumerate(lines):
    add_log(operation_id, line)
progress = 15 + int(75 * (i + 1) / max(len(lines), 1))
update_progress(operation_id, min(progress, 95), line[: 60])

if result.returncode == 0 or "Updating" in output or "Syncing" in output:
add_log(operation_id, "✅ Migration completed!")
complete_operation(operation_id, True, "✅ Migration completed")
        else:
add_log(operation_id, f"⚠️ Exit code: {result.returncode}")
complete_operation(operation_id, True, "⚠️ Check logs")
            
    except Exception as e:
add_log(operation_id, f"❌ Error: {str(e)}")
complete_operation(operation_id, False, f"❌ {str(e)}")


# =====================================================
# RESTART
# =====================================================

    @frappe.whitelist()
def restart_bench(sudo_password = None):
"""Restart bench"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

operation_id = f"restart_{int(time.time())}"

data = {
    "operation": "restart",
    "status": "running",
    "progress": 5,
    "message": "Starting restart...",
    "started_at": get_datetime_str(now_datetime()),
    "logs": [{ "time": get_datetime_str(now_datetime()), "message": "🔄 Restart initiated" }]
}
set_progress(operation_id, data)
    
    # Use frappe.enqueue
frappe.enqueue(
    "frappe.api.restart_api.execute_restart_job",
    queue = "short",
    timeout = 120,
    operation_id = operation_id,
    sudo_password = sudo_password
)

return { "success": True, "operation_id": operation_id }


@frappe.whitelist()
def restart_bench_with_sudo(sudo_password):
"""Restart with sudo"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))
if not sudo_password:
    frappe.throw(_("Sudo password required"))
return restart_bench(sudo_password)


def execute_restart_job(operation_id, sudo_password = None):
"""Background job for restart"""
try:
supervisor_group = CONFIG["supervisor_group"]

add_log(operation_id, f"🔄 Restarting: {supervisor_group}")
update_progress(operation_id, 20, "Restarting...")

if sudo_password:
    cmd = f"echo '{sudo_password}' | sudo -S supervisorctl restart {supervisor_group}: 2>&1"
        else:
cmd = f"supervisorctl restart {supervisor_group}: 2>&1"

result = subprocess.run(
    cmd,
    shell = True,
    capture_output = True,
    text = True,
    timeout = 120
)

output = result.stdout or ""

if output:
    for line in output.split('\n'):
        if line.strip() and 'password' not in line.lower():
add_log(operation_id, line.strip())

if "started" in output.lower():
    add_log(operation_id, "✅ Restart completed!")
complete_operation(operation_id, True, "✅ Bench restarted")
        else:
complete_operation(operation_id, True, "⚠️ Check logs")
            
    except Exception as e:
add_log(operation_id, f"❌ Error: {str(e)}")
complete_operation(operation_id, False, f"❌ {str(e)}")


# =====================================================
# BUILD
# =====================================================

    @frappe.whitelist()
def run_build(sudo_password = None, app = None):
"""Run bench build"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

operation_id = f"build_{int(time.time())}"

data = {
    "operation": "build",
    "status": "running",
    "progress": 5,
    "message": "Starting build...",
    "started_at": get_datetime_str(now_datetime()),
    "logs": [{ "time": get_datetime_str(now_datetime()), "message": "🔨 Build initiated" }]
}
set_progress(operation_id, data)

frappe.enqueue(
    "frappe.api.restart_api.execute_build_job",
    queue = "long",
    timeout = 600,
    operation_id = operation_id,
    sudo_password = sudo_password,
    app = app
)

return { "success": True, "operation_id": operation_id }


def execute_build_job(operation_id, sudo_password = None, app = None):
"""Background job for build"""
try:
bench_path = CONFIG["bench_path"]
bench_user = CONFIG["bench_user"]

build_cmd = f"bench build --app {app}" if app else "bench build"
add_log(operation_id, f"🔨 Running: {build_cmd}")
update_progress(operation_id, 10, "Building...")

if sudo_password:
    cmd = f"echo '{sudo_password}' | sudo -S -u {bench_user} bash -c 'cd {bench_path} && {build_cmd}' 2>&1"
        else:
cmd = f"cd {bench_path} && {build_cmd} 2>&1"

result = subprocess.run(
    cmd,
    shell = True,
    capture_output = True,
    text = True,
    timeout = 600,
    cwd = bench_path
)

output = result.stdout or ""

if output:
    lines = [l.strip() for l in output.split('\n') if l.strip() and 'password' not in l.lower()]
for i, line in enumerate(lines):
    add_log(operation_id, line)
progress = 10 + int(80 * (i + 1) / max(len(lines), 1))
update_progress(operation_id, min(progress, 95), line[: 60])

if result.returncode == 0:
    add_log(operation_id, "✅ Build completed!")
complete_operation(operation_id, True, "✅ Build completed")
        else:
complete_operation(operation_id, True, "⚠️ Build finished")
            
    except Exception as e:
add_log(operation_id, f"❌ Error: {str(e)}")
complete_operation(operation_id, False, f"❌ {str(e)}")


# =====================================================
# CLEAR CACHE
# =====================================================

    @frappe.whitelist()
def run_clear_cache():
"""Clear all caches"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

try:
frappe.clear_cache()
try:
frappe.cache().flushall()
except:
pass
subprocess.run(["bench", "clear-cache"], cwd = CONFIG["bench_path"], capture_output = True, timeout = 30)
try:
frappe.clear_website_cache()
except:
pass
return { "success": True, "message": _("✅ Cache cleared!") }
    except Exception as e:
frappe.throw(f"❌ {str(e)}")


# =====================================================
# PROGRESS TRACKING
# =====================================================

    @frappe.whitelist()
def get_operation_progress(operation_id):
"""Get progress"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

data = get_progress(operation_id)
return data if data else { "status": "not_found" }


@frappe.whitelist()
def get_all_operations():
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))
return {}


@frappe.whitelist()
def clear_operation(operation_id):
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))
try:
frappe.cache().delete_value(f"{CACHE_PREFIX}{operation_id}")
return { "success": True }
except:
return { "success": False }


# =====================================================
# BENCH INFO
# =====================================================

    @frappe.whitelist()
def get_bench_info():
"""Get bench info"""
if frappe.session.user != "Administrator":
    frappe.throw(_("🚫 Access Denied"))

supervisor_status = ""
try:
result = subprocess.run(["supervisorctl", "status"], capture_output = True, text = True, timeout = 5)
supervisor_status = result.stdout
except:
supervisor_status = "Unable to get status"

return {
    "bench_path": CONFIG["bench_path"],
    "bench_user": CONFIG["bench_user"],
    "site": CONFIG["site"],
    "supervisor_group": CONFIG["supervisor_group"],
    "supervisor_running": CONFIG["supervisor_group"] in supervisor_status,
    "systemd_setup": False,
    "frappe_version": frappe.__version__,
    "python_version": f"Python {sys.version.split()[0]}",
    "installed_apps": frappe.get_installed_apps(),
    "supervisor_status": supervisor_status
}