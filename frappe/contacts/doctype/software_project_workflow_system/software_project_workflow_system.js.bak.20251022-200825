frappe.ui.form.on('Software Project Workflow System', {
    refresh: function (frm) {
        render_workflow_system(frm);
    },

    onload: function (frm) {
        render_workflow_system(frm);
    }
});

function render_workflow_system(frm) {
    const phases = [
        {
            id: 1,
            number: "01",
            nameAr: "دراسة المشروع الأولية والاستشارة",
            nameEn: "Initial Project Study & Consultation",
            duration: "3-5 أيام",
            durationEn: "3-5 Days",
            deliverables: [
                "تقرير دراسة المشروع",
                "تقييم إمكانية التنفيذ على Forty Framework",
                "التكلفة التقديرية",
                "تحليل العائد على الاستثمار"
            ],
            deliverablesEn: [
                "Project Study Report",
                "Feasibility Assessment on Forty Framework",
                "Estimated Cost Analysis",
                "ROI Analysis"
            ],
            responsibilities: "فريق المبيعات + المحلل الفني",
            responsibilitiesEn: "Sales Team + Technical Analyst",
            acceptanceCriteria: [
                "موافقة العميل على نطاق العمل المبدئي",
                "تحديد الميزانية التقريبية",
                "تحديد الجدول الزمني الأولي"
            ],
            acceptanceCriteriaEn: [
                "Client approval on initial scope",
                "Budget estimation confirmed",
                "Initial timeline agreed"
            ],
            color: "#0078D4"
        },
        {
            id: 2,
            number: "02",
            nameAr: "استلام المتطلبات التفصيلية",
            nameEn: "Detailed Requirements Gathering",
            duration: "5-7 أيام",
            durationEn: "5-7 Days",
            deliverables: [
                "استمارة المتطلبات الكاملة",
                "مستندات العمليات الحالية",
                "قائمة أصحاب المصلحة",
                "تحديد الأهداف والنتائج المتوقعة"
            ],
            deliverablesEn: [
                "Complete Requirements Form",
                "Current Process Documentation",
                "Stakeholder List",
                "Goals and Expected Outcomes"
            ],
            responsibilities: "محلل الأعمال + العميل",
            responsibilitiesEn: "Business Analyst + Client",
            acceptanceCriteria: [
                "اكتمال 100% من استمارة المتطلبات",
                "تحديد جميع المستخدمين والصلاحيات",
                "توثيق جميع العمليات الحالية"
            ],
            acceptanceCriteriaEn: [
                "100% completion of requirements form",
                "All users and permissions identified",
                "All current processes documented"
            ],
            color: "#106EBE"
        },
        {
            id: 3,
            number: "03",
            nameAr: "اجتماع البدء وورشة العمل",
            nameEn: "Kick-off Meeting & Workshop",
            duration: "2-3 أيام",
            durationEn: "2-3 Days",
            deliverables: [
                "محضر الاجتماع",
                "خريطة ذهنية للنظام",
                "قائمة الأولويات",
                "تحديد نطاق MVP"
            ],
            deliverablesEn: [
                "Meeting Minutes",
                "System Mind Map",
                "Priority List",
                "MVP Scope Definition"
            ],
            responsibilities: "مدير المشروع + فريق التحليل + العميل",
            responsibilitiesEn: "Project Manager + Analysis Team + Client",
            acceptanceCriteria: [
                "توافق جميع الأطراف على الأهداف",
                "تحديد نطاق MVP بوضوح",
                "تحديد قنوات التواصل"
            ],
            acceptanceCriteriaEn: [
                "All parties aligned on goals",
                "Clear MVP scope defined",
                "Communication channels established"
            ],
            color: "#005A9E"
        },
        {
            id: 4,
            number: "04",
            nameAr: "تحليل الأعمال والتصميم الوظيفي",
            nameEn: "Business Analysis & Functional Design",
            duration: "7-14 يوم",
            durationEn: "7-14 Days",
            deliverables: [
                "وثيقة تحليل الأعمال (BRD)",
                "مخططات تدفق العمليات",
                "حالات الاستخدام",
                "قاموس البيانات",
                "مخططات العلاقات"
            ],
            deliverablesEn: [
                "Business Requirements Document (BRD)",
                "Process Flow Diagrams",
                "Use Cases",
                "Data Dictionary",
                "Relationship Diagrams"
            ],
            responsibilities: "محلل الأعمال + مهندس النظم",
            responsibilitiesEn: "Business Analyst + Systems Engineer",
            acceptanceCriteria: [
                "موافقة العميل الرسمية على BRD",
                "توقيع نموذج الموافقة",
                "اعتماد جميع حالات الاستخدام"
            ],
            acceptanceCriteriaEn: [
                "Client formal approval on BRD",
                "Signed approval form",
                "All use cases approved"
            ],
            color: "#0078D4"
        },
        {
            id: 5,
            number: "05",
            nameAr: "التصميم التقني والمعماري",
            nameEn: "Technical & Architectural Design",
            duration: "5-10 أيام",
            durationEn: "5-10 Days",
            deliverables: [
                "وثيقة التصميم التقني (TDD)",
                "مخطط قاعدة البيانات ERD",
                "تصميم DocTypes على Forty Framework",
                "تحديد Custom Apps المطلوبة",
                "مخطط البنية التحتية"
            ],
            deliverablesEn: [
                "Technical Design Document (TDD)",
                "Database ERD Diagram",
                "DocTypes Design on Forty Framework",
                "Required Custom Apps Identification",
                "Infrastructure Diagram"
            ],
            responsibilities: "المهندس المعماري + كبير المطورين",
            responsibilitiesEn: "Solution Architect + Lead Developer",
            acceptanceCriteria: [
                "مراجعة التصميم التقني",
                "موافقة على البنية التحتية",
                "اعتماد التقنيات المستخدمة"
            ],
            acceptanceCriteriaEn: [
                "Technical design review completed",
                "Infrastructure approved",
                "Technology stack confirmed"
            ],
            color: "#106EBE"
        },
        {
            id: 6,
            number: "06",
            nameAr: "تصميم تجربة وواجهات المستخدم",
            nameEn: "UX/UI Design Phase",
            duration: "7-14 يوم",
            durationEn: "7-14 Days",
            deliverables: [
                "مخططات الإطار السلكي Wireframes",
                "نماذج عالية الدقة Mockups",
                "دليل الهوية البصرية",
                "النماذج التفاعلية Prototype",
                "دليل أنماط التصميم"
            ],
            deliverablesEn: [
                "Wireframes",
                "High-Fidelity Mockups",
                "Brand Style Guide",
                "Interactive Prototype",
                "Design System Guide"
            ],
            responsibilities: "مصمم UX/UI + العميل",
            responsibilitiesEn: "UX/UI Designer + Client",
            acceptanceCriteria: [
                "موافقة العميل على التصاميم",
                "اعتماد الألوان والخطوط",
                "اعتماد تجربة المستخدم"
            ],
            acceptanceCriteriaEn: [
                "Client approval on designs",
                "Colors and fonts approved",
                "User experience confirmed"
            ],
            color: "#005A9E"
        },
        {
            id: 7,
            number: "07",
            nameAr: "العرض الفني والمالي النهائي",
            nameEn: "Final Technical & Financial Proposal",
            duration: "3-5 أيام",
            durationEn: "3-5 Days",
            deliverables: [
                "العرض الفني الكامل",
                "الجدول الزمني التفصيلي",
                "خطة الدفعات",
                "بنود العقد",
                "اتفاقية مستوى الخدمة SLA"
            ],
            deliverablesEn: [
                "Complete Technical Proposal",
                "Detailed Timeline",
                "Payment Schedule",
                "Contract Terms",
                "Service Level Agreement (SLA)"
            ],
            responsibilities: "مدير المشروع + القسم المالي",
            responsibilitiesEn: "Project Manager + Finance Department",
            acceptanceCriteria: [
                "قبول العرض المالي",
                "توقيع العقد",
                "استلام الدفعة الأولى"
            ],
            acceptanceCriteriaEn: [
                "Financial proposal accepted",
                "Contract signed",
                "First payment received"
            ],
            color: "#0078D4"
        },
        {
            id: 8,
            number: "08",
            nameAr: "إعداد بيئة Forty Framework",
            nameEn: "Forty Framework Environment Setup",
            duration: "2-3 أيام",
            durationEn: "2-3 Days",
            deliverables: [
                "إعداد بيئة Forty Framework",
                "إنشاء Custom App على Forty",
                "إعداد Git Repository",
                "إعدادات الأمان والصلاحيات",
                "بيئة Development و Production"
            ],
            deliverablesEn: [
                "Forty Framework Environment Setup",
                "Custom App Creation on Forty",
                "Git Repository Setup",
                "Security & Permission Configuration",
                "Development & Production Environments"
            ],
            responsibilities: "مطور Forty Framework + فريق DevOps",
            responsibilitiesEn: "Forty Framework Developer + DevOps Team",
            acceptanceCriteria: [
                "تثبيت Forty Framework بنجاح",
                "إنشاء Custom App والـ Site",
                "اكتمال الإعدادات الأمنية",
                "اختبار الاتصال بقاعدة البيانات"
            ],
            acceptanceCriteriaEn: [
                "Forty Framework installed successfully",
                "Custom App and Site created",
                "Security settings completed",
                "Database connectivity tested"
            ],
            color: "#106EBE"
        },
        {
            id: 9,
            number: "09",
            nameAr: "التطوير على Forty Framework - Sprints",
            nameEn: "Development on Forty Framework - Sprint Cycles",
            duration: "حسب حجم المشروع",
            durationEn: "Based on Project Size",
            deliverables: [
                "DocTypes & Forms على Forty",
                "Server Scripts & Client Scripts",
                "Workflows & Permissions",
                "Custom Reports & Print Formats",
                "API Integration & Webhooks"
            ],
            deliverablesEn: [
                "DocTypes & Forms on Forty",
                "Server Scripts & Client Scripts",
                "Workflows & Permissions",
                "Custom Reports & Print Formats",
                "API Integration & Webhooks"
            ],
            responsibilities: "مطورو Forty Framework + Scrum Master",
            responsibilitiesEn: "Forty Framework Developers + Scrum Master",
            acceptanceCriteria: [
                "اكتمال جميع DocTypes والنماذج",
                "اختبار جميع Server و Client Scripts",
                "تفعيل Workflows والصلاحيات",
                "معدل نجاح 90%+"
            ],
            acceptanceCriteriaEn: [
                "All DocTypes and Forms completed",
                "All Server & Client Scripts tested",
                "Workflows and Permissions activated",
                "90%+ success rate"
            ],
            color: "#005A9E"
        },
        {
            id: 10,
            number: "10",
            nameAr: "الاختبارات الشاملة وضمان الجودة",
            nameEn: "Comprehensive Testing & QA",
            duration: "7-14 يوم",
            durationEn: "7-14 Days",
            deliverables: [
                "تقرير الاختبارات الشامل",
                "قائمة الأخطاء Bug List",
                "اختبارات الأداء Performance Tests",
                "اختبارات الأمان Security Tests",
                "اختبارات التوافق"
            ],
            deliverablesEn: [
                "Comprehensive Test Report",
                "Bug List",
                "Performance Test Results",
                "Security Test Results",
                "Compatibility Tests"
            ],
            responsibilities: "فريق QA + مهندس الأمان",
            responsibilitiesEn: "QA Team + Security Engineer",
            acceptanceCriteria: [
                "معدل نجاح 95%+",
                "إصلاح جميع الأخطاء الحرجة",
                "اجتياز اختبارات الأمان",
                "تحسين الأداء"
            ],
            acceptanceCriteriaEn: [
                "95%+ success rate",
                "All critical bugs fixed",
                "Security tests passed",
                "Performance optimized"
            ],
            color: "#0078D4"
        },
        {
            id: 11,
            number: "11",
            nameAr: "اختبار قبول المستخدم",
            nameEn: "User Acceptance Testing (UAT)",
            duration: "5-10 أيام",
            durationEn: "5-10 Days",
            deliverables: [
                "دليل UAT",
                "نماذج التقييم",
                "تقرير UAT النهائي",
                "قائمة التحسينات المطلوبة",
                "نموذج القبول"
            ],
            deliverablesEn: [
                "UAT Guide",
                "Evaluation Forms",
                "Final UAT Report",
                "Improvement List",
                "Acceptance Form"
            ],
            responsibilities: "العميل + فريق الدعم",
            responsibilitiesEn: "Client + Support Team",
            acceptanceCriteria: [
                "موافقة العميل على الوظائف",
                "توقيع نموذج القبول",
                "رضا المستخدمين 85%+",
                "اكتمال السيناريوهات"
            ],
            acceptanceCriteriaEn: [
                "Client approval on functionality",
                "Acceptance form signed",
                "85%+ user satisfaction",
                "All scenarios completed"
            ],
            color: "#106EBE"
        },
        {
            id: 12,
            number: "12",
            nameAr: "التدريب ونقل المعرفة",
            nameEn: "Training & Knowledge Transfer",
            duration: "3-5 أيام",
            durationEn: "3-5 Days",
            deliverables: [
                "دليل المستخدم لـ Forty Framework",
                "دليل المدير والصلاحيات",
                "فيديوهات تعليمية للنظام",
                "تدريب على واجهة Forty",
                "أسئلة شائعة FAQ"
            ],
            deliverablesEn: [
                "User Manual for Forty Framework",
                "Admin & Permissions Guide",
                "System Training Videos",
                "Training on Forty Interface",
                "FAQ Document"
            ],
            responsibilities: "مدرب معتمد + فريق الدعم",
            responsibilitiesEn: "Certified Trainer + Support Team",
            acceptanceCriteria: [
                "اكتمال جميع الجلسات التدريبية",
                "اجتياز المستخدمين للتقييم",
                "تسليم جميع الأدلة",
                "رضا المتدربين 90%+"
            ],
            acceptanceCriteriaEn: [
                "All training sessions completed",
                "Users passed assessment",
                "All manuals delivered",
                "90%+ trainee satisfaction"
            ],
            color: "#005A9E"
        },
        {
            id: 13,
            number: "13",
            nameAr: "النشر والإطلاق",
            nameEn: "Deployment & Go-Live",
            duration: "1-3 أيام",
            durationEn: "1-3 Days",
            deliverables: [
                "نشر Custom App على Forty Production",
                "نسخة احتياطية كاملة Backup",
                "إعداد Nginx و Supervisor",
                "مراقبة مباشرة للنظام",
                "تقرير النشر"
            ],
            deliverablesEn: [
                "Deploy Custom App to Forty Production",
                "Complete Backup",
                "Nginx & Supervisor Setup",
                "Live System Monitoring",
                "Deployment Report"
            ],
            responsibilities: "فريق DevOps + مدير المشروع",
            responsibilitiesEn: "DevOps Team + Project Manager",
            acceptanceCriteria: [
                "نشر ناجح بدون أخطاء",
                "استقرار النظام 24 ساعة",
                "اكتمال النسخ الاحتياطي",
                "تفعيل المراقبة"
            ],
            acceptanceCriteriaEn: [
                "Successful deployment with no errors",
                "System stability for 24 hours",
                "Backup completed",
                "Monitoring activated"
            ],
            color: "#0078D4"
        },
        {
            id: 14,
            number: "14",
            nameAr: "التشغيل التجريبي",
            nameEn: "Pilot Phase / Soft Launch",
            duration: "7-30 يوم",
            durationEn: "7-30 Days",
            deliverables: [
                "تقارير الأداء اليومية",
                "تقييم رضا المستخدمين",
                "إصلاحات سريعة",
                "تحسينات الأداء",
                "تقرير التشغيل التجريبي"
            ],
            deliverablesEn: [
                "Daily Performance Reports",
                "User Satisfaction Assessment",
                "Quick Fixes",
                "Performance Improvements",
                "Pilot Phase Report"
            ],
            responsibilities: "فريق الدعم + مدير المشروع",
            responsibilitiesEn: "Support Team + Project Manager",
            acceptanceCriteria: [
                "معدل توفر 99%",
                "حل المشاكل خلال 24 ساعة",
                "رضا المستخدمين 85%+",
                "استقرار النظام"
            ],
            acceptanceCriteriaEn: [
                "99% uptime",
                "Issues resolved within 24 hours",
                "85%+ user satisfaction",
                "System stability"
            ],
            color: "#106EBE"
        },
        {
            id: 15,
            number: "15",
            nameAr: "الدعم والصيانة والتطوير المستمر",
            nameEn: "Support, Maintenance & Continuous Improvement",
            duration: "مستمر",
            durationEn: "Ongoing",
            deliverables: [
                "اتفاقية مستوى الخدمة SLA",
                "تحديثات Forty Framework",
                "تحديثات أمنية ودورية",
                "تطوير DocTypes جديدة",
                "نسخ احتياطية دورية"
            ],
            deliverablesEn: [
                "SLA Agreement",
                "Forty Framework Updates",
                "Security & Regular Updates",
                "New DocTypes Development",
                "Regular Backups"
            ],
            responsibilities: "فريق الدعم الفني",
            responsibilitiesEn: "Technical Support Team",
            acceptanceCriteria: [
                "الاستجابة حسب SLA",
                "رضا العميل 90%+",
                "معدل حل المشاكل 95%+",
                "تحديثات منتظمة"
            ],
            acceptanceCriteriaEn: [
                "Response as per SLA",
                "90%+ client satisfaction",
                "95%+ issue resolution rate",
                "Regular updates"
            ],
            color: "#005A9E"
        }
    ];

    const html = `
        <style>
            @font-face {
                font-family: 'Almarai';
                src: url('/files/Almarai-Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            .workflow-container {
                font-family: 'Almarai', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                direction: rtl;
                background: #FAFAFA;
                padding: 40px 30px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .company-logos {
                background: #FFFFFF;
                padding: 30px 50px;
                margin-bottom: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #0078D4;
                box-shadow: 0 2px 4px rgba(0,0,0,0.08);
            }
            
            .logo-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .logo-left img {
                max-height: 60px;
                width: auto;
            }
            
            .logo-divider {
                width: 2px;
                height: 50px;
                background: #EDEBE9;
            }
            
            .logo-right img {
                max-height: 50px;
                width: auto;
            }
            
            .workflow-header {
                background: #FFFFFF;
                border-right: 4px solid #0078D4;
                padding: 40px 50px;
                margin-bottom: 30px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            
            .workflow-header h1 {
                font-size: 28px;
                color: #323130;
                margin: 0 0 8px 0;
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            
            .workflow-header .subtitle {
                font-size: 16px;
                color: #605E5C;
                margin: 0 0 25px 0;
                font-weight: 400;
            }
            
            .phases-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .phase-card {
                background: #FFFFFF;
                border-right: 4px solid #0078D4;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                transition: box-shadow 0.2s ease, transform 0.2s ease;
            }
            
            .phase-card:hover {
                box-shadow: 0 3px 8px rgba(0,0,0,0.12);
            }
            
            .phase-header {
                padding: 24px 30px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                background: #FFFFFF;
                transition: background 0.2s ease;
            }
            
            .phase-header:hover {
                background: #F3F2F1;
            }
            
            .phase-number {
                font-size: 20px;
                font-weight: 600;
                color: #0078D4;
                min-width: 35px;
                font-family: 'Segoe UI', monospace;
            }
            
            .phase-title {
                flex: 1;
            }
            
            .phase-title h3 {
                font-size: 16px;
                color: #323130;
                margin: 0 0 4px 0;
                font-weight: 600;
            }
            
            .phase-title p {
                font-size: 13px;
                color: #605E5C;
                margin: 0;
                font-weight: 400;
            }
            
            .phase-actions {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .btn-export {
                background: #0078D4;
                color: #FFFFFF;
                border: none;
                padding: 8px 20px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: background 0.2s ease;
                font-family: 'Almarai', 'Segoe UI', sans-serif;
            }
            
            .btn-export:hover {
                background: #106EBE;
            }
            
            .btn-export:active {
                background: #005A9E;
            }
            
            .btn-export-all {
                background: #107C10;
                color: #FFFFFF;
                border: none;
                padding: 12px 30px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                transition: background 0.2s ease;
                font-family: 'Almarai', 'Segoe UI', sans-serif;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .btn-export-all:hover {
                background: #0E6B0E;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .btn-export-all:active {
                background: #0C5A0C;
            }
            
            .toggle-icon {
                color: #605E5C;
                font-size: 16px;
                transition: transform 0.3s ease;
                display: inline-block;
            }
            
            .toggle-icon.rotated {
                transform: rotate(180deg);
            }
            
            .phase-content {
                padding: 0 30px 30px 30px;
                display: none;
                background: #FAFAFA;
                border-top: 1px solid #EDEBE9;
            }
            
            .phase-content.active {
                display: block;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 25px 0;
            }
            
            .info-box {
                background: #FFFFFF;
                padding: 20px;
                border-right: 3px solid #0078D4;
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            }
            
            .info-box h4 {
                font-size: 14px;
                color: #323130;
                margin: 0 0 12px 0;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .info-box p {
                font-size: 14px;
                color: #323130;
                margin: 0 0 6px 0;
                line-height: 1.6;
            }
            
            .info-box .bilingual {
                font-size: 12px;
                color: #605E5C;
                font-weight: 400;
                margin: 0;
            }
            
            .section-box {
                background: #FFFFFF;
                padding: 25px;
                margin-bottom: 15px;
                border-right: 3px solid #0078D4;
                box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            }
            
            .section-box h4 {
                font-size: 15px;
                color: #323130;
                margin: 0 0 18px 0;
                font-weight: 600;
            }
            
            .section-box ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .section-box li {
                padding: 12px 0;
                border-bottom: 1px solid #EDEBE9;
                font-size: 14px;
                color: #323130;
                line-height: 1.6;
                position: relative;
                padding-right: 0;
            }
            
            .section-box li:last-child {
                border-bottom: none;
            }
            
            .section-box .bilingual {
                font-size: 12px;
                color: #605E5C;
                margin-top: 4px;
                display: block;
            }
            
            .workflow-footer {
                background: #323130;
                color: #FFFFFF;
                padding: 30px 50px;
                margin-top: 30px;
                text-align: center;
            }
            
            .footer-content {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .footer-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #FFFFFF;
            }
            
            .footer-contact {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 15px;
                flex-wrap: wrap;
            }
            
            .footer-contact a {
                color: #0078D4;
                text-decoration: none;
                font-size: 14px;
                transition: color 0.2s ease;
            }
            
            .footer-contact a:hover {
                color: #106EBE;
                text-decoration: underline;
            }
            
            .footer-powered {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #605E5C;
                font-size: 12px;
                color: #A19F9D;
            }
            
            @media (max-width: 768px) {
                .workflow-container {
                    padding: 20px 15px;
                }
                
                .company-logos {
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                }
                
                .logo-divider {
                    display: none;
                }
                
                .workflow-header {
                    padding: 25px 20px;
                }
                
                .workflow-stats {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .phase-header {
                    padding: 20px 20px;
                }
                
                .phase-content {
                    padding: 0 20px 20px 20px;
                }
                
                .footer-contact {
                    flex-direction: column;
                    gap: 10px;
                }
            }
            
            @media print {
                .workflow-container {
                    background: white;
                    padding: 0;
                }
                
                .phase-card {
                    page-break-inside: avoid;
                    box-shadow: none;
                    border: 1px solid #EDEBE9;
                    margin-bottom: 20px;
                }
                
                .phase-actions {
                    display: none !important;
                }
                
                .toggle-icon {
                    display: none !important;
                }
                
                .phase-content {
                    display: block !important;
                    background: white;
                }
                
                .phase-header {
                    background: #F3F2F1 !important;
                }
                
                .workflow-footer {
                    page-break-before: avoid;
                }
            }
        </style>
        
        <div class="workflow-container">
            <div class="company-logos">
                <div class="logo-left">
                    <img src="/files/Capital_Project_Logo.png" alt="Capital Project" />
                    <div class="logo-divider"></div>
                    <img src="/files/Forty_Framwork_Logo.png" alt="Forty Framework" />
                </div>
            </div>
            
            <div class="workflow-header">
                <h1>نظام سير العمل للمشاريع على Forty Framework</h1>
                <p class="subtitle">Software Project Workflow System on Forty Framework</p>
                <div style="margin-top: 25px; text-align: center;">
                    <button class="btn-export-all" onclick="exportAllGuideToPDF()">
                        📚 تصدير الدليل الكامل PDF
                    </button>
                </div>
            </div>
            
            <div class="phases-container">
                ${phases.map(phase => `
                    <div class="phase-card" data-phase-id="${phase.id}" style="border-right-color: ${phase.color}">
                        <div class="phase-header" onclick="togglePhase(${phase.id})">
                            <span class="phase-number">${phase.number}</span>
                            <div class="phase-title">
                                <h3>${phase.nameAr}</h3>
                                <p>${phase.nameEn}</p>
                            </div>
                            <div class="phase-actions">
                                <button class="btn-export" onclick="exportPhaseToPDF(${phase.id}, event)">
                                    تصدير PDF
                                </button>
                                <span class="toggle-icon" id="toggle-${phase.id}">▼</span>
                            </div>
                        </div>
                        <div class="phase-content" id="content-${phase.id}">
                            <div class="info-grid">
                                <div class="info-box" style="border-right-color: ${phase.color}">
                                    <h4>⏱ المدة الزمنية</h4>
                                    <p>${phase.duration}</p>
                                    <p class="bilingual">${phase.durationEn}</p>
                                </div>
                                <div class="info-box" style="border-right-color: ${phase.color}">
                                    <h4>👤 المسؤوليات</h4>
                                    <p>${phase.responsibilities}</p>
                                    <p class="bilingual">${phase.responsibilitiesEn}</p>
                                </div>
                            </div>
                            
                            <div class="section-box" style="border-right-color: ${phase.color}">
                                <h4>📋 المخرجات والتسليمات</h4>
                                <ul>
                                    ${phase.deliverables.map((item, idx) => `
                                        <li>
                                            ${item}
                                            <span class="bilingual">${phase.deliverablesEn[idx]}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            
                            <div class="section-box" style="border-right-color: ${phase.color}">
                                <h4>✓ معايير القبول</h4>
                                <ul>
                                    ${phase.acceptanceCriteria.map((item, idx) => `
                                        <li>
                                            ${item}
                                            <span class="bilingual">${phase.acceptanceCriteriaEn[idx]}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="workflow-footer">
                <div class="footer-content">
                    <div class="footer-title">Contact Us</div>
                    <div class="footer-contact">
                        <a href="https://www.capital-project.io" target="_blank">www.capital-project.io</a>
                        <a href="mailto:hello@capital-project.io">hello@capital-project.io</a>
                    </div>
                    <div class="footer-powered">
                        Powered by Forty Framework | Capital Project © 2025
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            function togglePhase(phaseId) {
                const content = document.getElementById('content-' + phaseId);
                const toggle = document.getElementById('toggle-' + phaseId);
                
                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                    toggle.classList.remove('rotated');
                } else {
                    content.classList.add('active');
                    toggle.classList.add('rotated');
                }
            }
            
            function exportPhaseToPDF(phaseId, event) {
                event.stopPropagation();
                
                const phaseData = ${JSON.stringify(phases)}.find(p => p.id === phaseId);
                
                const printWindow = window.open('', '_blank');
                const printContent = \`
                    <!DOCTYPE html>
                    <html dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>المرحلة \${phaseData.number} - \${phaseData.nameAr}</title>
                        <style>
                            @font-face {
                                font-family: 'Almarai';
                                src: url('/files/Almarai-Regular.ttf') format('truetype');
                                font-weight: normal;
                                font-style: normal;
                            }
                            
                            @page {
                                size: A4 portrait;
                                margin: 15mm;
                            }
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Almarai', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                                direction: rtl;
                                color: #323130;
                                line-height: 1.6;
                                background: #FFFFFF;
                            }
                            
                            .pdf-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 30px 0;
                                border-bottom: 3px solid #0078D4;
                                margin-bottom: 40px;
                            }
                            
                            .pdf-logos {
                                display: flex;
                                align-items: center;
                                gap: 20px;
                            }
                            
                            .pdf-logos img {
                                max-height: 50px;
                            }
                            
                            .logo-divider {
                                width: 2px;
                                height: 40px;
                                background: #EDEBE9;
                            }
                            
                            .document-header {
                                background: #FFFFFF;
                                border-right: 6px solid \${phaseData.color};
                                padding: 40px 30px;
                                margin-bottom: 40px;
                            }
                            
                            .document-header h1 {
                                font-size: 28px;
                                color: #323130;
                                margin: 0 0 8px 0;
                                font-weight: 600;
                                letter-spacing: -0.5px;
                            }
                            
                            .document-header p {
                                font-size: 16px;
                                color: #605E5C;
                                margin: 0;
                                font-weight: 400;
                            }
                            
                            .section {
                                margin-bottom: 30px;
                                page-break-inside: avoid;
                            }
                            
                            .section-header {
                                background: #F3F2F1;
                                padding: 15px 20px;
                                margin-bottom: 15px;
                                border-right: 4px solid \${phaseData.color};
                            }
                            
                            .section-header h2 {
                                font-size: 16px;
                                color: #323130;
                                font-weight: 600;
                                margin: 0;
                            }
                            
                            .section-content {
                                padding: 0 20px;
                            }
                            
                            .info-row {
                                margin-bottom: 20px;
                            }
                            
                            .info-row p {
                                font-size: 15px;
                                color: #323130;
                                margin: 0 0 6px 0;
                            }
                            
                            .info-row .bilingual {
                                font-size: 13px;
                                color: #605E5C;
                            }
                            
                            ul {
                                list-style: none;
                                padding: 0;
                                margin: 0;
                            }
                            
                            li {
                                padding: 12px 0 12px 22px;
                                border-bottom: 1px solid #EDEBE9;
                                font-size: 14px;
                                color: #323130;
                                position: relative;
                            }
                            
                            li:before {
                                content: "✓";
                                position: absolute;
                                right: 0;
                                color: #107C10;
                                font-weight: bold;
                                font-size: 16px;
                            }
                            
                            li:last-child {
                                border-bottom: none;
                            }
                            
                            li .bilingual {
                                font-size: 12px;
                                color: #605E5C;
                                margin-top: 4px;
                                display: block;
                            }
                            
                            .document-footer {
                                margin-top: 60px;
                                padding-top: 25px;
                                border-top: 2px solid #EDEBE9;
                                text-align: center;
                            }
                            
                            .footer-contact {
                                font-size: 14px;
                                color: #323130;
                                margin-bottom: 10px;
                            }
                            
                            .footer-contact a {
                                color: #0078D4;
                                text-decoration: none;
                                margin: 0 10px;
                            }
                            
                            .footer-info {
                                font-size: 12px;
                                color: #605E5C;
                                margin-top: 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="pdf-header">
                            <div class="pdf-logos">
                                <img src="/files/Capital_Project_Logo.png" alt="Capital Project" />
                                <div class="logo-divider"></div>
                                <img src="/files/Forty_Framwork_Logo.png" alt="Forty Framework" />
                            </div>
                        </div>
                        
                        <div class="document-header">
                            <h1>المرحلة \${phaseData.number}: \${phaseData.nameAr}</h1>
                            <p>\${phaseData.nameEn}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-header">
                                <h2>⏱ المدة الزمنية</h2>
                            </div>
                            <div class="section-content">
                                <div class="info-row">
                                    <p>\${phaseData.duration}</p>
                                    <p class="bilingual">\${phaseData.durationEn}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-header">
                                <h2>👤 المسؤوليات</h2>
                            </div>
                            <div class="section-content">
                                <div class="info-row">
                                    <p>\${phaseData.responsibilities}</p>
                                    <p class="bilingual">\${phaseData.responsibilitiesEn}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-header">
                                <h2>📋 المخرجات والتسليمات</h2>
                            </div>
                            <div class="section-content">
                                <ul>
                                    \${phaseData.deliverables.map((item, idx) => \`
                                        <li>
                                            \${item}
                                            <span class="bilingual">\${phaseData.deliverablesEn[idx]}</span>
                                        </li>
                                    \`).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-header">
                                <h2>✓ معايير القبول</h2>
                            </div>
                            <div class="section-content">
                                <ul>
                                    \${phaseData.acceptanceCriteria.map((item, idx) => \`
                                        <li>
                                            \${item}
                                            <span class="bilingual">\${phaseData.acceptanceCriteriaEn[idx]}</span>
                                        </li>
                                    \`).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <div class="document-footer">
                            <div class="footer-contact">
                                <strong>Contact Us:</strong>
                                <a href="https://www.capital-project.io">www.capital-project.io</a>
                                <a href="mailto:hello@capital-project.io">hello@capital-project.io</a>
                            </div>
                            <div class="footer-info">
                                <p>Powered by Forty Framework | Capital Project © 2025</p>
                                <p>تاريخ الطباعة: \${new Date().toLocaleDateString('ar-EG')} | Print Date: \${new Date().toLocaleDateString('en-US')}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                \`;
                
                printWindow.document.write(printContent);
                printWindow.document.close();
                
                setTimeout(() => {
                    printWindow.print();
                }, 1000);
            }
            
            function exportAllGuideToPDF() {
                const allPhasesData = ${JSON.stringify(phases)};
                
                const printWindow = window.open('', '_blank');
                const printContent = \`
                    <!DOCTYPE html>
                    <html dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>دليل سير العمل الكامل - Software Project Workflow Guide</title>
                        <style>
                            @font-face {
                                font-family: 'Almarai';
                                src: url('/files/Almarai-Regular.ttf') format('truetype');
                                font-weight: normal;
                                font-style: normal;
                            }
                            
                            @page {
                                size: A4 portrait;
                                margin: 15mm;
                            }
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Almarai', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                                direction: rtl;
                                color: #323130;
                                line-height: 1.6;
                                background: #FFFFFF;
                            }
                            
                            .cover-page {
                                min-height: 100vh;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                text-align: center;
                                page-break-after: always;
                                background: #FFFFFF;
                                color: #323130;
                                padding: 60px 40px 40px 40px;
                            }
                            
                            .cover-logos {
                                margin-top: 40px;
                                margin-bottom: 100px;
                                display: flex;
                                align-items: center;
                                gap: 40px;
                                padding: 35px 45px;
                                border-bottom: 4px solid #EDEBE9;
                            }
                            
                            .cover-logos img {
                                max-height: 90px;
                            }
                            
                            .cover-logo-divider {
                                width: 4px;
                                height: 70px;
                                background: #EDEBE9;
                            }
                            
                            .cover-title {
                                font-size: 58px;
                                font-weight: 700;
                                margin-bottom: 25px;
                                color: #0078D4;
                                line-height: 1.3;
                            }
                            
                            .cover-subtitle {
                                font-size: 38px;
                                font-weight: 400;
                                margin-bottom: 100px;
                                color: #605E5C;
                                line-height: 1.4;
                            }
                            
                            .cover-info {
                                font-size: 20px;
                                margin-top: 80px;
                                color: #605E5C;
                                padding: 35px 40px;
                                background: #F3F2F1;
                                border-right: 5px solid #0078D4;
                                max-width: 700px;
                            }
                            
                            .cover-info p {
                                margin: 12px 0;
                                line-height: 1.7;
                            }
                            
                            .toc-page {
                                page-break-after: always;
                                padding: 60px 0;
                            }
                            
                            .toc-title {
                                font-size: 42px;
                                font-weight: 600;
                                color: #0078D4;
                                margin-bottom: 40px;
                                padding-bottom: 20px;
                                border-bottom: 4px solid #0078D4;
                            }
                            
                            .toc-list {
                                list-style: none;
                                padding: 0;
                            }
                            
                            .toc-item {
                                padding: 20px 0;
                                border-bottom: 1px solid #EDEBE9;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            
                            .toc-item-number {
                                font-size: 26px;
                                font-weight: 600;
                                color: #0078D4;
                                margin-left: 25px;
                            }
                            
                            .toc-item-title {
                                flex: 1;
                                font-size: 20px;
                                color: #323130;
                                line-height: 1.6;
                            }
                            
                            .toc-item-subtitle {
                                font-size: 17px;
                                color: #605E5C;
                                margin-top: 6px;
                            }
                            
                            .pdf-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 30px 0;
                                border-bottom: 4px solid #0078D4;
                                margin-bottom: 40px;
                            }
                            
                            .pdf-logos {
                                display: flex;
                                align-items: center;
                                gap: 20px;
                            }
                            
                            .pdf-logos img {
                                max-height: 55px;
                            }
                            
                            .logo-divider {
                                width: 3px;
                                height: 45px;
                                background: #EDEBE9;
                            }
                            
                            .phase-page {
                                page-break-before: always;
                                padding-top: 30px;
                            }
                            
                            .document-header {
                                background: #F3F2F1;
                                border-right: 6px solid #0078D4;
                                padding: 40px;
                                margin-bottom: 40px;
                            }
                            
                            .document-header h1 {
                                font-size: 34px;
                                color: #323130;
                                margin: 0 0 12px 0;
                                font-weight: 600;
                                line-height: 1.4;
                            }
                            
                            .document-header p {
                                font-size: 20px;
                                color: #605E5C;
                                margin: 0;
                                line-height: 1.5;
                            }
                            
                            .section {
                                margin-bottom: 35px;
                                page-break-inside: avoid;
                            }
                            
                            .section-header {
                                background: #F3F2F1;
                                padding: 18px 25px;
                                margin-bottom: 18px;
                                border-right: 5px solid #0078D4;
                            }
                            
                            .section-header h2 {
                                font-size: 20px;
                                color: #323130;
                                font-weight: 600;
                                margin: 0;
                            }
                            
                            .section-content {
                                padding: 0 25px;
                            }
                            
                            .info-row p {
                                font-size: 18px;
                                color: #323130;
                                margin: 0 0 10px 0;
                                line-height: 1.7;
                            }
                            
                            .info-row .bilingual {
                                font-size: 16px;
                                color: #605E5C;
                                line-height: 1.6;
                            }
                            
                            ul {
                                list-style: none;
                                padding: 0;
                                margin: 0;
                            }
                            
                            li {
                                padding: 16px 0 16px 0;
                                border-bottom: 1px solid #EDEBE9;
                                font-size: 17px;
                                color: #323130;
                                position: relative;
                                line-height: 1.7;
                                padding-right: 0;
                            }
                            
                            li:last-child {
                                border-bottom: none;
                            }
                            
                            li .bilingual {
                                font-size: 15px;
                                color: #605E5C;
                                margin-top: 6px;
                                display: block;
                                line-height: 1.6;
                            }
                            
                            .document-footer {
                                margin-top: 60px;
                                padding-top: 30px;
                                border-top: 2px solid #EDEBE9;
                                text-align: center;
                                page-break-inside: avoid;
                            }
                            
                            .footer-contact {
                                font-size: 17px;
                                color: #323130;
                                margin-bottom: 12px;
                                line-height: 1.7;
                            }
                            
                            .footer-contact a {
                                color: #0078D4;
                                text-decoration: none;
                                margin: 0 12px;
                            }
                            
                            .footer-info {
                                font-size: 15px;
                                color: #605E5C;
                                margin-top: 15px;
                                line-height: 1.6;
                            }
                        </style>
                    </head>
                    <body>
                        <!-- Cover Page -->
                        <div class="cover-page">
                            <div class="cover-logos">
                                <img src="/files/Capital_Project_Logo.png" alt="Capital Project" />
                                <div class="cover-logo-divider"></div>
                                <img src="/files/Forty_Framwork_Logo.png" alt="Forty Framework" />
                            </div>
                            
                            <div class="cover-title">دليل سير العمل الكامل</div>
                            <div class="cover-subtitle">Complete Software Project Workflow Guide</div>
                        </div>
                        
                        <!-- Table of Contents -->
                        <div class="toc-page">
                            <div class="pdf-header">
                                <div class="pdf-logos">
                                    <img src="/files/Capital_Project_Logo.png" alt="Capital Project" />
                                    <div class="logo-divider"></div>
                                    <img src="/files/Forty_Framwork_Logo.png" alt="Forty Framework" />
                                </div>
                            </div>
                            
                            <h1 class="toc-title">جدول المحتويات | Table of Contents</h1>
                            <ul class="toc-list">
                                \${allPhasesData.map((phase, index) => \`
                                    <li class="toc-item">
                                        <span class="toc-item-number">\${phase.number}</span>
                                        <div class="toc-item-title">
                                            <div>\${phase.nameAr}</div>
                                            <div class="toc-item-subtitle">\${phase.nameEn}</div>
                                        </div>
                                    </li>
                                \`).join('')}
                            </ul>
                        </div>
                        
                        <!-- All Phases -->
                        \${allPhasesData.map((phase, index) => \`
                            <div class="phase-page">
                                <div class="pdf-header">
                                    <div class="pdf-logos">
                                        <img src="/files/Capital_Project_Logo.png" alt="Capital Project" />
                                        <div class="logo-divider"></div>
                                        <img src="/files/Forty_Framwork_Logo.png" alt="Forty Framework" />
                                    </div>
                                </div>
                                
                                <div class="document-header" style="border-right-color: \${phase.color}">
                                    <h1>المرحلة \${phase.number}: \${phase.nameAr}</h1>
                                    <p>\${phase.nameEn}</p>
                                </div>
                                
                                <div class="section">
                                    <div class="section-header" style="border-right-color: \${phase.color}">
                                        <h2>⏱ المدة الزمنية</h2>
                                    </div>
                                    <div class="section-content">
                                        <div class="info-row">
                                            <p>\${phase.duration}</p>
                                            <p class="bilingual">\${phase.durationEn}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="section">
                                    <div class="section-header" style="border-right-color: \${phase.color}">
                                        <h2>👤 المسؤوليات</h2>
                                    </div>
                                    <div class="section-content">
                                        <div class="info-row">
                                            <p>\${phase.responsibilities}</p>
                                            <p class="bilingual">\${phase.responsibilitiesEn}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="section">
                                    <div class="section-header" style="border-right-color: \${phase.color}">
                                        <h2>📋 المخرجات والتسليمات</h2>
                                    </div>
                                    <div class="section-content">
                                        <ul>
                                            \${phase.deliverables.map((item, idx) => \`
                                                <li>
                                                    \${item}
                                                    <span class="bilingual">\${phase.deliverablesEn[idx]}</span>
                                                </li>
                                            \`).join('')}
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="section">
                                    <div class="section-header" style="border-right-color: \${phase.color}">
                                        <h2>✓ معايير القبول</h2>
                                    </div>
                                    <div class="section-content">
                                        <ul>
                                            \${phase.acceptanceCriteria.map((item, idx) => \`
                                                <li>
                                                    \${item}
                                                    <span class="bilingual">\${phase.acceptanceCriteriaEn[idx]}</span>
                                                </li>
                                            \`).join('')}
                                        </ul>
                                    </div>
                                </div>
                                
                                \${index === allPhasesData.length - 1 ? \`
                                    <div class="document-footer">
                                        <div class="footer-contact">
                                            <strong>Contact Us:</strong>
                                            <a href="https://www.capital-project.io">www.capital-project.io</a>
                                            <a href="mailto:hello@capital-project.io">hello@capital-project.io</a>
                                        </div>
                                        <div class="footer-info">
                                            <p>Powered by Forty Framework | Capital Project © 2025</p>
                                            <p>تاريخ الطباعة: \${new Date().toLocaleDateString('ar-EG')} | Print Date: \${new Date().toLocaleDateString('en-US')}</p>
                                        </div>
                                    </div>
                                \` : ''}
                            </div>
                        \`).join('')}
                    </body>
                    </html>
                \`;
                
                printWindow.document.write(printContent);
                printWindow.document.close();
                
                setTimeout(() => {
                    printWindow.print();
                }, 2000);
            }
        </script>
    `;

    frm.set_df_property('software_project_workflow_system_html', 'options', html);
    frm.refresh_field('software_project_workflow_system_html');
}