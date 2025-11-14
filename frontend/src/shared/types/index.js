/**
 * Общие типы для всего приложения
 */
// Статусы заявки
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "new";
    OrderStatus["IN_PROGRESS"] = "in_progress";
    OrderStatus["COLLECTED"] = "collected";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["IN_TRANSIT"] = "in_transit";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
// Статусы доставки
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "pending";
    DeliveryStatus["SHIPPED"] = "shipped";
    DeliveryStatus["IN_TRANSIT"] = "in_transit";
    DeliveryStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["FAILED"] = "failed";
    DeliveryStatus["CANCELLED"] = "cancelled";
})(DeliveryStatus || (DeliveryStatus = {}));
