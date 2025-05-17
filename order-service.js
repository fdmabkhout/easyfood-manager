/**
 * خدمة إدارة الطلبات لتطبيق EasyFood Manager
 * تتيح هذه الخدمة إدارة الطلبات وتخزينها ونقلها بين واجهات التطبيق
 */

// مفاتيح التخزين المحلي
const PENDING_ORDERS_KEY = 'easyfood_pending_orders';
const COMPLETED_ORDERS_KEY = 'easyfood_completed_orders';
const TEMP_ORDERS_KEY = 'easyfood_temp_orders';
const ORDER_COUNTER_KEY = 'easyfood_order_counter';

/**
 * الحصول على رقم الطلب التالي
 * @returns {number} رقم الطلب التالي
 */
function getNextOrderNumber() {
    try {
        const counter = localStorage.getItem(ORDER_COUNTER_KEY);
        let nextNumber = 1;

        if (counter) {
            // محاولة تحويل القيمة إلى رقم صحيح
            const parsedCounter = parseInt(counter);

            // التحقق من أن القيمة المحولة هي رقم صحيح
            if (!isNaN(parsedCounter)) {
                nextNumber = parsedCounter + 1;
            }
        }

        // حفظ القيمة الجديدة في التخزين المحلي
        localStorage.setItem(ORDER_COUNTER_KEY, nextNumber.toString());

        return nextNumber;
    } catch (error) {
        console.error('خطأ أثناء الحصول على رقم الطلب التالي:', error);

        // إرجاع رقم عشوائي في حالة حدوث خطأ
        const randomNumber = Math.floor(Math.random() * 1000) + 1;
        return randomNumber;
    }
}

/**
 * الحصول على جميع الطلبات المعلقة
 * @returns {Array} قائمة الطلبات المعلقة
 */
function getPendingOrders() {
    const orders = localStorage.getItem(PENDING_ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

/**
 * الحصول على جميع الطلبات المكتملة
 * @returns {Array} قائمة الطلبات المكتملة
 */
function getCompletedOrders() {
    const orders = localStorage.getItem(COMPLETED_ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

/**
 * الحصول على جميع الطلبات المؤقتة
 * @returns {Array} قائمة الطلبات المؤقتة
 */
function getTempOrders() {
    const orders = localStorage.getItem(TEMP_ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
}

/**
 * حفظ طلب مؤقت
 * @param {Object} order - بيانات الطلب
 * @returns {Object} الطلب المحفوظ
 */
function saveTempOrder(order) {
    const tempOrders = getTempOrders();

    // إضافة رقم طلب إذا لم يكن موجوداً
    if (!order.orderNumber) {
        order.orderNumber = getNextOrderNumber();
    } else {
        // ضمان أن رقم الطلب هو رقم صحيح
        order.orderNumber = parseInt(order.orderNumber);
    }

    // إضافة تاريخ الإنشاء إذا لم يكن موجوداً
    if (!order.createdAt) {
        order.createdAt = new Date().toISOString();
    }

    // إضافة معرف فريد إذا لم يكن موجوداً
    if (!order.id) {
        order.id = Date.now().toString();
    }

    // إضافة حالة الطلب إذا لم تكن موجودة
    if (!order.status) {
        order.status = 'temp';
    }

    // البحث عن الطلب في القائمة المؤقتة
    const existingOrderIndex = tempOrders.findIndex(o => o.id === order.id);

    if (existingOrderIndex !== -1) {
        // تحديث الطلب الموجود
        tempOrders[existingOrderIndex] = order;
    } else {
        // إضافة الطلب الجديد في بداية القائمة
        tempOrders.unshift(order);
    }

    // حفظ القائمة المحدثة
    localStorage.setItem(TEMP_ORDERS_KEY, JSON.stringify(tempOrders));

    return order;
}

/**
 * حذف طلب مؤقت
 * @param {string} orderId - معرف الطلب
 * @returns {boolean} نجاح أو فشل العملية
 */
function removeTempOrder(orderId) {
    const tempOrders = getTempOrders();
    const updatedOrders = tempOrders.filter(order => order.id !== orderId);

    if (updatedOrders.length !== tempOrders.length) {
        localStorage.setItem(TEMP_ORDERS_KEY, JSON.stringify(updatedOrders));
        return true;
    }

    return false;
}

/**
 * نقل طلب من القائمة المؤقتة إلى قائمة الطلبات المعلقة
 * @param {string} orderId - معرف الطلب
 * @returns {Object|null} الطلب المنقول أو null في حالة الفشل
 */
function moveOrderToPending(orderId) {
    const tempOrders = getTempOrders();
    const pendingOrders = getPendingOrders();

    // البحث عن الطلب في القائمة المؤقتة
    const orderIndex = tempOrders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        return null;
    }

    // نسخ الطلب وتحديث حالته
    const order = {
        ...tempOrders[orderIndex],
        status: 'pending',
        // ضمان أن رقم الطلب هو رقم صحيح
        orderNumber: parseInt(tempOrders[orderIndex].orderNumber)
    };

    // إضافة الطلب إلى قائمة الطلبات المعلقة
    pendingOrders.unshift(order);

    // حذف الطلب من القائمة المؤقتة
    tempOrders.splice(orderIndex, 1);

    // حفظ القوائم المحدثة
    localStorage.setItem(TEMP_ORDERS_KEY, JSON.stringify(tempOrders));
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pendingOrders));

    return order;
}

/**
 * تحديث حالة طلب
 * @param {string} orderId - معرف الطلب
 * @param {string} status - الحالة الجديدة
 * @returns {Object|null} الطلب المحدث أو null في حالة الفشل
 */
function updateOrderStatus(orderId, status) {
    // البحث في الطلبات المعلقة أولاً
    const pendingOrders = getPendingOrders();
    const pendingOrderIndex = pendingOrders.findIndex(order => order.id === orderId);

    if (pendingOrderIndex !== -1) {
        // تحديث حالة الطلب
        pendingOrders[pendingOrderIndex].status = status;

        // إذا كانت الحالة الجديدة هي "مكتمل"، نقل الطلب إلى قائمة الطلبات المكتملة
        if (status === 'completed') {
            const completedOrders = getCompletedOrders();
            completedOrders.unshift(pendingOrders[pendingOrderIndex]);
            pendingOrders.splice(pendingOrderIndex, 1);
            localStorage.setItem(COMPLETED_ORDERS_KEY, JSON.stringify(completedOrders));
        }

        localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pendingOrders));
        return pendingOrders[pendingOrderIndex];
    }

    // البحث في الطلبات المؤقتة
    const tempOrders = getTempOrders();
    const tempOrderIndex = tempOrders.findIndex(order => order.id === orderId);

    if (tempOrderIndex !== -1) {
        // تحديث حالة الطلب
        tempOrders[tempOrderIndex].status = status;
        localStorage.setItem(TEMP_ORDERS_KEY, JSON.stringify(tempOrders));
        return tempOrders[tempOrderIndex];
    }

    return null;
}

/**
 * حساب المجموع الكلي للطلب
 * @param {Array} items - عناصر الطلب
 * @returns {number} المجموع الكلي
 */
function calculateTotalPrice(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}
