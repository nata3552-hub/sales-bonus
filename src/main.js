/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase
   return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
    if (index === 0) {
        return profit * 0.15;
    }

    if (index === 1 || index === 2) {
        return profit * 0.1;
    }

    if (index === total - 1) {
        return 0;
    }

    return profit * 0.05;
}
    // методика расчетов бонусов
    
    
/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
      // 1. Проверка входящих данных
    if (!data) {
        throw new Error("No data provided");
    }

    // 2. Проверка опций (функций расчёта)
    if (!options) {
        throw new Error("No options provided");
    }

    const { calculateRevenue, calculateBonus } = options;

    if (typeof calculateRevenue !== "function" || typeof calculateBonus !== "function") {
        throw new Error("Invalid calculation functions");
    }

    // 3. Подготовка промежуточных данных

    // Индекс товаров для быстрого доступа
    const productsBySku = {};
    data.products.forEach(product => {
        productsBySku[product.sku] = product;
    });

    // Статистика продавцов
    const sellersStats = {};

    data.sellers.forEach(seller => {
        sellersStats[seller.id] = {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });

    // 4. Основные вычисления (обработка продаж)

    data.purchase_records.forEach(record => {
        const seller = sellersStats[record.seller_id];
        if (!seller) return;

        record.items.forEach(item => {
            const product = productsBySku[item.sku];
            if (!product) return;

            // выручка через переданную функцию
            const revenue = calculateRevenue(item, product);

            // прибыль = выручка - себестоимость
            const profit = revenue - product.purchase_price * item.quantity;

            seller.revenue += revenue;
            seller.profit += profit;

            seller.sales_count += item.quantity;

            // накопление товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }

            seller.products_sold[item.sku] += item.quantity;
        });
    });

    // 5. Сортировка продавцов по прибыли
    const sortedSellers = Object.values(sellersStats)
        .sort((a, b) => b.profit - a.profit);

    const total = sortedSellers.length;

    // 6. Назначение бонусов
    sortedSellers.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, total, seller);
    });

    // 7. Формирование итогового результата
    return sortedSellers;

    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}