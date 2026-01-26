# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class APPLICATIONFORMSETTING(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.job_application_tracking_system.doctype.application_form_activity_log.application_form_activity_log import ApplicationFormActivityLog
		from frappe.job_application_tracking_system.doctype.project_number_table.project_number_table import ProjectNumberTable
		from frappe.types import DF

		activity_log: DF.Table[ApplicationFormActivityLog]
		internal_project_number: DF.Int
		multi_projects: DF.Literal["", "Nominated Project / Proposal", "Multi Projects / Proposals"]
		project_number_table: DF.Table[ProjectNumberTable]
		specific_for_project: DF.Literal["", "Yes", "No"]
	# end: auto-generated types

	pass
