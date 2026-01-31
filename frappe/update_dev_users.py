import frappe

def execute():
    """Update existing Developer users - Remove Administrator role, Add DevRole"""
    
    # Step 1: Create DevRole if not exists
    create_dev_role()
    
    # Step 2: Update developer users
    update_developers()
    
    frappe.db.commit()
    print("═" * 60)
    print("✅ All developer users updated successfully!")
    print("═" * 60)


def create_dev_role():
    """Create DevRole if not exists"""
    
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


def update_developers():
    """Update Developer users - Remove Administrator, Add DevRole"""
    
    developer_emails = [
        "developer_1@fortycloud.io",
        "developer_2@fortycloud.io",
        "developer_3@fortycloud.io",
        "developer_4@fortycloud.io",
    ]
    
    for email in developer_emails:
        
        # Check if user exists
        if not frappe.db.exists("User", email):
            print(f"⚠️  User not found: {email}")
            continue
        
        user = frappe.get_doc("User", email)
        
        print(f"\n{'─' * 40}")
        print(f"📝 Updating: {email}")
        print(f"{'─' * 40}")
        
        # Get current roles
        current_roles = [r.role for r in user.roles]
        print(f"   Current roles: {len(current_roles)} roles")
        
        # Check if has Administrator role
        has_admin = "Administrator" in current_roles
        print(f"   Has Administrator role: {'Yes ❌' if has_admin else 'No ✅'}")
        
        # Remove Administrator role
        if has_admin:
            user.roles = [r for r in user.roles if r.role != "Administrator"]
            print(f"   ➖ Removed Administrator role")
        
        # Add DevRole if not exists
        has_dev_role = any(r.role == "DevRole" for r in user.roles)
        if not has_dev_role:
            user.append("roles", {"role": "DevRole"})
            print(f"   ➕ Added DevRole")
        else:
            print(f"   ⏭️  DevRole already assigned")
        
        # Save user
        user.flags.ignore_permissions = True
        user.save()
        
        # Get updated roles count
        updated_roles = [r.role for r in user.roles]
        print(f"   ✅ Updated! Now has {len(updated_roles)} roles")
    
    print("")
