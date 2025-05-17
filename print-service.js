/**
 * خدمة الطباعة لتطبيق EasyFood Manager
 * تتيح هذه الخدمة طباعة الفواتير وأوراق المطبخ والتقارير
 * مع دعم طابعات متعددة:
 * - طابعة 1: للكاشير (الفواتير والتقارير)
 * - طابعة 2: للمطبخ (طلبات المطبخ)
 *
 * تم تحسين الخدمة لضمان عمل الطباعة في جميع القوائم والواجهات
 */

// إعدادات الطابعات
const printerConfig = {
    // طابعة 1: للكاشير (الفواتير والتقارير)
    cashier: {
        name: 'طابعة الكاشير',
        id: 1,
        description: 'طابعة الفواتير والتقارير'
    },
    // طابعة 2: للمطبخ (طلبات المطبخ)
    kitchen: {
        name: 'طابعة المطبخ',
        id: 2,
        description: 'طابعة طلبات المطبخ'
    }
};

/**
 * طباعة فاتورة للزبون
 * @param {Object} order - بيانات الطلب
 * @param {Object} customPrinter - طابعة مخصصة (اختياري)
 * @param {Object} options - خيارات إضافية للطباعة (اختياري)
 * @returns {Window|Object|null} - كائن النافذة المفتوحة أو كائن يشير إلى استخدام الطريقة البديلة أو null في حالة الفشل
 */
function printReceipt(order, customPrinter = null, options = {}) {
    try {
        console.log('بدء طباعة الفاتورة...');

        // الخيارات الافتراضية
        const defaultOptions = {
            autoPrint: true,         // طباعة تلقائية
            showPrintDialog: true,   // عرض نافذة الطباعة
            maxRetries: 3,           // عدد محاولات إعادة الطباعة
            silent: false            // عدم عرض رسائل الخطأ
        };

        // دمج الخيارات المخصصة مع الخيارات الافتراضية
        const printOptions = { ...defaultOptions, ...options };

        // إنشاء محتوى الفاتورة
        const receiptContent = generateReceiptContent(order);

        // استخدام الطابعة المخصصة إذا تم تحديدها، وإلا استخدام طابعة الكاشير الافتراضية
        const printer = customPrinter || printerConfig.cashier;

        // فتح نافذة الطباعة مع تحديد الطابعة
        const printResult = openPrintWindow(receiptContent, 'فاتورة', printOptions.autoPrint, printer);

        if (!printResult) {
            console.error('فشل في فتح نافذة طباعة الفاتورة');

            if (!printOptions.silent) {
                alert('حدث خطأ أثناء طباعة الفاتورة. يرجى المحاولة مرة أخرى.');
            }

            return null;
        }

        // التحقق مما إذا تم استخدام الطريقة البديلة
        if (printResult.fallback) {
            console.log('تم استخدام الطريقة البديلة لطباعة الفاتورة');
            return printResult;
        }

        console.log('تم إرسال الفاتورة للطباعة بنجاح');
        return printResult;
    } catch (error) {
        console.error('خطأ أثناء طباعة الفاتورة:', error);

        // محاولة استخدام طريقة بديلة للطباعة
        try {
            console.log('محاولة استخدام طريقة بديلة للطباعة بعد الخطأ...');
            const receiptContent = generateReceiptContent(order);
            const printer = customPrinter || printerConfig.cashier;

            if (useFallbackPrintMethod(receiptContent, 'فاتورة', printer)) {
                console.log('تم استخدام الطريقة البديلة بنجاح بعد الخطأ');
                return { fallback: true };
            }
        } catch (fallbackError) {
            console.error('فشل في استخدام الطريقة البديلة للطباعة:', fallbackError);
        }

        if (!options.silent) {
            alert('حدث خطأ أثناء طباعة الفاتورة. يرجى المحاولة مرة أخرى.');
        }

        return null;
    }
}

