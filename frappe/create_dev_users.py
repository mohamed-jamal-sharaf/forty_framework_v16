import frappe
from frappe.utils.password import update_password

def execute():
    """Create Developer users with full permissions"""
    
    developers = [
        {"email": "developer_1@fortycloud.io", "first_name": "Developer", "last_name": "1", "password": "Dev1@Forty2025"},
        {"email": "developer_2@fortycloud.io", "first_name": "Developer", "last_name": "2", "password": "Dev2@Forty2025"},
        {"email": "developer_3@fortycloud.io", "first_name": "Developer", "last_name": "3", "password": "Dev3@Forty2025"},
        {"email": "developer_4@fortycloud.io", "first_name": "Developer", "last_name": "4", "password": "Dev4@Forty2025"},
    ]
    
    for dev in developers:
        email = dev["email"]
        
        if frappe.db.exists("User", email):
            print(f"⏭️  User already exists: {email}")
            continue
        
        user = frappe.new_doc("User")
        user.email = email
        user.first_name = dev["first_name"]
        user.last_name = dev["last_name"]
        user.user_type = "System User"
        user.enabled = 1
        user.send_welcome_email = 0
        user.thread_notify = 0
        user.send_me_a_copy = 0
        user.append("roles", {"role": "Administrator"})
        user.flags.ignore_permissions = True
        user.flags.ignore_password_policy = True
        user.insert(ignore_if_duplicate=True)
        
        frappe.get_doc("User", email).add_roles(*frappe.get_all("Role", pluck="name"))
        update_password(email, dev["password"])
        print(f"✅ Developer user created: {email}")
    
    frappe.db.commit()
    print("✅ All developer users created successfully!")
