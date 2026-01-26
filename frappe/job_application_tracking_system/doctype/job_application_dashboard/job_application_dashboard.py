# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class JobApplicationDashboard(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from_date: DF.Date | None
		general_applications_count: DF.Int
		project_specific_count: DF.Int
		recent_applications_count: DF.Int
		to_date: DF.Date | None
		total_applications: DF.Int
	# end: auto-generated types

	pass
