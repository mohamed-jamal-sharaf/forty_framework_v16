# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt


from frappe.model.document import Document


class SMSLog(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		api_response: DF.Code | None
		error_message: DF.Text | None
		message: DF.SmallText | None
		mobile_number: DF.Data | None
		no_of_requested_sms: DF.Int
		no_of_sent_sms: DF.Int
		requested_numbers: DF.Code | None
		sender: DF.Link | None
		sender_name: DF.Data | None
		sent_on: DF.Datetime | None
		sent_to: DF.Code | None
		status: DF.Literal["Pending", "Sent", "Failed"]
	# end: auto-generated types

	pass
