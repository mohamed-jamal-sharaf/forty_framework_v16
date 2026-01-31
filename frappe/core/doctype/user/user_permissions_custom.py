import frappe

# ══════════════════════════════════════════════════════════════════════════════
# USER VISIBILITY PERMISSIONS - Capital Project
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
    """
    
    if not user:
        return ""
    
    # Admin users can see everything
    if user in ADMIN_USERS:
        return ""
    
    # Check if user has Administrator role
    if is_administrator(user):
        return ""
    
    # For DevRole users or any non-admin user
    if has_dev_role(user):
        protected_users_str = ", ".join([f"'{u}'" for u in PROTECTED_USERS])
        
        conditions = f"""
            (`tabUser`.`name` = '{user}' OR `tabUser`.`owner` = '{user}')
            AND `tabUser`.`name` NOT IN ({protected_users_str})
        """
        return conditions
    
    # Default: only see themselves
    return f"`tabUser`.`name` = '{user}'"


def has_permission(doc, ptype, user):
    """
    Check if user has permission to access a specific User document
    """
    
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
        
        return False
    
    return doc.name == user


def is_administrator(user):
    """Check if user has Administrator role"""
    if user == "Administrator":
        return True
    
    try:
        roles = frappe.get_roles(user)
        return "Administrator" in roles
    except:
        return False


def has_dev_role(user):
    """Check if user has DevRole"""
    try:
        roles = frappe.get_roles(user)
        return "DevRole" in roles
    except:
        return False
