"""
Cleanup Orphaned DocTypes
Removes DocTypes from database when their JSON files are deleted
"""

import os
import json
import frappe

def get_all_doctype_jsons():
    """Get all DocType names that have JSON files"""
    bench_path = frappe.utils.get_bench_path()
    apps_path = os.path.join(bench_path, "apps")
    existing_doctypes = set()
    
    for app in os.listdir(apps_path):
        app_path = os.path.join(apps_path, app)
        if not os.path.isdir(app_path):
            continue
            
        for root, dirs, files in os.walk(app_path):
            if "/doctype/" not in root:
                continue
            for f in files:
                folder_name = os.path.basename(root)
                if f == f"{folder_name}.json":
                    try:
                        json_path = os.path.join(root, f)
                        with open(json_path, 'r') as jf:
                            data = json.load(jf)
                            if data.get("doctype") == "DocType":
                                existing_doctypes.add(data.get("name"))
                    except:
                        pass
    
    return existing_doctypes

def cleanup():
    """Remove DocTypes that exist in DB but not in filesystem"""
    
    existing_jsons = get_all_doctype_jsons()
    
    db_doctypes = frappe.get_all(
        "DocType",
        filters={"custom": 0},
        pluck="name"
    )
    
    protected = {
        "DocType", "DocField", "DocPerm", "Module Def", "Role", 
        "User", "Has Role", "DefaultValue", "Singles", "DocType Link",
        "DocType Action", "DocType State"
    }
    
    orphaned = []
    for dt in db_doctypes:
        if dt not in existing_jsons and dt not in protected:
            orphaned.append(dt)
    
    if not orphaned:
        print("No orphaned DocTypes found.")
        return []
    
    print(f"Found {len(orphaned)} orphaned DocTypes: {orphaned}")
    
    deleted = []
    for dt in orphaned:
        try:
            table_name = f"tab{dt}"
            
            if frappe.db.table_exists(table_name):
                print(f"  Dropping table: {table_name}")
                frappe.db.sql_ddl(f"DROP TABLE IF EXISTS `{table_name}`")
            
            frappe.db.sql("DELETE FROM `tabSingles` WHERE doctype=%s", dt)
            
            if frappe.db.exists("DocType", dt):
                print(f"  Deleting DocType: {dt}")
                frappe.db.delete("DocType", dt)
                deleted.append(dt)
                
        except Exception as e:
            print(f"  Error deleting {dt}: {e}")
    
    if deleted:
        frappe.db.commit()
        print(f"Deleted {len(deleted)} orphaned DocTypes: {deleted}")
    
    return deleted