/**
 * طباعة ورقة للمطبخ
 * @param {Object} order - بيانات الطلب
 * @param {Object} customPrinter - طابعة مخصصة (اختياري)
 * @param {Object} options - خيارات إضافية للطباعة (اختياري)
 * @returns {Window|Object|null} - كائن النافذة المفتوحة أو كائن يشير إلى استخدام الطريقة البديلة أو null في حالة الفشل
 */
function printKitchenOrder(order, customPrinter = null, options = {}) {
    try {
        console.log('بدء طباعة طلب المطبخ...');

        // الخيارات الافتراضية
        const defaultOptions = {
            autoPrint: true,         // طباعة تلقائية
            showPrintDialog: true,   // عرض نافذة الطباعة
            maxRetries: 3,           // عدد محاولات إعادة الطباعة
            silent: false            // عدم عرض رسائل الخطأ
        };

        // دمج الخيارات المخصصة مع الخيارات الافتراضية
        const printOptions = { ...defaultOptions, ...options };

        // إنشاء محتوى ورقة المطبخ
        const kitchenContent = generateKitchenContent(order);

        // استخدام الطابعة المخصصة إذا تم تحديدها، وإلا استخدام طابعة المطبخ الافتراضية
        const printer = customPrinter || printerConfig.kitchen;

        // فتح نافذة الطباعة مع تفعيل الطباعة التلقائية وتحديد الطابعة
        const printResult = openPrintWindow(kitchenContent, 'طلب للمطبخ', printOptions.autoPrint, printer);

        if (!printResult) {
            console.error('فشل في فتح نافذة طباعة طلب المطبخ');

            if (!printOptions.silent) {
                alert('حدث خطأ أثناء طباعة طلب المطبخ. يرجى المحاولة مرة أخرى.');
            }

            return null;
        }

        // التحقق مما إذا تم استخدام الطريقة البديلة
        if (printResult.fallback) {
            console.log('تم استخدام الطريقة البديلة لطباعة طلب المطبخ');
            return printResult;
        }

        console.log('تم إرسال طلب المطبخ للطباعة بنجاح');
        return printResult;
    } catch (error) {
        console.error('خطأ أثناء طباعة طلب المطبخ:', error);

        // محاولة استخدام طريقة بديلة للطباعة
        try {
            console.log('محاولة استخدام طريقة بديلة للطباعة بعد الخطأ...');
            const kitchenContent = generateKitchenContent(order);
            const printer = customPrinter || printerConfig.kitchen;

            if (useFallbackPrintMethod(kitchenContent, 'طلب للمطبخ', printer)) {
                console.log('تم استخدام الطريقة البديلة بنجاح بعد الخطأ');
                return { fallback: true };
            }
        } catch (fallbackError) {
            console.error('فشل في استخدام الطريقة البديلة للطباعة:', fallbackError);
        }

        if (!options.silent) {
            alert('حدث خطأ أثناء طباعة طلب المطبخ. يرجى المحاولة مرة أخرى.');
        }

        return null;
    }
}

/**
 * طباعة إشعار جاهزية الطلب
 * @param {Object} order - بيانات الطلب
 * @param {Object} customPrinter - طابعة مخصصة (اختياري)
 * @param {Object} options - خيارات إضافية للطباعة (اختياري)
 * @returns {Window|Object|null} - كائن النافذة المفتوحة أو كائن يشير إلى استخدام الطريقة البديلة أو null في حالة الفشل
 */
