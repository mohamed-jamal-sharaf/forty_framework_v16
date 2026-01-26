# Copyright (c) 2025, Forty Technologies and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class JobApplicationForm(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.job_application_tracking_system.doctype.international_certification.international_certification import InternationalCertification
		from frappe.job_application_tracking_system.doctype.languages.languages import Languages
		from frappe.job_application_tracking_system.doctype.project_number_table.project_number_table import ProjectNumberTable
		from frappe.job_application_tracking_system.doctype.projects_involved.projects_involved import ProjectsInvolved
		from frappe.job_application_tracking_system.doctype.soft_skills.soft_skills import SoftSkills
		from frappe.job_application_tracking_system.doctype.technical_skills.technical_skills import TechnicalSkills
		from frappe.types import DF

		age_up_to_now: DF.Int
		are_you_open_to_site_based_assignments: DF.Literal["Yes", "No"]
		are_you_willing_to_relocate_for_projects: DF.Literal["Yes", "No"]
		availability: DF.Literal["Immediately", "1 Month", "2-3 Months", "More Than 3 Months"]
		business_sector: DF.Link | None
		certificates_upload: DF.Attach | None
		challenging_project: DF.Text | None
		city: DF.Data | None
		client_name: DF.Data | None
		country: DF.Literal["", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \u201cSwaziland\u201d)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine (State of)", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]
		current_job_position: DF.Data | None
		current_salary: DF.Currency
		cv_upload: DF.Attach | None
		date_of_birth: DF.Date | None
		department: DF.Link | None
		discipline: DF.Link | None
		do_you_have_driver_license: DF.Literal["Yes", "No"]
		email: DF.Data | None
		employee_number: DF.Data | None
		employment_type: DF.Literal["Full-time", "Part-time", "Internship", "Freelance"]
		expected_salary: DF.Currency
		field_of_study: DF.Literal["Architecture", "Interior Design", "Landscape Architecture", "Urban Design", "Urban & Regional Planning", "Civil Engineering", "Structural Engineering", "Transportation / Highway / Bridge Engineering", "Construction Management", "Geotechnical Engineering", "Infrastructure Engineering", "Survey Engineering / Geomatics", "Mechanical Engineering", "HVAC Engineering (Building Services)", "Plumbing Engineering (Building Services)", "Fire Protection / Safety Engineering", "Materials Science & Engineering", "Electrical Engineering", "Power Systems Engineering", "Lighting / Illumination Engineering", "Electronics / ELV Systems Engineering", "Information & Communication Technology Engineering", "Computer Engineering / IT Infrastructure", "Project Management / Engineering Management", "Quantity Surveying", "Contracts Management (Engineering / Law)", "Law (Corporate / Construction Law)", "Quality Engineering", "Health, Safety & Environmental Engineering", "Occupational Health & Safety", "Building Information Modeling (BIM)", "CAD / Drafting Technology", "Supply Chain Management", "Logistics", "Business Administration", "Human Resources Management", "Education / Training & Development", "Marketing", "Communications", "Finance", "Accounting", "Information Technology", "Computer Science", "Cybersecurity", "Other"]
		footer: DF.SmallText | None
		full_address: DF.SmallText | None
		full_name: DF.Data
		full_name_in_original_language: DF.Data | None
		grade: DF.Literal["A (Excellent)", "B (Good)", "C (Average)", "C (Average)", "D (Pass)"]
		grade_or_percentage: DF.Literal["Grade", "Percentage (0\u2013100%)"]
		graduation_year: DF.Int
		highest_degree: DF.Literal["High School", "Diploma", "Bachelor", "Master", "PhD", "Other"]
		how_many_team_members_have_you_managed_before: DF.Int
		id_number: DF.Data | None
		internal_project_number: DF.Int
		international_certification: DF.Table[InternationalCertification]
		is_saudconsult_staff: DF.Literal["", "Yes", "No"]
		join_reason: DF.Text | None
		key_responsibilities: DF.TextEditor | None
		languages: DF.Table[Languages]
		last_employer: DF.Data | None
		multi_projects: DF.Literal["", "Nominated Project / Proposal", "Multi Projects / Proposals"]
		nationality: DF.Literal["", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \u201cSwaziland\u201d)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine (State of)", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]
		other_field_of_study: DF.Data | None
		percentage: DF.Int
		personal_photo: DF.AttachImage | None
		phone_number: DF.Phone | None
		portfolio_upload: DF.Attach | None
		project_name_and_number: DF.Data | None
		project_number_table: DF.Table[ProjectNumberTable]
		projects_involved: DF.Table[ProjectsInvolved]
		soft_skills: DF.Table[SoftSkills]
		source: DF.Literal["Internal Transfer", "Referral", "Job Ad \u2013 Company Website", "Job Ad \u2013 LinkedIn Sponsored", "Job Ad \u2013 Social Media", "Job Platform \u2013 LinkedIn", "Job Platform \u2013 Bayt", "Job Platform \u2013 Naukrigulf", "Job Platform \u2013 Indeed", "Recruitment Agency", "Other"]
		specific_for_project: DF.Literal["", "Yes", "No"]
		state_or_region: DF.Data | None
		status: DF.Literal["Under Review", "Hired", "Assigned to the project and awaiting approval", "Assigned to the client and awaiting approval", "Rejected by the client", "Rejected by HR", "Hired for the project", "Hired for SAUD", "Rejected", "On Hold", "Terminated"]
		submission_date: DF.Date | None
		technical_skills: DF.Table[TechnicalSkills]
		type_of_visa: DF.Literal["Transferable residence", "Work Vist", "Tourist visa", "Final Exit"]
		university: DF.Data | None
		years_of_experience: DF.Int
	# end: auto-generated types

	pass
