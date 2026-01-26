# Copyright (c) 2026, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class AppFilesExplorer(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		app_name: DF.Literal[None]
		file_path: DF.Data | None
		my_code: DF.Code | None
		target_path: DF.Data | None
	# end: auto-generated types

	pass