function printOrderReadyNotification(order, customPrinter = null, options = {}) {
    try {
        console.log('بدء طباعة إشعار جاهزية الطلب...');

        // الخيارات الافتراضية
        const defaultOptions = {
            autoPrint: true,         // طباعة تلقائية
            showPrintDialog: true,   // عرض نافذة الطباعة
            maxRetries: 3,           // عدد محاولات إعادة الطباعة
            silent: false            // عدم عرض رسائل الخطأ
        };

        // دمج الخيارات المخصصة مع الخيارات الافتراضية
        const printOptions = { ...defaultOptions, ...options };

        // إنشاء محتوى الإشعار
        const notificationContent = generateNotificationContent(order);

        // استخدام الطابعة المخصصة إذا تم تحديدها، وإلا استخدام طابعة الكاشير الافتراضية
        const printer = customPrinter || printerConfig.cashier;

        // فتح نافذة الطباعة مع تفعيل الطباعة التلقائية وتحديد الطابعة
        const printResult = openPrintWindow(notificationContent, 'إشعار جاهزية الطلب', printOptions.autoPrint, printer);

        if (!printResult) {
            console.error('فشل في فتح نافذة طباعة إشعار جاهزية الطلب');

            if (!printOptions.silent) {
                alert('حدث خطأ أثناء طباعة إشعار جاهزية الطلب. يرجى المحاولة مرة أخرى.');
            }

            return null;
        }

        // التحقق مما إذا تم استخدام الطريقة البديلة
        if (printResult.fallback) {
            console.log('تم استخدام الطريقة البديلة لطباعة إشعار جاهزية الطلب');
            return printResult;
        }

        console.log('تم إرسال إشعار جاهزية الطلب للطباعة بنجاح');
        return printResult;
    } catch (error) {
        console.error('خطأ أثناء طباعة إشعار جاهزية الطلب:', error);

        // محاولة استخدام طريقة بديلة للطباعة
        try {
            console.log('محاولة استخدام طريقة بديلة للطباعة بعد الخطأ...');
            const notificationContent = generateNotificationContent(order);
            const printer = customPrinter || printerConfig.cashier;

            if (useFallbackPrintMethod(notificationContent, 'إشعار جاهزية الطلب', printer)) {
                console.log('تم استخدام الطريقة البديلة بنجاح بعد الخطأ');
                return { fallback: true };
            }
        } catch (fallbackError) {
            console.error('فشل في استخدام الطريقة البديلة للطباعة:', fallbackError);
        }

        if (!options.silent) {
            alert('حدث خطأ أثناء طباعة إشعار جاهزية الطلب. يرجى المحاولة مرة أخرى.');
        }

        return null;
    }
}

/**
 * إنشاء محتوى الفاتورة
 * @param {Object} order - بيانات الطلب
 * @returns {string} - محتوى الفاتورة بتنسيق HTML
 */
function generateReceiptContent(order) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let itemsHtml = '';
    let total = 0;

    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHtml += `
            <div class="receipt-item">
                <div class="receipt-item-name">
                    <div>${item.name} × ${item.quantity}</div>
                    ${item.notes ? `<div class="receipt-notes">${item.notes}</div>` : ''}
                </div>
                <div class="receipt-item-price">${itemTotal.toFixed(2)} دج</div>
            </div>
        `;
    });

    return `
        <div class="receipt-container">
            <div class="receipt-header">
                <img src="https://b.top4top.io/p_339723os71.jpg" alt="EasyFood Manager Logo">
                <div class="receipt-title">EasyFood Manager</div>
                <div class="receipt-subtitle">نظام إدارة المطعم</div>
                <div class="receipt-meta">
                    <p><strong>رقم الفاتورة:</strong> ${Math.floor(100000 + Math.random() * 900000)}</p>
                    <p><strong>التاريخ:</strong> ${dateStr}</p>
                </div>
                <div class="receipt-meta">
                    <p><strong>العميل:</strong> ${order.customerName || 'زبون'}</p>
                    <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
                </div>
                <div class="receipt-meta">
                    <p><strong>رقم الهاتف:</strong> ${order.customerPhone || 'غير متوفر'}</p>
                    <p><strong>الموظف:</strong> ${order.employee || 'الكاشير'}</p>
                </div>
            </div>

            <div class="receipt-items">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                    <div>الصنف</div>
                    <div>السعر</div>
                </div>
                ${itemsHtml}
            </div>

            <div class="receipt-total">
                <div style="display: flex; justify-content: space-between;">
                    <span>الإجمالي:</span>
                    <span>${total.toFixed(2)} دج</span>
                </div>
            </div>

            <div class="contact-info">
                <p><i class="fas fa-phone"></i> 0123456789</p>
                <p><i class="fas fa-map-marker-alt"></i> المدينة، الشارع</p>
            </div>

            <p class="thank-you">شكرًا لاختياركم مطعمنا! نتمنى لكم وجبة شهية</p>

            <div class="receipt-footer">
                <p>EasyFood Manager &copy; ${now.getFullYear()}</p>
            </div>
        </div>
    `;
}

