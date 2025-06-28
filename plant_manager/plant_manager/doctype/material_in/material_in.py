# Copyright (c) 2025, Bhargav N and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class MaterialIn(Document):
	def validate(self):
		frappe.msgprint(f"Before Save: component_table rows = {len(self.component_table)}")

	def before_save(self):
		frappe.msgprint(f"Before Save (again): component_table rows = {len(self.component_table)}")

	def on_submit(self):
		self.create_mo_receipt()
		self.create_ssl_entry()
		self.create_pwo()
		


	@frappe.whitelist()
	def create_mo_receipt(self):
		for a in self.get("component_table"):
			doc = frappe.get_doc("Material Out", a.material_out)
			doc.append('mrn', {
				'r_date_time': self.p_date,
				'received_qty': a.qty,
				'material_in': self.name,
				'comp_code': a.comp_code,
			})
			doc.save(
				ignore_permissions=True, # ignore write permissions during insert
				)
			modoc =  frappe.get_doc("Material Out" , a.material_out)
			modoc.update_pending_qty()


	@frappe.whitelist()
	def create_ssl_entry(self):
		for a in self.get("component_table"):
			print(a.batch)
			doc = frappe.get_doc("Production Work Order", a.batch)
			doc.append('ssl_entry', {
				'date': self.p_date,
				'process_id': a.completed_process,
				'qty': a.qty,
				'transaction_type': 'Material In',
				'transaction_id': self.name,
				'operation_status': a.operation_status,
				'from_warehouse': a.f_wh,
				'to_warehouse': a.t_wh,
				'duration': a.duration,
				'dur_min' : a.dur_min,
			})
			doc.save(
				ignore_permissions=True, # ignore write permissions during insert
				)
			pwodoc =  frappe.get_doc("Production Work Order" , a.batch)
			pwodoc.load_calculations()
			
	@frappe.whitelist()	
	def delete_ssl_mrn_entry(self):
		for a in self.get("component_table"):
			rows = frappe.get_all(
				"PWO SSL", 
				filters={"parent": a.batch},
				fields=[
					"transaction_id", "name",
				],
				)
			for row in rows:
				if row.transaction_id == self.name:
					frappe.delete_doc("PWO SSL", row.name, ignore_permissions=True)
					frappe.db.commit()
					pwodoc =  frappe.get_doc("Production Work Order" , a.batch)
					pwodoc.load_calculations()

			# To delete material receipt notes in Material Out Doc
			mrn_rows = frappe.get_all(
				"Material Out Receipt Note", 
				filters={"parent": a.material_out},
				fields=[
					"material_in", "name",
				],
				)
			for mrn_row in mrn_rows:
				if mrn_row.material_in == self.name:
					frappe.delete_doc("Material Out Receipt Note", mrn_row.name, ignore_permissions=True)
					frappe.db.commit()
					modoc =  frappe.get_doc("Material Out" , a.material_out)
					modoc.update_pending_qty()
		
	@frappe.whitelist()	
	def create_pwo(self):
		for a in self.get("rm_table"):
			if a.is_end_piece != 1:
				doc = frappe.new_doc('Production Work Order')
				doc.pos = frappe.get_doc('Component',a.fg_component).dos
				doc.pwo_qty = a.qty
				doc.pwo_date = self.p_date
				doc.created_against = self.name
				doc.insert(ignore_permissions=True)
				doc.load_operation()
				frappe.flags.ignore_permissions = True
				doc.submit()
				frappe.flags.ignore_permissions = False
				
				# updating Production work order name
				a.pwo_batch = doc.get_title()
				self.save(ignore_permissions=True)


