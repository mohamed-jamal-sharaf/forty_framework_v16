# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SoftSkills(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		help_options: DF.Literal["Critical Thinking", "Problem Solving", "Creativity", "Innovation", "Decision Making", "Analytical Thinking", "Strategic Thinking", "Learning Agility", "Attention to Detail", "Adaptability", "Communication", "Active Listening", "Public Speaking", "Negotiation", "Persuasion", "Storytelling", "Nonverbal Communication", "Cross-Cultural Communication", "Empathy", "Emotional Intelligence", "Teamwork", "Collaboration", "Leadership", "Delegation", "Conflict Resolution", "Motivation", "Coaching & Mentoring", "Relationship Building", "Accountability", "Cultural Awareness", "Time Management", "Prioritization", "Organization", "Planning", "Goal Setting", "Multitasking", "Stress Management", "Productivity", "Work Ethic", "Reliability", "Customer Service", "Networking", "Presentation Skills", "Business Etiquette", "Flexibility", "Positive Attitude", "Self-Motivation", "Resilience", "Lifelong Learning"]
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		percentage: DF.Rating
		soft_skills: DF.Data
	# end: auto-generated types

	pass
