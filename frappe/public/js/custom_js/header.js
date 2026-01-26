




frappe.ui.form.on('*', {
	refresh: function (frm) {
		// Skip for Single, Child, and Tree DocTypes
		if (isExcludedDocType(frm)) {
			$(".sticky-invoice-banner").remove();
			return;
		}

		if (frm.fields_dict.hide_banner && frm.doc.hide_banner == 1) {
			if (frm.doctype != "DocType") {
				$(".sticky-invoice-banner").remove();
				return;
			}
		} else {

			if (frm.doctype != "DocType") {
				setTimeout(() => {
					setupInvoiceBanner(frm);
				}, 100);
			}
		}
	},

	onload: function (frm) {
		// Skip for Single, Child, and Tree DocTypes
		if (isExcludedDocType(frm)) {
			$(".sticky-invoice-banner").remove();
			return;
		}

		if (frm.fields_dict.hide_banner && frm.doc.hide_banner == 1) {
			if (frm.doctype != "DocType") {
				$(".sticky-invoice-banner").remove();
				return;
			}
		} else {
			if (frm.doctype != "DocType") {
				let nameRecord = frm.wrapper.querySelector(".page-title .title-area .title-text");
				if (nameRecord) {
					nameRecord.style.display = "none";
				}
				setTimeout(() => {
					setupInvoiceBanner(frm);
					const banner = frm.wrapper.querySelector('.sticky-invoice-banner');

					if (frm.wrapper.querySelector('.form-tabs')) {
						banner.style.top = '134px';
					} else {
						banner.style.top = '96px';
					}

				}, 500);
			}

		}
	},
});

// Function to check if DocType should be excluded (Single, Child, or Tree)
function isExcludedDocType(frm) {
	if (frm.doctype === "DocType") {
		return true;
	}

	const meta = frappe.get_meta(frm.doctype);
	if (!meta) {
		return false;
	}

	// Check if it's a Single DocType
	if (meta.issingle) {
		return true;
	}

	// Check if it's a Child Table (istable)
	if (meta.istable) {
		return true;
	}

	// Check if it's a Tree DocType
	if (meta.is_tree) {
		return true;
	}

	return false;
}