/**
 * إنشاء محتوى ورقة المطبخ
 * @param {Object} order - بيانات الطلب
 * @returns {string} - محتوى ورقة المطبخ بتنسيق HTML
 */
function generateKitchenContent(order) {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-SA');
    const dateStr = now.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    let itemsHtml = '';

    order.items.forEach(item => {
        itemsHtml += `
            <div class="kitchen-item">
                <strong>${item.name}</strong> × ${item.quantity}
                ${item.notes ? `<div style="font-size: 14px; color: #777; padding-right: 10px;">${item.notes}</div>` : ''}
            </div>
        `;
    });

    return `
        <div class="kitchen-order">
            <div class="kitchen-header">
                <h1 style="font-size: 28px; margin: 0; color: #4caf50;">** للمطبخ **</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px; color: #777;">طلب يحتاج للتحضير</p>
            </div>

            <div class="kitchen-info">
                <p style="font-size: 18px;"><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
                <p><strong>التاريخ:</strong> ${dateStr}</p>
                <p><strong>الوقت:</strong> ${time}</p>
            </div>

            <div style="border-top: 2px dashed #4caf50; border-bottom: 2px dashed #4caf50; padding: 10px 0; margin: 15px 0;">
                <h2 style="margin: 0 0 10px 0; color: #4caf50;">محتويات الطلب:</h2>
                <div class="kitchen-items">
                    ${itemsHtml}
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px; font-weight: 700; color: #4caf50;">
                يرجى تحضير الطلب بأسرع وقت ممكن
            </div>
        </div>
    `;
}

/**
 * فتح نافذة الطباعة
 * @param {string} content - محتوى الطباعة بتنسيق HTML
 * @param {string} title - عنوان النافذة
 * @param {boolean} autoPrint - هل يتم الطباعة تلقائياً
 * @param {Object} printer - معلومات الطابعة المستخدمة
 * @returns {Window} - كائن النافذة المفتوحة
 */
