import frappe
from frappe.utils.password import update_password

def execute():
    """Create Developer users with restricted permissions"""
    
    # Step 1: Create DevRole if not exists
    create_dev_role()
    
    # Step 2: Create developer users
    create_developers()
    
    frappe.db.commit()
    print("✅ All developer users created successfully!")


def create_dev_role():
    """Create DevRole with full permissions except User visibility"""
    
    if frappe.db.exists("Role", "DevRole"):
        print("⏭️  DevRole already exists")
        return
    
    role = frappe.new_doc("Role")
    role.role_name = "DevRole"
    role.desk_access = 1
    role.is_custom = 1
    role.flags.ignore_permissions = True
    role.insert(ignore_if_duplicate=True)
    
    print("✅ DevRole created")


def create_developers():
    """Create Developer users with DevRole"""
    
    developers = [
        {"email": "developer_1@fortycloud.io", "first_name": "Developer", "last_name": "1", "password": "Dev1@Forty2025"},
        {"email": "developer_2@fortycloud.io", "first_name": "Developer", "last_name": "2", "password": "Dev2@Forty2025"},
        {"email": "developer_3@fortycloud.io", "first_name": "Developer", "last_name": "3", "password": "Dev3@Forty2025"},
        {"email": "developer_4@fortycloud.io", "first_name": "Developer", "last_name": "4", "password": "Dev4@Forty2025"},
    ]
    
    # Get all roles EXCEPT Administrator
    all_roles = frappe.get_all("Role", filters={"name": ["not in", ["Administrator", "Guest"]]}, pluck="name")
    
    for dev in developers:
        email = dev["email"]
        
        if frappe.db.exists("User", email):
            print(f"⏭️  User already exists: {email}")
            # Update existing user - remove Administrator role, add DevRole
            user = frappe.get_doc("User", email)
            
            # Remove Administrator role if exists
            user.roles = [r for r in user.roles if r.role != "Administrator"]
            
            # Add DevRole if not exists
            has_dev_role = any(r.role == "DevRole" for r in user.roles)
            if not has_dev_role:
                user.append("roles", {"role": "DevRole"})
            
            user.flags.ignore_permissions = True
            user.save()
            print(f"✅ Updated user roles: {email}")
            continue
        
        # Create new user
        user = frappe.new_doc("User")
        user.email = email
        user.first_name = dev["first_name"]
        user.last_name = dev["last_name"]
        user.user_type = "System User"
        user.enabled = 1
        user.send_welcome_email = 0
        user.thread_notify = 0
        user.send_me_a_copy = 0
        
        # Add DevRole (NOT Administrator)
        user.append("roles", {"role": "DevRole"})
        
        user.flags.ignore_permissions = True
        user.flags.ignore_password_policy = True
        user.insert(ignore_if_duplicate=True)
        
        # Add all roles EXCEPT Administrator
        frappe.get_doc("User", email).add_roles(*all_roles)
        
        # Set password
        update_password(email, dev["password"])
        print(f"✅ Developer user created: {email}")
