# Copyright (c) 2025, Bhargav N and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InHouseProduction(Document):
	def on_submit(self):
		self.create_ssl_entry()
		

	@frappe.whitelist()
	def create_ssl_entry(self):
		for a in self.get("production_log"):
			if (a.is_rework_operation == 0):
				prod_qty = a.acc_qty
			else:
				prod_qty = a.rew_qty

			doc = frappe.get_doc("Production Work Order", a.batch_number)
			doc.append('ssl_entry', {
				'date': self.p_date,
				'process_id': a.operation_id,
				'qty': prod_qty,
				'transaction_type': 'In-House Production',
				'transaction_id': self.name,
				'operation_status': 'Completed',
				'from_warehouse': frappe.get_doc("Master Settings").default_production_warehouse, 
				'to_warehouse': frappe.get_doc("Master Settings").default_production_warehouse, 
				'duration': a.total_duration, 
				'dur_min' : a.dur_min,
				's_dur': a.s_time,
				'p_dur': a.dur_min
			})
			doc.save(
				ignore_permissions=True, # ignore write permissions during insert
				)
			pwodoc =  frappe.get_doc("Production Work Order" , a.batch_number)
			pwodoc.load_calculations()		

	@frappe.whitelist()	
	def delete_ssl_entry(self):
		for a in self.get("production_log"):
			rows = frappe.get_all(
				"PWO SSL", 
				filters={"parent": a.batch_number},
				fields=[
					"transaction_id", "name",
				],
				)
			for row in rows:
				if row.transaction_id == self.name:
					frappe.delete_doc("PWO SSL", row.name, ignore_permissions=True)
					frappe.db.commit()
					pwodoc =  frappe.get_doc("Production Work Order" , a.batch_number)
					pwodoc.load_calculations()