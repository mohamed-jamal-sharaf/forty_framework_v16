frappe.ui.form.on('Send SMS', {
    refresh: function(frm) {
        // Add Send SMS button
        frm.add_custom_button(__('Send SMS'), function() {
            frm.trigger('send_sms');
        }, __('Actions'));
        
        // Set default to test mode
        if (frm.doc.__islocal) {
            frm.set_value('test_mode', 1);
        }
    },
    
    send_sms: function(frm) {
        // Validation
        if (!frm.doc.mobile_number) {
            frappe.msgprint(__('Please enter mobile number'));
            return;
        }
        
        if (!frm.doc.message) {
            frappe.msgprint(__('Please enter message'));
            return;
        }
        
        frappe.call({
            method: 'sms_misr.sms_api.send_sms_misr',
            args: {
                mobile: frm.doc.mobile_number,
                message: frm.doc.message,
                sender_name: frm.doc.sender
            },
            freeze: true,
            freeze_message: __('Sending SMS...'),
            callback: function(r) {
                if (r.message) {
                    if (r.message.status === 'success') {
                        frappe.msgprint({
                            title: __('Success'),
                            indicator: 'green',
                            message: __('SMS sent successfully to {0}<br>Response: {1}', 
                                [r.message.mobile, r.message.message])
                        });
                        
                        // Clear form
                        frm.set_value('mobile_number', '');
                        frm.set_value('message', '');
                        
                    } else {
                        frappe.msgprint({
                            title: __('Failed'),
                            indicator: 'red',
                            message: __('Failed to send SMS: {0}', [r.message.message])
                        });
                    }
                }
            }
        });
    }
});