frappe.ui.form.ControlButton = class ControlButton extends frappe.ui.form.ControlData {
    can_write() {
        return true;
    }

    make_input() {
        var me = this;
        const btn_type = this.df.primary ? "btn-primary" : "btn-default";
        const btn_size = this.df.btn_size ? `btn-${this.df.btn_size}` : "btn-xs";

        // Create the button
        this.$input = $(`<button
            class="btn custom-button ${frappe.utils.escape_html(btn_size)} ${frappe.utils.escape_html(btn_type)}"
            title="${frappe.utils.escape_html(this.df.label)}"
        ></button>`).prependTo(me.input_area)
          .on("click", function () {
              me.onclick();
          });

        this.input = this.$input.get(0);
        this.set_input_attributes();
        this.has_input = true;
        this.toggle_label(false);

        // Apply inline styles
        this.$input.css({
            padding: '10px 20px',
            width: '100%',
            backgroundColor: '#104864',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        });

        // SVG icon
        const svg_icon = $(`
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="18px" fill="#ffffff">
                <path d="M593-80q-24 0-46-9t-39-26L304-320l33-34q14-14 34-19t40 0l69 20v-287q0-17 11.5-28.5T520-680q17 0 28.5 11.5T560-640v393l-98-28 103 103q6 6 13 9t15 3h167q33 0 56.5-23.5T840-240v-160q0-17 11.5-28.5T880-440q17 0 28.5 11.5T920-400v160q0 66-47 113T760-80H593Zm7-280v-160q0-17 11.5-28.5T640-560q17 0 28.5 11.5T680-520v160h-80Zm120 0v-120q0-17 11.5-28.5T760-520q17 0 28.5 11.5T800-480v120h-80Zm40 200H565h195Zm-600-40q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h600q33 0 56.5 23.5T840-760v160h-80v-160H160v480h72l79 80H160Z"/>
            </svg>
        `);

        // Label span
        this.$label_span = $('<span>').text(this.df.label);

        // Append SVG + label
        this.$input.append(svg_icon).append(this.$label_span);
    }

    onclick() {
        if (this.frm && this.frm.doc) {
            if (this.frm.script_manager.has_handlers(this.df.fieldname, this.doctype)) {
                this.frm.script_manager.trigger(this.df.fieldname, this.doctype, this.docname);
            } else {
                if (this.df.options) {
                    this.run_server_script();
                }
            }
        } else if (this.df.click) {
            this.df.click();
        }
    }

    run_server_script() {
        var me = this;
        if (this.frm && this.frm.docname) {
            frappe.call({
                method: "run_doc_method",
                args: { docs: this.frm.doc, method: this.df.options },
                btn: this.$input,
                callback: function (r) {
                    if (!r.exc) {
                        me.frm.refresh_fields();
                    }
                },
            });
        }
    }

    hide() {
        this.$input.hide();
    }

    set_input_areas() {
        super.set_input_areas();
        $(this.disp_area).removeClass().addClass("hide");
    }

    set_empty_description() {
        this.$wrapper.find(".help-box").empty().toggle(false);
    }

    set_label(label) {
        if (label) {
            this.df.label = label;
        }
        if (this.$label_span) {
            this.$label_span.text(this.df.label);
        }
    }
};

// Add hover effect CSS globally
$(`<style>
.custom-button:hover {
    background-color: #0b2f48 !important;
    transform: translateY(-2px);
}
.custom-button:active {
    transform: translateY(0px);
}
</style>`).appendTo("head");
