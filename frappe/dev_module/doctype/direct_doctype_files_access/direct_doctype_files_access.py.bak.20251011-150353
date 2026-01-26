# apps/frappe/frappe/dev_module/doctype/direct_doctype_files_access/direct_doctype_files_access.py

import frappe
from frappe.query_builder import DocType
from frappe.utils import cint

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def doctypes_query(doctype, txt, searchfield, start, page_len, filters):
    """
    Whitelisted Link query for the 'target_doctype' Link field.
    Must return a list of tuples [(name,), ...]
    """
    excluded = ["Direct Doctype Files Access", "CODE EDITOR Pro"]

    DT = DocType("DocType")
    page_len = cint(page_len) or 20
    start = cint(start) or 0

    qb = (
        frappe.qb.from_(DT)
        .select(DT.name)
        .where(DT.issingle == 0)
        .where(DT.istable == 0)
        .where(DT.name.notin(excluded))
    )

    # Your dev_module field links to Module Def (stores the *title* like "DEV MODULE")
    module_title = (filters or {}).get("module")
    if module_title:
        qb = qb.where(DT.module == module_title)

    if txt:
        qb = qb.where(DT.name.like(f"%{txt}%"))

    rows = qb.orderby(DT.name).limit(page_len).offset(start).run(as_dict=True)
    return [(r["name"],) for r in rows]