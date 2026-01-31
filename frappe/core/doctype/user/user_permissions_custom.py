import frappe

# ══════════════════════════════════════════════════════════════════════════════
# USER VISIBILITY PERMISSIONS - Capital Project
# ══════════════════════════════════════════════════════════════════════════════
# Rules:
# 1. Administrator: Can see all users
# 2. Mohamed Sharaf (mohamed.sharaf.secured@gmail.com): Can see all users
# 3. Developers (DevRole): Can only see themselves + users they created
# ══════════════════════════════════════════════════════════════════════════════

# Protected users that developers cannot see
PROTECTED_USERS = [
    "Administrator",
    "Guest",
    "mohamed.sharaf.secured@gmail.com"
]

# Admin users who can see everything
ADMIN_USERS = [
    "Administrator",
    "mohamed.sharaf.secured@gmail.com"
]


def get_permission_query_conditions(user):
    """
    Filter User list based on current user's role
    This function is called when listing Users in List View
    """
    
    # If no user context, return empty (allow all)
    if not user:
        return ""
    
    # Admin users can see everything
    if user in ADMIN_USERS:
        return ""
    
    # Check if user has Administrator role
    if is_administrator(user):
        return ""
    
    # For DevRole users: Can only see themselves + users they created
    if has_dev_role(user):
        # Build condition: 
        # 1. User is themselves
        # 2. OR User was created by them (owner field)
        # 3. AND NOT protected users
        
        protected_users_str = ", ".join([f"'{u}'" for u in PROTECTED_USERS])
        
        conditions = f"""
            (
                `tabUser`.`name` = '{user}'
                OR `tabUser`.`owner` = '{user}'
            )
            AND `tabUser`.`name` NOT IN ({protected_users_str})
        """
        return conditions
    
    # Default: only see themselves
    return f"`tabUser`.`name` = '{user}'"


def has_permission(doc, ptype, user):
    """
    Check if user has permission to access a specific User document
    This function is called when opening a User document
    """
    
    # If no user context, allow
    if not user:
        return True
    
    # Admin users can access everything
    if user in ADMIN_USERS:
        return True
    
    # Check if user has Administrator role
    if is_administrator(user):
        return True
    
    # For DevRole users
    if has_dev_role(user):
        # Cannot access protected users
        if doc.name in PROTECTED_USERS:
            return False
        
        # Can access themselves
        if doc.name == user:
            return True
        
        # Can access users they created
        if doc.owner == user:
            return True
        
        # Cannot access other users
        return False
    
    # Default: only access themselves
    return doc.name == user


def is_administrator(user):
    """Check if user has Administrator role"""
    if user == "Administrator":
        return True
    
    roles = frappe.get_roles(user)
    return "Administrator" in roles


def has_dev_role(user):
    """Check if user has DevRole"""
    roles = frappe.get_roles(user)
    return "DevRole" in roles
