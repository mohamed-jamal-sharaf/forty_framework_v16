# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class OperationGuideDATA(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		attachment: DF.Attach | None
		block_type: DF.LongText | None
		code: DF.LongText | None
		custom_aspect_ratio: DF.Literal["16:9 (Default)", "1:1 (Square)", "3:4 (Portrait)", "4:5 (Instagram)", "A4 (Document)", "Auto (Content Height)"]
		custom_photo_height: DF.LongText | None
		custom_photo_width: DF.LongText | None
		custom_sort_order: DF.TextEditor | None
		custom_todo_checked: DF.Check
		description: DF.LongText | None
		embed: DF.LongText | None
		embed_code: DF.Text | None
		embed_url: DF.LongText | None
		header: DF.LongText | None
		js_code: DF.Code | None
		link: DF.LongText | None
		list: DF.LongText | None
		operation_guide_title: DF.LongText | None
		photo: DF.AttachImage | None
		python_code: DF.Code | None
		text: DF.TextEditor | None
		title: DF.LongText | None
	# end: auto-generated types

	pass
