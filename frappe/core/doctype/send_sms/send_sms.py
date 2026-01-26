# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SendSMS(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		message: DF.SmallText
		mobile_number: DF.Data
		sender: DF.Link
		test_mode: DF.Data | None
	# end: auto-generated types

	pass