function setupInvoiceBanner(frm) {
	console.log("Setting up Doctype banner...");

	// Double-check exclusion before setting up
	if (isExcludedDocType(frm)) {
		$(".sticky-invoice-banner").remove();
		return;
	}

	// Remove any existing banner
	$(".sticky-invoice-banner").remove();

	if (frm.doc.__islocal) {
		const unsavedHtml = `
            <div class="sticky-invoice-banner" style="
                position: sticky;
                top: 0;
                z-index: 999;
                background: #006064;
                color: white;
                padding: 15px 20px;
                margin: 0 0 20px 0;
                text-align: center;
                font-size: 14px;
            ">
                <i class="fa fa-save"></i> Please save the document first
            </div>
        `;

		// Inject after form-tabs-list form-tabs-sticky-down
		$(frm.wrapper).find(".form-tabs-list.form-tabs-sticky-down").after(unsavedHtml);
		return;
	}

	// Get values
	const invoice_id = frm.doc.name;
	const created_by = frm.doc.owner || "";
	const modified_by = frm.doc.modified_by || "";

	// Format dates and times
	let creation_time = "";
	let creation_date = "";
	if (frm.doc.creation) {
		const creation_full = frappe.datetime.str_to_user(frm.doc.creation);
		const creation_parts = creation_full.split(" ");

		if (
			creation_parts.length >= 3 &&
			(creation_parts[2] === "AM" || creation_parts[2] === "PM")
		) {
			creation_time = creation_parts[1] + " " + creation_parts[2];
		} else {
			const timeParts = creation_parts[1].split(":");
			let hours = parseInt(timeParts[0]);
			const minutes = timeParts[1];
			const seconds = timeParts[2] || "00";
			let period = "AM";

			if (hours === 0) {
				hours = 12;
			} else if (hours === 12) {
				period = "PM";
			} else if (hours > 12) {
				hours = hours - 12;
				period = "PM";
			}

			creation_time = `${hours}:${minutes}:${seconds} ${period}`;
		}

		const date_obj = new Date(frm.doc.creation);
		creation_date =
			date_obj.getDate() +
			" - " +
			date_obj.toLocaleString("en-US", { month: "short" }) +
			" -" +
			(date_obj.getFullYear() % 100);
	}

	let modified_time = "";
	let modified_date = "";
	if (frm.doc.modified) {
		const modified_full = frappe.datetime.str_to_user(frm.doc.modified);
		const modified_parts = modified_full.split(" ");

		if (
			modified_parts.length >= 3 &&
			(modified_parts[2] === "AM" || modified_parts[2] === "PM")
		) {
			modified_time = modified_parts[1] + " " + modified_parts[2];
		} else {
			const timeParts = modified_parts[1].split(":");
			let hours = parseInt(timeParts[0]);
			const minutes = timeParts[1];
			const seconds = timeParts[2] || "00";
			let period = "AM";

			if (hours === 0) {
				hours = 12;
			} else if (hours === 12) {
				period = "PM";
			} else if (hours > 12) {
				hours = hours - 12;
				period = "PM";
			}

			modified_time = `${hours}:${minutes}:${seconds} ${period}`;
		}

		const date_obj = new Date(frm.doc.modified);
		modified_date =
			date_obj.getDate() +
			" - " +
			date_obj.toLocaleString("en-US", { month: "short" }) +
			" -" +
			(date_obj.getFullYear() % 100);
	}

	const doc_url = `${window.location.origin}/app/${frm.doctype.replace(/ /g, "-").toLowerCase()}/${frm.doc.name}`;
	const qr_id = `qr_${Date.now()}`;

	// Create STICKY banner HTML

	const bannerHtml = `
<div
  class="sticky-invoice-banner"
  style="
    position: sticky;
    
    z-index: 5;
    margin: 0 0 20px 0;
    background: #ffffff;
	border-bottom: 2px solid;
	width:98.5%;
	margin:15px auto;
  "
>
  <div
    class="custom-invoice-banner"
    style="
      overflow: hidden;
    "
  >
    <!-- Header -->
    <div
      style="
        background: #104864;
        color: white;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        font-weight: 600;
        letter-spacing: 0.5px;
        justify-content: space-between;
      "
    >
      <span class="DoctypeName" style="display: flex; align-items: center; gap: 5px; font-size:18px;"
        ><svg class="svgmobile"
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path
            d="M320-440h320v-80H320v80Zm0 120h320v-80H320v80Zm0 120h200v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"
          /></svg
        >${frm.doctype}</span
      >
      <span class="idforty"
        style="
          margin-left: 30px;
          font-size: 15px;
          font-weight: 400;
          opacity: 0.95;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:5px;
        "
      >
        <svg class="svgmobile"
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path
            d="M40-120v-200h80v120h120v80H40Zm680 0v-80h120v-120h80v200H720ZM160-240v-480h80v480h-80Zm120 0v-480h40v480h-40Zm120 0v-480h80v480h-80Zm120 0v-480h120v480H520Zm160 0v-480h40v480h-40Zm80 0v-480h40v480h-40ZM40-640v-200h200v80H120v120H40Zm800 0v-120H720v-80h200v200h-80Z"
          />
        </svg>

        ${invoice_id}
      </span>
    </div>

    <!-- Content -->
    <div class="paddingchange contentContainer"
      style="
        background: #f5f5f5;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 80px;
      "
    >
      <!-- Left Side - Creation and Modification Info -->
      <div style="display: flex; gap: 60px; flex: 1">
        <div class="changegap" style="display: flex; gap: 55px">
          <div>
            <div class="changefont"
              style="
                color: #104864;
                font-size: 14px;
                font-weight: 500 !important;
                margin-bottom: 15px;
				display:flex;
				align-items:center;
				gap:5px;
              "
            >
            <svg class="svgmobile" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#104864"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v240h-80v-80H200v400h360v80H200Zm0-560h560v-80H200v80Zm0 0v-80 80ZM674-80q-14 0-24-10t-10-24v-132q0-14 10-24t24-10h6v-40q0-33 23.5-56.5T760-400q33 0 56.5 23.5T840-320v40h6q14 0 24 10t10 24v132q0 14-10 24t-24 10H674Zm46-200h80v-40q0-17-11.5-28.5T760-360q-17 0-28.5 11.5T720-320v40Z"/></svg>
              Created at :
              <span style="color: #333; font-weight: 400">
                ${creation_time} ${creation_date}
              </span>
            </div>
            <div class="changefont"
              style="
                color: #104864;
                font-size: 14px;
                font-weight: 500 !important;
				display:flex;
				align-items:center;
				gap:5px;
              "
            >
			<svg class="svgmobile" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#104864"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>
              Modified at :
              <span style="color: #333; font-weight: 400">
                ${modified_time} ${modified_date}
              </span>
            </div>
          </div>

          <div>
            <div class="changefont"
              style="
                color: #104864;
                font-size: 14px;
                font-weight: 500 !important;
                margin-bottom: 15px;
				display:flex;
				align-items:center;
				gap:5px;
              "
            >
			<svg class="svgmobile" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#104864"><path d="M200-200v-560 179-19 400Zm80-240h221q2-22 10-42t20-38H280v80Zm0 160h157q17-20 39-32.5t46-20.5q-4-6-7-13t-5-14H280v80Zm0-320h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v258q-14-26-34-46t-46-33v-179H200v560h202q-1 6-1.5 12t-.5 12v56H200Zm480-200q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-120v-56q0-24 12.5-44.5T528-250q36-15 74.5-22.5T680-280q39 0 77.5 7.5T832-250q23 9 35.5 29.5T880-176v56H480Z"/></svg>
              Created by :
              <span style="color: #333; font-weight: 400"> ${created_by} </span>
            </div>
            <div class="changefont"
              style="
                color: #104864;
                font-size: 14px;
                font-weight: 500 !important;
				display:flex;
				align-items:center;
				gap:5px;
              "
            >
			<svg class="svgmobile" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#104864"><path d="M560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm300-263-37-37 37 37ZM620-140h38l121-122-18-19-19-18-122 121v38ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v640h240v80H240Zm280-400Zm241 199-19-18 37 37-18-19Z"/></svg>
              Modified by :
              <span style="color: #333; font-weight: 400">
                ${modified_by}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Separator and QR Code -->
      <div style="display: flex; align-items: center; gap: 1rem">
    <img class="logoforty" src="/assets/frappe/images/frappe-logo.png" alt="Logo" style='width:60px;border-radius: 3px;'>
   
	  <!-- Vertical Separator -->
        <div class="clearWidth"
          style="width: 1px; height: 60px; background: #104864; opacity: 0.3"
        ></div>

        <!-- QR Code -->
        <div class="clearWidth" style="width: 70px; height: 70px; background: transparent; padding: 5px">
          <div class="center" id="${qr_id}" style="width: 100%; height: 100%">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #104864;
              "
             >
              <i class="fa fa-qrcode" style="font-size: 30px"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<style>
@media (max-width:767px) {
    :root{
	font-size:14px;
	}

	.DoctypeName,
	.idforty{
	font-size:12px !important;
	}
	.logoforty{
	width:26px !important;
	}
	.changefont{
	font-size:8px !important;
	}
	.paddingchange{
	padding:10px !important;
	}
	.changegap{
	gap:10px !important;
	}
	.clearWidth{
	width:0 !important;
	}
	.center{
	display: flex;
    align-items: center;
    justify-content: end;
	}
	.svgmobile{
	width:15px !important;
	}

	.contentContainer img{
	width: 25px !important;
	}

}
	</style>

    `;

	// Inject specifically after .form-tabs-list.form-tabs-sticky-down
	const $tabsList = $(frm.wrapper).find(".form-tabs-list.form-tabs-sticky-down");

	if ($tabsList.length) {
		// Inject right after the tabs
		$tabsList.after(bannerHtml);
		console.log("Banner injected after form-tabs-list form-tabs-sticky-down");
	} else {
		// Fallback: try just .form-tabs-list
		const $fallbackTabs = $(frm.wrapper).find(".form-tabs-list");
		if ($fallbackTabs.length) {
			$fallbackTabs.after(bannerHtml);
			console.log("Banner injected after form-tabs-list (fallback)");
		} else {
			// Last fallback: inject at the beginning of form-layout
			$(frm.wrapper).find(".form-layout").prepend(bannerHtml);
			console.log("Banner injected at beginning of form-layout (last fallback)");
		}
	}

	// Generate QR Code
	setTimeout(() => {
		if (window.QRCode) {
			const container = document.getElementById(qr_id);
			if (container) {
				container.innerHTML = "";
				new QRCode(container, {
					text: doc_url,
					width: 60,
					height: 60,
					colorDark: "#104864",
					colorLight: "#fff",
					correctLevel: QRCode.CorrectLevel.L,
				});
			}
		} else {
			loadQRLibrary(() => {
				setupInvoiceBanner(frm);
			});
		}
	}, 100);
}

// Clean up when leaving the form
frappe.ui.form.on('*', {
	before_load: function (frm) {
		if (frm.doctype != "DocType") {
			$(".sticky-invoice-banner").remove();
		}
	},
});

function loadQRLibrary(callback) {
	if (window.QRCode) {
		callback();
		return;
	}

	const script = document.createElement("script");
	script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
	script.onload = callback;
	document.head.appendChild(script);
}

// Auto-load QR library
if (typeof QRCode === "undefined") {
	loadQRLibrary(() => {
		console.log("QR Code library loaded");
	});
}