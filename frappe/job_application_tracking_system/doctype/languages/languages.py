# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Languages(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		languages: DF.Literal["Arabic", "English", "French", "Spanish", "German", "Italian", "Portuguese", "Russian", "Chinese (Mandarin)", "Japanese", "Korean", "Turkish", "Hindi", "Urdu", "Bengali", "Persian (Farsi)", "Greek", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian", "Serbian", "Croatian", "Bosnian", "Slovenian", "Albanian", "Hebrew", "Malay", "Indonesian", "Thai", "Vietnamese", "Filipino (Tagalog)", "Swahili", "Amharic", "Somali", "Pashto", "Kurdish", "Armenian", "Georgian", "Lithuanian", "Latvian", "Estonian", "Icelandic", "Irish (Gaelic)", "Scottish Gaelic", "Welsh", "Maltese"]
		level: DF.Literal["Basic", "Intermediate", "Advanced", "Fluent"]
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
	# end: auto-generated types

	pass