function openPrintWindow(content, title, autoPrint = false, printer = null) {
    try {
        // استخدام اسم فريد للنافذة لتجنب تداخل النوافذ
        const windowName = `print_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // محاولة فتح النافذة بخيارات مختلفة للتوافق مع مختلف المتصفحات
        let printWindow;
        try {
            // محاولة أولى - مع خيارات كاملة
            printWindow = window.open('', windowName, 'width=800,height=600,toolbar=0,scrollbars=1,status=0,menubar=1');
        } catch (e) {
            console.warn('فشلت المحاولة الأولى لفتح نافذة الطباعة، جاري المحاولة بخيارات أقل:', e);
            // محاولة ثانية - مع خيارات أقل
            printWindow = window.open('', windowName);
        }

        if (!printWindow) {
            console.error('فشل في فتح نافذة الطباعة - تأكد من السماح بالنوافذ المنبثقة');

            // محاولة استخدام طريقة بديلة للطباعة
            if (useFallbackPrintMethod(content, title, printer)) {
                return { fallback: true }; // إرجاع كائن يشير إلى استخدام الطريقة البديلة
            }

            alert('يرجى السماح بالنوافذ المنبثقة لطباعة المستند');
            return null;
        }

        // إضافة معلمة للطباعة التلقائية
        const autoClass = autoPrint ? 'auto-print' : '';

        // إضافة معلومات الطابعة
        const printerInfo = printer ? `data-printer-id="${printer.id}" data-printer-name="${printer.name}"` : '';

        // إعادة تعيين محتوى النافذة
        try {
            printWindow.document.open();

            // إضافة محتوى HTML مع تحسينات للتوافق
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar" class="${autoClass}" ${printerInfo}>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <title>${title}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <script>
                        // متغيرات عامة لتتبع حالة الطباعة
                        window.printAttempted = false;
                        window.printSuccess = false;
                        window.maxPrintAttempts = 3;
                        window.currentPrintAttempt = 0;

                        // دالة للطباعة مع إعادة المحاولة
                        function printWithRetry() {
                            try {
                                if (window.currentPrintAttempt < window.maxPrintAttempts) {
                                    window.currentPrintAttempt++;
                                    console.log('محاولة الطباعة رقم ' + window.currentPrintAttempt);

                                    window.print();
                                    window.printAttempted = true;

                                    // تحقق من نجاح الطباعة (لا يمكن التأكد بشكل مباشر)
                                    window.printSuccess = true;
                                    console.log('تمت الطباعة بنجاح (على الأرجح)');

                                    // إغلاق النافذة بعد الطباعة في حالة طلبات المطبخ
                                    if (document.title === 'طلب للمطبخ' && window.printSuccess) {
                                        setTimeout(() => window.close(), 1000);
                                    }
                                } else {
                                    console.error('فشلت جميع محاولات الطباعة');
                                    document.getElementById('print-error').style.display = 'block';
                                }
                            } catch (printError) {
                                console.error('خطأ أثناء الطباعة:', printError);
                                document.getElementById('print-error').style.display = 'block';

                                // محاولة مرة أخرى بعد تأخير
                                if (window.currentPrintAttempt < window.maxPrintAttempts) {
                                    setTimeout(printWithRetry, 1000);
                                }
                            }
                        }

                        // دالة للطباعة التلقائية
                        function autoPrintAndClose() {
                            try {
                                if (document.documentElement.classList.contains('auto-print')) {
                                    // عرض معلومات الطابعة المستخدمة
                                    const printerId = document.documentElement.getAttribute('data-printer-id');
                                    const printerName = document.documentElement.getAttribute('data-printer-name');

                                    if (printerId && printerName) {
                                        console.log('استخدام الطابعة رقم ' + printerId + ' (' + printerName + ') للطباعة');
                                    }

                                    // تأخير الطباعة لضمان تحميل الصفحة بالكامل
                                    setTimeout(printWithRetry, 1000);
                                }
                            } catch (error) {
                                console.error('خطأ في دالة الطباعة التلقائية:', error);
                                document.getElementById('print-error').style.display = 'block';
                            }
                        }

                        // تنفيذ الطباعة التلقائية عند تحميل الصفحة
                        if (document.readyState === 'complete') {
                            autoPrintAndClose();
                        } else {
                            window.addEventListener('load', autoPrintAndClose);
                        }

                        // محاولة ثانية للطباعة في حالة فشل المحاولة الأولى
                        setTimeout(function() {
                            if (document.documentElement.classList.contains('auto-print') &&
                                !window.printSuccess && window.currentPrintAttempt < window.maxPrintAttempts) {
                                console.log('محاولة إضافية للطباعة...');
                                printWithRetry();
                            }
                        }, 2500);

                        // محاولة ثالثة للطباعة في حالة فشل المحاولتين السابقتين
                        setTimeout(function() {
                            if (document.documentElement.classList.contains('auto-print') &&
                                !window.printSuccess && window.currentPrintAttempt < window.maxPrintAttempts) {
                                console.log('محاولة أخيرة للطباعة...');
                                printWithRetry();
                            }
                        }, 4000);

                        // دالة للطباعة اليدوية
                        function manualPrint() {
                            try {
                                document.getElementById('print-buttons').style.display = 'none';
                                printWithRetry();
                                setTimeout(() => {
                                    document.getElementById('print-buttons').style.display = 'flex';
                                }, 1000);
                            } catch (error) {
                                console.error('خطأ في الطباعة اليدوية:', error);
                                document.getElementById('print-error').style.display = 'block';
                            }
                        }
                    </script>
            <style>
                body {
                    font-family: 'Tajawal', sans-serif;
                    padding: 20px;
                    margin: 0;
                    background: white;
                    color: #333;
                }

                /* تنسيقات رسالة الخطأ */
                #print-error {
                    display: none;
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                }

                /* تنسيقات أزرار الطباعة */
                #print-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                }

                .print-btn {
                    padding: 10px 20px;
                    background-color: #8B4513;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Tajawal', sans-serif;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .print-btn:hover {
                    background-color: #5D2906;
                    transform: translateY(-2px);
                }

                .print-btn:active {
                    transform: translateY(0);
                }

                .print-btn.secondary {
                    background-color: #6c757d;
                }

                .print-btn.secondary:hover {
                    background-color: #5a6268;
                }

                .receipt-container {
                    max-width: 500px;
                    margin: 0 auto;
                    border: 2px solid #8B4513;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }

                .receipt-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px dashed #8B4513;
                }

                .receipt-header img {
                    width: 100px;
                    height: 100px;
                    margin-bottom: 10px;
                    border-radius: 50%;
                    border: 2px solid #FFD700;
                    object-fit: cover;
                }

                .receipt-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #8B4513;
                    margin-bottom: 5px;
                }

                .receipt-subtitle {
                    font-size: 14px;
                    color: #777;
                    margin-bottom: 15px;
                }

                .receipt-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    font-size: 14px;
                }

                .receipt-items {
                    margin: 20px 0;
                }

                .receipt-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                }

                .receipt-item-name {
                    flex: 1;
                }

                .receipt-item-price {
                    font-weight: 700;
                    color: #8B4513;
                }

                .receipt-notes {
                    font-size: 12px;
                    color: #777;
                    padding-right: 10px;
                }

                .receipt-total {
                    text-align: left;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 2px dashed #8B4513;
                    font-weight: 700;
                    font-size: 20px;
                }

                .contact-info {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 15px;
                    font-size: 14px;
                }

                .thank-you {
                    text-align: center;
                    margin-top: 15px;
                    font-style: italic;
                    color: #8B4513;
                    font-weight: 500;
                }

                .receipt-footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }

                .kitchen-order {
                    max-width: 500px;
                    margin: 0 auto;
                    border: 2px solid #4caf50;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }

                .kitchen-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px dashed #4caf50;
                }

                .kitchen-info {
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                .kitchen-items {
                    margin: 20px 0;
                }

                .kitchen-item {
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                    font-size: 18px;
                }

                .notification {
                    max-width: 500px;
                    margin: 0 auto;
                    border: 2px solid #2196f3;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }

                .notification-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px dashed #2196f3;
                }

                .notification-info {
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                .notification-items {
                    margin: 20px 0;
                }

                .notification-items ul {
                    padding-right: 20px;
                }

                .notification-footer {
                    text-align: center;
                    margin-top: 15px;
                    font-weight: 700;
                    color: #2196f3;
                }

                .no-print {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                }

                .no-print button {
                    padding: 10px 20px;
                    background-color: #8B4513;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Tajawal', sans-serif;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .no-print button:hover {
                    background-color: #5D2906;
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .receipt-container, .kitchen-order, .notification {
                        border: none;
                        box-shadow: none;
                        padding: 15px;
                        max-width: 100%;
                    }

                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <!-- رسالة الخطأ -->
            <div id="print-error" class="no-print">
                <p>حدث خطأ أثناء الطباعة. يرجى المحاولة مرة أخرى باستخدام الأزرار أدناه.</p>
            </div>

            <!-- أزرار الطباعة -->
            <div id="print-buttons" class="no-print">
                <button class="print-btn" onclick="manualPrint()">
                    <i class="fas fa-print"></i> طباعة
                </button>
                <button class="print-btn secondary" onclick="window.close()">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </body>
        </html>
    `);

            printWindow.document.close();
            return printWindow;
        } catch (docError) {
            console.error('خطأ أثناء إنشاء مستند الطباعة:', docError);

            // محاولة استخدام طريقة بديلة للطباعة
            if (useFallbackPrintMethod(content, title, printer)) {
                return { fallback: true }; // إرجاع كائن يشير إلى استخدام الطريقة البديلة
            }

            alert('حدث خطأ أثناء إعداد مستند الطباعة. يرجى المحاولة مرة أخرى.');
            return null;
        }
    } catch (error) {
        console.error('خطأ عام في وظيفة فتح نافذة الطباعة:', error);

        // محاولة استخدام طريقة بديلة للطباعة
        if (useFallbackPrintMethod(content, title, printer)) {
            return { fallback: true }; // إرجاع كائن يشير إلى استخدام الطريقة البديلة
        }

        alert('حدث خطأ أثناء الطباعة. يرجى المحاولة مرة أخرى.');
        return null;
    }
}

