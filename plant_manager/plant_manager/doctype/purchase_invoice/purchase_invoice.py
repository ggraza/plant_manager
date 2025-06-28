# Copyright (c) 2025, Bhargav N and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PurchaseInvoice(Document):
	def on_submit(self):
		self.update_rm_batch()
	
	@frappe.whitelist()
	def update_rm_batch(self):
		for a in self.get("pit"):

			# for creating RM Batch
			if a.rm_type == "Multi cut-RM":
				doc = frappe.new_doc('RM Batch')
				doc.rm_id = a.component_code
				doc.date = self.posting_date
				doc.rm_qty = a.qty
				doc.atr_no = self.atr_no
				doc.p_qty = a.qty
				doc.created_against = self.name
				doc.insert(ignore_permissions=True)				

				# updating rm_batch name
				a.rm_batch = doc.get_title()
				self.save(ignore_permissions=True)

			# for creating PWO (Production Work Order)
			if a.rm_type == "Single-RM":
				doc = frappe.new_doc('Production Work Order')
				doc.pos = frappe.get_doc('Component',a.fg_component).dos
				doc.pwo_qty = a.qty
				doc.pwo_date = self.posting_date
				doc.created_against = self.name
				doc.insert(ignore_permissions=True)
				doc.load_operation()
				frappe.flags.ignore_permissions = True
				doc.submit()
				frappe.flags.ignore_permissions = False
				
				# updating Production work order name
				a.pwo_batch = doc.get_title()
				self.save(ignore_permissions=True)
				

	
	@frappe.whitelist()	
	def delete_rm_batch_pwo(self):
		for a in self.get("pit"):
			if a.rm_type ==	'Multi cut-RM':
				if not frappe.get_doc('RM Batch',a.rm_batch).rm_consumtion:
					frappe.delete_doc("RM Batch", a.rm_batch, ignore_permissions=True)
					frappe.db.commit()
				else:
					frappe.throw('Cannot cancel Purchase Invoice since Raw Material already cut & listed in RM Batch')
				
			
			if a.rm_type ==	'Single-RM':
				pwo = frappe.get_doc('Production Work Order',a.pwo_batch)
				if not pwo.ssl_entry:
					frappe.flags.ignore_permissions = True
					pwo.cancel()
					frappe.flags.ignore_permissions = False
					frappe.delete_doc("Production Work Order", a.pwo_batch, ignore_permissions=True)
					frappe.db.commit()
				else:
					frappe.throw('Cannot cancel Purchase Invoice since Stock entries are already done')