/**
 * طريقة بديلة للطباعة في حالة فشل الطريقة الأساسية
 * @param {string} content - محتوى الطباعة بتنسيق HTML
 * @param {string} title - عنوان المستند
 * @param {Object} printer - معلومات الطابعة المستخدمة
 * @returns {boolean} - نجاح أو فشل الطريقة البديلة
 */
function useFallbackPrintMethod(content, title, printer) {
    try {
        console.log('استخدام طريقة بديلة للطباعة...');

        // إنشاء عنصر iframe مؤقت
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.name = 'print_frame_' + Date.now();
        document.body.appendChild(iframe);

        // إضافة محتوى HTML إلى الـ iframe
        const printDocument = iframe.contentWindow.document;
        printDocument.open();

        // إضافة معلومات الطابعة
        const printerInfo = printer ? `data-printer-id="${printer.id}" data-printer-name="${printer.name}"` : '';

        printDocument.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar" ${printerInfo}>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        margin: 0;
                        background: white;
                        color: #333;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);

        printDocument.close();

        // محاولة الطباعة بعد تأخير قصير
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // إزالة الـ iframe بعد الطباعة
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 2000);

                console.log('تمت الطباعة بنجاح باستخدام الطريقة البديلة');
                return true;
            } catch (printError) {
                console.error('فشل في الطباعة باستخدام الطريقة البديلة:', printError);

                // إزالة الـ iframe في حالة الفشل
                document.body.removeChild(iframe);
                return false;
            }
        }, 1000);

        return true; // تم استخدام الطريقة البديلة بنجاح (على الأقل تم إنشاء الـ iframe)
    } catch (error) {
        console.error('خطأ في الطريقة البديلة للطباعة:', error);
        return false;
    }
}

/**
 * إنشاء محتوى إشعار جاهزية الطلب
 * @param {Object} order - بيانات الطلب
 * @returns {string} - محتوى الإشعار بتنسيق HTML
 */
function generateNotificationContent(order) {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-SA');

    return `
        <div class="notification">
            <div class="notification-header">
                <h1>إشعار جاهزية الطلب</h1>
            </div>

            <div class="notification-info">
                <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
                <p><strong>الوقت:</strong> ${time}</p>
                <p><strong>الكاشير:</strong> ${order.employee || 'غير معروف'}</p>
                <p><strong>العميل:</strong> ${order.customerName || 'زبون'}</p>
            </div>

            <div class="notification-items">
                <h2>محتويات الطلب:</h2>
                <ul>
                    ${order.items.map(item => `<li>${item.name} × ${item.quantity}</li>`).join('')}
                </ul>
            </div>

            <div class="notification-footer">
                <p>يرجى استدعاء الزبون لاستلام الطلب</p>
            </div>
        </div>
    `;
}
